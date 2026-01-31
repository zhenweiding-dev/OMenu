# Pages and User Flows

## App Structure

```
App
├── Home Page (/)
├── Shopping Page (/shopping)
├── My Page (/me)
├── Meal Plans Page (/plans)
└── Create Plan Flow (/create)
    ├── Step 1: Welcome
    ├── Step 2: Keywords
    ├── Step 3: Must-Have Items
    ├── Step 4: Disliked Items
    ├── Step 5: People & Budget
    ├── Step 6: Schedule Grid
    ├── Step 7: Generating (Loading)
    ├── Step 8: Plan Overview
    ├── Step 9: Recipe Detail (Modal)
    ├── Step 10: Shopping List Loading
    └── Step 11: Shopping List Result
```

---

## Navigation

### Bottom Navigation Bar

Present on: **Home, Shopping, My Page**

| Tab | Icon | Route | Label |
|-----|------|-------|-------|
| Today | Home | `/` | Today |
| Shopping | ShoppingCart | `/shopping` | Shopping |
| Me | User | `/me` | Me |

### Home Page Header Actions

| Position | Icon | Action |
|----------|------|--------|
| Top Right #1 | List/Grid toggle | Toggle card view ↔ full plan view |
| Top Right #2 | Plus | Navigate to `/create` (new plan) |

---

## Page Specifications

### 1. Home Page (`/`)

**Purpose:** Display current/upcoming meals, quick access to full plan.

**Layout:**
- Header: App name + action buttons
- Main: Meal plan card or empty state
- Bottom: Navigation bar

**States:**

| State | Display |
|-------|---------|
| Empty | "No meal plan yet" + "Create Your First Plan" button |
| Generating | "Your meal plan is being generated..." + spinner |
| Ready | Current meal plan card (today's meals or next meal) |
| Error | "Something went wrong" + "Try Again" button |

**Interactions:**
- Tap card → Expand to full plan view (same page, scrollable list)
- Tap meal → Open Recipe Detail modal
- Tap "+" → Navigate to create flow

---

### 2. Meal Plans Page (`/plans`)

**Purpose:** View all historical meal plans in a scrollable list.

**Layout:**
- Header: "Meal Plans" title + back button
- Main: Scrollable list of all plans (newest first)
- No bottom navigation

**Plan Card Display:**
- Week start date
- Number of meals planned
- Quick preview (e.g., "Mon: Eggs, Pasta, Stir-fry")

**Interactions:**
- Tap plan card → Expand to show full week details
- Scroll up/down to browse history

---

### 3. Shopping Page (`/shopping`)

**Purpose:** View and manage shopping list for current meal plan.

**Layout:**
- Header: "Shopping List" + "Add Item" button (top right)
- Main: Categorized item list (collapsible sections)
- Bottom: Navigation bar

**Category Display Order:**
1. Proteins
2. Vegetables
3. Fruits
4. Grains
5. Dairy
6. Seasonings *(quantity NOT shown)*
7. Pantry Staples
8. Others

**Item Display:**
```
[ ] Chicken Breast    2 lbs
[✓] Tomatoes         6 count   ← purchased: strikethrough + gray
[ ] Soy Sauce                  ← seasonings: no quantity
```

**Interactions:**
- Tap checkbox → Toggle purchased status
- Tap item → Edit name/quantity (inline or modal)
- Tap "Add Item" → Show add item input
- Tap category header → Collapse/expand section

**Add Item Flow:**
1. Tap "Add Item" button
2. Modal appears: Item name input (required), quantity (optional), category dropdown
3. Save → Item added to list with `isManuallyAdded: true`

---

### 4. My Page (`/me`)

**Purpose:** User profile and preferences management.

**Layout:**
- Header: "Profile" + Settings icon
- Main: Preferences section
- Bottom: Navigation bar

**Sections:**

**Preferences Card:**
- Keywords (tags, editable)
- Must-have items (tags, editable)
- Disliked items (tags, editable)
- Default people count
- Default budget
- Default difficulty

**Interactions:**
- Tap any preference section → Edit inline or navigate to edit screen
- Changes auto-save to localStorage

---

## Create Plan Flow (`/create`)

**Key Principle:** All progress saved locally in real-time. User can exit anytime and resume from last step.

### Step 1: Welcome Splash

**Display:**
- Animated food circle image (top)
- Text: "Let's plan meals for next week!"
- Auto-advance after 2-3 seconds OR tap anywhere to skip

**Behavior:**
- Timer: 2.5 seconds then auto-navigate to Step 2
- Tap anywhere → Immediately navigate to Step 2

---

### Step 2: Keywords Selection

**Display:**
- Header: "Choose some keywords for your meal plan"
- Background: Food imagery
- Content: Colorful keyword tags (multi-select)
- Footer: Custom input + "Add" button + "Next" button

**Default Keywords:**
```
Quick, Easy, Healthy, Vegetarian, Dairy-Free, Low-Carb, 
High-Protein, Kid-Friendly, Chinese, Italian, Mexican, 
Japanese, Indian, Thai, Budget-Friendly, Comfort Food
```

**Interactions:**
- Tap tag → Toggle selection (highlight color change)
- Type custom + tap "Add" → Add as selected tag
- Tap "Next" → Save to draft, navigate to Step 3

**Data Saved:** `draft.keywords: string[]`

---

### Step 3: Must-Have Items

**Display:**
- Header: "Select something you must have"
- Background: Food imagery
- Content: Items with icons (multi-select)
- Footer: Custom input + "Add" button + "Next" button

**Default Options (with icons):**
```
🥚 Eggs, 🍞 Bread, 🥛 Milk, 🧀 Cheese, 🍗 Chicken, 
🐟 Fish, 🍚 Rice, 🍝 Pasta, 🫘 Beans, 🥜 Nuts,
🥩 Beef, 🐷 Pork, 🦐 Shrimp, 🥦 Broccoli, 🍳 Tofu
```

**Interactions:** Same as Step 2

**Data Saved:** `draft.mustHaveItems: string[]`

---

### Step 4: Disliked Items

**Display:**
- Header: "Select things you don't like"
- Background: Icons of default items
- Content: Items with icons (multi-select)
- Footer: Custom input + "Add" button + "Next" button

**Default Options (with icons):**
```
🥜 Peanut, 🥒 Cucumber, 🧄 Garlic, 🦐 Seafood, 
🌶️ Spicy, 🫚 Ginger, 🌿 Cilantro, 🍄 Mushroom,
🧅 Onion, 🥛 Lactose, 🌾 Gluten, 🥚 Eggs
```

**Interactions:** Same as Step 2

**Data Saved:** `draft.dislikedItems: string[]`

---

### Step 5: People, Budget & Difficulty

**Display:**
- Header: "The meal plan is for [n] people with $[X] budget and [difficulty] to cook"
- Content:
  - People: Number with -/+ buttons (1-10)
  - Budget: Scrollable slider ($50-$500, step $10)
  - Difficulty: 3-option selector (Easy/Medium/Hard)
- Footer: "Next" button

**Defaults:**
- People: 2
- Budget: $100
- Difficulty: Medium

**Interactions:**
- Tap -/+ → Adjust people count
- Drag slider → Adjust budget
- Tap difficulty option → Select

**Data Saved:** `draft.numPeople`, `draft.budget`, `draft.difficulty`

---

### Step 6: Schedule Grid

**Display:**
- Header: "Choose meals to plan"
- Content: 7×3 grid (days × meals)
- Footer: "Generate Plan" button

**Grid Layout:**
```
           Breakfast  Lunch  Dinner
Monday        [ ]      [ ]     [ ]
Tuesday       [ ]      [ ]     [ ]
Wednesday     [ ]      [ ]     [ ]
Thursday      [ ]      [ ]     [ ]
Friday        [ ]      [ ]     [ ]
Saturday      [ ]      [ ]     [ ]
Sunday        [ ]      [ ]     [ ]
```

**Interactions:**
- Tap cell → Toggle selection (unselected ↔ selected with color)
- Tap "Generate Plan" → Save draft, call Gemini API, navigate to Step 7

**Data Saved:** `draft.cookSchedule: CookSchedule`

---

### Step 7: Generating (Loading)

**Display:**
- Animated chef cooking different foods (center)
- Text: "Generating your meal plan..."
- Secondary button: "Go to Home" (bottom)

**Behavior:**
- API call runs in background
- On success → Navigate to Step 8 (Plan Overview)
- On error after 30s → Show error message + "Go to Home" button
- User taps "Go to Home" → Return to Home, generation continues in background

**Error Message:**
"It's taking longer than usual. We're working on it. You can go back and check later."

---

### Step 8: Plan Overview

**Display:**
- Header: "Your Meal Plan" + back button
- Main: Scrollable daily cards
- Footer: Floating action buttons

**Daily Card Layout:**
```
┌─────────────────────────────┐
│ Monday                      │
├─────────────────────────────┤
│ 🌅 Breakfast                │
│   Scrambled Eggs    180 cal │
├─────────────────────────────┤
│ ☀️ Lunch                    │
│   Chicken Salad     350 cal │
├─────────────────────────────┤
│ 🌙 Dinner                   │
│   Beef Stir-fry     420 cal │
└─────────────────────────────┘
```

- Unplanned meals show: "Not Planned" (grayed out)

**Footer Buttons:**
- "Chat to Modify" → Open chat input for modification requests
- "Generate Shopping List" → Navigate to Step 10

**Interactions:**
- Tap any meal row → Open Recipe Detail modal (Step 9)
- Tap "Chat to Modify" → Show input field, send to Gemini, return to Step 7 for regeneration
- Tap "Generate Shopping List" → Navigate to Step 10

---

### Step 9: Recipe Detail (Floating Modal)

**Display:**
- Close button (top left, X icon)
- Action buttons (top right): Edit Notes, Delete
- Content sections:
  - Recipe name (large)
  - Time & Servings & Difficulty & Calories (row)
  - Ingredients list
  - Instructions (numbered steps)
  - Notes (editable section)

**Layout:**
```
┌─────────────────────────────────┐
│ ✕                    📝  🗑️     │
├─────────────────────────────────┤
│ Scrambled Eggs with Tomato      │
│                                 │
│ ⏱️ 15 min  👥 2  📊 Easy  🔥 180 │
├─────────────────────────────────┤
│ Ingredients                     │
│ • 2 eggs                        │
│ • 100g tomato                   │
│ • 15ml oil                      │
├─────────────────────────────────┤
│ Instructions                    │
│ 1. Beat eggs in a bowl          │
│ 2. Stir fry tomato              │
│ 3. Mix together and serve       │
├─────────────────────────────────┤
│ Notes                    [Edit] │
│ Add a pinch of sugar for        │
│ better taste.                   │
└─────────────────────────────────┘
```

**Interactions:**
- Tap X → Close modal, return to Plan Overview
- Tap Edit Notes → Inline text editor for notes field
- Tap Delete → Confirm dialog → Remove meal from plan

---

### Step 10: Shopping List Loading

**Display:**
- Animated shopping cart with foods being added
- Text: "Generating your shopping list..."

**Behavior:**
- Call Gemini API with structured meal plan
- On success → Navigate to Shopping Page
- On error → Show error message + retry option

---

### Step 11: Shopping List Result

Navigates to **Shopping Page** (`/shopping`) with newly generated list.

---

## State Persistence

### Draft Auto-Save

Every step change saves to localStorage:

```typescript
// On any step change
localStorage.setItem('omenu_meal_plan_draft', JSON.stringify({
  currentStep: 3,
  keywords: ['Healthy', 'Chinese'],
  mustHaveItems: ['Eggs', 'Rice'],
  dislikedItems: [],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  cookSchedule: { ... },
  lastUpdated: new Date().toISOString()
}));
```

### Resume Logic

On app open or navigate to `/create`:

```typescript
const draft = localStorage.getItem('omenu_meal_plan_draft');
if (draft) {
  const parsed = JSON.parse(draft);
  // Navigate to parsed.currentStep with pre-filled data
}
```

### Clear Draft

After successful plan generation:

```typescript
localStorage.removeItem('omenu_meal_plan_draft');
```

---

## Background Generation

When user leaves Step 7 (Loading) to go Home:

1. Generation continues via service worker / async task
2. On completion:
   - Save plan to IndexedDB
   - Update `omenu_current_plan_id` in localStorage
   - Set plan `status: 'ready'`
3. On next Home page visit:
   - Check current plan status
   - If `ready` → Display plan
   - If `error` → Show error state with retry

---

## Error Handling

| Scenario | User Feedback | Action |
|----------|---------------|--------|
| API timeout (>30s) | "Taking longer than usual..." | Show "Go Home" button |
| API error | "Something went wrong" | Show "Try Again" button |
| Invalid response | "Couldn't understand the response" | Show "Try Again" button |
| Network offline | "No internet connection" | Show retry when back online |
