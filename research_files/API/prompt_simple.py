import gemini_api as g
import json

user_preferences_format = """{{
        "preferred_keywords": ["string", "string"],
        "preferred_recipes/ingredients": ["string", "string"],
        "dietary_restrictions": ["string", "string"],
        "budget": 0,
        "num_people": 0,
        "difficulty": "easy/medium/hard",
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

meal_plan_constraints = """
    1. Ensure the meal plan aligns with the user's restrictions and preferences.
    2. Consider the different between breakfast, lunch, and dinner in terms of portion size, nutritional needs and timing.
    3. Consider the ingredients can be used across multiple meals to minimize waste, but consider diversity as well.
    """

meal_plan_structure = """
{{  "monday": {
        "breakfast": {
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


def meal_plan_prompt(user_preferences: str) -> str:
    plan_prompt = f"""
    Task: Based on the user's preferences, generate a personalized meal plan in JSON format, every meal should include recipeName, ingredients and brief description.
    User Preferences: {user_preferences}
    """
    # Constraints: {meal_plan_constraints}
    return plan_prompt

def extract_text_from_response(response) -> str:
    """
    Extract text content from Gemini API response.
    
    Args:
        response: The API response object
    
    Returns:
        str: The extracted text content
    """
    try:
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and candidate.content:
                parts = candidate.content.parts
                if parts and hasattr(parts[0], 'text'):
                    text = parts[0].text
                    if text:
                        return text.strip()
        return ""
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def generate_structured_plan_prompt(extracted_plan: str) -> str:
    structured_plan_prompt = f"""
    Task: Convert the following meal plan into a structured JSON format according to the schema.
    
    Meal Plan: {extracted_plan}
    
    Output Schema:
    {meal_plan_structure}
    
    RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
    """
    return structured_plan_prompt

def generate_shopping_list_prompt(structured_plan: str) -> str:
    shopping_list_prompt = f"""
    Task: Convert the Meal Plan into a consolidated North American shopping list (JSON).
    
    CRITICAL RULES:
    1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories.
       - (e.g., "Beef strips" + "Flank steak" -> "Beef (Stir-fry cut)")
       - (e.g., "Scallions" + "Green onions" -> "Green Onions")
    
    2. **UNITS (North America)**:
       - **Meat/Bulk**: MUST use 'lbs' or 'oz'. (No grams).
       - **Produce**: MUST use 'count' or 'bunch'. (No 'stalks', 'slices').

    "predefinedCategories": [
        "proteins", "vegetables", "fruits", "grains", "dairy", "oils_condiments", "spices_seasonings", "pantry_staples", "others"
    ],
    
    Meal Plan: {structured_plan}
    
    Output Format:
    {{
        "ingredients": [
            {{"name": "ingredient_name", "category": "predefined_category", "total_quantity": 0, "unit": "unit"}},
            ...
        ]
    }}
    
    RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
    """
    return shopping_list_prompt

def user_manipulated_prompt(user_manipulation_input: str, user_preferences: str, previous_meal_plan: str) -> str: 
    prompt = f"""
    Task: based on user's new input, previous preferences and meal plan, adjust the meal plan accordingly. DO NOT change the format of the meal plan.
    Return exactly the same format as previous meal plan. Do minimal changes to accommodate user's new input.

    User's new input: {user_manipulation_input}
    Previous user preferences: {user_preferences}
    Previous meal plan: {previous_meal_plan}
    """
    return prompt


def __main__():
    # Define user preferences as a Python dictionary (not a string)
    user_preferences = {
        "preferred_keywords": ["chinese food", "healthy", "quick food", "nutritious"],
        "preferred_recipes/ingredients": ["braised beef", "noodles", "tofu skin", "eggs"],
        "dietary_restrictions": ["organ meat"],
        "budget": "140USD",
        "num_people": 2,
        "difficulty": "medium",
        "cook_schedule": {
            "monday": ["breakfast", "lunch", "dinner"],
            "tuesday": ["breakfast", "lunch", "dinner"],
            "wednesday": ["breakfast", "lunch", "dinner"],
            "thursday": ["breakfast", "lunch", "dinner"],
            "friday": ["breakfast", "lunch", "dinner"],
            "saturday": ["breakfast", "lunch", "dinner"],
            "sunday": []
        },
        "others": ["nutritious, abundant meat, suitable for home cooking"]
    }
    
    try:
        # Convert user preferences to JSON string
        user_preferences_str = json.dumps(user_preferences, ensure_ascii=False, indent=2)
        print(f"User Preferences: \n{user_preferences_str}\n——————————————\n")
        
        # Prompt to get meal plan
        meal_plan_prompt_str = meal_plan_prompt(user_preferences_str)
        print(f"Meal Plan Prompt: \n {meal_plan_prompt_str} \n——————————————\n")
        
        # Get meal plan from API
        print("Calling Gemini API for meal plan generation...")
        meal_plan_response = g.gemini3_flash(meal_plan_prompt_str)
        
        # Extract text from response
        meal_plan_text = extract_text_from_response(meal_plan_response)
        if not meal_plan_text:
            print("⚠️  Warning: Empty response from meal plan generation")
            return
        
        print(f"Extracted Meal Plan Text: \n {meal_plan_text} \n ——————————————\n")

        # Prompt to get structured meal plan
        structured_plan_prompt_str = generate_structured_plan_prompt(meal_plan_text)
        print(f"Structured Plan Prompt: \n {structured_plan_prompt_str} \n——————————————\n")

        # Get structured meal plan from API
        print("Calling Gemini API for plan structuring...")
        structured_meal_plan_response = g.gemini3_flash(structured_plan_prompt_str)
        
        # Extract and parse structured response
        structured_meal_plan_text = extract_text_from_response(structured_meal_plan_response)
        if not structured_meal_plan_text:
            print("⚠️  Warning: Empty response from structured plan generation")
            return
        
        print(f"Structured Meal Plan Response: \n {structured_meal_plan_text} \n——————————————\n")

        # user manipulation (if needed)
        user_manipulated_input = "Please add dinner on Sunday with high-protein meals."

        if user_manipulated_input.strip():
            user_manipulated_prompt_str = user_manipulated_prompt(user_manipulated_input, user_preferences_str,structured_meal_plan_text)
            print(f"User Manipulated Prompt: \n {user_manipulated_prompt_str} \n——————————————\n")

            # Get manipulated meal plan from API
            print("Calling Gemini API for user manipulated meal plan generation...")
            manipulated_meal_plan_response = g.gemini3_flash(user_manipulated_prompt_str)
            structured_meal_plan_text = extract_text_from_response(manipulated_meal_plan_response)
            if not structured_meal_plan_text:
                print("⚠️  Warning: Empty response from user manipulated meal plan generation")
                return
            print(f"Manipulated Meal Plan Response: \n {structured_meal_plan_text} \n——————————————\n")

        # Generate shopping list prompt
        shopping_list_prompt_str = generate_shopping_list_prompt(structured_meal_plan_text)
        print(f"Shopping List Prompt: \n {shopping_list_prompt_str} \n——————————————\n")

        # Get shopping list from API
        print("Calling Gemini API for shopping list generation...")
        shopping_list_response = g.gemini3_flash(shopping_list_prompt_str)
        shopping_list_text = extract_text_from_response(shopping_list_response)
        if not shopping_list_text:
            print("⚠️  Warning: Empty response from shopping list generation")
            return
        print(f"Shopping List Response: \n {shopping_list_text} \n——————————————\n")
    
        
            
    except Exception as e:
        print(f"✗ Error during meal plan generation: {e}")
        import traceback
        traceback.print_exc()



if __name__ == "__main__":
    __main__()
