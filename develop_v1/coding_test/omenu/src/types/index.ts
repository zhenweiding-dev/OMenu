// ===== Ingredient Categories =====
export type IngredientCategory =
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'seasonings'
  | 'pantry_staples'
  | 'others';

// ===== Difficulty Levels =====
export type Difficulty = 'easy' | 'medium' | 'hard';

// ===== Days of Week =====
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ===== Meal Types =====
export type MealType = 'breakfast' | 'lunch' | 'dinner';

// ===== Ingredient =====
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

// ===== Recipe =====
export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  estimatedTime: number;
  servings: number;
  difficulty: Difficulty;
  totalCalories: number;
  notes?: string;
}

// ===== Meal Selection =====
export interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

// ===== Cook Schedule =====
export interface CookSchedule {
  monday: MealSelection;
  tuesday: MealSelection;
  wednesday: MealSelection;
  thursday: MealSelection;
  friday: MealSelection;
  saturday: MealSelection;
  sunday: MealSelection;
}

// ===== User Preferences =====
export interface UserPreferences {
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
}

// ===== Day Meals =====
export interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

// ===== Week Days =====
export interface WeekDays {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

// ===== Weekly Meal Plan Status =====
export type MealPlanStatus = 'generating' | 'ready' | 'error';

// ===== Weekly Meal Plan =====
export interface WeeklyMealPlan {
  id: string;
  createdAt: Date;
  weekStartDate: Date;
  status: MealPlanStatus;
  preferences: UserPreferences;
  days: WeekDays;
}

// ===== Shopping Item =====
export interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
  isManuallyAdded?: boolean;
}

// ===== Shopping List =====
export interface ShoppingList {
  id: string;
  mealPlanId: string;
  items: ShoppingItem[];
  createdAt: Date;
}

// ===== Meal Plan Draft =====
export interface MealPlanDraft {
  currentStep: number;
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: Date;
}

// ===== Create Flow Step =====
export type CreateFlowStep =
  | 'welcome'
  | 'keywords'
  | 'mustHave'
  | 'disliked'
  | 'peopleBudget'
  | 'schedule'
  | 'loading'
  | 'planOverview'
  | 'shoppingLoading';

// ===== Gemini API Response Types =====
export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export interface GeminiMealPlanResponse extends WeekDays {}

export interface GeminiShoppingListResponse {
  items: Array<{
    name: string;
    category: IngredientCategory;
    totalQuantity: number;
    unit: string;
  }>;
}
