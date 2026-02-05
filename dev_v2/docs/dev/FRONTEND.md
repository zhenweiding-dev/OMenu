# Frontend Architecture Guide

This document describes the React frontend architecture for OMenu.

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | - | Base component library |
| Zustand | 4.x | State management (UI state only) |
| React Router | 6.x | Client-side routing |
| Lucide React | 0.x | UI icons |

---

## Project Structure

```
frontend/
├── public/
│   ├── icons/                    # Food SVG icons
│   │   ├── egg.svg
│   │   ├── chicken.svg
│   │   └── ...
│   └── images/                   # Background images
│
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── home/                 # Home page components
│   │   │   ├── DailyMenuCard.tsx
│   │   │   ├── MenuBookCard.tsx
│   │   │   ├── SwipeIndicator.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── shopping/             # Shopping page components
│   │   │   ├── ShoppingCategory.tsx
│   │   │   ├── ShoppingItem.tsx
│   │   │   └── AddItemModal.tsx
│   │   │
│   │   ├── create/               # Create flow components
│   │   │   ├── StepWelcome.tsx
│   │   │   ├── StepKeywords.tsx
│   │   │   ├── StepMustHave.tsx
│   │   │   ├── StepDisliked.tsx
│   │   │   ├── StepPeopleBudget.tsx
│   │   │   ├── StepSchedule.tsx
│   │   │   ├── StepLoading.tsx
│   │   │   ├── StepPlanOverview.tsx
│   │   │   └── RecipeDetailModal.tsx
│   │   │
│   │   └── common/               # Shared components
│   │       ├── Tag.tsx
│   │       ├── MealCard.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── VerticalPicker.tsx
│   │
│   ├── pages/                    # Route page components
│   │   ├── HomePage.tsx          # Menu Open + Menu Closed (state toggle)
│   │   ├── ShoppingPage.tsx
│   │   ├── MyPage.tsx
│   │   └── CreatePlanPage.tsx
│   │
│   ├── stores/                   # Zustand stores (UI state only)
│   │   ├── useAppStore.ts        # Global app state
│   │   ├── useDraftStore.ts      # Create flow draft
│   │   └── useShoppingStore.ts   # Shopping list UI state
│   │
│   ├── services/
│   │   └── api.ts                # Backend API client
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useMenuBook.ts
│   │
│   ├── utils/
│   │   ├── constants.ts          # Default values, categories
│   │   └── helpers.ts            # Utility functions
│   │
│   ├── App.tsx                   # Root component with routes
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + Tailwind
│
├── .env.example                  # Example environment variables
├── .env.local                    # Local environment (gitignored)
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## API Service

The frontend communicates with the backend through a centralized API service with **2-minute timeout** for all generation endpoints.

### services/api.ts

```typescript
import type { UserPreferences, MenuBook, ShoppingList } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API timeout: 2 minutes for generation endpoints
const GENERATION_TIMEOUT = 120000;

// ===== Types =====

interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out. Please try again.');
    this.name = 'ApiTimeoutError';
  }
}

// ===== Helper =====

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: response.statusText,
    }));
    throw new Error(error.message);
  }
  return response.json();
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ===== API Functions =====

export async function healthCheck(): Promise<{ status: string; version: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse(response);
}

export async function generateMenuBook(
  preferences: UserPreferences
): Promise<MenuBook> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/menu-books/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    },
    GENERATION_TIMEOUT
  );
  return handleResponse(response);
}

export async function modifyMenuBook(
  planId: string,
  modification: string,
  currentPlan: MenuBook
): Promise<MenuBook> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/menu-books/${planId}/modify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modification, currentPlan }),
    },
    GENERATION_TIMEOUT
  );
  return handleResponse(response);
}

export async function generateShoppingList(
  menuBookId: string,
  menuBook: MenuBook
): Promise<ShoppingList> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/shopping-lists/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuBookId, menuBook }),
    },
    GENERATION_TIMEOUT
  );
  return handleResponse(response);
}

export { ApiTimeoutError };
```

---

## State Management

Frontend uses Zustand for **UI state only**. All generated data (menu books, shopping lists) comes from the backend.

> **Note**: v3.5 architecture:
> - Each **MenuBook** (weekly plan) has a one-to-one relationship with a **ShoppingList**
> - `isMenuOpen` state toggles between Menu Open and Menu Closed views within the Home Page
> - When switching weeks, both the menu book and shopping list switch together

### stores/useAppStore.ts

```typescript
import { create } from 'zustand';
import type { MenuBook, ShoppingList, MenuBook } from '@/types';

interface AppState {
  // Menu Books (each week's plan + shopping list)
  menuBooks: MenuBook[];
  addMenuBook: (book: MenuBook) => void;
  updateMenuBook: (id: string, updates: Partial<MenuBook>) => void;
  deleteMenuBook: (id: string) => void;  // Long-press delete, removes ShoppingList too
  
  // Currently selected week
  currentWeekId: string | null;
  setCurrentWeekId: (id: string | null) => void;
  
  // Computed: current menu book (menu book + shopping list)
  getCurrentMenuBook: () => MenuBook | null;
  
  // Menu Open/Closed toggle (Home Page view state)
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleMenuView: () => void;
  
  // Current day index for swipe navigation (0-6, Monday-Sunday)
  currentDayIndex: number;
  setCurrentDayIndex: (index: number) => void;
  
  // Loading states
  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Menu Books storage
  menuBooks: [],
  addMenuBook: (book) => set((state) => ({ 
    menuBooks: [...state.menuBooks, book],
    currentWeekId: book.id,  // Auto-select newly created
  })),
  updateMenuBook: (id, updates) => set((state) => ({
    menuBooks: state.menuBooks.map(book => 
      book.id === id ? { ...book, ...updates } : book
    ),
  })),
  
  // Current week selection
  currentWeekId: null,
  setCurrentWeekId: (id) => set({ currentWeekId: id }),
  
  // Computed: get current menu book
  getCurrentMenuBook: () => {
    const { menuBooks, currentWeekId } = get();
    return menuBooks.find(book => book.id === currentWeekId) || null;
  },
  
  // Menu Open is default view
  isMenuOpen: true,
  setIsMenuOpen: (open) => set({ isMenuOpen: open }),
  toggleMenuView: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  
  currentDayIndex: 0,
  setCurrentDayIndex: (index) => set({ currentDayIndex: Math.max(0, Math.min(6, index)) }),
  
  isGenerating: false,
  setIsGenerating: (status) => set({ isGenerating: status }),
  
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
```

### stores/useDraftStore.ts

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CookSchedule, Difficulty } from '@/types';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type MealType = 'breakfast' | 'lunch' | 'dinner';

interface DraftState {
  // State
  currentStep: number;
  keywords: string[];
  preferredItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
  lastUpdated: string;
  
  // Step navigation
  setStep: (step: number) => void;
  
  // Keywords actions
  setKeywords: (keywords: string[]) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // Must-have items actions
  setMustHaveItems: (items: string[]) => void;
  addMustHaveItem: (item: string) => void;
  removeMustHaveItem: (item: string) => void;
  
  // Disliked items actions
  setDislikedItems: (items: string[]) => void;
  addDislikedItem: (item: string) => void;
  removeDislikedItem: (item: string) => void;
  
  // Settings actions
  setNumPeople: (n: number) => void;
  setBudget: (b: number) => void;
  setDifficulty: (d: Difficulty) => void;
  
  // Schedule actions
  setCookSchedule: (schedule: CookSchedule) => void;
  toggleMeal: (day: DayOfWeek, meal: MealType) => void;
  selectAllMeals: () => void;
  deselectAllMeals: () => void;
  
  // Computed
  getSelectedMealCount: () => number;
  
  // Reset
  resetDraft: () => void;
}

const initialCookSchedule: CookSchedule = {
  monday: { breakfast: false, lunch: false, dinner: false },
  tuesday: { breakfast: false, lunch: false, dinner: false },
  wednesday: { breakfast: false, lunch: false, dinner: false },
  thursday: { breakfast: false, lunch: false, dinner: false },
  friday: { breakfast: false, lunch: false, dinner: false },
  saturday: { breakfast: false, lunch: false, dinner: false },
  sunday: { breakfast: false, lunch: false, dinner: false },
};

const initialState = {
  currentStep: 1,
  keywords: [] as string[],
  preferredItems: [] as string[],
  dislikedItems: [] as string[],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium' as Difficulty,
  cookSchedule: initialCookSchedule,
  lastUpdated: new Date().toISOString(),
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Step navigation
      setStep: (step) => set({ 
        currentStep: Math.max(1, Math.min(8, step)), 
        lastUpdated: new Date().toISOString() 
      }),
      
      // Keywords
      setKeywords: (keywords) => set({ keywords, lastUpdated: new Date().toISOString() }),
      addKeyword: (keyword) => {
        const { keywords } = get();
        if (!keywords.includes(keyword)) {
          set({ keywords: [...keywords, keyword], lastUpdated: new Date().toISOString() });
        }
      },
      removeKeyword: (keyword) => {
        const { keywords } = get();
        set({ keywords: keywords.filter(k => k !== keyword), lastUpdated: new Date().toISOString() });
      },
      
      // Must-have items
      setMustHaveItems: (items) => set({ preferredItems: items, lastUpdated: new Date().toISOString() }),
      addMustHaveItem: (item) => {
        const { preferredItems } = get();
        if (!preferredItems.includes(item)) {
          set({ preferredItems: [...preferredItems, item], lastUpdated: new Date().toISOString() });
        }
      },
      removeMustHaveItem: (item) => {
        const { preferredItems } = get();
        set({ preferredItems: preferredItems.filter(i => i !== item), lastUpdated: new Date().toISOString() });
      },
      
      // Disliked items
      setDislikedItems: (items) => set({ dislikedItems: items, lastUpdated: new Date().toISOString() }),
      addDislikedItem: (item) => {
        const { dislikedItems } = get();
        if (!dislikedItems.includes(item)) {
          set({ dislikedItems: [...dislikedItems, item], lastUpdated: new Date().toISOString() });
        }
      },
      removeDislikedItem: (item) => {
        const { dislikedItems } = get();
        set({ dislikedItems: dislikedItems.filter(i => i !== item), lastUpdated: new Date().toISOString() });
      },
      
      // Settings with validation
      setNumPeople: (n) => set({ 
        numPeople: Math.max(1, Math.min(10, n)), 
        lastUpdated: new Date().toISOString() 
      }),
      setBudget: (b) => {
        // Round to nearest 10, clamp to 50-500
        const rounded = Math.round(b / 10) * 10;
        const clamped = Math.max(50, Math.min(500, rounded));
        set({ budget: clamped, lastUpdated: new Date().toISOString() });
      },
      setDifficulty: (d) => set({ difficulty: d, lastUpdated: new Date().toISOString() }),
      
      // Schedule
      setCookSchedule: (schedule) => set({ cookSchedule: schedule, lastUpdated: new Date().toISOString() }),
      toggleMeal: (day, meal) => {
        const { cookSchedule } = get();
        const newSchedule = {
          ...cookSchedule,
          [day]: {
            ...cookSchedule[day],
            [meal]: !cookSchedule[day][meal],
          },
        };
        set({ cookSchedule: newSchedule, lastUpdated: new Date().toISOString() });
      },
      selectAllMeals: () => {
        const allSelected: CookSchedule = {
          monday: { breakfast: true, lunch: true, dinner: true },
          tuesday: { breakfast: true, lunch: true, dinner: true },
          wednesday: { breakfast: true, lunch: true, dinner: true },
          thursday: { breakfast: true, lunch: true, dinner: true },
          friday: { breakfast: true, lunch: true, dinner: true },
          saturday: { breakfast: true, lunch: true, dinner: true },
          sunday: { breakfast: true, lunch: true, dinner: true },
        };
        set({ cookSchedule: allSelected, lastUpdated: new Date().toISOString() });
      },
      deselectAllMeals: () => {
        set({ cookSchedule: initialCookSchedule, lastUpdated: new Date().toISOString() });
      },
      
      // Computed
      getSelectedMealCount: () => {
        const { cookSchedule } = get();
        let count = 0;
        Object.values(cookSchedule).forEach(day => {
          if (day.breakfast) count++;
          if (day.lunch) count++;
          if (day.dinner) count++;
        });
        return count;
      },
      
      // Reset
      resetDraft: () => set({ ...initialState, lastUpdated: new Date().toISOString() }),
    }),
    {
      name: 'omenu-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### stores/useShoppingStore.ts

```typescript
import { create } from 'zustand';
import type { ShoppingItem, IngredientCategory } from '@/types';

interface ShoppingState {
  // Local modifications (not yet synced to backend)
  purchasedItems: Set<string>;  // Item IDs that are checked off
  manualItems: ShoppingItem[];  // Manually added items
  
  // Actions
  togglePurchased: (itemId: string) => void;
  addManualItem: (name: string, category: IngredientCategory, quantity?: number, unit?: string) => void;
  removeManualItem: (itemId: string) => void;
  clearPurchased: () => void;
  reset: () => void;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  purchasedItems: new Set(),
  manualItems: [],
  
  togglePurchased: (itemId) => {
    const { purchasedItems } = get();
    const newSet = new Set(purchasedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    set({ purchasedItems: newSet });
  },
  
  addManualItem: (name, category, quantity = 0, unit = '') => {
    const { manualItems } = get();
    const newItem: ShoppingItem = {
      id: `manual_${Date.now()}`,
      name,
      category,
      totalQuantity: quantity,
      unit,
      purchased: false,
      isManuallyAdded: true,
    };
    set({ manualItems: [...manualItems, newItem] });
  },
  
  removeManualItem: (itemId) => {
    const { manualItems } = get();
    set({ manualItems: manualItems.filter(item => item.id !== itemId) });
  },
  
  clearPurchased: () => set({ purchasedItems: new Set() }),
  
  reset: () => set({ purchasedItems: new Set(), manualItems: [] }),
}));
```

---

## TypeScript Interfaces

### types/index.ts

```typescript
// ===== Enums =====

export type Difficulty = 'easy' | 'medium' | 'hard';

export type IngredientCategory =
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'seasonings'
  | 'pantry_staples'
  | 'others';

// ===== Schedule =====

export interface MealSelection {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface CookSchedule {
  monday: MealSelection;
  tuesday: MealSelection;
  wednesday: MealSelection;
  thursday: MealSelection;
  friday: MealSelection;
  saturday: MealSelection;
  sunday: MealSelection;
}

// ===== User Preferences =====

export interface UserPreferences {
  keywords: string[];
  preferredItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  cookSchedule: CookSchedule;
}

// ===== Ingredient =====

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

// ===== Recipe =====

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  estimatedTime: number;
  servings: number;
  difficulty: Difficulty;
  totalCalories: number;
  notes?: string;
}

// ===== Day Meals =====

export interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

// ===== Week Days =====

export interface WeekDays {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

// ===== Menu Book =====

export type MenuBookStatus = 'generating' | 'ready' | 'error';

export interface MenuBook {
  id: string;
  createdAt: string;
  status: MenuBookStatus;
  preferences: UserPreferences;
  days: WeekDays;
}

// ===== Shopping List =====

export interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
  isManuallyAdded?: boolean;
}

export interface ShoppingList {
  id: string;
  menuBookId: string;
  createdAt: string;
  items: ShoppingItem[];
}

// ===== Day of Week Type =====

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
```

---

## Routing

### App.tsx

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import MyPage from './pages/MyPage';
import CreatePlanPage from './pages/CreatePlanPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },           // Menu Open/Closed (toggle via state)
  { path: '/shopping', element: <ShoppingPage /> },
  { path: '/me', element: <MyPage /> },
  { path: '/create', element: <CreatePlanPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

---

## Mock Data (Development)

For frontend-only development, use mock data when backend is unavailable.

### utils/mockData.ts

```typescript
import type { MenuBook, ShoppingList } from '@/types';

export const mockMenuBook: MenuBook = {
  id: 'mb_mock123',
  createdAt: new Date().toISOString(),
  status: 'ready',
  preferences: {
    keywords: ['Healthy', 'Quick'],
    preferredItems: ['Eggs', 'Chicken'],
    dislikedItems: ['Peanuts'],
    numPeople: 2,
    budget: 100,
    difficulty: 'medium',
    cookSchedule: {
      monday: { breakfast: true, lunch: true, dinner: true },
      tuesday: { breakfast: false, lunch: true, dinner: true },
      wednesday: { breakfast: false, lunch: true, dinner: true },
      thursday: { breakfast: false, lunch: true, dinner: true },
      friday: { breakfast: false, lunch: true, dinner: true },
      saturday: { breakfast: true, lunch: true, dinner: true },
      sunday: { breakfast: true, lunch: true, dinner: false },
    },
  },
  days: {
    monday: {
      breakfast: {
        id: 'mon-breakfast-001',
        name: 'Scrambled Eggs with Toast',
        ingredients: [
          { name: 'Eggs', quantity: 4, unit: 'count', category: 'proteins' },
          { name: 'Bread', quantity: 2, unit: 'slices', category: 'grains' },
          { name: 'Butter', quantity: 0, unit: '', category: 'seasonings' },
        ],
        instructions: '1. Beat eggs with salt\n2. Toast bread\n3. Scramble eggs in butter\n4. Serve with toast',
        estimatedTime: 10,
        servings: 2,
        difficulty: 'easy',
        totalCalories: 350,
      },
      lunch: null,
      dinner: null,
    },
    tuesday: { breakfast: null, lunch: null, dinner: null },
    wednesday: { breakfast: null, lunch: null, dinner: null },
    thursday: { breakfast: null, lunch: null, dinner: null },
    friday: { breakfast: null, lunch: null, dinner: null },
    saturday: { breakfast: null, lunch: null, dinner: null },
    sunday: { breakfast: null, lunch: null, dinner: null },
  },
};

export const mockShoppingList: ShoppingList = {
  id: 'sl_mock456',
  menuBookId: 'mb_mock123',
  createdAt: new Date().toISOString(),
  items: [
    { id: 'item_001', name: 'Eggs', category: 'proteins', totalQuantity: 12, unit: 'count', purchased: false },
    { id: 'item_002', name: 'Chicken Breast', category: 'proteins', totalQuantity: 2, unit: 'lbs', purchased: false },
    { id: 'item_003', name: 'Soy Sauce', category: 'seasonings', totalQuantity: 0, unit: '', purchased: false },
  ],
};
```

### Using Mock Data in API Service

```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function generateMenuBook(preferences: UserPreferences): Promise<MenuBook> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000)); // Simulate delay
    return mockMenuBook;
  }
  
  // Real API call with timeout...
}
```

---

## Environment Variables

### .env.example

```
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Enable mock data (for frontend-only development)
VITE_USE_MOCK=false
```

---

## Tailwind Configuration

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F7',
        'paper-dark': '#F5F4F1',
        card: '#FFFFFF',
        'card-header': '#F8F6F2',
        'primary-text': '#2C2C2C',
        'secondary-text': '#7A7A7A',
        'disabled-text': '#B5B5B5',
        accent: '#8B9469',
        'accent-light': '#A8AD8B',
        'accent-orange': '#D97706',
        'accent-orange-light': '#FEF3E2',
        success: '#6B9B76',
        error: '#C67B7B',
        divider: '#EEEBE6',
        'tag-border': '#D4D0C8',
        'tag-selected-bg': '#F0EBE3',
        'tag-selected-border': '#A68A64',
        // Meal icon backgrounds
        'meal-breakfast': '#FEF3E2',
        'meal-lunch': '#E8F5E9',
        'meal-dinner': '#EDE7F6',
      },
      borderRadius: {
        card: '20px',
        'card-sm': '12px',
        button: '8px',
        tag: '6px',
        modal: '24px',
        'meal-icon': '12px',
      },
      spacing: {
        'safe-bottom': '28px',
      },
      fontSize: {
        'nav-label': '11px',
        'section-label': '11px',
        tag: '13px',
        'header-title': '12px',
        'weekday-title': '24px',
        'meal-type': '11px',
      },
      letterSpacing: {
        'header': '1.5px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.06)',
        'card-sm': '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
```

---

## Vite Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment (Vercel)

### vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Environment Variables

Set in Vercel Dashboard → Project Settings → Environment Variables:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.railway.app` |
