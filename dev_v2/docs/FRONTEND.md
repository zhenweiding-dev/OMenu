# Frontend Architecture Guide

This document describes the React frontend architecture for OMenu.

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
│   │   │   ├── MealPlanCard.tsx
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
│   │   ├── HomePage.tsx
│   │   ├── ShoppingPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── PlansPage.tsx
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
│   │   └── useMealPlan.ts
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

The frontend communicates with the backend through a centralized API service.

### services/api.ts

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ===== Types =====

interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
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

// ===== API Functions =====

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse(response);
}

export async function generateMealPlan(
  preferences: UserPreferences
): Promise<MealPlan> {
  const response = await fetch(`${API_BASE_URL}/api/meal-plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  return handleResponse(response);
}

export async function modifyMealPlan(
  planId: string,
  modification: string,
  currentPlan: MealPlan
): Promise<MealPlan> {
  const response = await fetch(`${API_BASE_URL}/api/meal-plans/${planId}/modify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modification, currentPlan }),
  });
  return handleResponse(response);
}

export async function generateShoppingList(
  mealPlanId: string,
  mealPlan: MealPlan
): Promise<ShoppingList> {
  const response = await fetch(`${API_BASE_URL}/api/shopping-lists/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealPlanId, mealPlan }),
  });
  return handleResponse(response);
}
```

---

## State Management

Frontend uses Zustand for **UI state only**. All generated data (meal plans, shopping lists) comes from the backend.

### stores/useAppStore.ts

```typescript
import { create } from 'zustand';

interface AppState {
  // Current meal plan (from backend)
  currentPlan: MealPlan | null;
  setCurrentPlan: (plan: MealPlan | null) => void;
  
  // Current shopping list (from backend)
  currentShoppingList: ShoppingList | null;
  setCurrentShoppingList: (list: ShoppingList | null) => void;
  
  // View mode toggle (Daily View vs Plan View)
  viewMode: 'daily' | 'plan';
  setViewMode: (mode: 'daily' | 'plan') => void;
  
  // Loading states
  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  
  currentShoppingList: null,
  setCurrentShoppingList: (list) => set({ currentShoppingList: list }),
  
  viewMode: 'daily',
  setViewMode: (mode) => set({ viewMode: mode }),
  
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

interface DraftState {
  currentStep: number;
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cookSchedule: CookSchedule;
  lastUpdated: string;
  
  // Actions
  setStep: (step: number) => void;
  setKeywords: (keywords: string[]) => void;
  setMustHaveItems: (items: string[]) => void;
  setDislikedItems: (items: string[]) => void;
  setNumPeople: (n: number) => void;
  setBudget: (b: number) => void;
  setDifficulty: (d: 'easy' | 'medium' | 'hard') => void;
  setCookSchedule: (schedule: CookSchedule) => void;
  resetDraft: () => void;
}

const initialState = {
  currentStep: 1,
  keywords: [],
  mustHaveItems: [],
  dislikedItems: [],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium' as const,
  cookSchedule: {
    monday: { breakfast: false, lunch: false, dinner: false },
    tuesday: { breakfast: false, lunch: false, dinner: false },
    wednesday: { breakfast: false, lunch: false, dinner: false },
    thursday: { breakfast: false, lunch: false, dinner: false },
    friday: { breakfast: false, lunch: false, dinner: false },
    saturday: { breakfast: false, lunch: false, dinner: false },
    sunday: { breakfast: false, lunch: false, dinner: false },
  },
  lastUpdated: new Date().toISOString(),
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setStep: (step) => set({ currentStep: step, lastUpdated: new Date().toISOString() }),
      setKeywords: (keywords) => set({ keywords, lastUpdated: new Date().toISOString() }),
      setMustHaveItems: (items) => set({ mustHaveItems: items, lastUpdated: new Date().toISOString() }),
      setDislikedItems: (items) => set({ dislikedItems: items, lastUpdated: new Date().toISOString() }),
      setNumPeople: (n) => set({ numPeople: n, lastUpdated: new Date().toISOString() }),
      setBudget: (b) => set({ budget: b, lastUpdated: new Date().toISOString() }),
      setDifficulty: (d) => set({ difficulty: d, lastUpdated: new Date().toISOString() }),
      setCookSchedule: (schedule) => set({ cookSchedule: schedule, lastUpdated: new Date().toISOString() }),
      resetDraft: () => set({ ...initialState, lastUpdated: new Date().toISOString() }),
    }),
    {
      name: 'omenu_meal_plan_draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
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

// ===== Meal Schedule =====

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
  mustHaveItems: string[];
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

// ===== Meal Plan =====

export type MealPlanStatus = 'generating' | 'ready' | 'error';

export interface MealPlan {
  id: string;
  createdAt: string;
  status: MealPlanStatus;
  preferences: UserPreferences;
  days: {
    monday: DayMeals;
    tuesday: DayMeals;
    wednesday: DayMeals;
    thursday: DayMeals;
    friday: DayMeals;
    saturday: DayMeals;
    sunday: DayMeals;
  };
}

// ===== Shopping List =====

export interface ShoppingItem {
  id: string;
  name: string;
  category: IngredientCategory;
  totalQuantity: number;
  unit: string;
  purchased: boolean;
}

export interface ShoppingList {
  id: string;
  mealPlanId: string;
  createdAt: string;
  items: ShoppingItem[];
}
```

---

## Routing

### App.tsx

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import MyPage from './pages/MyPage';
import PlansPage from './pages/PlansPage';
import CreatePlanPage from './pages/CreatePlanPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/shopping', element: <ShoppingPage /> },
  { path: '/me', element: <MyPage /> },
  { path: '/plans', element: <PlansPage /> },
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
export const mockMealPlan: MealPlan = {
  id: 'mp_mock123',
  createdAt: new Date().toISOString(),
  status: 'ready',
  preferences: {
    keywords: ['Healthy', 'Quick'],
    mustHaveItems: ['Eggs', 'Chicken'],
    dislikedItems: ['Peanuts'],
    numPeople: 2,
    budget: 100,
    difficulty: 'medium',
    cookSchedule: {
      monday: { breakfast: true, lunch: true, dinner: true },
      tuesday: { breakfast: false, lunch: true, dinner: true },
      // ...
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
        ],
        instructions: '1. Beat eggs...',
        estimatedTime: 10,
        servings: 2,
        difficulty: 'easy',
        totalCalories: 350,
      },
      lunch: { /* ... */ },
      dinner: { /* ... */ },
    },
    // ... other days
  },
};

export const mockShoppingList: ShoppingList = {
  id: 'sl_mock456',
  mealPlanId: 'mp_mock123',
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

export async function generateMealPlan(preferences: UserPreferences): Promise<MealPlan> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000)); // Simulate delay
    return mockMealPlan;
  }
  
  // Real API call...
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
        'primary-text': '#2C2C2C',
        'secondary-text': '#7A7A7A',
        'disabled-text': '#B5B5B5',
        accent: '#8B9469',
        'accent-light': '#A8AD8B',
        success: '#6B9B76',
        error: '#C67B7B',
        divider: '#EEEBE6',
        'tag-border': '#D4D0C8',
        'tag-selected-bg': '#F0EBE3',
        'tag-selected-border': '#A68A64',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        tag: '6px',
        modal: '24px',
      },
      spacing: {
        'safe-bottom': '28px',
      },
      fontSize: {
        'nav-label': '11px',
        'section-label': '11px',
        tag: '13px',
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
