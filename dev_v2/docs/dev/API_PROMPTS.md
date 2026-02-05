# Gemini Prompt Templates

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

This document defines the prompt templates for Gemini API integration. All prompt generation and API calls are handled by the backend.

> 备注：本文已将 “Meal Plan” 统一更名为 “Menu Book”（一周菜单簿），并同步更新 prompt 命名与字段。

**Location**: `backend/app/services/prompts.py`

---

## Overview

| Step | Prompt | Purpose |
|------|--------|---------|
| 1 | `menu_book_prompt` | Generate natural language menu book |
| 2 | `structured_menu_prompt` | Convert to structured JSON |
| 3 | `modification_prompt` | Modify existing menu book |
| 4 | `shopping_list_prompt` | Generate shopping list |

**API calls per flow:** 
- New menu book: 2 calls (generate → structure)
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
│ Step 1: menu_book_prompt            │
│ "Generate a personalized menu book" │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #1
      │
Natural Language Menu Book
(semi-structured, creative)
      │
      ▼
┌─────────────────────────────────────┐
│ Step 2: structured_menu_prompt      │
│ "Convert to JSON format"            │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #2
      │
Structured JSON Menu Book
      │
      ├──────────────────────────────────┐
      │                                  │
      ▼  (optional)                      │
┌─────────────────────────────────────┐  │
│ modification_prompt                 │  │
│ "Adjust based on user input"        │  │
└─────────────────────────────────────┘  │
      │                                  │
      ▼  Gemini API Call #3             │
      │                                  │
Modified Menu Book ◄────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ shopping_list_prompt                │
│ "Create consolidated shopping list" │
└─────────────────────────────────────┘
      │
      ▼  Gemini API Call #4
      │
Shopping List JSON
```

**Total API calls:**
- New menu book generation: 2 calls (Step 1 + Step 2)
- Modification: 1 call
- Shopping list: 1 call
- **First-time full flow: 3 calls** (generate + structure + shopping)
- **With modification: 4 calls**

This two-step approach produces better results than asking for structured JSON directly.

---

## Prompt Templates

### 1. Menu Book Generation (Step 1)

**Function**: `menu_book_prompt(preferences: UserPreferences)`

**Template**:
```
Task: Based on the user's preferences, generate a personalized weekly menu in JSON format; every meal must include dishName, ingredients, and a brief description.
Important: preferredItems should appear at least once during the week, not necessarily in every meal.
Budget:$<budget>.

User Preferences: {preferences_json}
```

**Notes:**
- Keep prompt simple and concise
- Let the model be creative with the menu
- Output is natural language / semi-structured

---

### 2. Structured Menu Conversion (Step 2)

**Function**: `structured_menu_prompt(natural_menu: str, preferences: UserPreferences)`

**Template**:
```
Task: Convert the following menu into a structured JSON format according to the schema.

Menu: {natural_menu}

Output Schema:
{
  "monday": {
    "breakfast": [
      {
        "id": "mon-breakfast-001",
        "name": "Scrambled Eggs with Tomato",
        "ingredients": [
          {"name": "eggs", "quantity": 2, "unit": "count", "category": "proteins"},
          {"name": "tomato", "quantity": 100, "unit": "g", "category": "vegetables"},
          {"name": "oil", "quantity": 0, "unit": "", "category": "seasonings"}
        ],
        "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
        "estimatedTime": 15,
        "servings": 2,
        "difficulty": "easy",
        "totalCalories": 180,
        "source": "ai"
      }
    ],
    "lunch": [],
    "dinner": []
  },
  "tuesday": { ... },
  ...
}

Requirements:
1. All 7 days present (monday through sunday)
2. Each day has breakfast, lunch, dinner (use empty array if not scheduled)
3. Dish ID format: {day}-{meal}-{number} (e.g., "mon-breakfast-001")
4. Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
5. Seasonings use quantity 0 and empty unit
6. <=5 ingredients per dish and instructions <=200 characters
7. Each dish includes source="ai"

RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks).
```

---

### 3. Menu Book Modification

**Function**: `modification_prompt(modification: str, current_menu: str, preferences: UserPreferences)`

**Template**:
```
Task: Based on user's new input, previous preferences, and menu, adjust the menu accordingly without changing the format.
Make the minimal modifications needed to satisfy the request.
Note: preferredItems are items the user wants included at least once during the week, not in every meal.

User's new input: {modification}
Previous user preferences: {preferences_json}
Previous menu: {current_menu}

RETURN ONLY THE MODIFIED JSON OBJECT. Do not use Markdown formatting (no ```json blocks).
```

**Notes:**
- Minimal changes only
- Preserve unchanged meals exactly
- Keep same JSON structure

---

### 4. Shopping List Generation

**Function**: `shopping_list_prompt(menus: WeekMenus)`

**Template**:
```
Task: Generate a consolidated shopping list from the weekly menus (North American units).

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

Menus: {menus_json}

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
  "preferredItems": ["eggs", "tofu"],
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
  "preferredItems": ["eggs", "tofu"],
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
    "preferredItems": ["braised beef", "noodles", "tofu skin", "eggs"],
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
modification_input = "Please add dinner on Sunday with high-protein meals."
```

### Weekday Lunch/Dinner Only

```python
user_preferences = {
    "keywords": ["quick", "easy", "meal prep"],
    "preferredItems": ["chicken", "rice"],
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