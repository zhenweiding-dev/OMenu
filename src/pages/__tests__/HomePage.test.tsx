import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { startOfWeek } from "date-fns";
import { HomePage } from "@/pages/HomePage";
import { useAppStore } from "@/stores/useAppStore";
import type { MenuBook } from "@/types";

const emptyDay = () => ({ breakfast: [], lunch: [], dinner: [] });

const thisWeekBook = (): MenuBook => ({
  id: "book_home",
  createdAt: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
  status: "ready",
  preferences: {
    specificPreferences: [],
    specificDisliked: [],
    numPeople: 2,
    budget: 120,
    difficulty: "easy",
    cookSchedule: {} as MenuBook["preferences"]["cookSchedule"],
  },
  menus: {
    monday: {
      ...emptyDay(),
      dinner: [
        {
          id: "mon-dinner-001",
          name: "Test Stir-fry",
          ingredients: [{ name: "tofu", quantity: 200, unit: "g", category: "proteins" }],
          instructions: "1. Cook.",
          estimatedTime: 20,
          servings: 2,
          difficulty: "easy",
          totalCalories: 400,
          source: "ai",
        },
      ],
    },
    tuesday: emptyDay(),
    wednesday: emptyDay(),
    thursday: emptyDay(),
    friday: emptyDay(),
    saturday: emptyDay(),
    sunday: emptyDay(),
  },
  shoppingList: { id: "sl_home", menuBookId: "book_home", createdAt: "", items: [] },
});

describe("HomePage recipe sheet", () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
    const book = thisWeekBook();
    useAppStore.getState().setMenuBooks([book], book.id);
    useAppStore.getState().setCurrentDayIndex(0);
    document.getElementById("phone-screen")?.remove();
    const screenEl = document.createElement("div");
    screenEl.id = "phone-screen";
    document.body.appendChild(screenEl);
  });

  it("shows a saved note right away, without reopening the sheet", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Test Stir-fry"));
    fireEvent.click(screen.getByLabelText("Edit notes"));
    fireEvent.change(document.querySelector("#phone-screen textarea") as HTMLTextAreaElement, {
      target: { value: "Use less soy sauce" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Use less soy sauce")).toBeInTheDocument();
    const saved = useAppStore.getState().menuBooks[0].menus.monday.dinner[0];
    expect(saved.notes).toBe("Use less soy sauce");
  });
});
