"""Menu generation service."""

import uuid
from datetime import datetime, timezone

from app.core.exceptions import ParseError
from app.models import (
    CookSchedule,
    MenuBook,
    MenuBookStatus,
    ShoppingList,
    UserPreferences,
    WeekMenus,
)
from app.services.ai.client import GeminiClient, get_gemini_client
from app.services.ai.parser import ResponseParser
from app.services.ai.prompts import PromptBuilder
from app.services.validators import MenuValidator, VALID_DIFFICULTIES

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
MEALS = ("breakfast", "lunch", "dinner")


class MenuService:
    """Service for generating and modifying menu books."""

    def __init__(self, client: GeminiClient | None = None) -> None:
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()
        self._validator = MenuValidator()

    async def generate(self, preferences: UserPreferences) -> MenuBook:
        """Generate a new menu book based on user preferences.

        Args:
            preferences: User's meal planning preferences.

        Returns:
            Complete MenuBook with menus and placeholder shopping list.
        """
        # Step 1: Generate meal outline + draft shopping list
        ingredient_limit = self._estimate_ingredient_limit(preferences)
        outline_prompt = self._prompts.meal_outline(preferences, ingredient_limit)
        outline_response = await self._client.generate_json(outline_prompt)
        outline_payload = self._parser.parse_json(outline_response)

        meal_outline = outline_payload.get("mealOutline")
        draft_list = outline_payload.get("draftShoppingList")
        if not isinstance(meal_outline, dict) or not isinstance(draft_list, list):
            raise ParseError("Invalid outline payload from AI")

        normalized_list = self._normalize_draft_list(draft_list)

        # Step 2: Convert outline + draft list to structured JSON
        structure_prompt = self._prompts.structured_menu_from_outline(
            meal_outline=meal_outline,
            draft_shopping_list=normalized_list,
            preferences=preferences,
        )
        structured_response = await self._client.generate_json(structure_prompt)
        menu_data = self._parser.parse_json(structured_response)

        # Normalize and validate
        normalized = self._normalize_menus(
            menu_data, schedule=preferences.cookSchedule, preferences=preferences
        )

        # Build menu book
        book_id = f"mb_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc)

        placeholder_list = ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:12]}",
            menuBookId=book_id,
            createdAt=created_at,
            items=[],
        )

        return MenuBook(
            id=book_id,
            createdAt=created_at,
            status=MenuBookStatus.ready,
            preferences=preferences,
            menus=WeekMenus(**normalized),
            shoppingList=placeholder_list,
        )

    async def modify(
        self, book_id: str, modification: str, current_book: MenuBook
    ) -> MenuBook:
        """Modify an existing menu book.

        Args:
            book_id: ID of the menu book to modify.
            modification: User's modification request.
            current_book: Current state of the menu book.

        Returns:
            Modified MenuBook.
        """
        prompt = self._prompts.modification(
            modification=modification,
            current_menu=current_book.menus.model_dump(),
            preferences=current_book.preferences,
        )

        response_text = await self._client.generate_json(prompt)
        menu_data = self._parser.parse_json(response_text)
        normalized = self._normalize_menus(
            menu_data,
            schedule=current_book.preferences.cookSchedule,
            preferences=current_book.preferences,
        )

        return MenuBook(
            id=book_id,
            createdAt=current_book.createdAt,
            status=MenuBookStatus.ready,
            preferences=current_book.preferences,
            menus=WeekMenus(**normalized),
            shoppingList=current_book.shoppingList,
        )

    def _normalize_menus(
        self,
        raw_data: dict,
        schedule: CookSchedule | None = None,
        preferences: UserPreferences | None = None,
    ) -> dict:
        """Normalize menu data from AI response."""
        menus_data = raw_data.get("menus") or raw_data.get("days") or raw_data
        if not isinstance(menus_data, dict):
            raise ParseError("Menu data must be an object")

        normalized: dict[str, dict[str, list[dict]]] = {}
        schedule_map = None
        if schedule is not None:
            schedule_map = schedule.model_dump()

        for day in DAYS:
            day_data = menus_data.get(day, {})
            if not isinstance(day_data, dict):
                day_data = {}

            normalized_day: dict[str, list[dict]] = {}
            for meal in MEALS:
                if schedule_map and not schedule_map.get(day, {}).get(meal, False):
                    normalized_day[meal] = []
                    continue
                value = day_data.get(meal, [])
                if value is None:
                    meals = []
                elif isinstance(value, list):
                    meals = value
                elif isinstance(value, dict):
                    meals = [value]
                else:
                    meals = []

                normalized_meals: list[dict] = []
                for index, dish in enumerate(meals):
                    if not isinstance(dish, dict):
                        continue
                    name = dish.get("name")
                    if not isinstance(name, str) or not name.strip():
                        continue
                    normalized_dish = dict(dish)
                    normalized_dish["id"] = f"{day[:3]}-{meal}-{index + 1:03d}"
                    normalized_dish["source"] = "ai"
                    normalized_dish["name"] = name.strip()[:80]

                    difficulty = str(normalized_dish.get("difficulty", "medium")).lower()
                    if difficulty not in VALID_DIFFICULTIES:
                        difficulty = "medium"
                    normalized_dish["difficulty"] = difficulty

                    def _coerce_int(value: object, default: int) -> int:
                        try:
                            return int(float(value))  # type: ignore[arg-type]
                        except (TypeError, ValueError):
                            return default

                    normalized_dish["estimatedTime"] = max(1, _coerce_int(normalized_dish.get("estimatedTime"), 15))
                    servings = max(1, _coerce_int(normalized_dish.get("servings"), 1))
                    if preferences is not None:
                        servings = preferences.numPeople
                    normalized_dish["servings"] = servings
                    normalized_dish["totalCalories"] = max(0, _coerce_int(normalized_dish.get("totalCalories"), 0))
                    if not isinstance(normalized_dish.get("instructions"), str):
                        normalized_dish["instructions"] = ""

                    ingredients = normalized_dish.get("ingredients")
                    if not isinstance(ingredients, list):
                        ingredients = []
                    normalized_ingredients = []
                    for ingredient in ingredients:
                        if not isinstance(ingredient, dict):
                            continue
                        ingredient_name = str(ingredient.get("name", "")).strip()
                        if not ingredient_name:
                            continue
                        name_key = ingredient_name.lower()
                        category = self._normalize_ingredient_category(
                            ingredient.get("category"), name_key
                        )
                        quantity = ingredient.get("quantity", 0)
                        try:
                            quantity_val = float(quantity)
                        except (TypeError, ValueError):
                            quantity_val = 0.0
                        unit = str(ingredient.get("unit", "")).strip()
                        if category == "seasonings":
                            quantity_val = 0
                            unit = ""
                        normalized_ingredients.append(
                            {
                                "name": ingredient_name[:80],
                                "quantity": quantity_val,
                                "unit": unit,
                                "category": category,
                            }
                        )
                    normalized_dish["ingredients"] = normalized_ingredients
                    normalized_meals.append(normalized_dish)

                normalized_day[meal] = normalized_meals

            normalized[day] = normalized_day

        if not self._validator.validate_menus(normalized):
            raise ParseError("Invalid menu structure from AI")

        return normalized

    def _estimate_ingredient_limit(self, preferences: UserPreferences) -> int:
        schedule_map = preferences.cookSchedule.model_dump()
        planned_meals = sum(
            1 for day in schedule_map.values() for enabled in day.values() if enabled
        )
        base = 24
        meal_factor = 1 + (planned_meals - 10) * 0.02
        people_factor = 1 + (preferences.numPeople - 2) * 0.05
        limit = round(base * meal_factor * people_factor)
        return max(12, min(36, limit))

    def _normalize_ingredient_category(self, raw_category: str | None, name_key: str) -> str:
        fresh_overrides = (
            "green bean",
            "green beans",
            "green onion",
            "scallion",
            "spring onion",
            "onion",
            "garlic",
            "shallot",
            "leek",
        )
        if any(keyword in name_key for keyword in fresh_overrides) and "powder" not in name_key:
            return "vegetables"

        pantry_keywords = (
            "rice",
            "pasta",
            "spaghetti",
            "penne",
            "noodle",
            "noodles",
            "ramen",
            "udon",
            "soba",
            "couscous",
            "quinoa",
            "bulgur",
            "barley",
            "flour",
            "all-purpose flour",
            "bread flour",
            "cornmeal",
            "breadcrumbs",
            "panko",
            "oats",
            "oatmeal",
            "rolled oats",
            "bread",
            "bagel",
            "tortilla",
            "pita",
            "wrap",
            "canned beans",
            "black beans",
            "kidney beans",
            "pinto beans",
            "white beans",
            "navy beans",
            "garbanzo beans",
            "chickpeas",
            "lentils",
            "tomato sauce",
            "canned tomatoes",
            "tomato paste",
            "diced tomatoes",
            "crushed tomatoes",
            "marinara",
            "salsa",
            "stock",
            "broth",
            "vegetable broth",
            "chicken broth",
            "beef broth",
            "coconut milk",
            "peanut butter",
            "honey",
            "sugar",
            "brown sugar",
            "maple syrup",
            "jam",
            "jelly",
            "mustard",
            "ketchup",
            "mayonnaise",
            "hot sauce",
            "sriracha",
            "bbq sauce",
            "canned corn",
            "canned tuna",
            "tuna",
            "canned salmon",
            "salmon",
            "beans",
        )
        seasoning_keywords = (
            "salt",
            "pepper",
            "oil",
            "olive oil",
            "vegetable oil",
            "canola oil",
            "avocado oil",
            "sesame oil",
            "coconut oil",
            "butter",
            "ghee",
            "soy sauce",
            "vinegar",
            "balsamic vinegar",
            "rice vinegar",
            "apple cider vinegar",
            "white vinegar",
            "red wine vinegar",
            "fish sauce",
            "oyster sauce",
            "hoisin",
            "teriyaki",
            "miso",
            "garlic powder",
            "onion powder",
            "paprika",
            "cumin",
            "chili powder",
            "cayenne",
            "chili flakes",
            "oregano",
            "basil",
            "thyme",
            "rosemary",
            "cinnamon",
            "nutmeg",
            "ginger",
            "ground ginger",
            "turmeric",
            "curry powder",
            "five spice",
            "italian seasoning",
            "bay leaf",
            "vanilla",
            "vanilla extract",
            "lemon juice",
            "lime juice",
            "garlic powder",
            "onion powder",
        )
        if any(keyword in name_key for keyword in pantry_keywords):
            return "pantry_staples"
        if any(keyword in name_key for keyword in seasoning_keywords):
            return "seasonings"
        if raw_category in {
            "proteins",
            "vegetables",
            "fruits",
            "grains",
            "dairy",
            "seasonings",
            "pantry_staples",
            "others",
        }:
            return raw_category
        return "others"

    def _normalize_draft_list(self, draft_list: list[dict]) -> list[dict]:
        seen: set[str] = set()
        normalized: list[dict] = []
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


def get_menu_service() -> MenuService:
    """Get menu service instance."""
    return MenuService()
