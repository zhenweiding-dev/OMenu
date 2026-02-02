import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_BUDGET, DEFAULT_NUM_PEOPLE, MEAL_TYPES, WEEK_DAYS } from "@/utils/constants";
import type { CookSchedule, Difficulty, UserPreferences } from "@/types";

type DayOfWeek = (typeof WEEK_DAYS)[number];
type MealType = (typeof MEAL_TYPES)[number];

interface DraftState {
  currentStep: number;
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: string;

  setStep: (step: number) => void;
  setKeywords: (keywords: string[]) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;

  setMustHaveItems: (items: string[]) => void;
  addMustHaveItem: (item: string) => void;
  removeMustHaveItem: (item: string) => void;

  setDislikedItems: (items: string[]) => void;
  addDislikedItem: (item: string) => void;
  removeDislikedItem: (item: string) => void;

  setNumPeople: (count: number) => void;
  setBudget: (budget: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;

  setCookSchedule: (schedule: CookSchedule) => void;
  toggleMeal: (day: DayOfWeek, meal: MealType) => void;
  selectAllMeals: () => void;
  deselectAllMeals: () => void;
  setPreferences: (preferences: UserPreferences) => void;

  getSelectedMealCount: () => number;
  resetDraft: () => void;
}

const defaultMealSelection = { breakfast: false, lunch: false, dinner: false };
const initialSchedule = WEEK_DAYS.reduce<CookSchedule>((acc, day) => {
  acc[day] = { ...defaultMealSelection };
  return acc;
}, {} as CookSchedule);

const initialState = {
  currentStep: 1,
  keywords: [],
  mustHaveItems: [],
  dislikedItems: [],
  numPeople: DEFAULT_NUM_PEOPLE,
  budget: DEFAULT_BUDGET,
  difficulty: "medium" as Difficulty,
  cookSchedule: initialSchedule,
  lastUpdated: new Date().toISOString(),
};

export const useDraftStore = create(
  persist<DraftState>(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: Math.max(1, step) }),

      setKeywords: (keywords) => set({ keywords, lastUpdated: new Date().toISOString() }),
      addKeyword: (keyword) =>
        set((state) => ({
          keywords: [...new Set([...state.keywords, keyword.trim()])].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        })),
      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((item) => item !== keyword),
          lastUpdated: new Date().toISOString(),
        })),

      setMustHaveItems: (items) => set({ mustHaveItems: items, lastUpdated: new Date().toISOString() }),
      addMustHaveItem: (item) =>
        set((state) => ({
          mustHaveItems: [...new Set([...state.mustHaveItems, item.trim()])].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        })),
      removeMustHaveItem: (item) =>
        set((state) => ({
          mustHaveItems: state.mustHaveItems.filter((value) => value !== item),
          lastUpdated: new Date().toISOString(),
        })),

      setDislikedItems: (items) => set({ dislikedItems: items, lastUpdated: new Date().toISOString() }),
      addDislikedItem: (item) =>
        set((state) => ({
          dislikedItems: [...new Set([...state.dislikedItems, item.trim()])].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        })),
      removeDislikedItem: (item) =>
        set((state) => ({
          dislikedItems: state.dislikedItems.filter((value) => value !== item),
          lastUpdated: new Date().toISOString(),
        })),

      setNumPeople: (count) => set({ numPeople: Math.min(Math.max(1, count), 10) }),
      setBudget: (budget) => set({ budget: Math.max(50, budget) }),
      setDifficulty: (difficulty) => set({ difficulty }),

      setCookSchedule: (schedule) =>
        set({ cookSchedule: schedule, lastUpdated: new Date().toISOString() }),
      toggleMeal: (day, meal) =>
        set((state) => ({
          cookSchedule: {
            ...state.cookSchedule,
            [day]: { ...state.cookSchedule[day], [meal]: !state.cookSchedule[day][meal] },
          },
          lastUpdated: new Date().toISOString(),
        })),
      selectAllMeals: () =>
        set(() => ({
          cookSchedule: WEEK_DAYS.reduce<CookSchedule>((acc, day) => {
            acc[day] = { breakfast: true, lunch: true, dinner: true };
            return acc;
          }, {} as CookSchedule),
          lastUpdated: new Date().toISOString(),
        })),
      deselectAllMeals: () =>
        set(() => ({
          cookSchedule: WEEK_DAYS.reduce<CookSchedule>((acc, day) => {
            acc[day] = { ...defaultMealSelection };
            return acc;
          }, {} as CookSchedule),
          lastUpdated: new Date().toISOString(),
        })),

      setPreferences: (preferences) =>
        set({
          keywords: preferences.keywords,
          mustHaveItems: preferences.mustHaveItems,
          dislikedItems: preferences.dislikedItems,
          numPeople: preferences.numPeople,
          budget: preferences.budget,
          difficulty: preferences.difficulty,
          cookSchedule: preferences.cookSchedule,
          lastUpdated: new Date().toISOString(),
        }),

      getSelectedMealCount: () => {
        const { cookSchedule } = get();
        return WEEK_DAYS.reduce((total, day) => {
          const selection = cookSchedule[day];
          return total + MEAL_TYPES.filter((meal) => selection[meal]).length;
        }, 0);
      },

      resetDraft: () => set({ ...initialState, lastUpdated: new Date().toISOString() }),
    }),
    {
      name: "omenu-draft",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
