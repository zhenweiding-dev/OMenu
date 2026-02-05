import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it } from "vitest";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { useAppStore } from "@/stores/useAppStore";
import type { MenuBook } from "@/types";

const createTestMenuBook = (): MenuBook => ({
  id: "test_book_01",
  createdAt: "2026-01-29T08:00:00.000Z",
  status: "ready",
  preferences: {
    keywords: ["Healthy"],
    preferredItems: ["Avocado"],
    dislikedItems: ["Mushrooms"],
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
    monday: { breakfast: [], lunch: [], dinner: [] },
    tuesday: { breakfast: [], lunch: [], dinner: [] },
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
      { id: "item_bread", name: "Sourdough bread", category: "grains", totalQuantity: 1, unit: "loaf", purchased: false },
      { id: "item_eggs", name: "Eggs", category: "proteins", totalQuantity: 12, unit: "count", purchased: false },
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

describe("ShoppingPage interactions", () => {
  beforeEach(() => {
    useAppStore.setState(getInitialState());
    const book = createTestMenuBook();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });
  });

  it("allows editing and deleting an item via the modal flow", async () => {
    render(
      <MemoryRouter>
        <ShoppingPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sourdough bread")).toBeInTheDocument();

    const targetName = "Sourdough bread";
    const editButton = screen.getByRole("button", { name: `Edit ${targetName}` });
    fireEvent.click(editButton);

    expect(await screen.findByRole("button", { name: /save item/i })).toBeInTheDocument();

    const deleteButton = await screen.findByRole("button", { name: /delete item/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(screen.getByText(/remove item/i)).toBeInTheDocument());

    const confirmDelete = screen.getByRole("button", { name: /^delete$/i });
    fireEvent.click(confirmDelete);

    await waitFor(() => expect(screen.queryByText(targetName)).not.toBeInTheDocument());
  });
});
