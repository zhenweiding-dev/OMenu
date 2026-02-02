import { beforeEach, describe, expect, it } from "vitest";
import type { ShoppingItem } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";

const cloneSample = () => structuredClone(SAMPLE_MENU_BOOK);
const initialState = useAppStore.getInitialState();

describe("useAppStore shopping actions", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.persist.clearStorage?.();
    useAppStore.setState(initialState, true);
  });

  it("updates a shopping item's purchased status", () => {
    const book = cloneSample();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const target = book.shoppingList.items[0];
    useAppStore.getState().updateShoppingItem(book.id, target.id, { purchased: true });

    const updatedBook = useAppStore.getState().menuBooks[0];
    const updatedItem = updatedBook.shoppingList.items.find((item) => item.id === target.id);
    expect(updatedItem?.purchased).toBe(true);
  });

  it("adds a manual shopping item", () => {
    const book = cloneSample();
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
    expect(updatedBook.shoppingList.items).toContainEqual(newItem);
  });

  it("removes a shopping item", () => {
    const book = cloneSample();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const target = book.shoppingList.items[0];
    useAppStore.getState().removeShoppingItem(book.id, target.id);

    const updatedBook = useAppStore.getState().menuBooks[0];
    expect(updatedBook.shoppingList.items.some((item) => item.id === target.id)).toBe(false);
  });

  it("persists shopping changes to localStorage", () => {
    const book = cloneSample();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });

    const target = book.shoppingList.items[0];
    useAppStore.getState().updateShoppingItem(book.id, target.id, { purchased: true });

    const stored = localStorage.getItem("omenu_app_state");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.state.menuBooks[0].shoppingList.items.find((item: ShoppingItem) => item.id === target.id)?.purchased).toBe(
      true,
    );
  });
});
