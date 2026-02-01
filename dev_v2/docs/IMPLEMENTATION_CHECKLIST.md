# OMenu Implementation Checklist

**Version**: 3.4 (Menu Book Concept)  
**Last Updated**: February 1, 2025

Use this checklist to track development progress. Check off items as they are completed.

---

## Phase 1: Backend Setup

### 1.1 Project Initialization

- [ ] Create `backend/` directory structure
- [ ] Initialize Python virtual environment
- [ ] Create `requirements.txt` with dependencies:
  - [ ] fastapi
  - [ ] uvicorn
  - [ ] pydantic
  - [ ] pydantic-settings
  - [ ] google-generativeai
  - [ ] python-dotenv
- [ ] Create `.env.example` file
- [ ] Create `app/main.py` with FastAPI app
- [ ] Add CORS configuration
- [ ] Verify `uvicorn app.main:app --reload` runs

### 1.2 Data Models (Pydantic)

Location: `backend/app/models/schemas.py`

- [ ] `IngredientCategory` enum
- [ ] `Difficulty` enum
- [ ] `MealPlanStatus` enum
- [ ] `MealSelection` model
- [ ] `CookSchedule` model
- [ ] `Ingredient` model (with `category` field)
- [ ] `Recipe` model (with `estimatedTime`, `totalCalories`)
- [ ] `UserPreferences` model (budget: 50-500)
- [ ] `DayMeals` model
- [ ] `WeekDays` model
- [ ] `MealPlan` model (with `status`, `preferences`)
- [ ] `ShoppingItem` model (with `totalQuantity`, `purchased`)
- [ ] `ShoppingList` model (flat `items` array)
- [ ] Request/Response models for API endpoints
- [ ] `ErrorResponse` model

### 1.3 Prompt Templates

Location: `backend/app/services/prompts.py`

- [ ] `meal_plan_prompt()` - Step 1: Natural language generation
- [ ] `structured_plan_prompt()` - Step 2: JSON conversion
- [ ] `modification_prompt()` - Plan modification
- [ ] `shopping_list_prompt()` - Shopping list generation
- [ ] `_format_cook_schedule()` - Helper function

### 1.4 Gemini Service

Location: `backend/app/services/gemini.py`

- [ ] `GeminiService` class
- [ ] `generate()` method - Call Gemini API
- [ ] `_extract_text_from_response()` - Parse response
- [ ] `parse_json_response()` - Clean and parse JSON (handle markdown blocks)
- [ ] `GeminiError` exception class
- [ ] `ParseError` exception class
- [ ] Singleton `gemini_service` instance

### 1.5 API Endpoints

Location: `backend/app/routers/`

**Health Check** (`main.py`):
- [ ] `GET /api/health` (returns status, version, timestamp)

**Meal Plans** (`meal_plans.py`):
- [ ] `POST /api/meal-plans/generate` - Two-step generation
- [ ] `POST /api/meal-plans/{id}/modify` - Modify plan

**Shopping Lists** (`shopping.py`):
- [ ] `POST /api/shopping-lists/generate`

### 1.6 Validators

Location: `backend/app/utils/validators.py`

- [ ] `validate_recipe()` - Single recipe validation
- [ ] `validate_ingredient()` - Single ingredient validation
- [ ] `validate_meal_plan()` - Complete plan validation
- [ ] `validate_shopping_list()` - Shopping list validation

### 1.7 Backend Testing

- [ ] Test with curl: Health check
- [ ] Test with curl: Generate meal plan
- [ ] Test with curl: Modify meal plan
- [ ] Test with curl: Generate shopping list
- [ ] Verify JSON response format matches `DATA_MODELS.md`
- [ ] Verify error response format

---

## Phase 2: Frontend Setup

### 2.1 Project Initialization

- [ ] Create `frontend/` directory with Vite + React + TypeScript
- [ ] Install dependencies:
  - [ ] tailwindcss
  - [ ] zustand
  - [ ] react-router-dom
  - [ ] lucide-react
- [ ] Configure Tailwind with custom colors (from `UI_DESIGN.md`)
- [ ] Create `.env.local` with `VITE_API_BASE_URL`
- [ ] Verify `npm run dev` runs

### 2.2 TypeScript Types

Location: `frontend/src/types/index.ts`

- [ ] All types matching `DATA_MODELS.md`
- [ ] `Difficulty` type
- [ ] `IngredientCategory` type
- [ ] `MealSelection` interface
- [ ] `CookSchedule` interface
- [ ] `Ingredient` interface (with `category`)
- [ ] `Recipe` interface (with `estimatedTime`, `totalCalories`)
- [ ] `DayMeals` interface
- [ ] `WeekDays` interface
- [ ] `MealPlan` interface (with `status`, `preferences`)
- [ ] `ShoppingItem` interface (with `totalQuantity`, `purchased`)
- [ ] `ShoppingList` interface (flat `items` array)
- [ ] `MenuBook` interface (mealPlan + shoppingList per week)
- [ ] `DayOfWeek` type and `DAYS_OF_WEEK` constant

### 2.3 API Service

Location: `frontend/src/services/api.ts`

- [ ] `fetchWithTimeout()` helper (2-minute timeout)
- [ ] `ApiTimeoutError` class
- [ ] `handleResponse()` helper
- [ ] `healthCheck()` - GET /api/health
- [ ] `generateMealPlan()` - POST /api/meal-plans/generate
- [ ] `modifyMealPlan()` - POST /api/meal-plans/{id}/modify
- [ ] `generateShoppingList()` - POST /api/shopping-lists/generate

### 2.4 Zustand Stores

Location: `frontend/src/stores/`

**useAppStore**:
- [ ] `menuBooks: MenuBook[]` - All weekly plans with their shopping lists
- [ ] `currentWeekId: string | null` - Currently selected week
- [ ] `getCurrentMenuBook()` - Get current MenuBook (mealPlan + shoppingList)
- [ ] `isMenuOpen: boolean` - Toggle Menu Open/Closed views
- [ ] `currentDayIndex: number` (0-6 for swipe navigation)
- [ ] `isGenerating: boolean`
- [ ] `error: string | null`
- [ ] Actions: `addMenuBook`, `updateMenuBook`, `setCurrentWeekId`, `toggleMenuView`, etc.

**useDraftStore** (persisted to localStorage):
- [ ] `currentStep: number` (1-8)
- [ ] `keywords: string[]`
- [ ] `mustHaveItems: string[]`
- [ ] `dislikedItems: string[]`
- [ ] `numPeople: number` (1-10)
- [ ] `budget: number` (50-500, step 10)
- [ ] `difficulty: Difficulty`
- [ ] `cookSchedule: CookSchedule`
- [ ] `lastUpdated: string`
- [ ] Actions: `setStep`, `addKeyword`, `removeKeyword`, `addMustHaveItem`, `removeMustHaveItem`, `addDislikedItem`, `removeDislikedItem`, `setNumPeople`, `setBudget`, `setDifficulty`, `setCookSchedule`, `toggleMeal`, `selectAllMeals`, `deselectAllMeals`, `getSelectedMealCount`, `resetDraft`

**useShoppingStore**:
- [ ] `purchasedItems: Set<string>`
- [ ] `manualItems: ShoppingItem[]`
- [ ] Actions: `togglePurchased`, `addManualItem`, `removeManualItem`, `clearPurchased`, `reset`

---

## Phase 3: Core Pages

### 3.1 App Shell & Navigation

- [ ] `App.tsx` with React Router
- [ ] `BottomNav` component (Plan/List/Me icons)
- [ ] `PageContainer` layout component
- [ ] Route configuration: `/`, `/shopping`, `/me`, `/create`

### 3.2 Home Page (`/`) - Menu Open/Closed

**Empty State**:
- [ ] "No menu yet" message
- [ ] "Create Menu" button → `/create`

**Menu Open View (default)**:
- [ ] Header: "THIS WEEK" + date range + grid button
- [ ] Swipe indicator (7 dots)
- [ ] Daily menu card with weekday title
- [ ] Meal items with color-coded icons
- [ ] Tap meal → Recipe Detail modal
- [ ] Swipe left/right → Change day
- [ ] Tap grid button → Toggle to Menu Closed view

### 3.3 Menu Closed View (Home Page State)

- [ ] Header: Back button + "MY MENUS" title
- [ ] Grid of menu book cards
- [ ] Current week badge ("THIS WEEK")
- [ ] Food emoji cover for each book
- [ ] Date range and stats (meals, budget)
- [ ] "New Menu" card with dashed border
- [ ] Tap book → Load that week + Toggle to Menu Open
- [ ] Tap "New Menu" → Navigate to `/create`
- [ ] Tap back → Toggle to Menu Open view

### 3.4 Shopping Page (`/shopping`)

**Key Concept:** Each MenuBook (week) has its own ShoppingList. Shopping Page displays the list for the currently selected week.

- [ ] Header: "Shopping List" + week indicator + "Add Item" button
- [ ] Show which week's list is displayed (e.g., "Jan 27 - Feb 2")
- [ ] Category sections (collapsible)
- [ ] Category order: Proteins, Vegetables, Fruits, Grains, Dairy, Seasonings, Pantry Staples, Others
- [ ] Seasonings category: **No quantity display**
- [ ] Item checkbox toggle
- [ ] Purchased items: Strikethrough + gray styling
- [ ] "Add Item" button + modal
- [ ] Manual items with `isManuallyAdded: true`
- [ ] Empty state if no shopping list for current week

### 3.5 My Page (`/me`)

- [ ] Header: "Profile"
- [ ] Preferences card
- [ ] Editable: keywords, must-have items, disliked items
- [ ] Default: people count, budget, difficulty
- [ ] Auto-save to localStorage

---

## Phase 4: Create Plan Flow

### 4.1 Step 1: Welcome + Begin

- [ ] Animated food circle (center)
- [ ] "Let's plan meals for next week!" text
- [ ] **"Begin" button** (no auto-advance)
- [ ] Tap Begin → Step 2

### 4.2 Step 2: Keywords Selection

- [ ] Header + subtitle
- [ ] Tag categories with section labels
- [ ] Tag selection toggle (multi-select)
- [ ] "+" button for custom keywords
- [ ] "Next" button → Step 3
- [ ] Auto-save to draft

### 4.3 Step 3: Must-Have Items

- [ ] Item categories with emojis
- [ ] Item selection toggle
- [ ] "+" button for custom items
- [ ] "Next" button → Step 4
- [ ] Auto-save to draft

### 4.4 Step 4: Disliked Items

- [ ] Item categories (allergens, meats, vegetables, etc.)
- [ ] Item selection toggle
- [ ] "+" button for custom items
- [ ] "Next" button → Step 5
- [ ] Auto-save to draft

### 4.5 Step 5: People, Budget & Difficulty (Inline Sentence)

- [ ] Sentence: "The meal plan is for **[n]** people with **$[X]** budget and **[difficulty]** difficulty to cook."
- [ ] Orange accent color for editable values (`#D97706`)
- [ ] **People**: Tap → Show `[-] n [+]` inline control (1-10)
- [ ] **Budget**: Tap → Show scrollable picker ($50-$500, step $10)
- [ ] **Difficulty**: Tap → Show dropdown (Easy/Medium/Hard)
- [ ] "Next" button → Step 6
- [ ] Auto-save to draft

### 4.6 Step 6: Schedule Grid

- [ ] 7×3 grid (days × meals)
- [ ] Cell toggle (selected/unselected)
- [ ] **"Select All" button**
- [ ] **"Deselect All" button**
- [ ] Validation: At least 1 meal selected
- [ ] "Generate Plan" button (disabled if no meals) → Step 7
- [ ] Auto-save to draft

### 4.7 Step 7: Generating (Loading)

- [ ] Animated chef illustration
- [ ] "Generating your meal plan..." text
- [ ] Timer display (elapsed time)
- [ ] **Minimum wait: 1 minute** before allowing navigation
- [ ] **Timeout: 2 minutes** → Error message
- [ ] "Go to Home" button (appears after 1 min)
- [ ] API call: `generateMealPlan()`
- [ ] On success (after min wait) → Step 8
- [ ] Clear draft on success

### 4.8 Step 8: Plan Generated (Reuse Menu Open + Dual Buttons)

- [ ] Header: Back button + "YOUR NEW MENU"
- [ ] Reuse Menu Open daily card layout
- [ ] Swipe indicator (7 dots)
- [ ] Left/right swipe for days
- [ ] Tap meal → Recipe Detail modal
- [ ] **Dual buttons at bottom (equal width):**
  - [ ] 💬 Modify (secondary style)
  - [ ] 🛒 Shopping List (primary style)

### 4.9 Recipe Detail Modal

- [ ] Close button (X) top left
- [ ] Action buttons top right: Edit Notes, Delete
- [ ] Recipe name (large)
- [ ] Meta row: Time, Servings, Difficulty, Calories
- [ ] Ingredients list
- [ ] Instructions (numbered steps)
- [ ] Notes section (editable)
- [ ] Delete confirmation dialog

### 4.10 Shopping List Loading (Step 10)

- [ ] Animated shopping cart
- [ ] "Generating your shopping list..." text
- [ ] API call: `generateShoppingList()`
- [ ] On success → Navigate to Shopping Page
- [ ] Timeout: 2 minutes

### 4.11 Modification Flow

- [ ] Chat input modal (max 200 chars)
- [ ] Submit → Loading state (Step 7)
- [ ] API call: `modifyMealPlan()`
- [ ] On success → Return to Step 8 with updated plan
- [ ] **Auto-regenerate shopping list** when user clicks Shopping List button

---

## Phase 5: Draft Persistence & Resume

- [ ] `useDraftStore` with Zustand persist middleware
- [ ] localStorage key: `omenu_meal_plan_draft`
- [ ] On navigate to `/create`:
  - [ ] If `currentStep > 1`, show "Continue where you left off?" prompt
  - [ ] Yes → Resume from `currentStep`
  - [ ] No → Call `resetDraft()`, start from Step 1
- [ ] Clear draft after successful generation (Step 8)

---

## Phase 6: Error Handling

- [ ] API timeout handling (2 minutes)
- [ ] `ApiTimeoutError` class
- [ ] "Taking longer than usual" message
- [ ] "Try Again" button
- [ ] Network offline detection
- [ ] Invalid response handling
- [ ] Error boundary component

---

## Phase 7: Polish & Testing

### 7.1 UI Polish

- [ ] All colors match `UI_DESIGN.md`
- [ ] Typography matches spec
- [ ] Icons from Lucide (stroke width 1.8px)
- [ ] Border radius: card 20px, button 8-12px, tag 6px, modal 24px
- [ ] Box shadows match spec
- [ ] Responsive within phone frame
- [ ] Animations (food circle, loading states)

### 7.2 Unit Testing

- [ ] `useDraftStore` tests (all actions)
- [ ] `useAppStore` tests
- [ ] `useShoppingStore` tests
- [ ] API service tests (with MSW)
- [ ] Validator tests

### 7.3 Component Testing

- [ ] Tag selection component
- [ ] Schedule grid component
- [ ] Daily menu card component
- [ ] Shopping item component
- [ ] Recipe detail modal

### 7.4 E2E Testing

- [ ] Full create flow (Steps 1-8)
- [ ] Modification flow
- [ ] Shopping list generation
- [ ] Draft persistence and resume
- [ ] Error states

### 7.5 Final Verification

- [ ] All checklist items completed
- [ ] No console errors
- [ ] All API calls working
- [ ] localStorage working
- [ ] Mock data matches API spec
- [ ] Ready for deployment

---

## Phase 8: Deployment

### 8.1 Backend Deployment

- [ ] Choose platform (Railway / Render / Fly.io)
- [ ] Set environment variables:
  - [ ] `GEMINI_API_KEY`
  - [ ] `CORS_ORIGINS`
- [ ] Deploy and verify health check
- [ ] Note production URL

### 8.2 Frontend Deployment

- [ ] Choose platform (Vercel / Netlify)
- [ ] Set environment variables:
  - [ ] `VITE_API_BASE_URL` (production backend URL)
- [ ] Deploy and verify
- [ ] Test full flow in production

---

## Quick Reference

### API Calls (Total)

| Flow | Calls |
|------|-------|
| New plan generation | 2 (Natural language + JSON conversion) |
| Plan modification | 1 |
| Shopping list | 1 |
| **First-time full flow** | **3** (generate + structure + shopping) |

### Key v3.5 Changes (Menu Book Concept)

| Feature | Description |
|---------|-------------|
| Menu Open | Home page default - daily cards with swipe |
| Menu Closed | Home page state (toggle via `isMenuOpen`) |
| isMenuOpen state | Toggle between Menu Open/Closed views |
| Begin button | Step 1 requires explicit tap (no auto-advance) |
| Inline sentence editing | Step 5 with orange-highlighted values |
| Select All / Deselect All | Step 6 schedule grid buttons |
| 1 min minimum wait | Step 7 loading screen |
| 2 min timeout | All API calls |
| Dual buttons | Step 8 equal-width Modify + Shopping List |
| Auto-regenerate | Shopping list after modification |

### Validation Rules

| Field | Range |
|-------|-------|
| `numPeople` | 1-10 |
| `budget` | $50-$500 (step $10) |
| `difficulty` | easy / medium / hard |
| `cookSchedule` | At least 1 meal selected |
| `modification` | Max 200 characters |

### ID Prefixes

| Entity | Prefix | Example |
|--------|--------|---------|
| Meal Plan | `mp_` | `mp_abc123` |
| Shopping List | `sl_` | `sl_xyz789` |
| Shopping Item | `item_` | `item_001` |
| Recipe | `{day}-{meal}-{number}` | `mon-breakfast-001` |

### Color Quick Reference

| Name | Hex | Usage |
|------|-----|-------|
| Paper | `#FAF9F7` | Background |
| Card Header | `#F8F6F2` | Card header bg |
| Accent (Olive) | `#8B9469` | Primary buttons, highlights |
| Accent Orange | `#D97706` | Editable values |
| Primary Text | `#2C2C2C` | Main text |
| Secondary Text | `#7A7A7A` | Subtitles, meta |
| Divider | `#EEEBE6` | Borders, dividers |
| Meal Breakfast | `#FEF3E2` | Breakfast icon bg |
| Meal Lunch | `#E8F5E9` | Lunch icon bg |
| Meal Dinner | `#EDE7F6` | Dinner icon bg |

### Route Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Menu Open/Closed (toggle via `isMenuOpen` state) |
| `/shopping` | ShoppingPage | Shopping list |
| `/me` | MyPage | User preferences |
| `/create` | CreatePlanPage | 8-step create flow |

---

## Notes

_Use this space to track issues, decisions, or deviations from the spec:_

- 
- 
- 
