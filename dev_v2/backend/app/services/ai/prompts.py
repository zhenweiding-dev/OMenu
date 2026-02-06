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
    def _build_preferences_payload(preferences: UserPreferences) -> dict:
        """Build preferences payload for prompts."""
        payload = preferences.model_dump()
        payload["cookSchedule"] = PromptBuilder._schedule_to_array_format(
            preferences.cookSchedule
        )
        return payload

    @classmethod
    def menu_book(cls, preferences: UserPreferences) -> str:
        """Generate prompt for natural language meal plan creation."""
        schedule_json = cls._compact(
            cls._schedule_to_array_format(preferences.cookSchedule)
        )
        preferences_json = cls._compact(preferences.specificPreferences)
        disliked_json = cls._compact(preferences.specificDisliked)
        budget_json = cls._compact(preferences.budget)
        people_json = cls._compact(preferences.numPeople)

        return (
            "As a professional nutritionist and chef, create a weekly meal plan with user preferences and dislikes."
            "The meal plan should be diverse, balanced, and consider making full use of ingredients throughout the week, but similar main ingredients should not be repeated more than twice in the week."
            "Avoid repeating the simiar dishes on different days."
            "Keep real-world shopping habits in mind: aim for variety, but avoid introducing too many unique ingredients."
            "Reuse overlapping ingredients across meals when reasonable to reduce waste and keep the pantry practical."
            "And ensure the meals are enough to serve the number of people specified, generate two or more dishes per meal if necessary."
            f"BudgetUSD: {budget_json}. "
            f"People: {people_json}. "
            f"Preferences: {preferences_json}. "
            f"Dislikes: {disliked_json}. "
            f"CookSchedule: {schedule_json}."
        )

    @classmethod
    def structured_menu(cls, natural_menu: str, preferences: UserPreferences) -> str:
        """Generate prompt to convert natural meal plan to structured JSON."""
        meal_plan_text = cls._compact(natural_menu)
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
            "1) Days or meals without any selected meals may be omitted. "
            "2) Ingredient categories: proteins, vegetables, fruits, grains, dairy, "
            "seasonings, pantry_staples, others. "
            "4) instructions <=200 characters and with clear steps. "
        )

        return (
            "Convert the following meal plan into a structured JSON format according to the schema. "
            f"{requirements} RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
            f"MealPlanText: {meal_plan_text} "
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
        current_plan = cls._compact(current_menu)

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
            "Task: Generate a consolidated shopping list from the weekly meal plan.\n"
            "CRITICAL RULES:\n"
            "1) MERGE whenever possible: combine duplicates and close synonyms (e.g., bell pepper/peppers -> bell peppers). "
            "But do not merge items that are clearly different (e.g., spinach and broccoli, ginger and garlic are different).\n"
            "2) UNITS (North America): proteins -> lbs or oz; produce -> count or bunch; "
            "grains/dairy/pantry -> oz/lbs/count as appropriate. Use a single unit per item.\n"
            "3) Sum quantities across all dishes. For lbs/oz round to 1 decimal; for count/bunch use whole numbers.\n"
            "4) Valid categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others.\n"
            "5) Keep names concise (<= 5 words). Avoid brands and extra adjectives.\n"
            "6) If a unit is not applicable (e.g., seasonings), use totalQuantity 0 and unit \"\".\n"
            "7) Respond with compact JSON only (no comments or prose).\n"
            f"MealPlan: {menus_json}\n"
            f"OutputSchema: {output_schema}\n"
            "RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
        )
