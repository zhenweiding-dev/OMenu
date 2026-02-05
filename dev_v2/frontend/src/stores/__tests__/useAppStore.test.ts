import { beforeEach, describe, expect, it } from "vitest";
import type { MenuBook, ShoppingItem } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

const createTestMenuBook = (): MenuBook => ({
  id: "test_book_01",
  createdAt: "2026-01-29T08:00:00.000Z",
  status: "ready",
  preferences: {
    specificPreferences: ["Avocado"],
    specificDisliked: ["Mushrooms"],
    numPeople: 2,
    budget: 120,
    difficulty: "easy",
    cookSchedule: {
      monday: { breakfast: true, lunch: true, dinner: true },
      tuesday: { breakfast: true, lunch: true, dinner: true },
      wednesday: { breakfast: true, lunch: true, dinner: true },
      thursday: { breakfast: true, lunch: true, dinner: true },
      friday: { breakfast: true, lunch: true, dinner: true },
      saturday: { breakfast: true, lunch: true, dinner: true },
      sunday: { breakfast: true, lunch: true, dinner: true },
    },
  },
  menus: {
    monday: {
      breakfast: [{ id: "dish_1", name: "Test Breakfast", ingredients: [], instructions: "", estimatedTime: 15, servings: 2, difficulty: "easy", totalCalories: 300, source: "ai" }],
      lunch: [{ id: "dish_2", name: "Test Lunch", ingredients: [], instructions: "", estimatedTime: 30, servings: 2, difficulty: "medium", totalCalories: 500, source: "ai" }],
      dinner: [{ id: "dish_3", name: "Test Dinner", ingredients: [], instructions: "", estimatedTime: 45, servings: 2, difficulty: "medium", totalCalories: 600, source: "ai" }],
    },
    tuesday: {
      breakfast: [{ id: "dish_4", name: "Tuesday Breakfast", ingredients: [], instructions: "", estimatedTime: 15, servings: 2, difficulty: "easy", totalCalories: 300, source: "ai" }],
      lunch: [],
      dinner: [{ id: "dish_5", name: "Tuesday Dinner", ingredients: [], instructions: "", estimatedTime: 45, servings: 2, difficulty: "medium", totalCalories: 600, source: "ai" }],
    },
    wednesday: { breakfast: [], lunch: [], dinner: [] },
    thursday: { breakfast: [], lunch: [], dinner: [] },
    friday: { breakfast: [], lunch: [], dinner: [] },
    saturday: { breakfast: [], lunch: [], dinner: [] },
    sunday: { breakfast: [], lunch: [], dinner: [] },
  },
  shoppingList: {
    id: "shopping_test_01",
    menuBookId: "test_book_01",
    createdAt: "2026-01-29T09:00:00.000Z",
    items: [
      { id: "item_1", name: "Sourdough bread", category: "grains", totalQuantity: 1, unit: "loaf", purchased: false },
      { id: "item_2", name: "Eggs", category: "proteins", totalQuantity: 12, unit: "count", purchased: false },
    ],
  },
});

const getInitialState = () => ({
  menuBooks: [] as MenuBook[],
  currentWeekId: null as string | null,
  isMenuOpen: true,
  currentDayIndex: 0,
  isMenuPickerOpen: false,
  isGenerating: false,
  error: null as string | null,
  activeDish: null,
});

describe("useAppStore shopping actions", () => {
  beforeEach(() => {
    useAppStore.setState(getInitialState());
  });

  it("updates a shopping item's purchased status", () => {
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const target = book.shoppingList.items[0];
    useAppStore.getState().updateShoppingItem(book.id, target.id, { purchased: true });

    const updatedBook = useAppStore.getState().menuBooks[0];
    const updatedItem = updatedBook.shoppingList!.items.find((item) => item.id === target.id);
    expect(updatedItem?.purchased).toBe(true);
  });

  it("adds a manual shopping item", () => {
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const newItem: ShoppingItem = {
      id: "manual_test",
      name: "Fresh basil",
      category: "seasonings" as const,
      totalQuantity: 0,
      unit: "",
      purchased: false,
      isManuallyAdded: true,
    };

    useAppStore.getState().addShoppingItem(book.id, newItem);

    const updatedBook = useAppStore.getState().menuBooks[0];
    expect(updatedBook.shoppingList!.items).toContainEqual(newItem);
  });

  it("removes a shopping item", () => {
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const target = book.shoppingList.items[0];
    useAppStore.getState().removeShoppingItem(book.id, target.id);

    const updatedBook = useAppStore.getState().menuBooks[0];
    expect(updatedBook.shoppingList!.items.some((item) => item.id === target.id)).toBe(false);
  });
});

describe("useAppStore menu actions", () => {
  beforeEach(() => {
    useAppStore.setState(getInitialState());
  });

  it("adds a dish to a meal", () => {
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const dish = {
      ...book.menus.monday.breakfast[0],
      id: "manual-test",
      name: "Custom Breakfast",
      source: "manual" as const,
    };
    useAppStore.getState().addDish(book.id, "monday", "breakfast", dish);

    const updatedBook = useAppStore.getState().menuBooks[0];
    expect(updatedBook.menus.monday.breakfast.some((item) => item.id === "manual-test")).toBe(true);
  });

  it("removes an existing dish from a meal", () => {
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const targetId = book.menus.tuesday.dinner[0]?.id;
    if (!targetId) {
      throw new Error("Expected test menu to have a dinner dish on Tuesday");
    }
    useAppStore.getState().removeDish(book.id, "tuesday", "dinner", targetId);

    const updatedBook = useAppStore.getState().menuBooks[0];
    expect(updatedBook.menus.tuesday.dinner.some((item) => item.id === targetId)).toBe(false);
  });
});
