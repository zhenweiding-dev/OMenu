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

export type DishSource = "ai" | "manual";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  estimatedTime: number;
  servings: number;
  difficulty: Difficulty;
  totalCalories: number;
  source: DishSource;
  notes?: string | null;
}

export interface Menu {
  breakfast: Dish[];
  lunch: Dish[];
  dinner: Dish[];
}

export type WeekMenus = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  Menu
>;

export interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export type CookSchedule = Record<keyof WeekMenus, MealSelection>;

export interface UserPreferences {
  specificPreferences: string[];
  specificDisliked: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
}

export interface MenuBook {
  id: string;
  createdAt: string;
  status: "generating" | "ready" | "error";
  preferences: UserPreferences;
  menus: WeekMenus;
  shoppingList: ShoppingList;
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
  menuBookId: string;
  createdAt: string;
  items: ShoppingItem[];
}

export interface UserState {
  preferences: UserPreferences | null;
  menuBooks: MenuBook[];
  currentWeekId: string | null;
  currentDayIndex: number;
  isMenuOpen: boolean;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: ErrorDetail[];
}
