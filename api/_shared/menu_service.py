"""Menu generation service (synchronous for Vercel)."""

import uuid
from datetime import datetime, timezone

from _shared.exceptions import ParseError
from _shared.ai_client import GeminiClient, get_gemini_client
from _shared.parser import ResponseParser
from _shared.prompts import PromptBuilder
from _shared.validators import DAYS, MEALS, VALID_DIFFICULTIES, coerce_quantity, normalize_category


class MenuService:
    def __init__(self, client: GeminiClient | None = None):
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()

    def generate(self, preferences: dict) -> dict:
        ingredient_limit = self._estimate_ingredient_limit(preferences)
        outline_prompt = self._prompts.meal_outline(preferences, ingredient_limit)
        outline_response = self._client.generate_json(outline_prompt)
        outline_payload = self._parser.parse_json(outline_response)
        if not isinstance(outline_payload, dict):
            raise ParseError("Invalid outline payload from AI")

        meal_outline = outline_payload.get("mealOutline")
        draft_list = outline_payload.get("draftShoppingList")
        if not isinstance(meal_outline, dict) or not isinstance(draft_list, list):
            raise ParseError("Invalid outline payload from AI")

        normalized_list = self._normalize_draft_list(draft_list)

        structure_prompt = self._prompts.structured_menu_from_outline(
            meal_outline=meal_outline,
            draft_shopping_list=normalized_list,
            preferences=preferences,
        )
        structured_response = self._client.generate_json(structure_prompt)
        menu_data = self._parser.parse_json(structured_response)

        normalized = _require_dishes(self._normalize_menus(
            menu_data,
            schedule=preferences.get("cookSchedule"),
            preferences=preferences,
        ))

        book_id = f"mb_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        return {
            "id": book_id,
            "createdAt": now,
            "status": "ready",
            "preferences": preferences,
            "menus": normalized,
            "shoppingList": {
                "id": f"sl_{uuid.uuid4().hex[:12]}",
                "menuBookId": book_id,
                "createdAt": now,
                "items": [],
            },
        }

    def modify(self, book_id: str, modification: str, current_book: dict) -> dict:
        preferences = current_book.get("preferences", {})
        menus = current_book.get("menus", {})

        prompt = self._prompts.modification(
            modification=modification,
            current_menu=menus,
            preferences=preferences,
        )

        response_text = self._client.generate_json(prompt)
        menu_data = self._parser.parse_json(response_text)
        normalized = _require_dishes(self._normalize_menus(
            _keep_omitted(menu_data, menus),
            schedule=preferences.get("cookSchedule"),
            preferences=preferences,
        ))

        return {
            "id": book_id,
            "createdAt": current_book.get("createdAt", datetime.now(timezone.utc).isoformat()),
            "status": "ready",
            "preferences": preferences,
            "menus": normalized,
            "shoppingList": current_book.get("shoppingList", {"id": "", "menuBookId": book_id, "createdAt": "", "items": []}),
        }

    def _normalize_menus(self, raw_data, schedule=None, preferences=None) -> dict:
        menus_data = _menus_object(raw_data)

        normalized = {}
        schedule_map = schedule if isinstance(schedule, dict) else None

        for day in DAYS:
            day_data = menus_data.get(day, {})
            if not isinstance(day_data, dict):
                day_data = {}

            normalized_day = {}
            for meal in MEALS:
                if schedule_map and not schedule_map.get(day, {}).get(meal, False):
                    normalized_day[meal] = []
                    continue
                value = day_data.get(meal, [])
                if value is None:
                    meals_list = []
                elif isinstance(value, list):
                    meals_list = value
                elif isinstance(value, dict):
                    meals_list = [value]
                else:
                    meals_list = []

                normalized_meals = []
                for index, dish in enumerate(meals_list):
                    if not isinstance(dish, dict):
                        continue
                    name = dish.get("name")
                    if not isinstance(name, str) or not name.strip():
                        continue
                    nd = dict(dish)
                    nd["id"] = f"{day[:3]}-{meal}-{index + 1:03d}"
                    nd["source"] = "ai"
                    nd["name"] = name.strip()[:80]

                    difficulty = str(nd.get("difficulty", "medium")).lower()
                    if difficulty not in VALID_DIFFICULTIES:
                        difficulty = "medium"
                    nd["difficulty"] = difficulty

                    nd["estimatedTime"] = max(1, _coerce_int(nd.get("estimatedTime"), 15))
                    servings = max(1, _coerce_int(nd.get("servings"), 1))
                    if preferences is not None:
                        servings = preferences.get("numPeople", servings)
                    nd["servings"] = servings
                    nd["totalCalories"] = max(0, _coerce_int(nd.get("totalCalories"), 0))
                    if not isinstance(nd.get("instructions"), str):
                        nd["instructions"] = ""

                    ingredients = nd.get("ingredients")
                    if not isinstance(ingredients, list):
                        ingredients = []
                    norm_ingredients = []
                    for ing in ingredients:
                        if not isinstance(ing, dict):
                            continue
                        ing_name = str(ing.get("name", "")).strip()
                        if not ing_name:
                            continue
                        # Recipes keep seasoning amounts (needed for cooking); only the
                        # shopping list drops them.
                        norm_ingredients.append({
                            "name": ing_name[:80],
                            "quantity": coerce_quantity(ing.get("quantity", 0)),
                            "unit": str(ing.get("unit", "")).strip(),
                            "category": normalize_category(ing.get("category")),
                        })
                    nd["ingredients"] = norm_ingredients
                    normalized_meals.append(nd)

                normalized_day[meal] = normalized_meals
            normalized[day] = normalized_day

        return normalized

    def _estimate_ingredient_limit(self, preferences: dict) -> int:
        schedule = preferences.get("cookSchedule", {})
        planned_meals = sum(
            1 for day in schedule.values() if isinstance(day, dict)
            for enabled in day.values() if enabled
        )
        base = 24
        meal_factor = 1 + (planned_meals - 10) * 0.02
        people_factor = 1 + (preferences.get("numPeople", 2) - 2) * 0.05
        limit = round(base * meal_factor * people_factor)
        return max(12, min(36, limit))

    def _normalize_draft_list(self, draft_list: list) -> list:
        seen = set()
        normalized = []
        for item in draft_list:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            if not name:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            normalized.append({"name": name, "category": normalize_category(item.get("category"))})
        return normalized


def _lower_keys(value):
    return {str(key).strip().lower(): item for key, item in value.items()} if isinstance(value, dict) else value


def _menus_object(raw_data) -> dict:
    """The weekday -> meals object with lower-case day and meal keys.

    Models sometimes wrap it ("menus", "days", or a made-up name) or capitalize
    the days; a response without any weekday is a parse error rather than an
    empty or unchanged week.
    """
    if not isinstance(raw_data, dict):
        raise ParseError("Menu data must be an object")
    data = _lower_keys(raw_data)
    if not any(day in data for day in DAYS):
        wrapped = data.get("menus") or data.get("days")
        if not isinstance(wrapped, dict) and len(data) == 1:
            wrapped = next(iter(data.values()))
        if isinstance(wrapped, dict):
            data = _lower_keys(wrapped)
    if not any(day in data for day in DAYS):
        raise ParseError("AI response did not contain any weekday")
    return {key: _lower_keys(item) for key, item in data.items()}


def _keep_omitted(raw_data, current_menus: dict) -> dict:
    """For a modification, days and meals the AI left out stay as they were.

    The prompt asks for the changed days only. A meal counts as replaced only when
    the AI gives dishes (a list, or one dish object); [] removes the meal, and
    placeholders such as "unchanged" or null keep the previous dishes.
    """
    updated = _menus_object(raw_data)
    merged = {}
    for day in DAYS:
        new_day = updated.get(day) if isinstance(updated.get(day), dict) else {}
        old_day = current_menus.get(day) if isinstance(current_menus.get(day), dict) else {}
        merged[day] = {
            meal: new_day[meal] if isinstance(new_day.get(meal), (list, dict)) else old_day.get(meal, [])
            for meal in MEALS
        }
    return merged


def _require_dishes(menus: dict) -> dict:
    if not any(menus[day][meal] for day in DAYS for meal in MEALS):
        raise ParseError("AI returned a menu without any dishes")
    return menus


def _coerce_int(value, default: int) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def get_menu_service() -> MenuService:
    return MenuService()
