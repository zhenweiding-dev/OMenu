# Gemini API Prompts Specification

This document defines the data structures and prompts for Gemini API integration.

---

## API Calls Overview

| Call | Prompt | Input | Output |
|------|--------|-------|--------|
| Generate Meal Plan | `generate_meal_plan_prompt` | UserPreferences | WeeklyMealPlan |
| Modify Meal Plan | `user_modification_prompt` | User Request + MealPlan | WeeklyMealPlan |
| Generate Shopping List | `generate_shopping_list_prompt` | WeeklyMealPlan | ShoppingList |

**Total API calls per flow:** 2-3

---

## Input: UserPreferences

```json
{
  "keywords": ["Quick", "Healthy", "Chinese"],
  "mustHaveItems": ["Eggs", "Chicken", "Rice"],
  "dislikedItems": ["Peanuts", "Cilantro"],
  "numPeople": 2,
  "budget": 100,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": { "breakfast": true, "lunch": true, "dinner": true },
    "tuesday": { "breakfast": false, "lunch": true, "dinner": true },
    "wednesday": { "breakfast": false, "lunch": true, "dinner": true },
    "thursday": { "breakfast": false, "lunch": true, "dinner": true },
    "friday": { "breakfast": false, "lunch": true, "dinner": true },
    "saturday": { "breakfast": true, "lunch": true, "dinner": true },
    "sunday": { "breakfast": true, "lunch": false, "dinner": false }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `keywords` | string[] | Cooking style, diet, cuisine preferences |
| `mustHaveItems` | string[] | Required ingredients or recipes |
| `dislikedItems` | string[] | Ingredients to exclude |
| `numPeople` | number | Number of people to serve |
| `budget` | number | Weekly budget in USD |
| `difficulty` | string | "easy" / "medium" / "hard" |
| `cookSchedule` | object | Boolean flags for each meal slot |

---

## Output: WeeklyMealPlan

```json
{
  "monday": {
    "breakfast": {
      "id": "mon-breakfast-001",
      "name": "Scrambled Eggs with Tomato",
      "ingredients": [
        { "name": "eggs", "quantity": 4, "unit": "count", "category": "proteins" },
        { "name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables" },
        { "name": "vegetable oil", "quantity": 1, "unit": "tbsp", "category": "seasonings" },
        { "name": "salt", "quantity": 0, "unit": "", "category": "seasonings" }
      ],
      "instructions": "1. Beat eggs with a pinch of salt.\n2. Dice tomatoes.\n3. Heat oil in pan over medium heat.\n4. Scramble eggs until just set, remove.\n5. Sauté tomatoes, add eggs back, mix gently.",
      "estimatedTime": 15,
      "servings": 2,
      "difficulty": "easy",
      "totalCalories": 320
    },
    "lunch": { /* Recipe */ },
    "dinner": { /* Recipe */ }
  },
  "tuesday": {
    "breakfast": null,
    "lunch": { /* Recipe */ },
    "dinner": { /* Recipe */ }
  },
  "wednesday": { /* ... */ },
  "thursday": { /* ... */ },
  "friday": { /* ... */ },
  "saturday": { /* ... */ },
  "sunday": { /* ... */ }
}
```

### Recipe Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID, format: `{day}-{meal}-{number}` |
| `name` | string | Recipe name |
| `ingredients` | Ingredient[] | List of ingredients |
| `instructions` | string | Step-by-step cooking instructions |
| `estimatedTime` | number | Cooking time in minutes |
| `servings` | number | Number of servings |
| `difficulty` | string | "easy" / "medium" / "hard" |
| `totalCalories` | number | Total calories for the recipe |

### Ingredient Structure

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Ingredient name |
| `quantity` | number | Amount needed (0 for seasonings) |
| `unit` | string | Unit of measurement ("" for seasonings) |
| `category` | string | One of the predefined categories |

**Note:** Unscheduled meals should be `null`, not omitted.

---

## Output: ShoppingList

```json
{
  "items": [
    { "name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count" },
    { "name": "Chicken Breast", "category": "proteins", "totalQuantity": 2, "unit": "lbs" },
    { "name": "Tomatoes", "category": "vegetables", "totalQuantity": 8, "unit": "count" },
    { "name": "Rice", "category": "grains", "totalQuantity": 2, "unit": "lbs" },
    { "name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": "" },
    { "name": "Salt", "category": "seasonings", "totalQuantity": 0, "unit": "" }
  ]
}
```

### ShoppingItem Structure

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Item name |
| `category` | string | One of the predefined categories |
| `totalQuantity` | number | Aggregated quantity (0 for seasonings) |
| `unit` | string | Unit of measurement ("" for seasonings) |

---

## Ingredient Categories

```
proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
```

| Category | Examples |
|----------|----------|
| `proteins` | Meat, fish, eggs, tofu, legumes |
| `vegetables` | All vegetables |
| `fruits` | All fruits |
| `grains` | Rice, pasta, bread, oats |
| `dairy` | Milk, cheese, yogurt, butter |
| `seasonings` | Oils, sauces, spices, condiments |
| `pantry_staples` | Canned goods, dried goods |
| `others` | Anything else |

**Note:** `seasonings` items have `quantity: 0` and `unit: ""` — not displayed in shopping list.

---

## Units (North American)

| Type | Units |
|------|-------|
| Meat/Proteins | lbs, oz |
| Produce | count, bunch |
| Liquids | cups, tbsp, fl oz |
| Grains | lbs, cups |

---

## Python Code Templates

### user_preferences_format

```python
user_preferences_format = """{
    "keywords": ["string", "string"],
    "mustHaveItems": ["string", "string"],
    "dislikedItems": ["string", "string"],
    "budget": 0,
    "numPeople": 0,
    "difficulty": "easy/medium/hard",
    "cookSchedule": {
        "monday": { "breakfast": true, "lunch": true, "dinner": true },
        "tuesday": { "breakfast": true, "lunch": true, "dinner": true },
        "wednesday": { "breakfast": true, "lunch": true, "dinner": true },
        "thursday": { "breakfast": true, "lunch": true, "dinner": true },
        "friday": { "breakfast": true, "lunch": true, "dinner": true },
        "saturday": { "breakfast": true, "lunch": true, "dinner": true },
        "sunday": { "breakfast": true, "lunch": true, "dinner": true }
    }
}"""
```

### meal_plan_structure

```python
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
        "lunch": { "id": "mon-lunch-001", "name": "...", ... },
        "dinner": { "id": "mon-dinner-001", "name": "...", ... }
    },
    "tuesday": {
        "breakfast": null,
        "lunch": { "id": "tue-lunch-001", "name": "...", ... },
        "dinner": { "id": "tue-dinner-001", "name": "...", ... }
    },
    "wednesday": { "breakfast": ..., "lunch": ..., "dinner": ... },
    "thursday": { "breakfast": ..., "lunch": ..., "dinner": ... },
    "friday": { "breakfast": ..., "lunch": ..., "dinner": ... },
    "saturday": { "breakfast": ..., "lunch": ..., "dinner": ... },
    "sunday": { "breakfast": ..., "lunch": ..., "dinner": ... }
}"""
```

**Note:** Use `null` for meals not scheduled (cookSchedule is false).

### shopping_list_structure

```python
shopping_list_structure = """{
    "items": [
        {"name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count"},
        {"name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": ""}
    ]
}"""

predefined_categories = '["proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others"]'
```

### Example user_preferences (for testing)

```python
user_preferences = {
    "keywords": ["chinese food", "healthy", "quick", "nutritious"],
    "mustHaveItems": ["braised beef", "noodles", "tofu skin", "eggs"],
    "dislikedItems": ["organ meat", "cilantro"],
    "budget": 140,
    "numPeople": 2,
    "difficulty": "medium",
    "cookSchedule": {
        "monday": {"breakfast": True, "lunch": True, "dinner": True},
        "tuesday": {"breakfast": True, "lunch": True, "dinner": True},
        "wednesday": {"breakfast": True, "lunch": True, "dinner": True},
        "thursday": {"breakfast": True, "lunch": True, "dinner": True},
        "friday": {"breakfast": True, "lunch": True, "dinner": True},
        "saturday": {"breakfast": True, "lunch": True, "dinner": True},
        "sunday": {"breakfast": False, "lunch": False, "dinner": False}
    }
}
```

---

## JSON Serialization

**重要：** 传入 prompt 的 JSON 使用紧凑格式以节省 token。

```python
# ✅ 正确 - 紧凑格式
json.dumps(data, separators=(',', ':'))
# 输出: {"keywords":["Quick","Healthy"],"numPeople":2}

# ❌ 避免 - 带缩进格式（浪费 token）
json.dumps(data, indent=2)
# 输出:
# {
#   "keywords": [
#     "Quick",
#     "Healthy"
#   ],
#   "numPeople": 2
# }
```

**Token 节省估算：**
- 完整 UserPreferences: ~400 字符 → ~250 字符 (**37% 减少**)
- 完整 WeeklyMealPlan: ~15000 字符 → ~10000 字符 (**33% 减少**)

---

## Prompt Templates

### generate_meal_plan_prompt

```python
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
```

### generate_shopping_list_prompt

```python
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
```

### user_modification_prompt

```python
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
```

---

## API Flow

```
User Preferences
       ↓
[API Call 1] generate_meal_plan_prompt
       ↓
   Meal Plan JSON
       ↓
   (User Review)
       ↓
   ┌───────────────────────┐
   │ User wants changes?   │
   │                       │
   │  Yes ──► [API Call 2] user_modification_prompt
   │              ↓                    │
   │         Updated Meal Plan ◄───────┘
   │                       │
   │  No ──────────────────┤
   └───────────────────────┘
       ↓
[API Call 3] generate_shopping_list_prompt
       ↓
   Shopping List JSON
```

**Total API calls:** 2-3 (was 3-4)

---

## Response Parsing

### Extract Text from Gemini Response

```python
def extract_text_from_response(response) -> str:
    """
    Extract text content from Gemini API response.
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
```

### Clean and Parse JSON

```python
import re
import json

def parse_json_response(text: str) -> dict | None:
    """
    Clean markdown formatting and parse JSON from Gemini response.
    """
    if not text:
        return None
    
    try:
        # Remove markdown code blocks if present
        cleaned = text.strip()
        
        # Remove ```json ... ``` or ``` ... ```
        cleaned = re.sub(r'^```json\s*\n?', '', cleaned)
        cleaned = re.sub(r'^```\s*\n?', '', cleaned)
        cleaned = re.sub(r'\n?```\s*$', '', cleaned)
        cleaned = cleaned.strip()
        
        # Try to extract JSON object if there's extra text
        json_match = re.search(r'\{[\s\S]*\}', cleaned)
        if json_match:
            cleaned = json_match.group(0)
        
        return json.loads(cleaned)
    
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error parsing response: {e}")
        return None
```

### Parse Meal Plan Response

```python
def parse_meal_plan_response(response) -> dict | None:
    """
    Extract and parse meal plan JSON from Gemini response.
    Returns validated meal plan dict or None.
    """
    text = extract_text_from_response(response)
    if not text:
        print("Warning: Empty response from meal plan generation")
        return None
    
    data = parse_json_response(text)
    if not data:
        print("Warning: Failed to parse meal plan JSON")
        return None
    
    if not validate_meal_plan(data):
        print("Warning: Meal plan validation failed")
        return None
    
    return data
```

### Parse Shopping List Response

```python
def parse_shopping_list_response(response) -> dict | None:
    """
    Extract and parse shopping list JSON from Gemini response.
    Returns validated shopping list dict or None.
    """
    text = extract_text_from_response(response)
    if not text:
        print("Warning: Empty response from shopping list generation")
        return None
    
    data = parse_json_response(text)
    if not data:
        print("Warning: Failed to parse shopping list JSON")
        return None
    
    if not validate_shopping_list(data):
        print("Warning: Shopping list validation failed")
        return None
    
    return data
```

### TypeScript Version (for Frontend)

```typescript
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

function extractTextFromResponse(response: GeminiResponse): string {
  try {
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() ?? '';
  } catch {
    return '';
  }
}

function parseJsonResponse<T>(text: string): T | null {
  if (!text) return null;

  try {
    let cleaned = text.trim();
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/^```json\s*\n?/i, '');
    cleaned = cleaned.replace(/^```\s*\n?/, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
    cleaned = cleaned.trim();

    // Extract JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      cleaned = match[0];
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

// Usage
const mealPlan = parseJsonResponse<WeeklyMealPlan>(
  extractTextFromResponse(response)
);
```

---

## Validation

### Valid Categories

```python
VALID_CATEGORIES = [
    "proteins", "vegetables", "fruits", "grains", 
    "dairy", "seasonings", "pantry_staples", "others"
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]
```

### Validate Recipe

```python
def validate_recipe(recipe: dict) -> bool:
    """Validate a single recipe object."""
    required_fields = [
        "id", "name", "ingredients", "instructions", 
        "estimatedTime", "servings", "difficulty", "totalCalories"
    ]
    
    for field in required_fields:
        if field not in recipe:
            return False
    
    for ingredient in recipe["ingredients"]:
        required_ing_fields = ["name", "quantity", "unit", "category"]
        for field in required_ing_fields:
            if field not in ingredient:
                return False
        if ingredient["category"] not in VALID_CATEGORIES:
            return False
    
    return True
```

### Validate Meal Plan

```python
def validate_meal_plan(data: dict) -> bool:
    """Validate the complete weekly meal plan structure."""
    if not isinstance(data, dict):
        return False
    
    for day in DAYS:
        if day not in data:
            return False
        
        day_data = data[day]
        if not isinstance(day_data, dict):
            return False
        
        for meal in MEALS:
            if meal not in day_data:
                return False
            
            recipe = day_data[meal]
            # Recipe can be null (not scheduled) or a valid recipe object
            if recipe is not None:
                if not validate_recipe(recipe):
                    return False
    
    return True
```

### Validate Shopping List

```python
def validate_shopping_list(data: dict) -> bool:
    """Validate shopping list structure."""
    if "items" not in data or not isinstance(data["items"], list):
        return False
    
    for item in data["items"]:
        required_fields = ["name", "category", "totalQuantity", "unit"]
        for field in required_fields:
            if field not in item:
                return False
        if item["category"] not in VALID_CATEGORIES:
            return False
    
    return True
```

### TypeScript Validation (for Frontend)

```typescript
const VALID_CATEGORIES = [
  'proteins', 'vegetables', 'fruits', 'grains',
  'dairy', 'seasonings', 'pantry_staples', 'others'
] as const;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

function validateRecipe(recipe: unknown): recipe is Recipe {
  if (!recipe || typeof recipe !== 'object') return false;
  
  const r = recipe as Record<string, unknown>;
  const requiredFields = ['id', 'name', 'ingredients', 'instructions', 
                          'estimatedTime', 'servings', 'difficulty', 'totalCalories'];
  
  for (const field of requiredFields) {
    if (!(field in r)) return false;
  }
  
  if (!Array.isArray(r.ingredients)) return false;
  
  for (const ing of r.ingredients) {
    if (!ing.name || !ing.category) return false;
    if (!VALID_CATEGORIES.includes(ing.category)) return false;
  }
  
  return true;
}

function validateMealPlan(data: unknown): data is WeeklyMealPlan {
  if (!data || typeof data !== 'object') return false;
  
  const plan = data as Record<string, unknown>;
  
  for (const day of DAYS) {
    if (!(day in plan)) return false;
    
    const dayData = plan[day] as Record<string, unknown>;
    if (!dayData || typeof dayData !== 'object') return false;
    
    for (const meal of MEALS) {
      if (!(meal in dayData)) return false;
      
      const recipe = dayData[meal];
      if (recipe !== null && !validateRecipe(recipe)) {
        return false;
      }
    }
  }
  
  return true;
}

function validateShoppingList(data: unknown): data is ShoppingList {
  if (!data || typeof data !== 'object') return false;
  
  const list = data as Record<string, unknown>;
  if (!Array.isArray(list.items)) return false;
  
  for (const item of list.items) {
    if (!item.name || !item.category) return false;
    if (!VALID_CATEGORIES.includes(item.category)) return false;
  }
  
  return true;
}
```
