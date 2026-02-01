# Gemini Prompt Templates

This document defines the prompt templates for Gemini API integration. All prompt generation and API calls are handled by the backend.

**Location**: `backend/app/services/prompts.py`

---

## Overview

| Step | Prompt | Purpose |
|------|--------|---------|
| 1 | `meal_plan_prompt` | Generate natural language meal plan |
| 2 | `structured_plan_prompt` | Convert to structured JSON |
| 3 | `modification_prompt` | Modify existing plan |
| 4 | `shopping_list_prompt` | Generate shopping list |

**API calls per flow:** 
- New plan: 2 calls (generate → structure)
- Modification: 1 call
- Shopping list: 1 call

---

## Two-Step Generation Flow

```
User Preferences (frontend)
      │
      │ (convert schedule to array format)
      ▼
User Preferences (for Gemini)
      │
      ▼
┌─────────────────────────────────────┐
│ Step 1: meal_plan_prompt            │
│ "Generate a personalized meal plan" │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #1
      │
Natural Language Meal Plan
(semi-structured, creative)
      │
      ▼
┌─────────────────────────────────────┐
│ Step 2: generate_structured_plan    │
│ "Convert to JSON format"            │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #2
      │
Structured JSON Meal Plan
      │
      ├──────────────────────────────────┐
      │                                  │
      ▼  (optional)                      │
┌─────────────────────────────────────┐  │
│ user_manipulation_prompt            │  │
│ "Adjust based on user input"        │  │
└─────────────────────────────────────┘  │
      │                                  │
      ▼  Gemini API Call #3             │
      │                                  │
Modified Meal Plan ◄────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ generate_shopping_list_prompt       │
│ "Create consolidated shopping list" │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #4
      │
Shopping List JSON
```

**Total API calls:**
- New plan generation: 2 calls (Step 1 + Step 2)
- Modification: 1 call
- Shopping list: 1 call
- **First-time full flow: 3 calls** (generate + structure + shopping)
- **With modification: 4 calls**

This two-step approach produces better results than asking for structured JSON directly.

---

## Prompt Templates

### 1. Meal Plan Generation (Step 1)

**Function**: `meal_plan_prompt(user_preferences: str)`

**Template**:
```
Task: Based on the user's preferences, generate a personalized meal plan in JSON format, every meal should include recipeName, ingredients and brief description.

User Preferences: {user_preferences_json}
```

**Notes:**
- Keep prompt simple and concise
- Let the model be creative with the plan
- Output is natural language / semi-structured

---

### 2. Structured Plan Conversion (Step 2)

**Function**: `structured_plan_prompt(extracted_plan: str)`

**Template**:
```
Task: Convert the following meal plan into a structured JSON format according to the schema.

Meal Plan: {extracted_plan}

Output Schema:
{
  "monday": {
    "breakfast": {
      "id": "mon-breakfast-001",
      "name": "Scrambled Eggs with Tomato",
      "ingredients": [
        {"name": "eggs", "quantity": 2, "unit": "count", "category": "proteins"},
        {"name": "tomato", "quantity": 100, "unit": "g", "category": "vegetables"},
        {"name": "oil", "quantity": 15, "unit": "ml", "category": "seasonings"}
      ],
      "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
      "estimatedTime": 15,
      "servings": 2,
      "difficulty": "easy",
      "totalCalories": 180
    },
    "lunch": { ... },
    "dinner": { ... }
  },
  "tuesday": { ... },
  ...
}

Requirements:
1. All 7 days must be present (monday through sunday)
2. Each day has breakfast, lunch, dinner (null if not scheduled)
3. Recipe ID format: {day}-{meal}-{number} (e.g., "mon-breakfast-001")
4. Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
5. For seasonings: quantity can be 0, unit can be empty

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

---

### 3. Meal Plan Modification

**Function**: `modification_prompt(user_input: str, user_preferences: str, previous_plan: str)`

**Template**:
```
Task: Based on user's new input, previous preferences and meal plan, adjust the meal plan accordingly. DO NOT change the format of the meal plan.

Return exactly the same format as previous meal plan. Do minimal changes to accommodate user's new input.

User's new input: {user_input}
Previous user preferences: {user_preferences}
Previous meal plan: {previous_plan}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

**Notes:**
- Minimal changes only
- Preserve unchanged meals exactly
- Keep same JSON structure

---

### 4. Shopping List Generation

**Function**: `shopping_list_prompt(structured_plan: str)`

**Template**:
```
Task: Convert the Meal Plan into a consolidated North American shopping list (JSON).

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
{
  "items": [
    {"name": "ingredient_name", "category": "predefined_category", "totalQuantity": 0, "unit": "unit"},
    ...
  ]
}

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

---

## User Preferences Format

**Frontend Format** (boolean schedule):
```json
{
  "keywords": ["chinese food", "healthy"],
  "mustHaveItems": ["eggs", "tofu"],
  "dislikedItems": ["organ meat"],
  "budget": 140,
  "numPeople": 2,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": { "breakfast": true, "lunch": true, "dinner": true },
    "tuesday": { "breakfast": false, "lunch": true, "dinner": true },
    "sunday": { "breakfast": false, "lunch": false, "dinner": false }
  }
}
```

**Converted for Gemini** (array schedule):
```json
{
  "keywords": ["chinese food", "healthy"],
  "mustHaveItems": ["eggs", "tofu"],
  "dislikedItems": ["organ meat"],
  "budget": 140,
  "numPeople": 2,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": ["breakfast", "lunch", "dinner"],
    "tuesday": ["lunch", "dinner"],
    "sunday": []
  }
}
```

**Conversion Function** (in backend):
```python
def convert_schedule_to_array_format(cook_schedule: dict) -> dict:
    """
    Convert boolean schedule to array format for Gemini.
    """
    result = {}
    for day, meals in cook_schedule.items():
        selected = [meal for meal, enabled in meals.items() if enabled]
        result[day] = selected
    return result
```

---

## Example Test Cases

### Full Week (Chinese, Healthy)

Based on original `prompt_simple.py` test case:

```python
user_preferences = {
    "keywords": ["chinese food", "healthy", "quick food", "nutritious"],
    "mustHaveItems": ["braised beef", "noodles", "tofu skin", "eggs"],
    "dislikedItems": ["organ meat"],
    "budget": 140,
    "numPeople": 2,
    "difficulty": "medium",
    "cookSchedule": {
        "monday": ["breakfast", "lunch", "dinner"],
        "tuesday": ["breakfast", "lunch", "dinner"],
        "wednesday": ["breakfast", "lunch", "dinner"],
        "thursday": ["breakfast", "lunch", "dinner"],
        "friday": ["breakfast", "lunch", "dinner"],
        "saturday": ["breakfast", "lunch", "dinner"],
        "sunday": []  # No meals on Sunday
    },
    "others": ["nutritious, abundant meat, suitable for home cooking"]
}
```

### User Modification Example

```python
user_manipulation_input = "Please add dinner on Sunday with high-protein meals."
```

### Weekday Lunch/Dinner Only

```python
user_preferences = {
    "keywords": ["quick", "easy", "meal prep"],
    "mustHaveItems": ["chicken", "rice"],
    "dislikedItems": ["seafood"],
    "budget": 100,
    "numPeople": 1,
    "difficulty": "easy",
    "cookSchedule": {
        "monday": ["lunch", "dinner"],
        "tuesday": ["lunch", "dinner"],
        "wednesday": ["lunch", "dinner"],
        "thursday": ["lunch", "dinner"],
        "friday": ["lunch", "dinner"],
        "saturday": [],
        "sunday": []
    }
}
```

---

## Prompt Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-31 | Initial prompt templates |
| 1.1.0 | 2025-01-31 | Adopted two-step generation flow from original prompt_simple.py |
