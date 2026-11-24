import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import type { MenuBook } from "@/types";

const data = vi.hoisted(() => ({
  fetchProfile: vi.fn(),
  fetchMenuBooks: vi.fn(),
  updateProfile: vi.fn(async () => {}),
  upsertMenuBook: vi.fn(async () => {}),
  deleteMenuBook: vi.fn(async () => {}),
}));
vi.mock("@/services/supabase-data", () => data);
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(async () => ({ error: null })),
    },
  },
}));

import App from "@/App";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDraftStore } from "@/stores/useDraftStore";

const emptyWeek = () =>
  Object.fromEntries(
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => [
      day,
      { breakfast: [], lunch: [], dinner: [] },
    ]),
  ) as unknown as MenuBook["menus"];

const book = (id: string): MenuBook => ({
  id,
  createdAt: new Date().toISOString(),
  status: "ready",
  preferences: {
    specificPreferences: [],
    specificDisliked: [],
    numPeople: 2,
    budget: 120,
    difficulty: "easy",
    cookSchedule: {} as MenuBook["preferences"]["cookSchedule"],
  },
  menus: emptyWeek(),
  shoppingList: {
    id: `sl_${id}`,
    menuBookId: id,
    createdAt: "",
    items: [{ id: "eggs", name: "Eggs", category: "proteins", totalQuantity: 12, unit: "count", purchased: false }],
  },
});

const renderSignedIn = () => {
  useAuthStore.setState({ user: { id: "u1" } as User, loading: false, initialize: async () => {} });
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("App Supabase sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState(useAppStore.getInitialState(), true);
    useDraftStore.setState(useDraftStore.getInitialState(), true);
  });
  afterEach(() => {
    useAuthStore.setState({ user: null });
  });

  it("writes nothing on load, then saves exactly the book that changed", async () => {
    data.fetchProfile.mockResolvedValue({ preferences: null, current_week_id: "a", current_day_index: 0 });
    data.fetchMenuBooks.mockResolvedValue([book("a"), book("b")]);
    renderSignedIn();
    await waitFor(() => expect(useAppStore.getState().menuBooks).toHaveLength(2));
    await sleep(50);
    expect(data.upsertMenuBook).not.toHaveBeenCalled();

    act(() => useAppStore.getState().updateShoppingItem("a", "eggs", { purchased: true }));
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(1));
    expect(data.upsertMenuBook).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "a", shoppingList: expect.objectContaining({ items: [expect.objectContaining({ purchased: true })] }) }),
    );

    const dish = {
      id: "manual_1", name: "Toast", ingredients: [], instructions: "", estimatedTime: 5,
      servings: 2, difficulty: "easy" as const, totalCalories: 200, source: "manual" as const,
    };
    act(() => useAppStore.getState().addDish("b", "monday", "breakfast", dish));
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(2));
    expect(data.upsertMenuBook).toHaveBeenLastCalledWith(expect.objectContaining({ id: "b" }));

    act(() => useAppStore.getState().updateDishNotes("b", "monday", "breakfast", "manual_1", "less salt"));
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(3));

    act(() => useAppStore.getState().deleteMenuBook("a"));
    await waitFor(() => expect(data.deleteMenuBook).toHaveBeenCalledWith("a"));
    expect(data.upsertMenuBook).toHaveBeenCalledTimes(3);
  });

  it("after a failed load, never writes the profile but still saves new books", async () => {
    data.fetchProfile.mockRejectedValue(new Error("network down"));
    data.fetchMenuBooks.mockResolvedValue([]);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    renderSignedIn();
    await waitFor(() => expect(consoleError).toHaveBeenCalled());

    act(() => useAppStore.getState().addMenuBook(book("new")));
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(1));
    expect(data.upsertMenuBook).toHaveBeenLastCalledWith(expect.objectContaining({ id: "new" }));
    await sleep(800); // longer than the 600 ms profile debounce
    expect(data.updateProfile).not.toHaveBeenCalled();
    expect(data.deleteMenuBook).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("sends one save per book at a time and the latest version last", async () => {
    data.fetchProfile.mockResolvedValue({ preferences: null, current_week_id: "a", current_day_index: 0 });
    data.fetchMenuBooks.mockResolvedValue([book("a")]);
    let finishFirst: () => void = () => {};
    data.upsertMenuBook.mockImplementationOnce(() => new Promise<void>((resolve) => { finishFirst = resolve; }));
    renderSignedIn();
    await waitFor(() => expect(useAppStore.getState().menuBooks).toHaveLength(1));

    const lastCall = () => (data.upsertMenuBook.mock.calls.at(-1) as unknown as [MenuBook] | undefined)?.[0];
    act(() => useAppStore.getState().updateShoppingItem("a", "eggs", { purchased: true }));
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(1));
    act(() => useAppStore.getState().updateShoppingItem("a", "eggs", { name: "Free-range eggs" }));
    act(() => useAppStore.getState().updateShoppingItem("a", "eggs", { totalQuantity: 6 }));
    await sleep(50);
    expect(data.upsertMenuBook).toHaveBeenCalledTimes(1); // the first save is still in flight

    act(() => finishFirst());
    await waitFor(() => expect(data.upsertMenuBook).toHaveBeenCalledTimes(2));
    expect(lastCall()?.shoppingList?.items[0]).toMatchObject({ purchased: true, name: "Free-range eggs", totalQuantity: 6 });
  });

  it("sign-out clears the previous account's menus and draft", async () => {
    useAppStore.getState().setMenuBooks([book("a")]);
    useDraftStore.getState().setSpecificDisliked(["No cilantro"]);
    await useAuthStore.getState().signOut();
    expect(useAppStore.getState().menuBooks).toEqual([]);
    expect(useDraftStore.getState().specificDisliked).toEqual([]);
  });
});
