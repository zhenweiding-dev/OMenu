import { create } from "zustand";
import { INGREDIENT_CATEGORIES } from "@/utils/constants";
import type { IngredientCategory, ShoppingItem } from "@/types";

interface ShoppingState {
  collapsedCategories: Record<IngredientCategory, boolean>;
  toggleCategoryCollapse: (category: IngredientCategory) => void;

  editingItem: ShoppingItem | null;
  setEditingItem: (item: ShoppingItem | null) => void;

  showAddItemModal: boolean;
  setShowAddItemModal: (visible: boolean) => void;
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  collapsedCategories: INGREDIENT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = false;
      return acc;
    },
    {} as Record<IngredientCategory, boolean>,
  ),
  toggleCategoryCollapse: (category) =>
    set((state) => ({
      collapsedCategories: {
        ...state.collapsedCategories,
        [category]: !state.collapsedCategories[category],
      },
    })),

  editingItem: null,
  setEditingItem: (item) => set({ editingItem: item }),

  showAddItemModal: false,
  setShowAddItemModal: (visible) => set({ showAddItemModal: visible }),
}));
