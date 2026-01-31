"""
OMenu Gemini API Test Script
测试 meal plan 生成、修改和 shopping list 生成
"""

import json
import re
from typing import Optional
from dataclasses import dataclass
from enum import Enum

# ============================================================
# 如果有 gemini_api 模块，取消下面的注释
# import gemini_api as g
# ============================================================

# ============================================================
# Constants
# ============================================================

VALID_CATEGORIES = [
    "proteins", "vegetables", "fruits", "grains", 
    "dairy", "seasonings", "pantry_staples", "others"
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]

predefined_categories = '["proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others"]'

# ============================================================
# Data Structure Templates
# ============================================================

meal_plan_structure = """{
    "monday": {
        "breakfast": {
            "id": "mon-breakfast-001",
            "name": "Scrambled Eggs with Tomato",
            "ingredients": [
                {"name": "eggs", "quantity": 4, "unit": "count", "category": "proteins"},
                {"name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables"},
                {"name": "vegetable oil", "quantity": 1, "unit": "tbsp", "category": "seasonings"}
            ],
            "instructions": "1. Beat eggs with salt. 2. Dice tomatoes. 3. Heat oil, scramble eggs. 4. Add tomatoes, mix.",
            "estimatedTime": 15,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 320
        },
        "lunch": { "id": "mon-lunch-001", ... },
        "dinner": { "id": "mon-dinner-001", ... }
    },
    "tuesday": { "breakfast": null or {...}, "lunch": {...}, "dinner": {...} },
    ...
}"""

shopping_list_structure = """{
    "items": [
        {"name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count"},
        {"name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": ""}
    ]
}"""

# ============================================================
# Prompt Templates
# ============================================================

def generate_meal_plan_prompt(user_preferences: str) -> str:
    prompt = f"""Generate a weekly meal plan as JSON based on these preferences:

{user_preferences}

Rules:
- Generate recipes ONLY where cookSchedule is true, use null where false
- NEVER include ingredients from dislikedItems
- Include mustHaveItems across the week
- Use North American units (lbs, oz, count, cups, tbsp)
- Seasonings: set quantity=0, unit=""

Recipe format:
{{
  "id": "mon-breakfast-001",
  "name": "Recipe Name",
  "ingredients": [{{"name": "eggs", "quantity": 4, "unit": "count", "category": "proteins"}}],
  "instructions": "Step by step...",
  "estimatedTime": 15,
  "servings": 2,
  "difficulty": "easy",
  "totalCalories": 320
}}

Categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others

Output structure:
{{
  "monday": {{"breakfast": {{recipe}} or null, "lunch": {{recipe}} or null, "dinner": {{recipe}} or null}},
  "tuesday": {{...}},
  "wednesday": {{...}},
  "thursday": {{...}},
  "friday": {{...}},
  "saturday": {{...}},
  "sunday": {{...}}
}}

Return RAW JSON only. No markdown, no explanation."""
    return prompt


def generate_shopping_list_prompt(structured_plan: str) -> str:
    prompt = f"""Convert this meal plan into a shopping list JSON:

{structured_plan}

Rules:
- Merge similar ingredients (e.g., "beef strips" + "flank steak" → "Beef")
- Units: meat=lbs/oz, produce=count/bunch, liquids=cups/tbsp
- Seasonings: totalQuantity=0, unit=""
- Sort by category: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others

Output format:
{{
  "items": [
    {{"name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count"}},
    {{"name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": ""}}
  ]
}}

Return RAW JSON only. No markdown, no explanation."""
    return prompt


def user_modification_prompt(user_input: str, user_preferences: str, current_meal_plan: str) -> str: 
    prompt = f"""Modify this meal plan based on the user's request.

User's Request: {user_input}

Original Preferences:
{user_preferences}

Current Meal Plan:
{current_meal_plan}

Rules:
- Make MINIMAL changes to satisfy the request
- Keep the EXACT same JSON structure
- Still respect dislikedItems
- Generate new recipe IDs for modified recipes

Return RAW JSON only. No markdown, no explanation."""
    return prompt


# ============================================================
# Response Parsing
# ============================================================

def extract_text_from_response(response) -> str:
    """Extract text content from Gemini API response."""
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


def parse_json_response(text: str) -> Optional[dict]:
    """Clean markdown formatting and parse JSON from Gemini response."""
    if not text:
        return None
    
    try:
        cleaned = text.strip()
        
        # Remove markdown code blocks
        cleaned = re.sub(r'^```json\s*\n?', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'^```\s*\n?', '', cleaned)
        cleaned = re.sub(r'\n?```\s*$', '', cleaned)
        cleaned = cleaned.strip()
        
        # Extract JSON object if there's extra text
        json_match = re.search(r'\{[\s\S]*\}', cleaned)
        if json_match:
            cleaned = json_match.group(0)
        
        return json.loads(cleaned)
    
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Text was: {text[:500]}...")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None


# ============================================================
# Validation
# ============================================================

def validate_recipe(recipe: dict) -> tuple[bool, list[str]]:
    """Validate a single recipe. Returns (is_valid, error_messages)."""
    errors = []
    required_fields = [
        "id", "name", "ingredients", "instructions", 
        "estimatedTime", "servings", "difficulty", "totalCalories"
    ]
    
    for field in required_fields:
        if field not in recipe:
            errors.append(f"Missing field: {field}")
    
    if "ingredients" in recipe:
        for i, ing in enumerate(recipe["ingredients"]):
            for field in ["name", "quantity", "unit", "category"]:
                if field not in ing:
                    errors.append(f"Ingredient {i} missing: {field}")
            if "category" in ing and ing["category"] not in VALID_CATEGORIES:
                errors.append(f"Invalid category: {ing.get('category')}")
    
    return len(errors) == 0, errors


def validate_meal_plan(data: dict) -> tuple[bool, list[str]]:
    """Validate complete meal plan. Returns (is_valid, error_messages)."""
    errors = []
    
    if not isinstance(data, dict):
        return False, ["Data is not a dict"]
    
    for day in DAYS:
        if day not in data:
            errors.append(f"Missing day: {day}")
            continue
        
        day_data = data[day]
        if not isinstance(day_data, dict):
            errors.append(f"{day} is not a dict")
            continue
        
        for meal in MEALS:
            if meal not in day_data:
                errors.append(f"Missing {day}.{meal}")
                continue
            
            recipe = day_data[meal]
            if recipe is not None:
                is_valid, recipe_errors = validate_recipe(recipe)
                if not is_valid:
                    errors.extend([f"{day}.{meal}: {e}" for e in recipe_errors])
    
    return len(errors) == 0, errors


def validate_shopping_list(data: dict) -> tuple[bool, list[str]]:
    """Validate shopping list. Returns (is_valid, error_messages)."""
    errors = []
    
    if "items" not in data:
        return False, ["Missing 'items' field"]
    
    if not isinstance(data["items"], list):
        return False, ["'items' is not a list"]
    
    for i, item in enumerate(data["items"]):
        for field in ["name", "category", "totalQuantity", "unit"]:
            if field not in item:
                errors.append(f"Item {i} missing: {field}")
        if "category" in item and item["category"] not in VALID_CATEGORIES:
            errors.append(f"Item {i} invalid category: {item.get('category')}")
    
    return len(errors) == 0, errors


# ============================================================
# Test Cases
# ============================================================

# Test Case 1: 完整一周计划（中式健康餐）
test_case_1 = {
    "name": "Full Week - Chinese Healthy",
    "preferences": {
        "keywords": ["chinese food", "healthy", "quick", "nutritious"],
        "mustHaveItems": ["eggs", "tofu", "rice", "noodles"],
        "dislikedItems": ["organ meat", "cilantro", "peanuts"],
        "budget": 150,
        "numPeople": 2,
        "difficulty": "medium",
        "cookSchedule": {
            "monday": {"breakfast": True, "lunch": True, "dinner": True},
            "tuesday": {"breakfast": True, "lunch": True, "dinner": True},
            "wednesday": {"breakfast": True, "lunch": True, "dinner": True},
            "thursday": {"breakfast": True, "lunch": True, "dinner": True},
            "friday": {"breakfast": True, "lunch": True, "dinner": True},
            "saturday": {"breakfast": True, "lunch": True, "dinner": True},
            "sunday": {"breakfast": True, "lunch": True, "dinner": True}
        }
    }
}

# Test Case 2: 工作日午晚餐（美式简单）
test_case_2 = {
    "name": "Weekday Lunch & Dinner Only - American Easy",
    "preferences": {
        "keywords": ["American", "easy", "comfort food", "quick"],
        "mustHaveItems": ["chicken", "pasta", "cheese"],
        "dislikedItems": ["spicy food", "mushrooms", "olives"],
        "budget": 100,
        "numPeople": 2,
        "difficulty": "easy",
        "cookSchedule": {
            "monday": {"breakfast": False, "lunch": True, "dinner": True},
            "tuesday": {"breakfast": False, "lunch": True, "dinner": True},
            "wednesday": {"breakfast": False, "lunch": True, "dinner": True},
            "thursday": {"breakfast": False, "lunch": True, "dinner": True},
            "friday": {"breakfast": False, "lunch": True, "dinner": True},
            "saturday": {"breakfast": False, "lunch": False, "dinner": False},
            "sunday": {"breakfast": False, "lunch": False, "dinner": False}
        }
    }
}

# Test Case 3: 周末早午餐（素食）
test_case_3 = {
    "name": "Weekend Brunch - Vegetarian",
    "preferences": {
        "keywords": ["vegetarian", "healthy", "Mediterranean", "brunch"],
        "mustHaveItems": ["eggs", "avocado", "bread", "yogurt"],
        "dislikedItems": ["meat", "fish", "shellfish"],
        "budget": 50,
        "numPeople": 2,
        "difficulty": "easy",
        "cookSchedule": {
            "monday": {"breakfast": False, "lunch": False, "dinner": False},
            "tuesday": {"breakfast": False, "lunch": False, "dinner": False},
            "wednesday": {"breakfast": False, "lunch": False, "dinner": False},
            "thursday": {"breakfast": False, "lunch": False, "dinner": False},
            "friday": {"breakfast": False, "lunch": False, "dinner": False},
            "saturday": {"breakfast": True, "lunch": True, "dinner": False},
            "sunday": {"breakfast": True, "lunch": True, "dinner": False}
        }
    }
}

# Test Case 4: 一人餐 Keto 低碳
test_case_4 = {
    "name": "Solo Keto - Low Carb",
    "preferences": {
        "keywords": ["keto", "low-carb", "high-protein", "meal prep"],
        "mustHaveItems": ["beef", "salmon", "eggs", "bacon"],
        "dislikedItems": ["bread", "rice", "pasta", "potatoes", "sugar"],
        "budget": 120,
        "numPeople": 1,
        "difficulty": "medium",
        "cookSchedule": {
            "monday": {"breakfast": True, "lunch": True, "dinner": True},
            "tuesday": {"breakfast": True, "lunch": True, "dinner": True},
            "wednesday": {"breakfast": True, "lunch": True, "dinner": True},
            "thursday": {"breakfast": True, "lunch": True, "dinner": True},
            "friday": {"breakfast": True, "lunch": True, "dinner": True},
            "saturday": {"breakfast": False, "lunch": False, "dinner": False},
            "sunday": {"breakfast": False, "lunch": False, "dinner": False}
        }
    }
}

# Test Case 5: 家庭餐（4人）
test_case_5 = {
    "name": "Family Meals - 4 People",
    "preferences": {
        "keywords": ["family-style", "kid-friendly", "budget-friendly", "easy"],
        "mustHaveItems": ["chicken", "rice", "pasta", "cheese", "broccoli"],
        "dislikedItems": ["spicy food", "raw fish", "liver"],
        "budget": 200,
        "numPeople": 4,
        "difficulty": "easy",
        "cookSchedule": {
            "monday": {"breakfast": False, "lunch": False, "dinner": True},
            "tuesday": {"breakfast": False, "lunch": False, "dinner": True},
            "wednesday": {"breakfast": False, "lunch": False, "dinner": True},
            "thursday": {"breakfast": False, "lunch": False, "dinner": True},
            "friday": {"breakfast": False, "lunch": False, "dinner": True},
            "saturday": {"breakfast": True, "lunch": True, "dinner": True},
            "sunday": {"breakfast": True, "lunch": True, "dinner": True}
        }
    }
}

# 用户修改请求测试
modification_requests = [
    "Replace Monday dinner with a high-protein meal",
    "Make Wednesday lunch vegetarian",
    "Add more variety to breakfast options",
    "I bought salmon on sale, can you add more salmon dishes?",
    "Remove all beef from the plan and replace with chicken",
]

ALL_TEST_CASES = [test_case_1, test_case_2, test_case_3, test_case_4, test_case_5]


# ============================================================
# Test Runner
# ============================================================

class TestMode(Enum):
    PROMPT_ONLY = "prompt_only"       # 只打印 prompt，不调用 API
    API_CALL = "api_call"             # 调用 API 并验证结果
    FULL_FLOW = "full_flow"           # 完整流程：生成 → 修改 → 购物清单


def run_test(test_case: dict, mode: TestMode = TestMode.PROMPT_ONLY, gemini_api=None):
    """Run a single test case."""
    print("\n" + "=" * 60)
    print(f"TEST: {test_case['name']}")
    print("=" * 60)
    
    preferences = test_case["preferences"]
    # 紧凑格式，不用 indent
    preferences_json = json.dumps(preferences, ensure_ascii=False, separators=(',', ':'))
    
    # Count scheduled meals
    scheduled_meals = sum(
        1 for day in DAYS 
        for meal in MEALS 
        if preferences["cookSchedule"][day][meal]
    )
    print(f"\nScheduled meals: {scheduled_meals}")
    print(f"Budget: ${preferences['budget']} for {preferences['numPeople']} people")
    print(f"Difficulty: {preferences['difficulty']}")
    print(f"Keywords: {', '.join(preferences['keywords'])}")
    
    # Generate prompt
    prompt = generate_meal_plan_prompt(preferences_json)
    
    if mode == TestMode.PROMPT_ONLY:
        print("\n--- PROMPT ---")
        print(prompt)
        print("\n--- END PROMPT ---")
        return None
    
    # API Call mode
    if gemini_api is None:
        print("\n⚠️  No gemini_api provided, cannot make API call")
        return None
    
    print("\n📡 Calling Gemini API for meal plan...")
    try:
        response = gemini_api.gemini3_flash(prompt)
        text = extract_text_from_response(response)
        
        if not text:
            print("❌ Empty response from API")
            return None
        
        print(f"📝 Response length: {len(text)} chars")
        
        # Parse and validate
        data = parse_json_response(text)
        if not data:
            print("❌ Failed to parse JSON")
            print(f"Raw response:\n{text[:1000]}...")
            return None
        
        is_valid, errors = validate_meal_plan(data)
        if is_valid:
            print("✅ Meal plan validation passed!")
            
            # Count actual recipes
            recipe_count = sum(
                1 for day in DAYS 
                for meal in MEALS 
                if data[day][meal] is not None
            )
            print(f"📊 Generated {recipe_count} recipes (expected {scheduled_meals})")
            
            # Check null placements
            null_count = sum(
                1 for day in DAYS 
                for meal in MEALS 
                if data[day][meal] is None
            )
            expected_nulls = 21 - scheduled_meals  # 7 days * 3 meals = 21
            print(f"📊 Null meals: {null_count} (expected {expected_nulls})")
            
        else:
            print("❌ Validation failed:")
            for error in errors[:10]:  # Show first 10 errors
                print(f"   - {error}")
        
        if mode == TestMode.FULL_FLOW and is_valid:
            # Test modification
            print("\n--- Testing Modification ---")
            mod_request = modification_requests[0]
            print(f"Modification request: {mod_request}")
            
            mod_prompt = user_modification_prompt(
                mod_request, 
                preferences_json, 
                json.dumps(data, separators=(',', ':'))
            )
            
            mod_response = gemini_api.gemini3_flash(mod_prompt)
            mod_text = extract_text_from_response(mod_response)
            mod_data = parse_json_response(mod_text)
            
            if mod_data:
                is_valid, errors = validate_meal_plan(mod_data)
                if is_valid:
                    print("✅ Modified meal plan validation passed!")
                else:
                    print("❌ Modified plan validation failed")
            
            # Test shopping list
            print("\n--- Testing Shopping List ---")
            shop_prompt = generate_shopping_list_prompt(json.dumps(data, separators=(',', ':')))
            shop_response = gemini_api.gemini3_flash(shop_prompt)
            shop_text = extract_text_from_response(shop_response)
            shop_data = parse_json_response(shop_text)
            
            if shop_data:
                is_valid, errors = validate_shopping_list(shop_data)
                if is_valid:
                    print("✅ Shopping list validation passed!")
                    print(f"📊 Total items: {len(shop_data['items'])}")
                    
                    # Count by category
                    category_counts = {}
                    for item in shop_data['items']:
                        cat = item['category']
                        category_counts[cat] = category_counts.get(cat, 0) + 1
                    print(f"📊 By category: {category_counts}")
                else:
                    print("❌ Shopping list validation failed")
                    for error in errors[:5]:
                        print(f"   - {error}")
        
        return data
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def run_all_tests(mode: TestMode = TestMode.PROMPT_ONLY, gemini_api=None):
    """Run all test cases."""
    print("\n" + "#" * 60)
    print("# OMenu API Test Suite")
    print(f"# Mode: {mode.value}")
    print("#" * 60)
    
    results = []
    for test_case in ALL_TEST_CASES:
        result = run_test(test_case, mode, gemini_api)
        results.append({
            "name": test_case["name"],
            "success": result is not None
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for r in results:
        status = "✅" if r["success"] else "❌"
        print(f"{status} {r['name']}")


def print_prompt_only(test_case_index: int = 0):
    """Quick function to print a single prompt for inspection."""
    test_case = ALL_TEST_CASES[test_case_index]
    preferences_json = json.dumps(test_case["preferences"], indent=2)
    prompt = generate_meal_plan_prompt(preferences_json)
    
    print(f"Test Case: {test_case['name']}")
    print("-" * 40)
    print(prompt)


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    import sys
    
    # 默认只打印 prompt
    mode = TestMode.PROMPT_ONLY
    
    # 命令行参数
    if len(sys.argv) > 1:
        if sys.argv[1] == "api":
            mode = TestMode.API_CALL
        elif sys.argv[1] == "full":
            mode = TestMode.FULL_FLOW
        elif sys.argv[1] == "prompt":
            mode = TestMode.PROMPT_ONLY
        elif sys.argv[1].isdigit():
            # 打印单个测试用例的 prompt
            print_prompt_only(int(sys.argv[1]))
            sys.exit(0)
    
    # 如果需要调用 API，尝试导入 gemini_api
    gemini = None
    if mode in [TestMode.API_CALL, TestMode.FULL_FLOW]:
        try:
            import gemini_api as g
            gemini = g
            print("✅ gemini_api loaded")
        except ImportError:
            print("⚠️  gemini_api not found, falling back to PROMPT_ONLY mode")
            mode = TestMode.PROMPT_ONLY
    
    # 运行测试
    run_all_tests(mode, gemini)
