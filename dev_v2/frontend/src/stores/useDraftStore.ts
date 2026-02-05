import { create } from "zustand";
import { DEFAULT_BUDGET, DEFAULT_NUM_PEOPLE, MEAL_TYPES, WEEK_DAYS } from "@/utils/constants";
import type { CookSchedule, Difficulty, MenuBook, UserPreferences } from "@/types";

type DayOfWeek = (typeof WEEK_DAYS)[number];
type MealType = (typeof MEAL_TYPES)[number];

interface DraftState {
  currentStep: number;
  specificPreferences: string[];
  specificDisliked: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: string;
  pendingResult: MenuBook | null;
  generationStartTime: number | null;
  targetWeekStart: string | null;

  setStep: (step: number) => void;
  setSpecificPreferences: (items: string[]) => void;
  addSpecificPreference: (item: string) => void;
  removeSpecificPreference: (item: string) => void;

  setSpecificDisliked: (items: string[]) => void;
  addSpecificDisliked: (item: string) => void;
  removeSpecificDisliked: (item: string) => void;

  setNumPeople: (count: number) => void;
  setBudget: (budget: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;

  setCookSchedule: (schedule: CookSchedule) => void;
  toggleMeal: (day: DayOfWeek, meal: MealType) => void;
  selectAllMeals: () => void;
  deselectAllMeals: () => void;
  setPreferences: (preferences: UserPreferences) => void;
  setPendingResult: (result: MenuBook | null) => void;
  clearPendingResult: () => void;
  setGenerationStartTime: (time: number | null) => void;
  clearGenerationStartTime: () => void;
  setTargetWeekStart: (isoDate: string | null) => void;

  getSelectedMealCount: () => number;
  resetDraft: () => void;
  resetDraftProgress: () => void;
}

const defaultMealSelection = { breakfast: false, lunch: false, dinner: false };
const initialSchedule = WEEK_DAYS.reduce<CookSchedule>((acc, day) => {
  acc[day] = { ...defaultMealSelection };
  return acc;
}, {} as CookSchedule);

const initialState = {
  currentStep: 1,
  specificPreferences: [],
  specificDisliked: [],
  numPeople: DEFAULT_NUM_PEOPLE,
  budget: DEFAULT_BUDGET,
  difficulty: "medium" as Difficulty,
  cookSchedule: initialSchedule,
  lastUpdated: new Date().toISOString(),
  pendingResult: null,
  generationStartTime: null as number | null,
  targetWeekStart: null as string | null,
};

export const useDraftStore = create<DraftState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: Math.max(1, step) }),

  setSpecificPreferences: (items) => set({ specificPreferences: items, lastUpdated: new Date().toISOString() }),
  addSpecificPreference: (item) =>
    set((state) => ({
      specificPreferences: [...new Set([...state.specificPreferences, item.trim()])].filter(Boolean),
      lastUpdated: new Date().toISOString(),
    })),
  removeSpecificPreference: (item) =>
    set((state) => ({
      specificPreferences: state.specificPreferences.filter((value) => value !== item),
      lastUpdated: new Date().toISOString(),
    })),

  setSpecificDisliked: (items) => set({ specificDisliked: items, lastUpdated: new Date().toISOString() }),
  addSpecificDisliked: (item) =>
    set((state) => ({
      specificDisliked: [...new Set([...state.specificDisliked, item.trim()])].filter(Boolean),
      lastUpdated: new Date().toISOString(),
    })),
  removeSpecificDisliked: (item) =>
    set((state) => ({
      specificDisliked: state.specificDisliked.filter((value) => value !== item),
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
      specificPreferences: preferences.specificPreferences,
      specificDisliked: preferences.specificDisliked,
      numPeople: preferences.numPeople,
      budget: preferences.budget,
      difficulty: preferences.difficulty,
      cookSchedule: preferences.cookSchedule,
      lastUpdated: new Date().toISOString(),
    }),

  setPendingResult: (result) => set({ pendingResult: result }),
  clearPendingResult: () => set({ pendingResult: null }),
  setGenerationStartTime: (time) => set({ generationStartTime: time }),
  clearGenerationStartTime: () => set({ generationStartTime: null }),
  setTargetWeekStart: (isoDate) => set({ targetWeekStart: isoDate }),

  getSelectedMealCount: () => {
    const { cookSchedule } = get();
    return WEEK_DAYS.reduce((total, day) => {
      const selection = cookSchedule[day];
      return total + MEAL_TYPES.filter((meal) => selection[meal]).length;
    }, 0);
  },

  resetDraft: () =>
    set({ ...initialState, lastUpdated: new Date().toISOString(), generationStartTime: null, targetWeekStart: null }),
  resetDraftProgress: () =>
    set((state) => ({
      currentStep: 1,
      pendingResult: null,
      generationStartTime: null,
      lastUpdated: new Date().toISOString(),
      specificPreferences: state.specificPreferences,
      specificDisliked: state.specificDisliked,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
      targetWeekStart: state.targetWeekStart,
    })),
}));
