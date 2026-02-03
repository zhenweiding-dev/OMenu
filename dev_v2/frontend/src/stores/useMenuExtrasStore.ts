import { create } from "zustand";
import type { DayMeals, MenuBook, Recipe } from "@/types";

type DayKey = keyof MenuBook["mealPlan"]["days"];
type MealKey = keyof DayMeals;

type ExtrasMap = Record<string, Partial<Record<DayKey, Partial<Record<MealKey, Recipe[]>>>>>;

interface MenuExtrasState {
  extras: ExtrasMap;
  addExtraMeal: (bookId: string, day: DayKey, mealType: MealKey, recipe: Recipe) => void;
  updateExtraMealNotes: (bookId: string, day: DayKey, mealType: MealKey, recipeId: string, notes: string) => void;
  removeExtraMeal: (bookId: string, day: DayKey, mealType: MealKey, recipeId: string) => void;
}

export const useMenuExtrasStore = create<MenuExtrasState>((set) => ({
  extras: {},
  addExtraMeal: (bookId, day, mealType, recipe) =>
    set((state) => {
      const bookExtras = state.extras[bookId] ?? {};
      const dayExtras = bookExtras[day] ?? {};
      const mealExtras = dayExtras[mealType] ?? [];
      return {
        extras: {
          ...state.extras,
          [bookId]: {
            ...bookExtras,
            [day]: {
              ...dayExtras,
              [mealType]: [...mealExtras, recipe],
            },
          },
        },
      };
    }),
  updateExtraMealNotes: (bookId, day, mealType, recipeId, notes) =>
    set((state) => {
      const bookExtras = state.extras[bookId];
      if (!bookExtras) return state;
      const dayExtras = bookExtras[day];
      if (!dayExtras) return state;
      const mealExtras = dayExtras[mealType];
      if (!mealExtras) return state;
      return {
        extras: {
          ...state.extras,
          [bookId]: {
            ...bookExtras,
            [day]: {
              ...dayExtras,
              [mealType]: mealExtras.map((recipe) =>
                recipe.id === recipeId ? { ...recipe, notes } : recipe,
              ),
            },
          },
        },
      };
    }),
  removeExtraMeal: (bookId, day, mealType, recipeId) =>
    set((state) => {
      const bookExtras = state.extras[bookId];
      if (!bookExtras) return state;
      const dayExtras = bookExtras[day];
      if (!dayExtras) return state;
      const mealExtras = dayExtras[mealType];
      if (!mealExtras) return state;
      return {
        extras: {
          ...state.extras,
          [bookId]: {
            ...bookExtras,
            [day]: {
              ...dayExtras,
              [mealType]: mealExtras.filter((recipe) => recipe.id !== recipeId),
            },
          },
        },
      };
    }),
}));
