#!/usr/bin/env python3
"""
Test script to run user scenarios and generate evaluation report.
"""
import json
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def load_scenarios():
    with open("tests/test_scenarios.json", "r") as f:
        return json.load(f)["scenarios"]

def generate_meal_plan(scenario):
    """Call API to generate meal plan."""
    response = requests.post(
        f"{BASE_URL}/meal-plans/generate",
        json=scenario["request"],
        timeout=120
    )
    response.raise_for_status()
    return response.json()

def generate_shopping_list(meal_plan):
    """Call API to generate shopping list."""
    response = requests.post(
        f"{BASE_URL}/shopping-lists/generate",
        json={
            "mealPlanId": meal_plan["id"],
            "mealPlan": meal_plan
        },
        timeout=60
    )
    response.raise_for_status()
    return response.json()

def format_recipe(recipe, meal_type):
    """Format a single recipe for markdown."""
    if recipe is None:
        return f"  - **{meal_type.capitalize()}**: *(Not scheduled)*\n"
    
    ingredients_str = ", ".join([
        f"{ing['name']} ({ing['quantity']} {ing['unit']})" 
        for ing in recipe.get("ingredients", [])
    ])
    
    return f"""  - **{meal_type.capitalize()}**: {recipe['name']}
    - ⏱️ {recipe.get('estimatedTime', 'N/A')} min | 👥 {recipe.get('servings', 'N/A')} servings | 🔥 {recipe.get('totalCalories', 'N/A')} cal
    - 📝 Ingredients: {ingredients_str}
    - 📖 {recipe.get('instructions', 'N/A')[:100]}...
"""

def format_meal_plan(meal_plan, scenario):
    """Format meal plan for markdown."""
    days_order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    day_names = {
        "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday",
        "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday"
    }
    
    output = f"""
## Scenario: {scenario['name']}

**Description**: {scenario['description']}

### User Preferences
| Setting | Value |
|---------|-------|
| Keywords | {', '.join(scenario['request']['keywords'])} |
| Must Have | {', '.join(scenario['request']['mustHaveItems'])} |
| Disliked | {', '.join(scenario['request']['dislikedItems']) or 'None'} |
| People | {scenario['request']['numPeople']} |
| Budget | ${scenario['request']['budget']} |
| Difficulty | {scenario['request']['difficulty']} |

### Generated Meal Plan

"""
    
    days = meal_plan.get("days", {})
    for day in days_order:
        day_meals = days.get(day, {})
        schedule = scenario['request']['cookSchedule'].get(day, {})
        
        # Check if any meal is scheduled
        if not any(schedule.values()):
            output += f"#### {day_names[day]}\n*(No meals scheduled)*\n\n"
            continue
            
        output += f"#### {day_names[day]}\n"
        for meal_type in ["breakfast", "lunch", "dinner"]:
            if schedule.get(meal_type, False):
                output += format_recipe(day_meals.get(meal_type), meal_type)
        output += "\n"
    
    return output

def format_shopping_list(shopping_list):
    """Format shopping list for markdown."""
    output = """### Shopping List

| Category | Item | Quantity | Unit |
|----------|------|----------|------|
"""
    # Group by category
    items_by_category = {}
    for item in shopping_list.get("items", []):
        category = item.get("category", "others")
        if category not in items_by_category:
            items_by_category[category] = []
        items_by_category[category].append(item)
    
    category_order = ["proteins", "vegetables", "fruits", "grains", "dairy", "pantry_staples", "seasonings", "others"]
    
    for category in category_order:
        if category in items_by_category:
            for item in items_by_category[category]:
                qty = item.get("totalQuantity", 0)
                unit = item.get("unit", "")
                if qty == 0 and not unit:
                    qty_str = "As needed"
                else:
                    qty_str = f"{qty} {unit}"
                output += f"| {category} | {item['name']} | {qty_str} |  |\n"
    
    return output

def run_scenario(scenario):
    """Run a single scenario and return formatted results."""
    print(f"\n{'='*60}")
    print(f"Running: {scenario['name']}")
    print(f"{'='*60}")
    
    try:
        # Generate meal plan
        print("  → Generating meal plan...")
        meal_plan = generate_meal_plan(scenario)
        print(f"  ✓ Meal plan generated: {meal_plan['id']}")
        
        # Generate shopping list
        print("  → Generating shopping list...")
        shopping_list = generate_shopping_list(meal_plan)
        print(f"  ✓ Shopping list generated: {shopping_list['id']}")
        
        # Format results
        result = format_meal_plan(meal_plan, scenario)
        result += format_shopping_list(shopping_list)
        result += "\n---\n"
        
        return {
            "success": True,
            "formatted": result,
            "meal_plan": meal_plan,
            "shopping_list": shopping_list
        }
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "formatted": f"\n## Scenario: {scenario['name']}\n\n**Error**: {e}\n\n---\n"
        }

def main():
    print("=" * 60)
    print("OMenu API Test - User Scenario Evaluation")
    print("=" * 60)
    
    scenarios = load_scenarios()
    print(f"Loaded {len(scenarios)} test scenarios")
    
    # Generate report header
    report = f"""# OMenu API Test Results

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This document contains generated meal plans and shopping lists for evaluation.

---
"""
    
    # Run each scenario
    results = []
    for scenario in scenarios:
        result = run_scenario(scenario)
        results.append(result)
        report += result["formatted"]
    
    # Add summary
    success_count = sum(1 for r in results if r["success"])
    report += f"""
## Summary

| Metric | Value |
|--------|-------|
| Total Scenarios | {len(scenarios)} |
| Successful | {success_count} |
| Failed | {len(scenarios) - success_count} |

### Evaluation Checklist

For each scenario, please verify:

- [ ] Meal names match the requested cuisine/style keywords
- [ ] Must-have ingredients appear in multiple recipes
- [ ] Disliked items do NOT appear in any recipe
- [ ] Portion sizes match the number of people
- [ ] Difficulty level is appropriate
- [ ] Shopping list correctly merges ingredients
- [ ] Categories are correctly assigned
"""
    
    # Save report
    with open("tests/test_results.md", "w") as f:
        f.write(report)
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print(f"Results saved to: tests/test_results.md")
    print("=" * 60)

if __name__ == "__main__":
    main()
