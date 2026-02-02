#!/usr/bin/env python3
"""
Run 3 scenario tests for OMenu backend.
"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# 3 test scenarios
SCENARIOS = [
    {
        "name": "健康减脂用户",
        "request": {
            "keywords": ["low-carb", "high-protein", "健身餐"],
            "mustHaveItems": ["chicken breast", "broccoli", "eggs"],
            "dislikedItems": ["pork", "fried food"],
            "numPeople": 1,
            "budget": 100,
            "difficulty": "easy",
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
    },
    {
        "name": "中式家庭餐",
        "request": {
            "keywords": ["中餐", "家常菜", "营养均衡"],
            "mustHaveItems": ["豆腐", "青菜", "猪肉"],
            "dislikedItems": ["辣椒", "香菜"],
            "numPeople": 4,
            "budget": 200,
            "difficulty": "medium",
            "cookSchedule": {
                "monday": {"breakfast": False, "lunch": False, "dinner": False},
                "tuesday": {"breakfast": False, "lunch": False, "dinner": False},
                "wednesday": {"breakfast": False, "lunch": False, "dinner": False},
                "thursday": {"breakfast": False, "lunch": False, "dinner": False},
                "friday": {"breakfast": False, "lunch": False, "dinner": False},
                "saturday": {"breakfast": True, "lunch": True, "dinner": True},
                "sunday": {"breakfast": True, "lunch": True, "dinner": True}
            }
        }
    },
    {
        "name": "素食主义者",
        "request": {
            "keywords": ["vegetarian", "plant-based", "healthy"],
            "mustHaveItems": ["tofu", "quinoa", "avocado"],
            "dislikedItems": ["meat", "fish", "eggs"],
            "numPeople": 2,
            "budget": 300,
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
]


def validate_recipe(recipe, scenario_name, day, meal):
    """Validate a single recipe has all required fields."""
    if recipe is None:
        return True  # Skip if no meal scheduled
    
    errors = []
    required_fields = ["name", "ingredients", "instructions", "estimatedTime", "servings", "difficulty", "totalCalories"]
    
    for field in required_fields:
        if field not in recipe or recipe[field] is None:
            errors.append(f"Missing {field}")
        elif field == "ingredients" and len(recipe[field]) == 0:
            errors.append("Empty ingredients")
        elif field == "instructions" and len(recipe[field].strip()) == 0:
            errors.append("Empty instructions")
    
    if errors:
        print(f"    ⚠️  {day} {meal}: {', '.join(errors)}")
        return False
    return True


def run_scenario(scenario, index):
    """Run a single test scenario."""
    print(f"\n{'='*60}")
    print(f"Scenario {index + 1}: {scenario['name']}")
    print(f"{'='*60}")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/meal-plans/generate",
            json=scenario["request"],
            timeout=180
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            plan_id = data.get("id", "unknown")
            
            print(f"✅ SUCCESS in {elapsed:.1f}s")
            print(f"   Plan ID: {plan_id}")
            
            # Validate all recipes
            all_valid = True
            days = data.get("days", {})
            for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
                day_data = days.get(day, {})
                for meal in ["breakfast", "lunch", "dinner"]:
                    recipe = day_data.get(meal)
                    if not validate_recipe(recipe, scenario["name"], day, meal):
                        all_valid = False
            
            if all_valid:
                print("   All recipes validated ✓")
            
            return {
                "status": "success",
                "time": elapsed,
                "plan_id": plan_id,
                "valid": all_valid
            }
        else:
            print(f"❌ FAILED with status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return {
                "status": "failed",
                "time": elapsed,
                "error": f"HTTP {response.status_code}: {response.text[:100]}"
            }
            
    except requests.Timeout:
        elapsed = time.time() - start_time
        print(f"❌ TIMEOUT after {elapsed:.1f}s")
        return {"status": "timeout", "time": elapsed}
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ ERROR: {e}")
        return {"status": "error", "time": elapsed, "error": str(e)}


def main():
    print("\n" + "="*60)
    print("OMenu Backend Test - 3 Scenarios")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Model: gemini-2.0-flash (paid API - full week generation)")
    print("="*60)
    
    results = []
    for i, scenario in enumerate(SCENARIOS):
        result = run_scenario(scenario, i)
        result["name"] = scenario["name"]
        results.append(result)
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results if r["status"] == "success")
    total = len(results)
    
    for r in results:
        status = "✅" if r["status"] == "success" else "❌"
        print(f"{status} {r['name']}: {r['status']} ({r['time']:.1f}s)")
    
    print(f"\nTotal: {passed}/{total} passed")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
