# Tech Stack & Architecture

## Technology Choices

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |

### Styling

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first CSS |
| shadcn/ui | Base component library |
| Lucide React | UI icons |

### State Management

| Technology | Purpose |
|------------|---------|
| Zustand | Global state management |
| React Hook Form | Form handling (optional) |

### Data Storage

| Technology | Purpose |
|------------|---------|
| localStorage | Simple key-value (preferences, draft) |
| IndexedDB (via idb) | Complex data (meal plans, shopping lists) |

### API Integration

| Service | Purpose |
|---------|---------|
| Google Gemini API | AI meal plan & shopping list generation |

### Deployment

| Platform | Purpose |
|----------|---------|
| Vercel | Hosting, CI/CD, environment variables |

---

## Project Structure

```
omenu/
├── public/
│   ├── icons/                 # Food SVG icons
│   └── images/                # Background images
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── home/             # Home page components
│   │   ├── shopping/         # Shopping page components
│   │   ├── create/           # Create flow components
│   │   │   ├── StepWelcome.tsx
│   │   │   ├── StepKeywords.tsx
│   │   │   ├── StepMustHave.tsx
│   │   │   ├── StepDisliked.tsx
│   │   │   ├── StepPeopleBudget.tsx
│   │   │   ├── StepSchedule.tsx
│   │   │   ├── StepLoading.tsx
│   │   │   ├── StepPlanOverview.tsx
│   │   │   └── RecipeDetailModal.tsx
│   │   └── common/           # Shared components
│   │       ├── Tag.tsx
│   │       ├── MealCard.tsx
│   │       └── LoadingSpinner.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ShoppingPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── PlansPage.tsx
│   │   └── CreatePlanPage.tsx
│   ├── stores/
│   │   ├── useAppStore.ts    # Global app state
│   │   ├── useDraftStore.ts  # Create flow draft state
│   │   └── useShoppingStore.ts
│   ├── services/
│   │   ├── gemini.ts         # Gemini API integration
│   │   ├── storage.ts        # localStorage helpers
│   │   └── db.ts             # IndexedDB operations
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   ├── constants.ts      # Default values, categories
│   │   └── helpers.ts        # Utility functions
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useMealPlan.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local                # Local environment variables
├── .env.example              # Example env file
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## Gemini API Integration

### Configuration

```typescript
// src/services/gemini.ts

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
  });

  const data = await response.json();
  return extractTextFromResponse(data);
}

function extractTextFromResponse(response: any): string {
  try {
    return response.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    console.error('Error extracting text:', e);
    return '';
  }
}
```

### Prompt Templates

See original `prompt_simple.py` for prompt structures. Key prompts:

1. **Meal Plan Generation**: `generateMealPlanPrompt(preferences)`
2. **Structured Plan Conversion**: `generateStructuredPlanPrompt(rawPlan)`
3. **User Modification**: `generateModificationPrompt(input, preferences, currentPlan)`
4. **Shopping List**: `generateShoppingListPrompt(structuredPlan)`

### Response Parsing

```typescript
// Extract JSON from potentially markdown-wrapped response
function parseJsonResponse(text: string): any {
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  return JSON.parse(cleaned);
}
```

---

## State Management

### Zustand Store Structure

```typescript
// src/stores/useAppStore.ts

interface AppState {
  // Current active plan
  currentPlanId: string | null;
  setCurrentPlanId: (id: string | null) => void;
  
  // User preferences
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;
  
  // Generation status
  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;
  generationError: string | null;
  setGenerationError: (error: string | null) => void;
}

// src/stores/useDraftStore.ts

interface DraftState {
  currentStep: number;
  keywords: string[];
  mustHaveItems: string[];
  dislikedItems: string[];
  numPeople: number;
  budget: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cookSchedule: CookSchedule;
  
  // Actions
  setStep: (step: number) => void;
  setKeywords: (keywords: string[]) => void;
  // ... other setters
  resetDraft: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
```

### Persistence Middleware

```typescript
// Auto-save draft to localStorage on changes
const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'omenu_meal_plan_draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## IndexedDB Schema

```typescript
// src/services/db.ts

import { openDB, DBSchema } from 'idb';

interface OMenuDB extends DBSchema {
  mealPlans: {
    key: string;
    value: WeeklyMealPlan;
    indexes: {
      'by-created': Date;
      'by-week-start': Date;
    };
  };
  shoppingLists: {
    key: string;
    value: ShoppingList;
    indexes: {
      'by-plan': string;
      'by-created': Date;
    };
  };
}

export async function initDB() {
  return openDB<OMenuDB>('OMenuDB', 1, {
    upgrade(db) {
      // Meal Plans store
      const planStore = db.createObjectStore('mealPlans', { keyPath: 'id' });
      planStore.createIndex('by-created', 'createdAt');
      planStore.createIndex('by-week-start', 'weekStartDate');
      
      // Shopping Lists store
      const listStore = db.createObjectStore('shoppingLists', { keyPath: 'id' });
      listStore.createIndex('by-plan', 'mealPlanId');
      listStore.createIndex('by-created', 'createdAt');
    },
  });
}

// CRUD operations
export async function saveMealPlan(plan: WeeklyMealPlan) {
  const db = await initDB();
  await db.put('mealPlans', plan);
}

export async function getAllMealPlans(): Promise<WeeklyMealPlan[]> {
  const db = await initDB();
  return db.getAllFromIndex('mealPlans', 'by-created');
}

export async function getMealPlan(id: string): Promise<WeeklyMealPlan | undefined> {
  const db = await initDB();
  return db.get('mealPlans', id);
}

// ... similar for shopping lists
```

---

## Routing

```typescript
// Using React Router

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/shopping',
    element: <ShoppingPage />,
  },
  {
    path: '/me',
    element: <MyPage />,
  },
  {
    path: '/plans',
    element: <PlansPage />,
  },
  {
    path: '/create',
    element: <CreatePlanPage />,
  },
]);
```

---

## Environment Variables

### `.env.local` (local development)

```
VITE_GEMINI_API_KEY=your_api_key_here
```

### `.env.example` (committed to repo)

```
VITE_GEMINI_API_KEY=
```

### Vercel Configuration

Set in Vercel Dashboard → Project Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_GEMINI_API_KEY` | `AIza...` | Production, Preview |

---

## Deployment

### Vercel Setup

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## Development Workflow

### Commands

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

### Git Workflow

1. Feature branches from `main`
2. PR review before merge
3. Auto-deploy on merge to `main`

---

## Future iOS App Migration

### Strategy

1. Keep business logic in separate hooks/services
2. Use React Native with same component structure
3. Replace:
   - Tailwind → React Native StyleSheet or NativeWind
   - React Router → React Navigation
   - localStorage → AsyncStorage
   - IndexedDB → SQLite or Realm

### Shared Code

- `types/` - TypeScript interfaces
- `services/gemini.ts` - API calls (minor URL changes)
- `utils/` - Helper functions
- Zustand stores (with different persistence layer)
