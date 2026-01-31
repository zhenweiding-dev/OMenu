import { create } from 'zustand';
import type { ShoppingItem, ShoppingList, IngredientCategory } from '@/types';
import * as db from '@/services/db';
import { generateId } from '@/utils/helpers';
import { INGREDIENT_CATEGORIES } from '@/utils/constants';

interface ShoppingState {
  // Current shopping list
  list: ShoppingList | null;
  isLoading: boolean;
  error: string | null;

  // Collapsed categories
  collapsedCategories: Set<IngredientCategory>;

  // Actions
  setList: (list: ShoppingList | null) => void;
  loadList: (planId: string) => Promise<void>;

  // Item operations
  togglePurchased: (itemId: string) => Promise<void>;
  addItem: (item: Omit<ShoppingItem, 'id' | 'purchased'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;

  // Category operations
  toggleCategory: (category: IngredientCategory) => void;
  expandAllCategories: () => void;
  collapseAllCategories: () => void;

  // Grouping helper
  getItemsByCategory: () => Map<IngredientCategory, ShoppingItem[]>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  list: null,
  isLoading: false,
  error: null,
  collapsedCategories: new Set(),

  setList: (list) => set({ list }),

  loadList: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const list = await db.getShoppingListByPlanId(planId);
      set({ list: list || null, isLoading: false });
    } catch (error) {
      console.error('Error loading shopping list:', error);
      set({ error: 'Failed to load shopping list', isLoading: false });
    }
  },

  togglePurchased: async (itemId) => {
    const { list } = get();
    if (!list) return;

    const item = list.items.find((i) => i.id === itemId);
    if (!item) return;

    const newPurchased = !item.purchased;

    // Optimistic update
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? { ...i, purchased: newPurchased } : i
    );
    set({ list: { ...list, items: updatedItems } });

    // Persist to DB
    try {
      await db.updateShoppingListItem(list.id, itemId, { purchased: newPurchased });
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert on error
      set({ list });
    }
  },

  addItem: async (itemData) => {
    const { list } = get();
    if (!list) return;

    const newItem: ShoppingItem = {
      ...itemData,
      id: generateId(),
      purchased: false,
      isManuallyAdded: true,
    };

    // Optimistic update
    const updatedList = { ...list, items: [...list.items, newItem] };
    set({ list: updatedList });

    // Persist to DB
    try {
      await db.addShoppingListItem(list.id, newItem);
    } catch (error) {
      console.error('Error adding item:', error);
      // Revert on error
      set({ list });
    }
  },

  removeItem: async (itemId) => {
    const { list } = get();
    if (!list) return;

    // Optimistic update
    const updatedItems = list.items.filter((i) => i.id !== itemId);
    set({ list: { ...list, items: updatedItems } });

    // Persist to DB
    try {
      await db.removeShoppingListItem(list.id, itemId);
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert on error
      set({ list });
    }
  },

  updateItem: async (itemId, updates) => {
    const { list } = get();
    if (!list) return;

    // Optimistic update
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? { ...i, ...updates } : i
    );
    set({ list: { ...list, items: updatedItems } });

    // Persist to DB
    try {
      await db.updateShoppingListItem(list.id, itemId, updates);
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert on error
      set({ list });
    }
  },

  toggleCategory: (category) => {
    const { collapsedCategories } = get();
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    set({ collapsedCategories: newCollapsed });
  },

  expandAllCategories: () => {
    set({ collapsedCategories: new Set() });
  },

  collapseAllCategories: () => {
    set({ collapsedCategories: new Set(INGREDIENT_CATEGORIES) });
  },

  getItemsByCategory: () => {
    const { list } = get();
    const grouped = new Map<IngredientCategory, ShoppingItem[]>();

    // Initialize all categories
    INGREDIENT_CATEGORIES.forEach((cat) => {
      grouped.set(cat, []);
    });

    if (!list) return grouped;

    // Group items
    list.items.forEach((item) => {
      const items = grouped.get(item.category) || [];
      items.push(item);
      grouped.set(item.category, items);
    });

    // Remove empty categories
    INGREDIENT_CATEGORIES.forEach((cat) => {
      if (grouped.get(cat)?.length === 0) {
        grouped.delete(cat);
      }
    });

    return grouped;
  },
}));
