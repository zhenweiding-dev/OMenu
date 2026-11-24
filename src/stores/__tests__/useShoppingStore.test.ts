import { beforeEach, describe, expect, it } from "vitest";
import { useShoppingStore } from "@/stores/useShoppingStore";

const initialState = useShoppingStore.getInitialState();

describe("useShoppingStore", () => {
  beforeEach(() => {
    useShoppingStore.setState(initialState, true);
  });

  it("starts with seasonings and pantry staples folded, everything else open", () => {
    const collapsed = useShoppingStore.getState().collapsedCategories;
    expect(collapsed.seasonings).toBe(true);
    expect(collapsed.pantry_staples).toBe(true);
    expect(collapsed.proteins).toBe(false);
    expect(collapsed.vegetables).toBe(false);
  });

  it("toggles category collapse", () => {
    useShoppingStore.getState().toggleCategoryCollapse("proteins");
    expect(useShoppingStore.getState().collapsedCategories.proteins).toBe(true);
  });

  it("controls the add item modal visibility", () => {
    useShoppingStore.getState().setShowAddItemModal(true);
    expect(useShoppingStore.getState().showAddItemModal).toBe(true);
  });

  it("records an editing item reference", () => {
    const sampleItem = {
      id: "temp",
      name: "Test",
      category: "proteins" as const,
      totalQuantity: 1,
      unit: "",
      purchased: false,
    };
    useShoppingStore.getState().setEditingItem(sampleItem);
    expect(useShoppingStore.getState().editingItem).toEqual(sampleItem);
  });
});
