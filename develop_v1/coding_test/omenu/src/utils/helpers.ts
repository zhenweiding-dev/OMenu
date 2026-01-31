import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  CookSchedule,
  DayOfWeek,
  MealType,
  WeekDays,
  Recipe,
  UserPreferences,
  GeminiMealPlanResponse,
  GeminiShoppingListResponse,
  IngredientCategory,
} from '@/types';
import { DAYS, MEALS } from './constants';

// ===== Class Name Utility =====
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== ID Generation =====
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateRecipeId(day: DayOfWeek, meal: MealType): string {
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${day.substring(0, 3)}-${meal}-${num}`;
}

// ===== Date Utilities =====
export function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

export function getWeekDates(startDate: Date): Record<DayOfWeek, Date> {
  const dates = {} as Record<DayOfWeek, Date>;
  DAYS.forEach((day, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    dates[day] = date;
  });
  return dates;
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ===== Cook Schedule Utilities =====
export function countSelectedMeals(schedule: CookSchedule): number {
  let count = 0;
  DAYS.forEach((day) => {
    MEALS.forEach((meal) => {
      if (schedule[day][meal]) {
        count++;
      }
    });
  });
  return count;
}

export function hasAnyMealSelected(schedule: CookSchedule): boolean {
  return countSelectedMeals(schedule) > 0;
}

// ===== JSON Utilities =====
export function compactJson(data: unknown): string {
  return JSON.stringify(data, null, 0);
}

// ===== Gemini Response Parsing =====
export function extractTextFromResponse(response: unknown): string {
  try {
    const r = response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const text = r?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() ?? '';
  } catch {
    return '';
  }
}

export function parseJsonResponse<T>(text: string): T | null {
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

// ===== Validation =====
const VALID_CATEGORIES: IngredientCategory[] = [
  'proteins',
  'vegetables',
  'fruits',
  'grains',
  'dairy',
  'seasonings',
  'pantry_staples',
  'others',
];

export function validateRecipe(recipe: unknown): recipe is Recipe {
  if (!recipe || typeof recipe !== 'object') return false;

  const r = recipe as Record<string, unknown>;
  const requiredFields = [
    'id',
    'name',
    'ingredients',
    'instructions',
    'estimatedTime',
    'servings',
    'difficulty',
    'totalCalories',
  ];

  for (const field of requiredFields) {
    if (!(field in r)) return false;
  }

  // Check specific types
  if (typeof r.id !== 'string') return false;
  if (typeof r.name !== 'string') return false;
  if (typeof r.instructions !== 'string') {
    // If instructions is an array, convert it to string
    if (Array.isArray(r.instructions)) {
      r.instructions = (r.instructions as string[]).join('\n');
    } else {
      return false;
    }
  }
  if (typeof r.estimatedTime !== 'number') return false;
  if (typeof r.servings !== 'number') return false;
  if (typeof r.totalCalories !== 'number') return false;

  if (!Array.isArray(r.ingredients)) return false;

  for (const ing of r.ingredients as Array<Record<string, unknown>>) {
    if (!ing.name || !ing.category) return false;
    if (!VALID_CATEGORIES.includes(ing.category as IngredientCategory)) return false;
  }

  return true;
}

export function validateMealPlan(data: unknown): data is GeminiMealPlanResponse {
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

export function validateShoppingList(data: unknown): data is GeminiShoppingListResponse {
  if (!data || typeof data !== 'object') return false;

  const list = data as Record<string, unknown>;
  if (!Array.isArray(list.items)) return false;

  for (const item of list.items as Array<Record<string, unknown>>) {
    if (!item.name || !item.category) return false;
    if (!VALID_CATEGORIES.includes(item.category as IngredientCategory)) return false;
  }

  return true;
}

// ===== Preferences to JSON for API =====
export function preferencesToApiJson(preferences: UserPreferences): string {
  return JSON.stringify(preferences, null, 0);
}

// ===== Meal Plan to JSON for API =====
export function mealPlanToApiJson(days: WeekDays): string {
  return JSON.stringify(days, null, 0);
}

// ===== Calculate Total Calories for a Day =====
export function calculateDayCalories(dayMeals: {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}): number {
  let total = 0;
  if (dayMeals.breakfast) total += dayMeals.breakfast.totalCalories;
  if (dayMeals.lunch) total += dayMeals.lunch.totalCalories;
  if (dayMeals.dinner) total += dayMeals.dinner.totalCalories;
  return total;
}

// ===== Format Time =====
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

// ===== Format Quantity =====
export function formatQuantity(quantity: number, unit: string, category?: IngredientCategory): string {
  // Seasonings don't show quantity
  if (category === 'seasonings' || quantity === 0) {
    return '';
  }
  return `${quantity} ${unit}`;
}
