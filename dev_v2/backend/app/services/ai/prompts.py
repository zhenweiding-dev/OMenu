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
            "The meal plan should be diverse, balanced, and consider making full use of ingredients throughout the week."
            "Avoid repeating the simiar dishes on different days."
            "And ensure the meals align with the user's budget constraints and number of people to serve."
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
            "4) instructions <=200 characters. "
        )

        return (
            "Convert the following meal plan into a structured JSON format according to the schema. "
            "Important: Please skip long internal reasoning and output the JSON directly. "
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
            "Task: Generate a consolidated shopping list from the weekly meal plan (North American units).\n"
            "CRITICAL RULES:\n"
            "1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories "
            "(e.g., \"Beef strips\" + \"Flank steak\" -> \"Beef (Stir-fry cut)\", "
            "\"Scallions\" + \"Green onions\" -> \"Green Onions\").\n"
            "2. **UNITS (North America)**: Meat/Bulk must use 'lbs' or 'oz'; produce must use 'count' or 'bunch'.\n"
            "3. Valid categories: \"proteins\", \"vegetables\", \"fruits\", \"grains\", \"dairy\", "
            "\"seasonings\", \"pantry_staples\", \"others\".\n"
            "4. Seasonings set totalQuantity to 0 and unit to \"\".\n"
            "5. Limit the list to at most 12 items and keep field values concise (ingredient names <=4 words).\n"
            "6. Respond with compact JSON (no comments or prose) to stay within model token limits.\n"
            f"MealPlan: {menus_json}\n"
            f"OutputSchema: {output_schema}\n"
            "RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."
        )
