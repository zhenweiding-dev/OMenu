# OMenu Implementation Checklist

**Version**: 2.1  
**Last Updated**: January 31, 2025

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
- [ ] `Ingredient` model
- [ ] `Recipe` model
- [ ] `UserPreferences` model
- [ ] `DayMeals` model
- [ ] `WeekDays` model
- [ ] `MealPlan` model
- [ ] `ShoppingItem` model
- [ ] `ShoppingList` model
- [ ] Request/Response models for API endpoints

### 1.3 Prompt Templates

Location: `backend/app/services/prompts.py`

- [ ] `meal_plan_prompt()` - Step 1: Natural language generation
- [ ] `generate_structured_plan_prompt()` - Step 2: JSON conversion
- [ ] `user_manipulation_prompt()` - Plan modification
- [ ] `generate_shopping_list_prompt()` - Shopping list
- [ ] `convert_schedule_to_array_format()` - Helper function

### 1.4 Gemini Service

Location: `backend/app/services/gemini.py`

- [ ] `GeminiService` class
- [ ] `generate()` method - Call Gemini API
- [ ] `_extract_text_from_response()` - Parse response
- [ ] `parse_json_response()` - Clean and parse JSON
- [ ] `GeminiError` exception class
- [ ] `ParseError` exception class
- [ ] Singleton `gemini_service` instance

### 1.5 API Endpoints

Location: `backend/app/routers/`

**Health Check** (`health.py`):
- [ ] `GET /api/health`

**Meal Plans** (`meal_plans.py`):
- [ ] `POST /api/meal-plans/generate` - Two-step generation
- [ ] `GET /api/meal-plans/{id}` - Get plan by ID (optional for MVP)
- [ ] `POST /api/meal-plans/{id}/modify` - Modify plan

**Shopping Lists** (`shopping.py`):
- [ ] `POST /api/shopping-lists/generate`

### 1.6 Backend Testing

- [ ] Test with curl: Health check
- [ ] Test with curl: Generate meal plan
- [ ] Test with curl: Modify meal plan
- [ ] Test with curl: Generate shopping list
- [ ] Verify 2-minute timeout handling
- [ ] Verify JSON response format

---

## Phase 2: Frontend Setup

### 2.1 Project Initialization

- [ ] Create `frontend/` directory with Vite + React + TypeScript
- [ ] Install dependencies:
  - [ ] tailwindcss
  - [ ] zustand
  - [ ] react-router-dom
  - [ ] lucide-react
- [ ] Configure Tailwind with custom colors
- [ ] Create `.env.local` with `VITE_API_BASE_URL`
- [ ] Verify `npm run dev` runs

### 2.2 TypeScript Types

Location: `frontend/src/types/index.ts`

- [ ] All types matching `DATA_MODELS.md`
- [ ] Ensure alignment with backend Pydantic models

### 2.3 API Service

Location: `frontend/src/services/api.ts`

- [ ] `generateMealPlan()` - POST /api/meal-plans/generate
- [ ] `modifyMealPlan()` - POST /api/meal-plans/{id}/modify
- [ ] `generateShoppingList()` - POST /api/shopping-lists/generate
- [ ] Error handling
- [ ] Timeout configuration (2 minutes)

### 2.4 Zustand Stores

Location: `frontend/src/stores/`

**useAppStore**:
- [ ] `currentPlan: MealPlan | null`
- [ ] `shoppingList: ShoppingList | null`
- [ ] `isLoading: boolean`
- [ ] `error: string | null`
- [ ] `viewMode: 'daily' | 'plan'` (v2.1)
- [ ] Actions: `setCurrentPlan`, `setShoppingList`, `setViewMode`, etc.

**useDraftStore** (persisted):
- [ ] `currentStep: number`
- [ ] `keywords: string[]`
- [ ] `mustHaveItems: string[]`
- [ ] `dislikedItems: string[]`
- [ ] `numPeople: number`
- [ ] `budget: number`
- [ ] `difficulty: Difficulty`
- [ ] `cookSchedule: CookSchedule`
- [ ] Actions: All setters + `resetDraft()`

**useShoppingStore**:
- [ ] `togglePurchased()`
- [ ] `addItem()`
- [ ] `removeItem()`

---

## Phase 3: Core Pages

### 3.1 App Shell & Navigation

- [ ] `App.tsx` with React Router
- [ ] `BottomNav` component
- [ ] `PageContainer` layout component
- [ ] Route configuration: `/`, `/shopping`, `/me`, `/create`

### 3.2 Home Page (`/`)

**Empty State**:
- [ ] "No meal plan yet" message
- [ ] "Create Meal Plan" button → `/create`

**Daily View** (v2.1 default):
- [ ] Today's date header
- [ ] Meal count + total calories
- [ ] Breakfast/Lunch/Dinner detailed cards
- [ ] Tap meal → Recipe Detail modal

**Plan View** (v2.1):
- [ ] Header card with plan summary
- [ ] "💬 Modify Plan" button
- [ ] Daily cards with simplified meal rows
- [ ] View toggle in header

**View Toggle**:
- [ ] Toggle button in header
- [ ] Switch between Daily/Plan views
- [ ] Persist during session

### 3.3 Shopping Page (`/shopping`)

- [ ] Category sections (collapsible)
- [ ] Item checkbox toggle
- [ ] "Add Item" button + modal
- [ ] Seasonings category: No quantity display
- [ ] Purchased items: Strikethrough styling

### 3.4 My Page (`/me`)

- [ ] Preferences card
- [ ] Editable keywords, must-have, disliked items
- [ ] Default people, budget, difficulty
- [ ] Save to localStorage

---

## Phase 4: Create Plan Flow

### 4.1 Step 1: Welcome + Begin (v2.1)

- [ ] Animated food circle
- [ ] "Let's plan meals for next week!" text
- [ ] **"Begin" button** (no auto-advance)
- [ ] Tap Begin → Step 2

### 4.2 Step 2: Keywords Selection

- [ ] Header + subtitle
- [ ] Tag categories with section labels
- [ ] Tag selection toggle
- [ ] "+" button for custom keywords
- [ ] "Next" button → Step 3
- [ ] Save to draft

### 4.3 Step 3: Must-Have Items

- [ ] Item categories with emojis
- [ ] Item selection toggle
- [ ] "+" button for custom items
- [ ] "Next" button → Step 4
- [ ] Save to draft

### 4.4 Step 4: Disliked Items

- [ ] Item categories (allergens, meats, vegetables, etc.)
- [ ] Item selection toggle
- [ ] "+" button for custom items
- [ ] "Next" button → Step 5
- [ ] Save to draft

### 4.5 Step 5: People, Budget & Difficulty (v2.1 Inline Sentence)

- [ ] Sentence: "The meal plan is for **[n]** people with **$[X]** budget and **[difficulty]** difficulty to cook."
- [ ] Orange accent color for editable values (`#D97706`)
- [ ] **People**: Tap → Show `[-] n [+]` inline control
- [ ] **Budget**: Tap → Show scrollable picker ($50-$500, step $10)
- [ ] **Difficulty**: Tap → Show dropdown (Easy/Medium/Hard)
- [ ] "Next" button → Step 6
- [ ] Save to draft

### 4.6 Step 6: Schedule Grid (v2.1)

- [ ] 7×3 grid (days × meals)
- [ ] Cell toggle (selected/unselected)
- [ ] **"Select All" button**
- [ ] **"Deselect All" button**
- [ ] Validation: At least 1 meal selected
- [ ] "Generate Plan" button (disabled if no meals) → Step 7
- [ ] Save to draft

### 4.7 Step 7: Generating (Loading)

- [ ] Animated chef illustration
- [ ] "Generating your meal plan..." text
- [ ] Timer display (elapsed time)
- [ ] **Minimum wait: 1 minute** before allowing navigation
- [ ] **Timeout: 2 minutes** → Error message
- [ ] "Go to Home" button (appears after 1 min)
- [ ] API call: `generateMealPlan()`
- [ ] On success → Step 8
- [ ] Clear draft on success

### 4.8 Step 8: Plan Overview

- [ ] Reuse Plan View layout
- [ ] Back button → Home
- [ ] "💬 Modify Plan" button
- [ ] **"Generate Shopping List" button** at bottom
- [ ] Tap meal → Recipe Detail modal

### 4.9 Step 9: Recipe Detail Modal

- [ ] Close button (X)
- [ ] Recipe name
- [ ] Time, servings, difficulty, calories row
- [ ] Ingredients list
- [ ] Instructions (numbered)
- [ ] Notes section (editable)
- [ ] Delete button (confirm dialog)

### 4.10 Step 10: Shopping List Loading

- [ ] Animated shopping cart
- [ ] "Generating your shopping list..." text
- [ ] API call: `generateShoppingList()`
- [ ] On success → Shopping Page

### 4.11 Modification Flow

- [ ] Chat input modal (max 200 chars)
- [ ] Submit → Loading state
- [ ] API call: `modifyMealPlan()`
- [ ] **Auto-regenerate shopping list** after modification
- [ ] Update UI with modified plan

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
- [ ] "Taking longer than usual" message
- [ ] "Try Again" button
- [ ] Network offline detection
- [ ] Invalid response handling

---

## Phase 7: Polish & Testing

### 7.1 UI Polish

- [ ] All colors match `UI_DESIGN.md`
- [ ] Typography matches spec
- [ ] Icons from Lucide
- [ ] Responsive within phone frame
- [ ] Animations (food circle, loading states)

### 7.2 Testing

- [ ] Create flow: All steps work
- [ ] Generate plan: API returns valid data
- [ ] Modify plan: Changes apply correctly
- [ ] Shopping list: Aggregation works
- [ ] Draft resume: Works after app restart
- [ ] Edge cases: Empty inputs, API errors

### 7.3 Final Verification

- [ ] All checklist items completed
- [ ] No console errors
- [ ] All API calls working
- [ ] Local storage working
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
| New plan generation | 2 (Step 1 + Step 2) |
| Plan modification | 1 |
| Shopping list | 1 |
| **First-time full flow** | **3** |

### Key v2.1 Changes

| Feature | Location |
|---------|----------|
| Daily View / Plan View toggle | Home Page |
| Begin button (no auto-advance) | Step 1 |
| Inline sentence editing | Step 5 |
| Select All / Deselect All | Step 6 |
| 1 min minimum wait | Step 7 |
| 2 min timeout | All API calls |
| Auto-regenerate shopping list | Modification |

### Color Quick Reference

| Name | Hex |
|------|-----|
| Paper | `#FAF9F7` |
| Accent (Olive) | `#8B9469` |
| Accent Orange | `#D97706` |
| Primary Text | `#2C2C2C` |
| Secondary Text | `#7A7A7A` |

---

## Notes

_Use this space to track issues, decisions, or deviations from the spec:_

- 
- 
- 
