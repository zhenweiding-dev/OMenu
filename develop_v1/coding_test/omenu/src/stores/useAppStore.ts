import { create } from 'zustand';
import type { UserPreferences, WeeklyMealPlan, ShoppingList } from '@/types';
import * as storage from '@/services/storage';
import * as db from '@/services/db';

interface AppState {
  // Current active plan
  currentPlanId: string | null;
  currentPlan: WeeklyMealPlan | null;
  currentShoppingList: ShoppingList | null;

  // User preferences
  preferences: UserPreferences | null;

  // Generation status
  isGenerating: boolean;
  generationError: string | null;

  // All plans (for history)
  allPlans: WeeklyMealPlan[];

  // Actions
  setCurrentPlanId: (id: string | null) => void;
  setCurrentPlan: (plan: WeeklyMealPlan | null) => void;
  setCurrentShoppingList: (list: ShoppingList | null) => void;
  setPreferences: (prefs: UserPreferences) => void;
  setIsGenerating: (status: boolean) => void;
  setGenerationError: (error: string | null) => void;

  // Data loading
  loadCurrentPlan: () => Promise<void>;
  loadCurrentShoppingList: () => Promise<void>;
  loadAllPlans: () => Promise<void>;
  loadPreferences: () => void;

  // Data operations
  savePlan: (plan: WeeklyMealPlan) => Promise<void>;
  saveShoppingList: (list: ShoppingList) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentPlanId: null,
  currentPlan: null,
  currentShoppingList: null,
  preferences: null,
  isGenerating: false,
  generationError: null,
  allPlans: [],

  // Simple setters
  setCurrentPlanId: (id) => {
    set({ currentPlanId: id });
    if (id) {
      storage.setCurrentPlanId(id);
    } else {
      storage.removeCurrentPlanId();
    }
  },

  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  setCurrentShoppingList: (list) => set({ currentShoppingList: list }),

  setPreferences: (prefs) => {
    set({ preferences: prefs });
    storage.setUserPreferences(prefs);
  },

  setIsGenerating: (status) => set({ isGenerating: status }),

  setGenerationError: (error) => set({ generationError: error }),

  // Load current plan from DB
  loadCurrentPlan: async () => {
    const id = storage.getCurrentPlanId();
    if (!id) {
      set({ currentPlanId: null, currentPlan: null });
      return;
    }

    try {
      const plan = await db.getMealPlan(id);
      set({ currentPlanId: id, currentPlan: plan || null });
    } catch (error) {
      console.error('Error loading current plan:', error);
      set({ currentPlanId: null, currentPlan: null });
    }
  },

  // Load shopping list for current plan
  loadCurrentShoppingList: async () => {
    const { currentPlanId } = get();
    if (!currentPlanId) {
      set({ currentShoppingList: null });
      return;
    }

    try {
      const list = await db.getShoppingListByPlanId(currentPlanId);
      set({ currentShoppingList: list || null });
    } catch (error) {
      console.error('Error loading shopping list:', error);
      set({ currentShoppingList: null });
    }
  },

  // Load all plans for history
  loadAllPlans: async () => {
    try {
      const plans = await db.getAllMealPlans();
      set({ allPlans: plans });
    } catch (error) {
      console.error('Error loading all plans:', error);
      set({ allPlans: [] });
    }
  },

  // Load preferences from localStorage
  loadPreferences: () => {
    const prefs = storage.getUserPreferences();
    set({ preferences: prefs });
  },

  // Save a plan to DB
  savePlan: async (plan) => {
    try {
      await db.saveMealPlan(plan);
      set({ currentPlan: plan, currentPlanId: plan.id });
      storage.setCurrentPlanId(plan.id);
      // Refresh all plans list
      const { loadAllPlans } = get();
      await loadAllPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  },

  // Save shopping list to DB
  saveShoppingList: async (list) => {
    try {
      await db.saveShoppingList(list);
      set({ currentShoppingList: list });
    } catch (error) {
      console.error('Error saving shopping list:', error);
      throw error;
    }
  },

  // Delete a plan
  deletePlan: async (id) => {
    try {
      await db.deleteMealPlan(id);
      const { currentPlanId, loadAllPlans } = get();
      if (currentPlanId === id) {
        set({ currentPlan: null, currentPlanId: null, currentShoppingList: null });
        storage.removeCurrentPlanId();
      }
      await loadAllPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },
}));
