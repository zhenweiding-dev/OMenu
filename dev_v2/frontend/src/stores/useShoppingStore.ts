import { create } from "zustand";
import { INGREDIENT_CATEGORIES } from "@/utils/constants";
import type { IngredientCategory, ShoppingItem } from "@/types";

interface ShoppingState {
  selectedCategory: IngredientCategory | "all";
  setSelectedCategory: (category: IngredientCategory | "all") => void;

  collapsedCategories: Record<IngredientCategory, boolean>;
  toggleCategoryCollapse: (category: IngredientCategory) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  editingItem: ShoppingItem | null;
  setEditingItem: (item: ShoppingItem | null) => void;

  showAddItemModal: boolean;
  setShowAddItemModal: (visible: boolean) => void;
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  selectedCategory: "all",
  setSelectedCategory: (category) => set({ selectedCategory: category }),

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

  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),

  editingItem: null,
  setEditingItem: (item) => set({ editingItem: item }),

  showAddItemModal: false,
  setShowAddItemModal: (visible) => set({ showAddItemModal: visible }),
}));
