"""Prompt templates for AI content generation."""

import json

from app.models.user import CookSchedule, UserPreferences
from app.models.menu import WeekMenus


class PromptBuilder:
    """Builder for AI prompts used in menu generation."""

    @staticmethod
    def _schedule_to_array_format(schedule: CookSchedule) -> dict[str, list[str]]:
        """Convert schedule to array format for prompts."""
        schedule_dict = schedule.model_dump()
        result: dict[str, list[str]] = {}
        for day, meals in schedule_dict.items():
            selected = [meal for meal, enabled in meals.items() if enabled]
            result[day] = selected
        return result

    @staticmethod
    def _compact(value: object) -> str:
        """Dump JSON without newlines to reduce token usage."""
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))

    @staticmethod
    def _strip_keys(value: object, keys: set[str]) -> object:
        """Recursively remove unwanted keys from dict/list structures."""
        if isinstance(value, dict):
            return {
                key: PromptBuilder._strip_keys(item, keys)
                for key, item in value.items()
                if key not in keys
            }
        if isinstance(value, list):
            return [PromptBuilder._strip_keys(item, keys) for item in value]
        return value

    @classmethod
    def meal_outline(cls, preferences: UserPreferences, ingredient_limit: int) -> str:
        """Generate prompt for meal outline + draft shopping list (Step 1)."""
        schedule_json = cls._compact(
            cls._schedule_to_array_format(preferences.cookSchedule)
        )
        preferences_json = cls._compact(preferences.specificPreferences)
        disliked_json = cls._compact(preferences.specificDisliked)
        budget_json = cls._compact(preferences.budget)
        people_json = cls._compact(preferences.numPeople)
        difficulty_json = cls._compact(preferences.difficulty)
        schema_example = {
            "mealOutline": {
                "monday": {"breakfast": ["Avocado toast"], "lunch": ["Chicken salad"], "dinner": ["Stir-fry"]},
                "tuesday": {"breakfast": [], "lunch": ["Tuna sandwich"], "dinner": []},
                "...": "...",
            },
            "draftShoppingList": [
                {"name": "chicken breast", "category": "proteins"},
                {"name": "rice", "category": "grains"},
                {"name": "olive oil", "category": "seasonings"},
            ],
        }
        schema_block = cls._compact(schema_example)

        return (
            "You are a professional chef and dietitian tasked with creating a guideline for a weekly meal plan and shopping list based on user preferences and constraints."
            "result: give a rough meal outline for the week (main dish names only, no recipes yet) along with a draft shopping list of  ~{ingredient_limit} unique non-pantry ingredients needed. "
            "Return ONLY JSON with two keys: mealOutline and draftShoppingList.\n"
            "Rules:\n"
            f"1) NO leftovers, NO repeat main dishes across the week.\n"
            "2) Balance variety with practicality: reuse overlapping ingredients across meals when reasonable. \n"
            "3) Seasonings (oils/sauces/spices) and Pantry staples (rice/pasta/flour/canned beans/oats/bread) do NOT count toward the limit and must be category=seasonings.\n"
            "4) Only include meals selected in CookSchedule; unselected meals should be [] or omitted.\n"
            "5) Meal outline: the amount of dishes per selected meal should be appropriate for the number of people and meal type.\n"
            "6) draftShoppingList must be derived from the outline and include unique items with name + category only "
            "(no quantities, no duplicates).\n"
            "7) Valid categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others.\n"
            f"BudgetUSD: {budget_json}\n"
            f"People: {people_json}\n"
            f"Preferences: {preferences_json}\n"
            f"Dislikes: {disliked_json}\n"
            f"CookSchedule: {schedule_json}\n"
            f"OutputSchema: {schema_block}\n"
            "RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
        )

    @classmethod
    def structured_menu_from_outline(
        cls, meal_outline: dict, draft_shopping_list: list[dict], preferences: UserPreferences
    ) -> str:
        """Generate prompt to convert meal outline + draft list into structured menus (Step 2)."""
        outline_json = cls._compact(meal_outline)
        list_json = cls._compact(draft_shopping_list)
        schedule_json = cls._compact(
            cls._schedule_to_array_format(preferences.cookSchedule)
        )
        preferences_json = cls._compact(preferences.specificPreferences)
        disliked_json = cls._compact(preferences.specificDisliked)
        budget_json = cls._compact(preferences.budget)
        people_json = cls._compact(preferences.numPeople)
        difficulty_json = cls._compact(preferences.difficulty)
        schema_example = {
            "monday": {
                "breakfast": [
                    {
                        "name": "Scrambled Eggs with Tomato",
                        "ingredients": [
                            {
                                "name": "eggs",
                                "quantity": 2,
                                "unit": "count",
                                "category": "proteins",
                            },
                            {
                                "name": "tomato",
                                "quantity": 100,
                                "unit": "g",
                                "category": "vegetables",
                            },
                            {"name": "oil", "quantity": 0, "unit": "", "category": "seasonings"},
                        ],
                        "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
                        "estimatedTime": 15,
                        "servings": preferences.numPeople,
                        "difficulty": "easy",
                        "totalCalories": 180,
                    }
                ],
            },
            "tuesday": "{ ... }",
            "...": "...",
        }
        schema_block = cls._compact(schema_example)
        requirements = (
            "Requirements: "
            "1) DraftShoppingList is the source of truth for NON-pantry items. Do NOT add new non-pantry items. "
            "You may add pantry_staples/seasonings only when needed (keep minimal). "
            "2) MealOutline is guidance for dish ideas; feel free to improve dish names and recipes, but stay within the shopping list. "
            "3) Focus on high-quality, nutritious, and varied meals that fit Preferences/Dislikes/Budget/People. "
            "Avoid repeating the exact same dish. "
            "4) Only include meals selected in CookSchedule; unselected meals must be [] or omitted. "
            "5) Servings MUST equal People for every dish. "
            "6) Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others. "
            "7) instructions <=200 characters and include clear steps. "
        )

        return (
            "Step 2: Create a high-quality, nutritious, and structured weekly meal plan within the ingredient constraints. "
            f"{requirements} RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
            f"BudgetUSD: {budget_json} "
            f"People: {people_json} "
            f"Difficulty: {difficulty_json} "
            f"Preferences: {preferences_json} "
            f"Dislikes: {disliked_json} "
            f"CookSchedule: {schedule_json} "
            f"MealOutline: {outline_json} "
            f"DraftShoppingList: {list_json} "
            f"OutputSchema: {schema_block} "
        )

    @classmethod
    def modification(
        cls, modification: str, current_menu: object, preferences: UserPreferences
    ) -> str:
        """Generate prompt for meal plan modification."""
        schedule_json = cls._compact(
            cls._schedule_to_array_format(preferences.cookSchedule)
        )
        preferences_json = cls._compact(preferences.specificPreferences)
        disliked_json = cls._compact(preferences.specificDisliked)
        budget_json = cls._compact(preferences.budget)
        people_json = cls._compact(preferences.numPeople)
        modification_text = cls._compact(modification)
        sanitized_menu = cls._strip_keys(current_menu, {"id", "source"})
        current_plan = cls._compact(sanitized_menu)
        return (
            "Task: Based on user's new input, previous preferences, and meal plan, "
            "adjust the meal plan accordingly without changing the format. "
            "Make the minimal modifications needed to satisfy the request.\n"
            "Note: specificPreferences are items the user wants included at least once during the week, "
            "not in every meal. Avoid items in specificDisliked.\n"
            f"UserInput: {modification_text}\n"
            "Previous Preferences and Constraints:\n"
            f"BudgetUSD: {budget_json}\n"
            f"People: {people_json}\n"
            f"Preferences: {preferences_json}\n"
            f"Dislikes: {disliked_json}\n"
            f"CookSchedule: {schedule_json}\n"
            f"PreviousMealPlan: {current_plan}\n"
            "RETURN ONLY THE MODIFIED JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
        )

    @classmethod
    def shopping_list(cls, menus: WeekMenus) -> str:
        """Generate prompt for shopping list generation."""
        menus_json = cls._compact(menus.model_dump())
        output_schema = cls._compact(
            {
                "items": [
                    {
                        "name": "ingredient_name",
                        "category": "predefined_category",
                        "totalQuantity": 0,
                        "unit": "unit",
                    }
                ]
            }
        )

        return (
            "Step 3: Generate a consolidated shopping list from the structured weekly meal plan.\n"
            "CRITICAL RULES:\n"
            "1) MERGE only true duplicates or very close synonyms (e.g., bell pepper/peppers -> bell peppers). "
            "Do NOT merge clearly different items (spinach vs broccoli, ginger vs garlic, green onion vs onion).\n"
            "2) UNITS (North America): proteins -> lbs or oz; produce -> count or bunch; "
            "grains/dairy/pantry_staples/others -> oz/lbs/count as appropriate. Use a single unit per item.\n"
            "3) Sum quantities across all dishes. For lbs/oz round to 1 decimal; for count/bunch use whole numbers.\n"
            "4) Valid categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others.\n"
            "5) Keep names concise (<= 5 words). Avoid brands and extra adjectives.\n"
            "6) For seasonings (oils/sauces/spices), use totalQuantity 0 and unit \"\".\n"
            "7) Respond with compact JSON only (no comments or prose).\n"
            f"MealPlan: {menus_json}\n"
            f"OutputSchema: {output_schema}\n"
            "RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
        )
