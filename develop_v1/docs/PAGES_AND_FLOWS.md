Z# Pages and User Flows

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
| Today | Fork & Knife | `/` | Today |
| List | Checklist | `/shopping` | List |
| Me | Heart | `/me` | Me |

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
- Subheader: "Select all that apply"
- Content: Tags grouped by category with section labels + "+" button at the end
- Footer: "Next" button

**Tag Categories:**

**Cooking Style:**
```
Quick, Easy, One-Pot, Sheet Pan, Slow Cooker, Instant Pot, 
Grilling, Meal Prep, Under 30 Min, Weeknight
```

**Diet & Health:**
```
Healthy, Vegetarian, Vegan, Dairy-Free, Gluten-Free, Low-Carb, 
Keto, High-Protein, Low-Sodium, Heart-Healthy
```

**Cuisine:**
```
American, Italian, Mexican, Chinese, Japanese, Thai, Indian, 
Korean, Vietnamese, Mediterranean, Greek, Southern, Cajun, Tex-Mex
```

**Other:**
```
Kid-Friendly, Family-Style, Comfort Food, Budget-Friendly, BBQ, Soul Food
```

**Custom Input:**
- "+" button appears as the last tag in the "Other" section
- Tap "+" → Show inline text input (max 20 characters)
- Submit → Add as selected tag, input closes

**Interactions:**
- Tap tag → Toggle selection (highlight color change)
- Tap "+" → Open inline input for custom keyword
- Tap "Next" → Save to draft, navigate to Step 3

**Data Saved:** `draft.keywords: string[]`

---

### Step 3: Must-Have Items

**Display:**
- Header: "Select something you must have"
- Subheader: "Select all that apply"
- Content: Items grouped by category with section labels + "+" button at the end
- Footer: "Next" button

**Item Categories:**

**Proteins:**
```
🥚 Eggs, 🥓 Bacon, 🍗 Chicken, 🦃 Turkey, 🥩 Beef, 🐷 Pork, 
🍖 Steak, 🐟 Salmon, 🐟 Tuna, 🦐 Shrimp, 🍳 Tofu
```

**Grains & Carbs:**
```
🍞 Bread, 🍚 Rice, 🍝 Pasta, 🥔 Potatoes, 🥣 Oatmeal, 🥞 Pancakes
```

**Dairy:**
```
🥛 Milk, 🧀 Cheese, 🥛 Yogurt, 🧈 Butter
```

**Vegetables:**
```
🥦 Broccoli, 🥕 Carrots, 🥗 Salad, 🌽 Corn, 🥑 Avocado
```

**Meal Types:**
```
🍕 Pizza, 🌮 Tacos, 🍔 Burgers, 🥪 Sandwiches, 🌯 Wraps, 
🍜 Soup, 🍱 Bowls, 🥙 Pita
```

**Pantry:**
```
🫘 Beans, 🥜 Peanut Butter, 🥜 Nuts
```

**Custom Input:**
- "+" button appears as the last item in the list
- Tap "+" → Show inline text input (max 20 characters)
- Submit → Add as selected item, input closes

**Interactions:**
- Tap item → Toggle selection
- Tap "+" → Open inline input for custom item
- Tap "Next" → Save to draft, navigate to Step 4

**Data Saved:** `draft.mustHaveItems: string[]`

---

### Step 4: Disliked Items

**Display:**
- Header: "Select things you don't like"
- Subheader: "Select all that apply"
- Content: Items grouped by category with section labels + "+" button at the end
- Footer: "Next" button

**Item Categories:**

**Common Allergens:**
```
🥜 Peanuts, 🌰 Tree Nuts, 🥛 Dairy/Lactose, 🌾 Gluten, 
🥚 Eggs, 🦐 Shellfish, 🐟 Fish, 🌱 Soy
```

**Seafood:**
```
🦑 Squid, 🐙 Octopus, 🦞 Lobster, 🦀 Crab
```

**Vegetables:**
```
🧅 Onion, 🧄 Garlic, 🌿 Cilantro, 🥒 Cucumber, 🍄 Mushrooms,
🫑 Bell Peppers, 🍆 Eggplant, 🥬 Brussels Sprouts, 🥦 Broccoli,
🫒 Olives, 🌿 Celery, 🥬 Kale, 🌶️ Jalapeño, 🥒 pickled cucumber
```

**Meats:**
```
🐷 Pork, 🥩 Red Meat, 🍖 Organ Meat, 🦴 Bone-in Meat
```

**Flavors & Textures:**
```
🌶️ Spicy Food, 🫚 Ginger, 🥥 Coconut, 🥗 Raw Vegetables
```

**Cooking Styles:**
```
🛢️ Fried Food, 🧈 Butter, 🥛 Heavy Cream, 🍺 Alcohol in Cooking
```

**Other:**
```
🧃 Artificial Sweeteners, 🧂 High Sodium
```

**Custom Input:**
- "+" button appears as the last item in the list
- Tap "+" → Show inline text input (max 20 characters)
- Submit → Add as selected item, input closes

**Interactions:**
- Tap item → Toggle selection
- Tap "+" → Open inline input for custom item
- Tap "Next" → Save to draft, navigate to Step 5

**Data Saved:** `draft.dislikedItems: string[]`

---

### Step 5: People, Budget & Difficulty

**Display:**
- Header: "The meal plan is for [n] people with $[X] budget and [difficulty] to cook"
- Content:
  - People: Number with -/+ buttons (1-10)
  - Budget: Vertical scrollable picker ($50-$500, step $10)
  - Difficulty: Vertical scrollable picker (Easy / Medium / Hard)
- Footer: "Next" button

**Defaults:**
- People: 2
- Budget: $100
- Difficulty: Medium

**Picker Style:**
All three use similar vertical scroll/swipe picker UI:
```
       ┌─────────┐
       │   $90   │  ← dimmed
       │  $100   │  ← selected (highlighted)
       │  $110   │  ← dimmed
       └─────────┘
```

**Interactions:**
- Tap -/+ → Adjust people count (1-10 range)
- Swipe up/down on Budget picker → Change budget value
- Swipe up/down on Difficulty picker → Change difficulty level
- Tap "Next" → Save to draft, navigate to Step 6

**Data Saved:** `draft.numPeople`, `draft.budget`, `draft.difficulty`

---

### Step 6: Schedule Grid

**Display:**
- Header: "Choose meals to plan"
- Subheader hint: "Select at least one meal to continue"
- Content: 7×3 grid (days × meals)
- Footer: "Generate Plan" button (disabled until at least 1 meal selected)

**Grid Layout:**
```
              Breakfast  Lunch  Dinner
Monday           [ ]      [ ]     [ ]
  Jan 27
Tuesday          [ ]      [ ]     [ ]
  Jan 28
Wednesday        [ ]      [ ]     [ ]
  Jan 29
Thursday         [ ]      [ ]     [ ]
  Jan 30
Friday           [ ]      [ ]     [ ]
  Jan 31
Saturday         [ ]      [ ]     [ ]
  Feb 1
Sunday           [ ]      [ ]     [ ]
  Feb 2
```

- Day name in regular weight
- Date (e.g., "Jan 27") in smaller, lighter text below day name
- Dates are calculated from the upcoming Monday

**Validation:**
- At least 1 meal must be selected
- "Generate Plan" button disabled (grayed out) if no meals selected
- Show hint text when nothing selected: "Select at least one meal to continue"

**Interactions:**
- Tap cell → Toggle selection (unselected ↔ selected with color)
- Tap "Generate Plan" (when enabled) → Save draft, call Gemini API, navigate to Step 7

**Data Saved:** `draft.cookSchedule: CookSchedule`

---

### Step 7: Generating (Loading)

**Display:**
- Animated chef cooking different foods (center)
- Text: "Generating your meal plan..."
- Secondary button: "Go to Home" (bottom)
- Subtext under button: "Don't worry, we'll keep working on it in the background"

**Behavior:**
- API call runs in background
- On success → Navigate to Step 8 (Plan Overview)
- On error after 30s → Show error message + "Go to Home" button
- User taps "Go to Home" → Show confirmation toast: "Your meal plan will be ready when you come back!" → Return to Home, generation continues in background

**Error Message:**
"It's taking longer than usual. We're working on it. You can go back and we'll have it ready for you soon."

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

**Chat to Modify:**
- Opens text input field at bottom of screen
- Character limit: 200 characters
- Placeholder: "Tell us what to change..."
- Show character count: "0/200"
- Send button disabled when empty or over limit
- On submit → Send to Gemini, return to Step 7 for regeneration

**Interactions:**
- Tap any meal row → Open Recipe Detail modal (Step 9)
- Tap "Chat to Modify" → Show input field with 200 char limit
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

**Important:** User always lands on Home page when opening the app, NOT directly into the create flow.

Resume only happens when user navigates to `/create`:

```typescript
// On navigate to /create
const draft = localStorage.getItem('omenu_meal_plan_draft');
if (draft) {
  const parsed = JSON.parse(draft);
  // Show resume prompt: "Continue where you left off?"
  // If yes → Navigate to parsed.currentStep with pre-filled data
  // If no → Clear draft and start fresh from Step 1
}
```

**Resume Prompt UI:**
```
┌─────────────────────────────────┐
│  You have an unfinished plan   │
│                                 │
│  Continue where you left off?   │
│                                 │
│  [Start Fresh]  [Continue]      │
└─────────────────────────────────┘
```

### Clear Draft

After successful plan generation (Step 8 loads):

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
| API timeout (>30s) | "Taking longer than usual. We'll keep trying in the background." | Show "Go Home" button |
| User taps "Go Home" during timeout | Toast: "We'll notify you when it's ready!" | Continue retry in background |
| API error | "Something went wrong" | Show "Try Again" button |
| Invalid response | "Couldn't understand the response" | Show "Try Again" button |
| Network offline | "No internet connection" | Show retry when back online |

**Background Retry Logic:**
- On timeout, if user goes home, system continues retrying up to 3 times
- On eventual success → Save plan, update status to 'ready'
- On eventual failure → Save status as 'error', show error on next Home visit
