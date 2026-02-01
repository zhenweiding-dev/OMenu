# Data Models

This document defines all data structures used in OMenu, including both TypeScript interfaces (frontend) and Pydantic models (backend).

---

## Overview

| Layer | Technology | Location |
|-------|------------|----------|
| Frontend | TypeScript | `frontend/src/types/index.ts` |
| Backend | Pydantic | `backend/app/models/schemas.py` |

Both layers use identical structures to ensure type safety across the stack.

---

## Core Types

### Ingredient Category

**TypeScript**
```typescript
type IngredientCategory = 
  | 'proteins'           // Meat, tofu, eggs, etc.
  | 'vegetables'         // Vegetables
  | 'fruits'             // Fruits
  | 'grains'             // Rice, pasta, bread, etc.
  | 'dairy'              // Milk, cheese, yogurt, etc.
  | 'seasonings'         // Oils, condiments, spices (NO quantity in shopping list)
  | 'pantry_staples'     // Canned goods, dried goods, etc.
  | 'others';            // Miscellaneous
```

**Pydantic**
```python
from enum import Enum

class IngredientCategory(str, Enum):
    proteins = "proteins"
    vegetables = "vegetables"
    fruits = "fruits"
    grains = "grains"
    dairy = "dairy"
    seasonings = "seasonings"
    pantry_staples = "pantry_staples"
    others = "others"
```

**Note**: `seasonings` category does **NOT display quantity** in shopping list.

---

### Difficulty

**TypeScript**
```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
```

**Pydantic**
```python
class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
```

---

### Ingredient

**TypeScript**
```typescript
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;              // g, ml, count, lbs, oz, bunch, etc.
  category: IngredientCategory;
}
```

**Pydantic**
```python
class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str
    category: IngredientCategory
```

---

### Recipe

**TypeScript**
```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;               // Step-by-step cooking instructions
  estimatedTime: number;              // Minutes
  servings: number;
  difficulty: Difficulty;
  totalCalories: number;
  notes?: string;                     // User notes (editable)
}
```

**Pydantic**
```python
class Recipe(BaseModel):
    id: str
    name: str
    ingredients: List[Ingredient]
    instructions: str
    estimatedTime: int
    servings: int
    difficulty: Difficulty
    totalCalories: int
    notes: Optional[str] = None
```

---

### Cook Schedule

**TypeScript**
```typescript
interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

interface CookSchedule {
  monday: MealSelection;
  tuesday: MealSelection;
  wednesday: MealSelection;
  thursday: MealSelection;
  friday: MealSelection;
  saturday: MealSelection;
  sunday: MealSelection;
}
```

**Pydantic**
```python
class MealSelection(BaseModel):
    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False

class CookSchedule(BaseModel):
    monday: MealSelection
    tuesday: MealSelection
    wednesday: MealSelection
    thursday: MealSelection
    friday: MealSelection
    saturday: MealSelection
    sunday: MealSelection
```

---

### User Preferences

**TypeScript**
```typescript
interface UserPreferences {
  keywords: string[];                  // Quick, Healthy, Chinese, etc.
  mustHaveItems: string[];             // Required ingredients/recipes
  dislikedItems: string[];             // Excluded ingredients
  numPeople: number;
  budget: number;                      // USD
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
}
```

**Pydantic**
```python
class UserPreferences(BaseModel):
    keywords: List[str] = []
    mustHaveItems: List[str] = []
    dislikedItems: List[str] = []
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule
```

---

### Weekly Meal Plan

**TypeScript**
```typescript
interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

interface WeekDays {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

type MealPlanStatus = 'generating' | 'ready' | 'error';

interface MealPlan {
  id: string;
  createdAt: string;                  // ISO 8601
  status: MealPlanStatus;
  preferences: UserPreferences;
  days: WeekDays;
}
```

**Pydantic**
```python
class DayMeals(BaseModel):
    breakfast: Optional[Recipe] = None
    lunch: Optional[Recipe] = None
    dinner: Optional[Recipe] = None

class WeekDays(BaseModel):
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals

class MealPlanStatus(str, Enum):
    generating = "generating"
    ready = "ready"
    error = "error"

class MealPlan(BaseModel):
    id: str
    createdAt: datetime
    status: MealPlanStatus
    preferences: UserPreferences
    days: WeekDays
```

---

### Shopping List

**TypeScript**
```typescript
interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
  isManuallyAdded?: boolean;
}

interface ShoppingList {
  id: string;
  mealPlanId: string;
  createdAt: string;
  items: ShoppingItem[];
}
```

**Pydantic**
```python
class ShoppingItem(BaseModel):
    id: str
    name: str
    category: IngredientCategory
    totalQuantity: float
    unit: str
    purchased: bool = False
    isManuallyAdded: Optional[bool] = None

class ShoppingList(BaseModel):
    id: str
    mealPlanId: str
    createdAt: datetime
    items: List[ShoppingItem]
```

---

### Menu Book (Frontend Only)

A MenuBook represents a complete weekly package containing both the meal plan and its corresponding shopping list. Each MenuBook has a one-to-one relationship with a ShoppingList.

**TypeScript**
```typescript
interface MenuBook {
  id: string;                          // Unique identifier for the week
  weekStartDate: string;               // ISO 8601 date (Monday)
  weekEndDate: string;                 // ISO 8601 date (Sunday)
  mealPlan: MealPlan;                  // Weekly meal plan
  shoppingList: ShoppingList | null;   // Corresponding shopping list (null if not yet generated)
  createdAt: string;                   // ISO 8601 timestamp
}
```

**Relationship:**
- One MenuBook = One Week = One MealPlan + One ShoppingList
- When viewing Shopping Page, it displays the shopping list for the currently selected MenuBook
- When meal plan is modified, the shopping list should be regenerated

---

### Meal Plan Draft (Frontend Only)

Stores intermediate state during plan creation for resume capability.

**TypeScript**
```typescript
interface MealPlanDraft {
  currentStep: number;                 // Steps 1-8
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: string;
}
```

---

## Storage Strategy

### Frontend (localStorage)

For UI state and drafts only:

| Key | Type | Description |
|-----|------|-------------|
| `omenu_meal_plan_draft` | `MealPlanDraft` | Creation draft (resume support) |
| `omenu_preferences` | `Partial<UserPreferences>` | Last used preferences |

### Backend

All generated data is returned from the backend API. The MVP does not persist data on the backend (stateless). Future versions may add database storage.

| Endpoint | Returns | Description |
|----------|---------|-------------|
| `POST /api/meal-plans/generate` | `MealPlan` | Generated meal plan |
| `POST /api/meal-plans/{id}/modify` | `MealPlan` | Modified meal plan |
| `POST /api/shopping-lists/generate` | `ShoppingList` | Generated shopping list |

---

## API Request/Response Formats

### Generate Meal Plan Request

```json
{
  "keywords": ["chinese food", "healthy"],
  "mustHaveItems": ["eggs", "tofu"],
  "dislikedItems": ["peanuts"],
  "budget": 100,
  "numPeople": 2,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": { "breakfast": true, "lunch": true, "dinner": true },
    "tuesday": { "breakfast": false, "lunch": true, "dinner": true }
  }
}
```

### Meal Plan Response

```json
{
  "id": "mp_abc123",
  "createdAt": "2025-01-31T12:00:00Z",
  "status": "ready",
  "preferences": { ... },
  "days": {
    "monday": {
      "breakfast": {
        "id": "mon-breakfast-001",
        "name": "Scrambled Eggs with Tomato",
        "ingredients": [
          { "name": "eggs", "quantity": 4, "unit": "count", "category": "proteins" },
          { "name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables" },
          { "name": "vegetable oil", "quantity": 0, "unit": "", "category": "seasonings" }
        ],
        "instructions": "1. Beat eggs... 2. Stir fry...",
        "estimatedTime": 15,
        "servings": 2,
        "difficulty": "easy",
        "totalCalories": 320
      },
      "lunch": { ... },
      "dinner": { ... }
    },
    "tuesday": {
      "breakfast": null,
      "lunch": { ... },
      "dinner": { ... }
    }
  }
}
```

### Shopping List Response

```json
{
  "id": "sl_xyz789",
  "mealPlanId": "mp_abc123",
  "createdAt": "2025-01-31T12:05:00Z",
  "items": [
    { "id": "item_001", "name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count", "purchased": false },
    { "id": "item_002", "name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": "", "purchased": false }
  ]
}
```

**Note**: `seasonings` items have `totalQuantity: 0`, `unit: ""` — quantity is NOT displayed in UI.

---

## Validation Rules

### User Preferences

| Field | Validation |
|-------|------------|
| `numPeople` | Integer, 1-10 |
| `budget` | Integer, 50-500 (USD), step $10 |
| `difficulty` | Enum: easy, medium, hard |
| `cookSchedule` | At least one meal selected |

### Ingredient

| Field | Validation |
|-------|------------|
| `category` | Must be valid IngredientCategory |
| `quantity` | 0 for seasonings, > 0 for others |

### Recipe

| Field | Validation |
|-------|------------|
| `id` | Format: `{day}-{meal}-{number}` (e.g., `mon-breakfast-001`) |
| `estimatedTime` | Integer, > 0 |
| `servings` | Integer, > 0 |
| `totalCalories` | Integer, >= 0 |

---

## ID Format Conventions

| Entity | Prefix | Example |
|--------|--------|---------|
| Meal Plan | `mp_` | `mp_abc123` |
| Shopping List | `sl_` | `sl_xyz789` |
| Shopping Item | `item_` | `item_001` |
| Recipe | `{day}-{meal}-{number}` | `mon-breakfast-001` |
