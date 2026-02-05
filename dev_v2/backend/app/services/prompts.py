import json

from app.models.schemas import CookSchedule, UserPreferences, WeekMenus


def _convert_schedule_to_array_format(schedule: CookSchedule) -> dict[str, list[str]]:
    schedule_dict = schedule.model_dump()
    result: dict[str, list[str]] = {}
    for day, meals in schedule_dict.items():
        selected = [meal for meal, enabled in meals.items() if enabled]
        result[day] = selected
    return result


def _build_preferences_payload(preferences: UserPreferences) -> dict:
    payload = preferences.model_dump()
    payload["cookSchedule"] = _convert_schedule_to_array_format(preferences.cookSchedule)
    return payload


def menu_book_prompt(preferences: UserPreferences) -> str:
    prompt_payload = _build_preferences_payload(preferences)
    preferences_json = json.dumps(prompt_payload, ensure_ascii=False, separators=(",", ":"))
    budget_text = f"Budget:${preferences.budget}"

    return (
        "Task: Based on the user's preferences, generate a personalized weekly menu in JSON format; "
        "every meal must include dishName, ingredients, and a brief description. Keep the JSON compact by limiting "
        "each meal to at most 5 ingredients and a description under 25 words. "
        "Important: preferredItems should appear at least once during the week, not necessarily in every meal. "
        f"{budget_text}.\nUser Preferences: {preferences_json}"
    )


def structured_menu_prompt(natural_menu: str, preferences: UserPreferences) -> str:
    schema_example = {
        "monday": {
            "breakfast": [
                {
                    "id": "mon-breakfast-001",
                    "name": "Scrambled Eggs with Tomato",
                    "ingredients": [
                        {"name": "eggs", "quantity": 2, "unit": "count", "category": "proteins"},
                        {"name": "tomato", "quantity": 100, "unit": "g", "category": "vegetables"},
                        {"name": "oil", "quantity": 0, "unit": "", "category": "seasonings"},
                    ],
                    "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
                    "estimatedTime": 15,
                    "servings": preferences.numPeople,
                    "difficulty": "easy",
                    "totalCalories": 180,
                    "source": "ai",
                }
            ],
            "lunch": [],
            "dinner": [],
        },
        "tuesday": "{ ... }",
        "...": "...",
    }
    schema_block = json.dumps(schema_example, ensure_ascii=False, separators=(",", ":"))
    requirements = (
        "Requirements: 1) All 7 days present (monday through sunday). 2) Each day has breakfast, lunch, dinner (use empty array if not scheduled). "
        "3) Dish ID format {day}-{meal}-{number} (e.g., \"mon-breakfast-001\"). 4) Ingredient categories: proteins, vegetables, fruits, grains, dairy, "
        "seasonings, pantry_staples, others. 5) Seasonings use quantity 0 and empty unit. 6) <=5 ingredients per meal and instructions <=200 characters. "
        "7) Each dish must include source=\"ai\"."
    )

    return (
        "Task: Convert the following menu into a structured JSON format according to the schema. "
        f"Menu: {natural_menu} "
        f"Output Schema: {schema_block} "
        f"{requirements} RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
    )


def modification_prompt(modification: str, current_menu: str, preferences: UserPreferences) -> str:
    preferences_json = json.dumps(_build_preferences_payload(preferences), ensure_ascii=False, separators=(",", ":"))
    return (
        "Task: Based on user's new input, previous preferences, and menu, adjust the menu accordingly without changing the format. "
        "Make the minimal modifications needed to satisfy the request.\n"
        "Note: preferredItems are items the user wants included at least once during the week, not in every meal.\n"
        f"User's new input: {modification}\nPrevious user preferences: {preferences_json}\nPrevious menu: {current_menu}\n"
        "RETURN ONLY THE MODIFIED JSON OBJECT. Do not use Markdown formatting (no ```json blocks)."
    )


def shopping_list_prompt(menus: WeekMenus) -> str:
    menus_json = menus.model_dump_json()

    return (
        "Task: Generate a consolidated shopping list from the weekly menus (North American units).\n"
        "CRITICAL RULES:\n1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories (e.g., \"Beef strips\" + \"Flank steak\" -> \"Beef (Stir-fry cut)\", \"Scallions\" + \"Green onions\" -> \"Green Onions\").\n"
        "2. **UNITS (North America)**: Meat/Bulk must use 'lbs' or 'oz'; produce must use 'count' or 'bunch'.\n"
        "3. Valid categories: \"proteins\", \"vegetables\", \"fruits\", \"grains\", \"dairy\", \"seasonings\", \"pantry_staples\", \"others\".\n"
        "4. Seasonings set totalQuantity to 0 and unit to \"\".\n5. Limit the list to at most 12 items and keep field values concise (ingredient names <=4 words).\n"
        "6. Respond with compact JSON (no comments or prose) to stay within model token limits.\n"
        f"Menus: {menus_json}\n"
        "Output Format:{\n  \"items\": [\n    {\"name\": \"ingredient_name\", \"category\": \"predefined_category\", \"totalQuantity\": 0, \"unit\": \"unit\"},\n    ...\n  ]\n}\n"
        "RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."
    )
