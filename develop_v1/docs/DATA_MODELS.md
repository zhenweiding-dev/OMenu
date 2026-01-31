# Data Models

## Core Types

### Ingredient Category

```typescript
type IngredientCategory = 
  | 'proteins'           // Meat, tofu, eggs, etc.
  | 'vegetables'         // Vegetables
  | 'fruits'             // Fruits
  | 'grains'             // Rice, pasta, bread, etc.
  | 'dairy'              // Milk, cheese, yogurt, etc.
  | 'seasonings'         // Merged: oils, condiments, spices (NO quantity in shopping list)
  | 'pantry_staples'     // Canned goods, dried goods, etc.
  | 'others';            // Miscellaneous
```

**Note**: `seasonings` category does **NOT display quantity** in shopping list.

### Ingredient

```typescript
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;              // g, ml, count, lbs, oz, bunch, etc.
  category: IngredientCategory;
}
```

### Recipe

```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;               // Step-by-step cooking instructions
  estimatedTime: number;              // Minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  totalCalories: number;
  notes?: string;                     // User notes (editable)
}
```

### User Preferences

```typescript
interface UserPreferences {
  keywords: string[];                  // Quick, Healthy, Chinese, etc.
  mustHaveItems: string[];             // Required ingredients/recipes
  dislikedItems: string[];             // Excluded ingredients
  numPeople: number;
  budget: number;                      // USD
  difficulty: 'easy' | 'medium' | 'hard';
  cookSchedule: CookSchedule;
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

interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}
```

### Weekly Meal Plan

```typescript
interface WeeklyMealPlan {
  id: string;
  createdAt: Date;
  weekStartDate: Date;                        // Start date of the week
  status: 'generating' | 'ready' | 'error';
  preferences: UserPreferences;               // Snapshot of preferences when generated
  days: WeekDays;
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

interface DayMeals {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}
```

### Shopping List

```typescript
interface ShoppingList {
  id: string;
  mealPlanId: string;
  items: ShoppingItem[];
  createdAt: Date;
}

interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
  isManuallyAdded?: boolean;
}
```

### Meal Plan Draft

Stores intermediate state during plan creation for resume capability.

```typescript
interface MealPlanDraft {
  currentStep: number;                 // Steps 1-7
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cookSchedule: CookSchedule;
  lastUpdated: Date;
}
```

## Storage Strategy

### localStorage

For simple data:

| Key | Type | Description |
|-----|------|-------------|
| `omenu_user_preferences` | `UserPreferences` | User preferences |
| `omenu_meal_plan_draft` | `MealPlanDraft` | Creation draft (resume support) |
| `omenu_current_plan_id` | `string` | Currently active plan ID |

### IndexedDB

For complex/large data:

| Store | Key | Description |
|-------|-----|-------------|
| `mealPlans` | `id` | All weekly meal plans |
| `shoppingLists` | `id` | All shopping lists |

### Database Schema

```typescript
const DB_NAME = 'OMenuDB';
const DB_VERSION = 1;

const STORES = {
  mealPlans: {
    keyPath: 'id',
    indexes: ['createdAt', 'weekStartDate']
  },
  shoppingLists: {
    keyPath: 'id',
    indexes: ['mealPlanId', 'createdAt']
  }
};
```

## Gemini API Data Formats

> 详细的 prompt 和解析逻辑见 [API_PROMPTS.md](./API_PROMPTS.md)

### Request: UserPreferences (JSON)

```json
{"keywords":["chinese food","healthy"],"mustHaveItems":["eggs","tofu"],"dislikedItems":["peanuts"],"budget":100,"numPeople":2,"difficulty":"medium","cookSchedule":{"monday":{"breakfast":true,"lunch":true,"dinner":true},"tuesday":{"breakfast":false,"lunch":true,"dinner":true}}}
```

### Response: Meal Plan

```json
{
  "monday": {
    "breakfast": {
      "id": "mon-breakfast-001",
      "name": "Scrambled Eggs with Tomato",
      "ingredients": [
        {"name": "eggs", "quantity": 4, "unit": "count", "category": "proteins"},
        {"name": "tomato", "quantity": 2, "unit": "count", "category": "vegetables"},
        {"name": "vegetable oil", "quantity": 0, "unit": "", "category": "seasonings"}
      ],
      "instructions": "1. Beat eggs... 2. Stir fry tomato...",
      "estimatedTime": 15,
      "servings": 2,
      "difficulty": "easy",
      "totalCalories": 320
    },
    "lunch": null,
    "dinner": {...}
  }
}
```

### Response: Shopping List

```json
{
  "items": [
    {"name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count"},
    {"name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": ""}
  ]
}
```

**Note**: `seasonings` 类别 `totalQuantity=0`, `unit=""`，不显示数量。
