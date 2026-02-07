"""Menu generation service (synchronous for Vercel)."""

import uuid
from datetime import datetime, timezone

from _shared.exceptions import ParseError
from _shared.ai_client import GeminiClient, get_gemini_client
from _shared.parser import ResponseParser
from _shared.prompts import PromptBuilder
from _shared.validators import MenuValidator, VALID_DIFFICULTIES

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
MEALS = ("breakfast", "lunch", "dinner")


class MenuService:
    def __init__(self, client: GeminiClient | None = None):
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()
        self._validator = MenuValidator()

    def generate(self, preferences: dict) -> dict:
        ingredient_limit = self._estimate_ingredient_limit(preferences)
        outline_prompt = self._prompts.meal_outline(preferences, ingredient_limit)
        outline_response = self._client.generate_json(outline_prompt)
        outline_payload = self._parser.parse_json(outline_response)

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

        normalized = self._normalize_menus(
            menu_data,
            schedule=preferences.get("cookSchedule"),
            preferences=preferences,
        )

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
        normalized = self._normalize_menus(
            menu_data,
            schedule=preferences.get("cookSchedule"),
            preferences=preferences,
        )

        return {
            "id": book_id,
            "createdAt": current_book.get("createdAt", datetime.now(timezone.utc).isoformat()),
            "status": "ready",
            "preferences": preferences,
            "menus": normalized,
            "shoppingList": current_book.get("shoppingList", {"id": "", "menuBookId": book_id, "createdAt": "", "items": []}),
        }

    def _normalize_menus(self, raw_data: dict, schedule=None, preferences=None) -> dict:
        menus_data = raw_data.get("menus") or raw_data.get("days") or raw_data
        if not isinstance(menus_data, dict):
            raise ParseError("Menu data must be an object")

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
                        name_key = ing_name.lower()
                        category = self._normalize_ingredient_category(ing.get("category"), name_key)
                        quantity = ing.get("quantity", 0)
                        try:
                            quantity_val = float(quantity)
                        except (TypeError, ValueError):
                            quantity_val = 0.0
                        unit = str(ing.get("unit", "")).strip()
                        if category == "seasonings":
                            quantity_val = 0
                            unit = ""
                        norm_ingredients.append({
                            "name": ing_name[:80],
                            "quantity": quantity_val,
                            "unit": unit,
                            "category": category,
                        })
                    nd["ingredients"] = norm_ingredients
                    normalized_meals.append(nd)

                normalized_day[meal] = normalized_meals
            normalized[day] = normalized_day

        if not self._validator.validate_menus(normalized):
            raise ParseError("Invalid menu structure from AI")

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

    def _normalize_ingredient_category(self, raw_category, name_key: str) -> str:
        from _shared.validators import FRESH_VEGETABLE_OVERRIDES, PANTRY_KEYWORDS, SEASONING_KEYWORDS, VALID_CATEGORIES
        if any(keyword in name_key for keyword in FRESH_VEGETABLE_OVERRIDES) and "powder" not in name_key:
            return "vegetables"
        if any(keyword in name_key for keyword in PANTRY_KEYWORDS):
            return "pantry_staples"
        if any(keyword in name_key for keyword in SEASONING_KEYWORDS):
            return "seasonings"
        if raw_category in VALID_CATEGORIES:
            return raw_category
        return "others"

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
            raw_category = item.get("category", "others")
            category = self._normalize_ingredient_category(raw_category, key)
            normalized.append({"name": name, "category": category})
        return normalized


def _coerce_int(value, default: int) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def get_menu_service() -> MenuService:
    return MenuService()
