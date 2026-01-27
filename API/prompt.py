import gemini_api as g
import json
user_preferences_structure = """{{
        "preferred_mood_tags": ["string", "string"],
        "preferred_recipes": ["string", "string"],
        "preferred_ingredients": ["string", "string"],
        "dietary_restrictions": ["string", "string"],
        "budget": 0,
        "num_people": 0,
        "cook_time_per_meal": 0,
        "cook_schedule": {{
            "monday": ["breakfast", "lunch", "dinner"],
            "tuesday": ["breakfast", "lunch", "dinner"],
            "wednesday": ["breakfast", "lunch", "dinner"],
            "thursday": ["breakfast", "lunch", "dinner"],
            "friday": ["breakfast", "lunch", "dinner"],
            "saturday": ["breakfast", "lunch", "dinner"],
            "sunday": ["breakfast", "lunch", "dinner"]
        }},
        "others": ["string"]
    }}"""

meal_plan_structure = """
{{  "monday": {
        "breakfast": {
            "recipeId": "recipe_001",
            "recipeName": "Scrambled Eggs with Tomato",
            "ingredients": [
                {"name": "eggs", "quantity": 2, "unit": "count"},
                {"name": "tomato", "quantity": 100, "unit": "g"},
                {"name": "oil", "quantity": 15, "unit": "ml"}
            ],
            "recipeDetails": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
            "estimatedTime": 15,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 180
            }
    """

mela_plan_constraints = """
    1. Ensure the meal plan aligns with the user's dietary restrictions and preferences.
    2. Must include user preferred ingredients and recipes where possible.
    3. Each meal should have a balanced nutritional profile.
    4. Consider the different between breakfast, lunch, and dinner in terms of portion size and nutritional needs.
    5. Consider the ingredients can be usetd across multiple meals to minimize waste. 
    6. RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
    """

def structured_preference(user_input: str, user_preferences: dict) -> str:
    prompt = f"""
    Role: You are a culinary data extraction assistant. Your task is to normalize and structure meal preference data into consistent JSON format.
    
    Task: Analyze the 'User Input' and 'User Preferences' below, then extract and structure all preference data according to the schema.
    
    Inputs:
    - User Input: "{user_input}"
    - Current Preferences: {user_preferences}
    
    Output Schema (return as valid JSON only):
    {user_preferences_structure}

    Constraints:
    1. Extract ALL information from user input and current preferences.
    2. If information is missing, use empty list [] or 0 for numbers.
    3. budget: integer (US dollars)
    4. num_people: integer (number of people)
    5. cook_time_per_meal: integer (minutes)
    6. cook_schedule: only include meals explicitly mentioned by user (e.g., ["breakfast", "dinner"] if only breakfast and dinner are mentioned)
    7. Uncategorized details go in 'others' as strings.
    8. RETURN ONLY VALID JSON. No markdown, no extra text, no code blocks.
    9. Ensure all required fields are present.
    """
    return prompt

def structured_preference_plan(preference_profile: str) -> dict:
    plan_prompt = f""" 
    Role: You are a nutrition and meal planning expert with great knowledge of cook styles and recipes from many countries, with extensive experience in creating personalized meal plans based on user preferences and dietary needs.
    Task: Based on the user preferences provided below, generate a personalized meal plan in JSON format.

    Inputs:
    - user_preference: {preference_profile}
    Output Schema:
    {meal_plan_structure}

    Constraints:
    {mela_plan_constraints}
"""
    return plan_prompt

def direct_meal_plan(user_prompts: str, user_preferences: dict) -> str:
    plan_prompt = f"""
    Role: You are a nutrition and meal planning expert. Generate meal plans directly from user natural language input.
    
    Task: Based on the user's raw input and preferences, generate a complete 7-day meal plan in JSON format without intermediate processing.
    
    User Input: "{user_prompts}"
    User Preferences: {user_preferences}
    
    Output Schema:
    {meal_plan_structure}

    Constraints:
    {mela_plan_constraints}
    """
    return plan_prompt


def __main__():
    user_prompts = input("What do you want to eat next week?")

    user_preferences = {
        'preferred_mood_tags': ['chinese food', 'spicy food'],
        'preferred_recipes': ['mapo tofu', 'kung pao chicken', 'hot and sour soup'],
        'preferred_ingredients': ['tofu', 'chicken', 'mushrooms'],
        'dietary_restrictions': ['no peanuts', 'no shellfish'],
        'preferred_cuisine': ['Sichuan', 'Hunan'],
        'budget': 140,
        'num_people': 2,
        'cook_time_per_meal': 30,
        'others':[],
        'cook_schedule': {
            'monday': ['breakfast', 'lunch', 'dinner'],
            'tuesday': ['breakfast', 'lunch', 'dinner'],
            'wednesday': ['breakfast', 'lunch', 'dinner'],
            'thursday': ['breakfast', 'lunch', 'dinner'],
            'friday': ['breakfast', 'lunch', 'dinner'],
            'saturday': ['breakfast', 'lunch', 'dinner'],
            'sunday': ['breakfast', 'lunch', 'dinner']
        }
    }
    # prompt to get direct meal plan
    direct_meal_plan_prompt = direct_meal_plan(user_prompts, user_preferences)
    print(f"Direct Meal Plan Prompt: \n {direct_meal_plan_prompt} \n——————————————\n")
    # get direct meal plan
    direct_meal_plan_result = g.gemini(direct_meal_plan_prompt)
    print(f"Direct Meal Plan: \n {direct_meal_plan_result} \n")

    """
    # prompt to get structured preference profile
    preference_prompt = structured_preference(user_prompts, user_preferences)
    print(f"Preference Prompt: \n {preference_prompt} \n——————————————\n")
    # get structured preference profile
    structured_preference_result = g.gemini(preference_prompt)
    print(f"Preference Profile: \n {structured_preference_result} \n——————————————\n")

    # prompt to get structured meal plan
    structured_preference_plan_prompt = structured_preference_plan(structured_preference_result)
    print(f"Structured Meal Plan Prompt: \n {structured_preference_plan_prompt} \n——————————————\n")
    # get structured meal plan
    structured_meal_plan_result = g.gemini(structured_preference_plan_prompt)
    print(f"Structured Meal Plan: \n {structured_meal_plan_result} \n——————————————\n")
    """


if __name__ == "__main__":
    __main__()
