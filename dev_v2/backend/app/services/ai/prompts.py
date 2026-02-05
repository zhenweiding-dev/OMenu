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
    def _build_preferences_payload(preferences: UserPreferences) -> dict:
        """Build preferences payload for prompts."""
        payload = preferences.model_dump()
        payload["cookSchedule"] = PromptBuilder._schedule_to_array_format(
            preferences.cookSchedule
        )
        return payload

    @classmethod
    def menu_book(cls, preferences: UserPreferences) -> str:
        """Generate prompt for structured weekly menu creation (single-pass)."""
        prompt_payload = cls._build_preferences_payload(preferences)
        preferences_json = json.dumps(
            prompt_payload, ensure_ascii=False, separators=(",", ":")
        )

        return (
            f"Generate a weekly menu JSON for {preferences.numPeople} people, budget ${preferences.budget}, "
            f"difficulty: {preferences.difficulty}.\n"
            f"Preferences: {preferences_json}\n"
            "Output JSON with keys: monday-sunday. Each day has breakfast/lunch/dinner arrays.\n"
            "Dish format: {id,name,ingredients:[{name,quantity,unit,category}],instructions,estimatedTime,servings,difficulty,totalCalories,source:\"ai\"}\n"
            "ID format: mon-breakfast-001. Categories: proteins,vegetables,fruits,grains,dairy,seasonings,pantry_staples,others.\n"
            "Seasonings: quantity=0,unit=\"\". Max 5 ingredients, instructions<200 chars. Empty array if meal not scheduled.\n"
            "RETURN ONLY RAW JSON, no markdown."
        )

    @classmethod
    def modification(
        cls, modification: str, current_menu: str, preferences: UserPreferences
    ) -> str:
        """Generate prompt for menu modification."""
        preferences_json = json.dumps(
            cls._build_preferences_payload(preferences),
            ensure_ascii=False,
            separators=(",", ":"),
        )

        return (
            "Task: Based on user's new input, previous preferences, and menu, "
            "adjust the menu accordingly without changing the format. "
            "Make the minimal modifications needed to satisfy the request.\n"
            "Note: preferredItems are items the user wants included at least once during the week, "
            "not in every meal.\n"
            f"User's new input: {modification}\n"
            f"Previous user preferences: {preferences_json}\n"
            f"Previous menu: {current_menu}\n"
            "RETURN ONLY THE MODIFIED JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
        )

    @classmethod
    def shopping_list(cls, menus: WeekMenus) -> str:
        """Generate prompt for shopping list generation."""
        menus_json = menus.model_dump_json()

        return (
            "Task: Generate a consolidated shopping list from the weekly menus (North American units).\n"
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
            f"Menus: {menus_json}\n"
            "Output Format:{\n"
            '  "items": [\n'
            '    {"name": "ingredient_name", "category": "predefined_category", "totalQuantity": 0, "unit": "unit"},\n'
            "    ...\n"
            "  ]\n"
            "}\n"
            "RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."
        )
