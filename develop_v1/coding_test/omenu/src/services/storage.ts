import type { UserPreferences, MealPlanDraft } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

// ===== Generic Storage Helpers =====
function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// ===== User Preferences =====
export function getUserPreferences(): UserPreferences | null {
  return getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
}

export function setUserPreferences(preferences: UserPreferences): void {
  setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
}

export function removeUserPreferences(): void {
  removeItem(STORAGE_KEYS.USER_PREFERENCES);
}

// ===== Meal Plan Draft =====
export function getMealPlanDraft(): MealPlanDraft | null {
  const draft = getItem<MealPlanDraft>(STORAGE_KEYS.MEAL_PLAN_DRAFT);
  if (draft) {
    // Convert lastUpdated string back to Date
    draft.lastUpdated = new Date(draft.lastUpdated);
  }
  return draft;
}

export function setMealPlanDraft(draft: MealPlanDraft): void {
  setItem(STORAGE_KEYS.MEAL_PLAN_DRAFT, draft);
}

export function removeMealPlanDraft(): void {
  removeItem(STORAGE_KEYS.MEAL_PLAN_DRAFT);
}

export function hasMealPlanDraft(): boolean {
  return localStorage.getItem(STORAGE_KEYS.MEAL_PLAN_DRAFT) !== null;
}

// ===== Current Plan ID =====
export function getCurrentPlanId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN_ID);
}

export function setCurrentPlanId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN_ID, id);
}

export function removeCurrentPlanId(): void {
  removeItem(STORAGE_KEYS.CURRENT_PLAN_ID);
}

// ===== Clear All Data =====
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeItem(key);
  });
}
