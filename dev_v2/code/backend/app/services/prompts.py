"""
Prompt templates for Gemini API.

This module contains all prompt templates used for:
1. Meal plan generation (natural language)
2. Structured plan conversion (JSON)
3. Meal plan modification
4. Shopping list generation
"""

from typing import Dict, Any
import json


def convert_schedule_to_array_format(cook_schedule: Dict[str, Any]) -> Dict[str, list]:
    """
    Convert boolean schedule to array format for Gemini.
    
    Input:  {"monday": {"breakfast": true, "lunch": true, "dinner": false}}
    Output: {"monday": ["breakfast", "lunch"]}
    """
    result = {}
    for day, meals in cook_schedule.items():
        if isinstance(meals, dict):
            selected = [meal for meal, enabled in meals.items() if enabled]
            result[day] = selected
        else:
            result[day] = meals  # Already in array format
    return result


def format_preferences_for_gemini(preferences: Dict[str, Any]) -> str:
    """
    Format user preferences for Gemini prompt.
    Converts schedule to array format for cleaner output.
    """
    prefs_copy = preferences.copy()
    
    if "cookSchedule" in prefs_copy:
        prefs_copy["cookSchedule"] = convert_schedule_to_array_format(
            prefs_copy["cookSchedule"]
        )
    
    return json.dumps(prefs_copy, indent=2)


def meal_plan_prompt(user_preferences: str) -> str:
    """
    Step 1: Generate natural language meal plan.
    
    This prompt asks Gemini to create a creative meal plan.
    The output is semi-structured but not strict JSON.
    """
    return f"""Task: Based on the user's preferences, generate a personalized meal plan in JSON format, every meal should include recipeName, ingredients and brief description.

User Preferences: {user_preferences}"""


def structured_plan_prompt(extracted_plan: str) -> str:
    """
    Step 2: Convert natural language plan to structured JSON.
    
    This prompt converts the creative plan into strict JSON format.
    """
    return f"""Task: Convert the following meal plan into a structured JSON format according to the schema.

Meal Plan: {extracted_plan}

Output Schema:
{{
  "monday": {{
    "breakfast": {{
      "id": "mon-breakfast-001",
      "name": "Scrambled Eggs with Tomato",
      "ingredients": [
        {{"name": "eggs", "quantity": 2, "unit": "count", "category": "proteins"}},
        {{"name": "tomato", "quantity": 100, "unit": "g", "category": "vegetables"}},
        {{"name": "oil", "quantity": 15, "unit": "ml", "category": "seasonings"}}
      ],
      "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
      "estimatedTime": 15,
      "servings": 2,
      "difficulty": "easy",
      "totalCalories": 180
    }},
    "lunch": {{ ... }},
    "dinner": {{ ... }}
  }},
  "tuesday": {{ ... }},
  ...
}}

Requirements:
1. All 7 days must be present (monday through sunday)
2. Each day has breakfast, lunch, dinner (null if not scheduled)
3. Recipe ID format: {{day}}-{{meal}}-{{number}} (e.g., "mon-breakfast-001")
4. Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
5. For seasonings: quantity can be 0, unit can be empty

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""


def modification_prompt(
    user_input: str,
    user_preferences: str,
    previous_plan: str
) -> str:
    """
    Modify existing meal plan based on user input.
    
    Makes minimal changes to accommodate the user's request.
    """
    return f"""Task: Based on user's new input, previous preferences and meal plan, adjust the meal plan accordingly. DO NOT change the format of the meal plan.

Return exactly the same format as previous meal plan. Do minimal changes to accommodate user's new input.

User's new input: {user_input}
Previous user preferences: {user_preferences}
Previous meal plan: {previous_plan}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""


def shopping_list_prompt(structured_plan: str) -> str:
    """
    Generate consolidated shopping list from meal plan.
    
    Merges ingredients and uses North American units.
    """
    return f"""Task: Convert the Meal Plan into a consolidated North American shopping list (JSON).

CRITICAL RULES:
1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories.
   - (e.g., "Beef strips" + "Flank steak" -> "Beef (Stir-fry cut)")
   - (e.g., "Scallions" + "Green onions" -> "Green Onions")

2. **UNITS (North America)**:
   - **Meat/Bulk**: MUST use 'lbs' or 'oz'. (No grams).
   - **Produce**: MUST use 'count' or 'bunch'. (No 'stalks', 'slices').

3. **Categories** (use exactly these):
   "proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others"

4. **Seasonings**: Set totalQuantity to 0 and unit to "" (not displayed in UI)

Meal Plan: {structured_plan}

Output Format:
{{
  "items": [
    {{"name": "ingredient_name", "category": "predefined_category", "totalQuantity": 0, "unit": "unit"}},
    ...
  ]
}}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""
