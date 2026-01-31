import { create } from 'zustand';
import type { CookSchedule, Difficulty, MealPlanDraft, UserPreferences } from '@/types';
import {
  DEFAULT_NUM_PEOPLE,
  DEFAULT_BUDGET,
  DEFAULT_DIFFICULTY,
  DEFAULT_COOK_SCHEDULE,
} from '@/utils/constants';
import * as storage from '@/services/storage';

interface DraftState extends MealPlanDraft {
  // Actions
  setStep: (step: number) => void;
  setKeywords: (keywords: string[]) => void;
  toggleKeyword: (keyword: string) => void;
  setMustHaveItems: (items: string[]) => void;
  toggleMustHaveItem: (item: string) => void;
  setDislikedItems: (items: string[]) => void;
  toggleDislikedItem: (item: string) => void;
  setNumPeople: (num: number) => void;
  setBudget: (budget: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCookSchedule: (schedule: CookSchedule) => void;
  toggleMeal: (day: keyof CookSchedule, meal: 'breakfast' | 'lunch' | 'dinner') => void;

  // Draft management
  resetDraft: () => void;
  loadFromStorage: () => boolean; // Returns true if draft was loaded
  saveToStorage: () => void;
  clearStorage: () => void;

  // Convert to UserPreferences
  toUserPreferences: () => UserPreferences;
}

const initialState: MealPlanDraft = {
  currentStep: 1,
  keywords: [],
  mustHaveItems: [],
  dislikedItems: [],
  numPeople: DEFAULT_NUM_PEOPLE,
  budget: DEFAULT_BUDGET,
  difficulty: DEFAULT_DIFFICULTY,
  cookSchedule: DEFAULT_COOK_SCHEDULE,
  lastUpdated: new Date(),
};

export const useDraftStore = create<DraftState>((set, get) => ({
  ...initialState,

  // Step navigation
  setStep: (step) => {
    set({ currentStep: step, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // Keywords
  setKeywords: (keywords) => {
    set({ keywords, lastUpdated: new Date() });
    get().saveToStorage();
  },

  toggleKeyword: (keyword) => {
    const { keywords } = get();
    const newKeywords = keywords.includes(keyword)
      ? keywords.filter((k) => k !== keyword)
      : [...keywords, keyword];
    set({ keywords: newKeywords, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // Must-have items
  setMustHaveItems: (items) => {
    set({ mustHaveItems: items, lastUpdated: new Date() });
    get().saveToStorage();
  },

  toggleMustHaveItem: (item) => {
    const { mustHaveItems } = get();
    const newItems = mustHaveItems.includes(item)
      ? mustHaveItems.filter((i) => i !== item)
      : [...mustHaveItems, item];
    set({ mustHaveItems: newItems, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // Disliked items
  setDislikedItems: (items) => {
    set({ dislikedItems: items, lastUpdated: new Date() });
    get().saveToStorage();
  },

  toggleDislikedItem: (item) => {
    const { dislikedItems } = get();
    const newItems = dislikedItems.includes(item)
      ? dislikedItems.filter((i) => i !== item)
      : [...dislikedItems, item];
    set({ dislikedItems: newItems, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // People, Budget, Difficulty
  setNumPeople: (num) => {
    set({ numPeople: num, lastUpdated: new Date() });
    get().saveToStorage();
  },

  setBudget: (budget) => {
    set({ budget, lastUpdated: new Date() });
    get().saveToStorage();
  },

  setDifficulty: (difficulty) => {
    set({ difficulty, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // Cook Schedule
  setCookSchedule: (schedule) => {
    set({ cookSchedule: schedule, lastUpdated: new Date() });
    get().saveToStorage();
  },

  toggleMeal: (day, meal) => {
    const { cookSchedule } = get();
    const newSchedule = {
      ...cookSchedule,
      [day]: {
        ...cookSchedule[day],
        [meal]: !cookSchedule[day][meal],
      },
    };
    set({ cookSchedule: newSchedule, lastUpdated: new Date() });
    get().saveToStorage();
  },

  // Reset to initial state
  resetDraft: () => {
    set({ ...initialState, lastUpdated: new Date() });
    storage.removeMealPlanDraft();
  },

  // Load from localStorage
  loadFromStorage: () => {
    const draft = storage.getMealPlanDraft();
    if (draft) {
      set({
        ...draft,
        // Ensure cook schedule has all days
        cookSchedule: {
          ...DEFAULT_COOK_SCHEDULE,
          ...draft.cookSchedule,
        },
      });
      return true;
    }
    return false;
  },

  // Save to localStorage
  saveToStorage: () => {
    const state = get();
    const draft: MealPlanDraft = {
      currentStep: state.currentStep,
      keywords: state.keywords,
      mustHaveItems: state.mustHaveItems,
      dislikedItems: state.dislikedItems,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
      lastUpdated: state.lastUpdated,
    };
    storage.setMealPlanDraft(draft);
  },

  // Clear storage
  clearStorage: () => {
    storage.removeMealPlanDraft();
  },

  // Convert current state to UserPreferences
  toUserPreferences: (): UserPreferences => {
    const state = get();
    return {
      keywords: state.keywords,
      mustHaveItems: state.mustHaveItems,
      dislikedItems: state.dislikedItems,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
    };
  },
}));
