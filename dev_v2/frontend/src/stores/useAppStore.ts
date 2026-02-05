import { create } from "zustand";
import type { Dish, Menu, MenuBook, ShoppingItem, WeekMenus } from "@/types";

type DayKey = keyof MenuBook["menus"];
type MealKey = keyof Menu;

interface ActiveDishState {
  bookId: string;
  day: DayKey;
  mealType: MealKey;
  dishId: string;
}

interface AppState {
  menuBooks: MenuBook[];
  addMenuBook: (book: MenuBook) => void;
  updateMenuBook: (id: string, updates: Partial<MenuBook>) => void;
  deleteMenuBook: (id: string) => void;
  setMenuBooks: (books: MenuBook[], currentWeekId?: string | null) => void;

  currentWeekId: string | null;
  setCurrentWeekId: (id: string | null) => void;
  getCurrentMenuBook: () => MenuBook | null;

  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleMenuView: () => void;

  currentDayIndex: number;
  setCurrentDayIndex: (index: number) => void;

  isMenuPickerOpen: boolean;
  setIsMenuPickerOpen: (open: boolean) => void;

  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  activeDish: ActiveDishState | null;
  setActiveDish: (activeDish: ActiveDishState | null) => void;
  clearActiveDish: () => void;
  getActiveDish: () => {
    book: MenuBook;
    day: DayKey;
    mealType: MealKey;
    dish: Dish;
  } | null;

  addDish: (bookId: string, day: DayKey, mealType: MealKey, dish: Dish) => void;
  updateDishNotes: (bookId: string, day: DayKey, mealType: MealKey, dishId: string, notes: string) => void;
  removeDish: (bookId: string, day: DayKey, mealType: MealKey, dishId: string) => void;

  updateShoppingItem: (bookId: string, itemId: string, updates: Partial<ShoppingItem>) => void;
  addShoppingItem: (bookId: string, item: ShoppingItem) => void;
  removeShoppingItem: (bookId: string, itemId: string) => void;
}

const ensureMenus = (menus: WeekMenus): WeekMenus =>
  (Object.fromEntries(
    Object.entries(menus).map(([day, menu]) => [
      day,
      {
        breakfast: menu.breakfast ?? [],
        lunch: menu.lunch ?? [],
        dinner: menu.dinner ?? [],
      },
    ]),
  ) as WeekMenus);

export const useAppStore = create<AppState>()((set, get) => ({
  menuBooks: [],
  addMenuBook: (book) =>
    set((state) => ({
      menuBooks: [...state.menuBooks, { ...book, menus: ensureMenus(book.menus) }],
      currentWeekId: book.id,
    })),
  updateMenuBook: (id, updates) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) =>
        book.id === id
          ? {
              ...book,
              ...updates,
              menus: updates.menus ? ensureMenus(updates.menus) : book.menus,
            }
          : book,
      ),
    })),
  deleteMenuBook: (id) =>
    set((state) => ({
      menuBooks: state.menuBooks.filter((book) => book.id !== id),
      currentWeekId: state.currentWeekId === id ? null : state.currentWeekId,
    })),
  setMenuBooks: (books, nextCurrentWeekId = null) =>
    set(() => ({
      menuBooks: books.map((book) => ({ ...book, menus: ensureMenus(book.menus) })),
      currentWeekId: nextCurrentWeekId ?? books[0]?.id ?? null,
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
  setCurrentDayIndex: (index) => set({ currentDayIndex: Math.max(0, Math.min(6, index)) }),

  isMenuPickerOpen: false,
  setIsMenuPickerOpen: (open) => set({ isMenuPickerOpen: open }),

  isGenerating: false,
  setIsGenerating: (status) => set({ isGenerating: status }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  activeDish: null,
  setActiveDish: (activeDish) => set({ activeDish }),
  clearActiveDish: () => set({ activeDish: null }),
  getActiveDish: () => {
    const { menuBooks, activeDish } = get();
    if (!activeDish) return null;
    const book = menuBooks.find((item) => item.id === activeDish.bookId);
    if (!book) return null;
    const dayMenu = book.menus[activeDish.day];
    const dishes = dayMenu[activeDish.mealType] ?? [];
    const dish = dishes.find((item) => item.id === activeDish.dishId);
    if (!dish) return null;
    return {
      book,
      day: activeDish.day,
      mealType: activeDish.mealType,
      dish,
    };
  },

  addDish: (bookId, day, mealType, dish) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMenu = book.menus[day];
        const existing = dayMenu[mealType] ?? [];
        return {
          ...book,
          menus: {
            ...book.menus,
            [day]: {
              ...dayMenu,
              [mealType]: [dish, ...existing],
            },
          },
        };
      }),
    })),
  updateDishNotes: (bookId, day, mealType, dishId, notes) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMenu = book.menus[day];
        return {
          ...book,
          menus: {
            ...book.menus,
            [day]: {
              ...dayMenu,
              [mealType]: (dayMenu[mealType] ?? []).map((dish) =>
                dish.id === dishId ? { ...dish, notes } : dish,
              ),
            },
          },
        };
      }),
    })),
  removeDish: (bookId, day, mealType, dishId) =>
    set((state) => ({
      menuBooks: state.menuBooks.map((book) => {
        if (book.id !== bookId) return book;
        const dayMenu = book.menus[day];
        return {
          ...book,
          menus: {
            ...book.menus,
            [day]: {
              ...dayMenu,
              [mealType]: (dayMenu[mealType] ?? []).filter((dish) => dish.id !== dishId),
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
}));
