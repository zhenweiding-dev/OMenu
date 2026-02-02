"""
Prompt templates for Gemini API.

Based on API_PROMPTS.md specification:
- meal_plan_prompt: Step 1 - Generate natural language meal plan
- structured_plan_prompt: Step 2 - Convert to structured JSON
- modification_prompt: Modify existing plan
- shopping_list_prompt: Generate shopping list

Data format uses compact JSON (no whitespace) for token efficiency.
"""

from typing import Dict, Any, List
import json


def convert_schedule_to_array_format(cook_schedule: Dict[str, Any]) -> Dict[str, list]:
    """
    Convert boolean schedule to array format for Gemini.
    
    Example:
        {"monday": {"breakfast": true, "lunch": true}} 
        -> {"monday": ["breakfast", "lunch"]}
    """
    result = {}
    for day, meals in cook_schedule.items():
        if isinstance(meals, dict):
            selected = [meal for meal, enabled in meals.items() if enabled]
            result[day] = selected
        else:
            result[day] = meals
    return result


def format_preferences_for_gemini(preferences: Dict[str, Any]) -> str:
    """Format preferences as compact JSON with array schedule format."""
    prefs_copy = preferences.copy()
    if "cookSchedule" in prefs_copy:
        prefs_copy["cookSchedule"] = convert_schedule_to_array_format(
            prefs_copy["cookSchedule"]
        )
    return json.dumps(prefs_copy, separators=(',', ':'))


def get_scheduled_days(preferences: Dict[str, Any]) -> List[str]:
    """Get list of days that have scheduled meals."""
    schedule = preferences.get("cookSchedule", {})
    days_with_meals = []
    for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
        day_schedule = schedule.get(day, {})
        if isinstance(day_schedule, dict):
            if any(day_schedule.values()):
                days_with_meals.append(day)
        elif isinstance(day_schedule, list) and len(day_schedule) > 0:
            days_with_meals.append(day)
    return days_with_meals


def get_day_meals(preferences: Dict[str, Any], day: str) -> List[str]:
    """Get scheduled meals for a specific day."""
    schedule = preferences.get("cookSchedule", {})
    day_schedule = schedule.get(day, {})
    if isinstance(day_schedule, dict):
        return [meal for meal, enabled in day_schedule.items() if enabled]
    elif isinstance(day_schedule, list):
        return day_schedule
    return []


# =============================================================================
# Main Prompt Functions (matches API_PROMPTS.md)
# =============================================================================

def meal_plan_prompt(user_preferences: str) -> str:
    """
    Step 1: Generate natural language meal plan.
    
    Prompt per API_PROMPTS.md specification.
    """
    return f"""Task: Based on the user's preferences, generate a personalized meal plan in JSON format, every meal should include recipeName, ingredients and brief description.

User Preferences: {user_preferences}"""


def structured_plan_prompt(extracted_plan: str) -> str:
    """
    Step 2: Convert natural language plan to structured JSON.
    
    Prompt per API_PROMPTS.md specification.
    """
    return f"""Task: Convert the following meal plan into a structured JSON format according to the schema.

Meal Plan: {extracted_plan}

Output Schema:
{{"monday":{{"breakfast":{{"id":"mon-breakfast-001","name":"Recipe Name","ingredients":[{{"name":"ingredient","quantity":2,"unit":"count","category":"proteins"}}],"instructions":"1. Step one... 2. Step two...","estimatedTime":15,"servings":2,"difficulty":"easy","totalCalories":180}},"lunch":...,"dinner":...}},"tuesday":...,...}}

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
    
    Prompt per API_PROMPTS.md specification.
    """
    return f"""Task: Based on user's new input, previous preferences and meal plan, adjust the meal plan accordingly. DO NOT change the format of the meal plan.

Return exactly the same format as previous meal plan. Do minimal changes to accommodate user's new input.

User's new input: {user_input}
Previous user preferences: {user_preferences}
Previous meal plan: {previous_plan}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""


def shopping_list_prompt(structured_plan: str) -> str:
    """
    Generate shopping list from meal plan.
    
    Prompt per API_PROMPTS.md specification.
    """
    return f"""Task: Convert the Meal Plan into a consolidated North American shopping list (JSON).

CRITICAL RULES:
1. MERGE AGGRESSIVELY: Combine interchangeable ingredients into broad categories.
   - (e.g., "Beef strips" + "Flank steak" -> "Beef (Stir-fry cut)")
   - (e.g., "Scallions" + "Green onions" -> "Green Onions")

2. UNITS (North America):
   - Meat/Bulk: MUST use 'lbs' or 'oz'. (No grams).
   - Produce: MUST use 'count' or 'bunch'. (No 'stalks', 'slices').

3. Categories (use exactly these):
   "proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others"

4. Seasonings: Set totalQuantity to 0 and unit to "" (not displayed in UI)

Meal Plan: {structured_plan}

Output Format:
{{"items":[{{"name":"ingredient_name","category":"predefined_category","totalQuantity":0,"unit":"unit"}}]}}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""


# =============================================================================
# Direct Generation Prompt (single API call for full week)
# =============================================================================

def multi_day_prompt(
    days_meals: Dict[str, List[str]],
    preferences: Dict[str, Any],
    previous_recipes: List[str] = None
) -> str:
    """
    Generate prompt for multiple days' meals in a single API call.
    
    This is an optimized version that combines Step 1 and Step 2 into one call,
    directly outputting structured JSON. Used for paid API tier.
    """
    prefs_json = format_preferences_for_gemini(preferences)
    
    # Build days specification
    days_spec = []
    for day, meals in days_meals.items():
        days_spec.append(f"{day}:[{','.join(meals)}]")
    days_str = " ".join(days_spec)
    
    # Previous recipes context
    prev_context = ""
    if previous_recipes and len(previous_recipes) > 0:
        prev_context = f"\nAlready used (DO NOT repeat): {','.join(previous_recipes)}"
    
    return f"""Task: Generate a personalized meal plan in structured JSON format.

Schedule: {days_str}
Unscheduled meals should be null.{prev_context}

User Preferences: {prefs_json}

Output Schema:
{{"monday":{{"breakfast":recipe|null,"lunch":recipe|null,"dinner":recipe|null}},"tuesday":...,...,"sunday":...}}

Recipe Schema:
{{"id":"day-meal-001","name":"Recipe Name","ingredients":[{{"name":"x","quantity":1,"unit":"g","category":"proteins"}}],"instructions":"1. Step... 2. Step...","estimatedTime":30,"servings":2,"difficulty":"medium","totalCalories":300}}

Requirements:
1. All 7 days must be present (monday through sunday)
2. Each day has breakfast, lunch, dinner (null if not scheduled)
3. Recipe ID format: {{day}}-{{meal}}-{{number}} (e.g., "mon-breakfast-001")
4. Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
5. For seasonings: quantity can be 0, unit can be empty

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks)."""
