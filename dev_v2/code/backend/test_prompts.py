"""
Test script to show complete prompts for OMenu.

Run this to see the actual prompts that will be sent to Gemini.
"""

import json
from app.services.prompts import (
    meal_plan_prompt,
    structured_plan_prompt,
    modification_prompt,
    shopping_list_prompt,
    format_preferences_for_gemini,
)


def main():
    # Sample user preferences (from frontend)
    sample_preferences = {
        "keywords": ["Chinese", "Healthy", "Quick"],
        "mustHaveItems": ["Eggs", "Chicken", "Rice"],
        "dislikedItems": ["Peanuts", "Cilantro"],
        "numPeople": 2,
        "budget": 100,
        "difficulty": "medium",
        "cookSchedule": {
            "monday": {"breakfast": True, "lunch": True, "dinner": True},
            "tuesday": {"breakfast": False, "lunch": True, "dinner": True},
            "wednesday": {"breakfast": False, "lunch": True, "dinner": True},
            "thursday": {"breakfast": False, "lunch": True, "dinner": True},
            "friday": {"breakfast": False, "lunch": True, "dinner": True},
            "saturday": {"breakfast": True, "lunch": True, "dinner": True},
            "sunday": {"breakfast": True, "lunch": False, "dinner": False},
        }
    }
    
    # Convert to Gemini format
    prefs_json = format_preferences_for_gemini(sample_preferences)
    
    print("=" * 80)
    print("STEP 1: MEAL PLAN GENERATION PROMPT")
    print("=" * 80)
    print()
    prompt1 = meal_plan_prompt(prefs_json)
    print(prompt1)
    print()
    
    print("=" * 80)
    print("STEP 2: STRUCTURED PLAN CONVERSION PROMPT")
    print("=" * 80)
    print()
    # Simulate Step 1 output (abbreviated for display)
    sample_natural_plan = """
Monday:
- Breakfast: Scrambled Eggs with Tomato (eggs, tomatoes, oil)
- Lunch: Chicken Stir-fry with Rice (chicken breast, bell peppers, soy sauce, rice)
- Dinner: Steamed Fish with Ginger (fish fillet, ginger, scallions)

Tuesday:
- Lunch: Egg Fried Rice (rice, eggs, peas, carrots)
- Dinner: Kung Pao Chicken (chicken, vegetables, no peanuts)
...
"""
    prompt2 = structured_plan_prompt(sample_natural_plan)
    print(prompt2)
    print()
    
    print("=" * 80)
    print("STEP 3: MODIFICATION PROMPT (optional)")
    print("=" * 80)
    print()
    sample_modification = "Please add more high-protein meals for dinner"
    sample_previous_plan = '{"monday": {"breakfast": {...}, "lunch": {...}, "dinner": {...}}, ...}'
    prompt3 = modification_prompt(sample_modification, prefs_json, sample_previous_plan)
    print(prompt3)
    print()
    
    print("=" * 80)
    print("STEP 4: SHOPPING LIST GENERATION PROMPT")
    print("=" * 80)
    print()
    sample_structured_plan = """
{
  "monday": {
    "breakfast": {
      "name": "Scrambled Eggs with Tomato",
      "ingredients": [
        {"name": "eggs", "quantity": 4, "unit": "count"},
        {"name": "tomatoes", "quantity": 2, "unit": "count"}
      ]
    },
    "lunch": {
      "name": "Chicken Stir-fry",
      "ingredients": [
        {"name": "chicken breast", "quantity": 300, "unit": "g"},
        {"name": "bell peppers", "quantity": 2, "unit": "count"}
      ]
    }
  }
}
"""
    prompt4 = shopping_list_prompt(sample_structured_plan)
    print(prompt4)
    print()
    
    print("=" * 80)
    print("PREFERENCES FORMAT COMPARISON")
    print("=" * 80)
    print()
    print("Original (boolean schedule):")
    print(json.dumps(sample_preferences["cookSchedule"], indent=2))
    print()
    print("Converted for Gemini (array schedule):")
    from app.services.prompts import convert_schedule_to_array_format
    converted = convert_schedule_to_array_format(sample_preferences["cookSchedule"])
    print(json.dumps(converted, indent=2))


if __name__ == "__main__":
    main()
