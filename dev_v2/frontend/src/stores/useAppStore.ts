import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { DayMeals, MenuBook, ShoppingItem } from "@/types";

type DayKey = keyof MenuBook["mealPlan"]["days"];
type MealKey = keyof DayMeals;

interface ActiveMealState {
  bookId: string;
  day: DayKey;
  mealType: MealKey;
}

interface AppState {
  menuBooks: MenuBook[];
  addMenuBook: (book: MenuBook) => void;
  updateMenuBook: (id: string, updates: Partial<MenuBook>) => void;
  deleteMenuBook: (id: string) => void;
  setDayMeal: (bookId: string, day: DayKey, mealType: MealKey, meal: NonNullable<DayMeals[MealKey]>) => void;
  clearDayMeal: (bookId: string, day: DayKey, mealType: MealKey) => void;

  currentWeekId: string | null;
  setCurrentWeekId: (id: string | null) => void;
  getCurrentMenuBook: () => MenuBook | null;

  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleMenuView: () => void;

  currentDayIndex: number;
  setCurrentDayIndex: (index: number) => void;

  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  activeMeal: ActiveMealState | null;
  setActiveMeal: (activeMeal: ActiveMealState | null) => void;
  clearActiveMeal: () => void;
  getActiveMeal: () => {
    book: MenuBook;
    day: DayKey;
    mealType: MealKey;
    recipe: NonNullable<DayMeals[MealKey]>;
  } | null;
  updateMealNotes: (bookId: string, day: DayKey, mealType: MealKey, notes: string) => void;
  updateShoppingItem: (bookId: string, itemId: string, updates: Partial<ShoppingItem>) => void;
  addShoppingItem: (bookId: string, item: ShoppingItem) => void;
  removeShoppingItem: (bookId: string, itemId: string) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => void 0,
  removeItem: () => void 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  menuBooks: [],
  addMenuBook: (book) =>
    set((state) => ({
      menuBooks: [...state.menuBooks, book],
      currentWeekId: book.id,
    })),
  updateMenuBook: (id, updates) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) =>
        book.id === id ? { ...book, ...updates } : book,
      ),
    })),
  deleteMenuBook: (id) =>
    set((state) => ({
      menuBooks: state.menuBooks.filter((book) => book.id !== id),
      currentWeekId: state.currentWeekId === id ? null : state.currentWeekId,
    })),
  setDayMeal: (bookId, day, mealType, meal) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMeals = book.mealPlan.days[day];
        return {
          ...book,
          mealPlan: {
            ...book.mealPlan,
            days: {
              ...book.mealPlan.days,
              [day]: {
                ...dayMeals,
                [mealType]: meal,
              },
            },
          },
        };
      }),
    })),
  clearDayMeal: (bookId, day, mealType) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMeals = book.mealPlan.days[day];
        if (!dayMeals[mealType]) return book;
        return {
          ...book,
          mealPlan: {
            ...book.mealPlan,
            days: {
              ...book.mealPlan.days,
              [day]: {
                ...dayMeals,
                [mealType]: null,
              },
            },
          },
        };
      }),
    })),

  currentWeekId: null,
  setCurrentWeekId: (id) => set({ currentWeekId: id }),
  getCurrentMenuBook: () => {
    const { menuBooks, currentWeekId } = get();
    return menuBooks.find((book) => book.id === currentWeekId) ?? null;
  },

  isMenuOpen: true,
  setIsMenuOpen: (open) => set({ isMenuOpen: open }),
  toggleMenuView: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  currentDayIndex: 0,
  setCurrentDayIndex: (index) =>
    set({ currentDayIndex: Math.max(0, Math.min(6, index)) }),

  isGenerating: false,
  setIsGenerating: (status) => set({ isGenerating: status }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  activeMeal: null,
  setActiveMeal: (activeMeal) => set({ activeMeal }),
  clearActiveMeal: () => set({ activeMeal: null }),
  getActiveMeal: () => {
    const { menuBooks, activeMeal } = get();
    if (!activeMeal) return null;
    const book = menuBooks.find((item) => item.id === activeMeal.bookId);
    if (!book) return null;
    const dayMeals = book.mealPlan.days[activeMeal.day];
    const recipe = dayMeals[activeMeal.mealType];
    if (!recipe) return null;
    return {
      book,
      day: activeMeal.day,
      mealType: activeMeal.mealType,
      recipe,
    };
  },
  updateMealNotes: (bookId, day, mealType, notes) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMeals = book.mealPlan.days[day];
        const recipe = dayMeals[mealType];
        if (!recipe) return book;
        return {
          ...book,
          mealPlan: {
            ...book.mealPlan,
            days: {
              ...book.mealPlan.days,
              [day]: {
                ...dayMeals,
                [mealType]: {
                  ...recipe,
                  notes,
                },
              },
            },
          },
        };
      }),
    })),
  updateShoppingItem: (bookId, itemId, updates) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const list = book.shoppingList;
        if (!list) return book;
        return {
          ...book,
          shoppingList: {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    ...updates,
                  }
                : item,
            ),
          },
        };
      }),
    })),
  addShoppingItem: (bookId, item) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const list = book.shoppingList;
        if (!list) return book;
        return {
          ...book,
          shoppingList: {
            ...list,
            items: [...list.items, item],
          },
        };
      }),
    })),
  removeShoppingItem: (bookId, itemId) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const list = book.shoppingList;
        if (!list) return book;
        return {
          ...book,
          shoppingList: {
            ...list,
            items: list.items.filter((item) => item.id !== itemId),
          },
        };
      }),
    })),
    }),
    {
      name: "omenu_app_state",
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : window.localStorage)),
      partialize: (state) => ({
        menuBooks: state.menuBooks,
        currentWeekId: state.currentWeekId,
        isMenuOpen: state.isMenuOpen,
        currentDayIndex: state.currentDayIndex,
      }),
    },
  ),
);
