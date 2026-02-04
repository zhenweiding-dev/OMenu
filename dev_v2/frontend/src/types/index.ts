export type Difficulty = "easy" | "medium" | "hard";

export type IngredientCategory =
  | "proteins"
  | "vegetables"
  | "fruits"
  | "grains"
  | "dairy"
  | "seasonings"
  | "pantry_staples"
  | "others";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

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

export interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

export type WeekDays = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  DayMeals
>;

export type DayKey = keyof WeekDays;
export type MealKey = keyof DayMeals;

export interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export type CookSchedule = Record<keyof WeekDays, MealSelection>;

export interface UserPreferences {
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
}

export interface MealPlan {
  id: string;
  createdAt: string;
  status: "generating" | "ready" | "error";
  preferences: UserPreferences;
  days: WeekDays;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
  isManuallyAdded?: boolean;
}

export interface ShoppingList {
  id: string;
  mealPlanId: string;
  createdAt: string;
  items: ShoppingItem[];
}

export interface MenuBook {
  id: string;
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
}

export type MenuExtras = Record<string, Partial<Record<DayKey, Partial<Record<MealKey, Recipe[]>>>>>;

export interface DraftState {
  currentStep: number;
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: string;
  pendingResult: { plan: MealPlan; list: ShoppingList } | null;
}

export interface UIState {
  currentWeekId: string | null;
  currentDayIndex: number;
  isMenuOpen: boolean;
}
