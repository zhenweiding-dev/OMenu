# Pages and User Flows

This document describes all pages, states, and user flows in OMenu.

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

---

## Key Design Decisions

| Decision | Value |
|----------|-------|
| **Week Starts On** | Monday |
| **Shopping List Generation** | User clicks "Shopping List" button after Menu Book generated (not auto-generated) |
| **Data Storage (MVP)** | Pure local storage (IndexedDB), backend is stateless AI service |
| **Draft Persistence** | Saved when user exits Create flow mid-way, restored when returning to `/create` |
| **Delete MenuBook** | Long-press on MenuBook card → Confirm → Delete MenuBook + ShoppingList together |
| **Data Cleanup** | No automatic cleanup; display all local data |

---

## App Structure (v3.5 - Menu Book Concept)

```
App
├── Home Page (/)
│   ├── Menu Open (default) - Current week daily view with swipe navigation
│   └── Menu Closed - Grid of all menu books
├── Shopping Page (/shopping)
├── My Page (/me)
└── Create Plan Flow (/create)
    ├── Step 1: Welcome + Begin
    ├── Step 2: Preferences
    ├── Step 3: Preferred Items
    ├── Step 4: Disliked Items
    ├── Step 5: People & Budget (Sentence Style)
    ├── Step 6: Schedule Grid
    ├── Step 7: Generating (Loading)
    ├── Step 8: Plan Generated (Reuse Menu Open + Dual Buttons)
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
| Plan | Book (📖) | `/` | Plan |
| List | Checklist | `/shopping` | List |
| Me | Person (👤) | `/me` | Me |

### Home Page Header (Menu Open)

| Position | Element | Action |
|----------|---------|--------|
| Top Left | "THIS WEEK" (title) | - |
| Top Left (sub) | Date range (e.g., "Jan 27 – Feb 2") | - |
| Top Right | Grid icon button | Toggle to Menu Closed view |

### Menu Closed Header

| Position | Element | Action |
|----------|---------|--------|
| Top Left | Back button | Toggle to Menu Open view |
| Center | "MY MENUS" (title) | - |

---

## Page Specifications

### 1. Home Page (`/`) - Menu Open

**Core Concept:** Think of the weekly plan as a restaurant menu book. Open the menu to see daily details, close it to see all menu books.

**Two View States (within Home Page):**

| State | Description |
|-------|-------------|
| **Menu Open** (default) | Current week's menu open, showing daily detail cards with horizontal swipe |
| **Menu Closed** | Grid of all menu books, each representing one week |

**State Management:** Use `isMenuOpen: boolean` in `useAppStore` to toggle between views.

**States:**

| State | Display |
|-------|---------|
| Empty | "No menu yet" + "Create Menu" button |
| Has Plan | Menu Open view with daily cards |

---

#### Menu Open (Default Home View)

**Purpose:** Display current week's daily meal details with horizontal swipe to browse different days.

**Layout:**
```
┌─────────────────────────────────────┐
│ THIS WEEK                     [⊞]   │
│ Jan 27 – Feb 2                      │
├─────────────────────────────────────┤
│           · · ● · · · ·             │  ← Swipe dots (7 days)
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Monday              [+]       │  │  ← Weekday large + Add button
│  │ January 27                    │  │  ← Date small
│  │ 🍽️ 3 meals  🔥 1,350 cal      │  │
│  ├───────────────────────────────┤  │
│  │ 🌅 BREAKFAST                  │  │
│  │ Scrambled Eggs with Tomato    │  │
│  │ 15 min · 2 servings      320  │  │
│  ├───────────────────────────────┤  │
│  │ ☀️ LUNCH                      │  │
│  │ Chicken Caesar Salad          │  │
│  │ 20 min · 2 servings      450  │  │
│  ├───────────────────────────────┤  │
│  │ 🌙 DINNER                     │  │
│  │ Beef Stir-fry with Rice       │  │
│  │ 30 min · 2 servings      580  │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  [Plan]     [List]     [Me]         │
└─────────────────────────────────────┘
```

**Header:**
- Title: Relative week label (olive green, uppercase, letter-spacing: 2px)
- Subtitle: Date range (gray, small text)
- Grid button (top right) → Toggle to Menu Closed view

**Title Display Logic (Relative Week):**
| Week Offset | Title |
|-------------|-------|
| Current week | "THIS WEEK" |
| -1 week | "LAST WEEK" |
| +1 week | "NEXT WEEK" |
| -2 weeks | "2 WEEKS AGO" |
| -3 weeks | "3 WEEKS AGO" |
| +2 weeks | "IN 2 WEEKS" |
| +3 weeks | "IN 3 WEEKS" |
| ... | Continue pattern |

**Swipe Indicator:**
- 7 small dots representing the week
- Current day highlighted (accent color, elongated)
- Minimal design, no arrows

**Daily Menu Card:**
- **Header:**
  - Weekday (24px bold)
  - Date (13px gray)
  - Stats: "X meals · X cal"
  - **Plus button (top right):** Manually add meal (future feature)
- **Meal Items:**
  - Color-coded icon wrapper (breakfast orange / lunch green / dinner purple)
  - Meal type (uppercase small text)
  - Recipe name (15px bold)
  - Time · Servings
  - Calories (right side, olive green)

**Interactions:**
- Swipe left/right → Change day
- Tap meal → Open Recipe Detail modal
- Tap plus button (top right) → Manually add meal (future)
- Tap grid button (header right) → Toggle to Menu Closed view

---

#### Menu Closed View (Home Page State)

**Purpose:** Display all menu books in a grid. Each book represents one week's plan.

**Layout:**
```
┌─────────────────────────────────────┐
│ [←]  MY MENUS                       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ THIS WEEK   │ │             │   │
│  │ 🥚🥗🥩      │ │ 🍝🍗🥕      │   │
│  │ 🍚🥦🍳      │ │ 🥐🧀🍲      │   │
│  ├─────────────┤ ├─────────────┤   │
│  │ Jan 27-Feb 2│ │ Jan 20-26   │   │
│  │ 18meals·$100│ │ 21meals·$120│   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  ┌─────────────┐ ┌ ─ ─ ─ ─ ─ ─ ┐   │
│  │ 🍜🥟🥬      │ │             │   │
│  │ 🍛🥒🍤      │ │     +       │   │
│  ├─────────────┤ │  New Menu   │   │
│  │ Jan 13-19   │ │             │   │
│  │ 14meals·$80 │ └ ─ ─ ─ ─ ─ ─ ┘   │
│  └─────────────┘                   │
│                                     │
├─────────────────────────────────────┤
│  [Plan]     [List]     [Me]         │
└─────────────────────────────────────┘
```

**Header:**
- Back button → Toggle to Menu Open view
- Title: "MY MENUS"

**Menu Book Card:**
- **Cover:** 
  - Food emoji combination (representing ingredients from that week)
  - Gradient background
- **"THIS WEEK" badge:** Green horizontal bar at top for current week
- **Info Footer:**
  - Date range
  - "X meals · $X"

**New Menu Card:**
- Dashed border
- "+" icon + "New Menu" text
- Tap → Navigate to `/create`

**Interactions:**
- Tap menu book → Load that week's plan and toggle to Menu Open view
- **Long-press menu book → Show delete confirmation dialog**
  - Confirm → Delete MenuBook + associated ShoppingList
  - Cancel → Dismiss dialog
- Tap "New Menu" → Navigate to `/create`
- Tap back button → Toggle to Menu Open view

---

### 2. Shopping Page (`/shopping`)

**Purpose:** View and manage shopping list for the currently selected Menu Book (week).

**Key Concept:** Each Menu Book (weekly menu book) has its own Shopping List. When switching weeks in the Home Page, the Shopping Page shows the corresponding week's list. There is no week switcher on this page — users switch weeks from Home Page.

**Layout:**
```
┌─────────────────────────────────────┐
│ SHOPPING LIST              [+ Add]  │
│ Jan 27 – Feb 2                      │  ← Week indicator (read-only)
├─────────────────────────────────────┤
│ 🥩 Proteins                    [−]  │
│   [ ] Chicken Breast      2 lbs     │
│   [ ] Eggs               12 count   │
├─────────────────────────────────────┤
│ 🥬 Vegetables              [−]      │
│   [✓] Tomatoes           6 count    │
│   ...                               │
├─────────────────────────────────────┤
│  [Plan]     [List]     [Me]         │
└─────────────────────────────────────┘
```

**Header:**
- Title: "SHOPPING LIST" (uppercase, olive green, letter-spacing)
- Subtitle: Date range of current week (e.g., "Jan 27 – Feb 2") — **read-only indicator, no tap action**
- "Add" button (top right)

**Main Content:**
- Categorized item list (collapsible sections)
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

**Empty State (no shopping list for current week):**
- Icon: 🛒
- Text: "No shopping list yet"
- Subtext: "Generate a shopping list from your menu book"

**Interactions:**
- Tap checkbox → Toggle purchased status
- Tap item → Edit name/quantity (inline or modal)
- Tap "Add" button → Show add item input
- Tap category header → Collapse/expand section

**Add Item Flow:**
1. Tap "Add" button
2. Modal appears: Item name input (required), quantity (optional), category dropdown
3. Save → Item added to list with `isManuallyAdded: true`

---

### 3. My Page (`/me`)

**Purpose:** User preferences management.

**Layout:**
- Header: "Profile" (no settings button)
- Main: Preferences section
- Bottom: Navigation bar

**Sections:**

**Preferences Card:**
- Preferences (tags, editable)
- Must-have items (tags, editable)
- Disliked items (tags, editable)
- Default people count
- Default budget
- Default difficulty

**Future: Menu Book History** *(Not in MVP)*
- List of past menu books
- Tap to view details

**Interactions:**
- Tap any preference section → Edit inline or navigate to edit screen
- Changes auto-save to localStorage

---

## Create Plan Flow (`/create`)

**Key Principle:** All progress saved locally in real-time. User can exit anytime and resume from last step.

### Step 1: Welcome + Begin

**Display:**
- Animated food circle (center) - foods rotating/changing in a circle
- Text: "Let's plan meals for next week!"
- "Begin" button (bottom)

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         🍳 🥗 🍜 🥩 🥦              │
│           (animated circle)         │
│                                     │
│                                     │
│    Let's plan meals for next week!  │
│                                     │
│                                     │
│           [ Begin ]                 │
│                                     │
└─────────────────────────────────────┘
```

**Behavior:**
- NO auto-advance
- User must tap "Begin" button to proceed to Step 2
- Animation loops until user taps Begin

**Interactions:**
- Tap "Begin" → Navigate to Step 2

---

### Step 2: Preferences Selection

**Display:**
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


---

### Step 3: Preferred Items

**Display:**
- Header: "Select items you'd like this week"
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

**Data Saved:** `draft.specificPreferences: string[]`

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
🫒 Olives, 🌿 Celery, 🥬 Kale, 🌶️ Jalapeño, 🥒 Pickles
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

**Interactions:**
- Tap item → Toggle selection
- Tap "+" → Open inline input for custom item
- Tap "Next" → Save to draft, navigate to Step 5

**Data Saved:** `draft.specificDisliked: string[]`

---

### Step 5: People, Budget & Difficulty (Inline Sentence Style)

**Design Reference:** [Google Arts & Culture - Food Mood](https://artsandculture.google.com/experiment/food-mood/HwHnGalZ3up0EA?hl=en)

**Display:**
- Single sentence with inline editable values (highlighted in orange accent color)
- Tap on highlighted value to trigger its specific control
- Clean, minimal design with sentence as the focus

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  The menu is for 2 people      │
│  with $100 budget and medium        │
│  difficulty to cook.                │
│                                     │
│         (highlighted values:        │
│          2, $100, medium)           │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│           [ Next ]                  │
│                                     │
└─────────────────────────────────────┘
```

**Sentence Structure:**
```
The menu is for [n] people with $[X] budget and [difficulty] difficulty to cook.
```

- Static text: Primary text color (`#2C2C2C`)
- Editable values: Accent orange color (`#D97706`)

**Inline Controls (appear on tap):**

**People (tap on number):**
```
The menu is for [-] 2 [+] people...
                      ↑
              +/- buttons appear inline
```
- Tap `-` → Decrease (min: 1)
- Tap `+` → Increase (max: 10)
- Tap elsewhere → Hide buttons, show just number

**Budget (tap on $amount):**
```
                    ┌─────────┐
                    │   $90   │
The menu book is... │  $100   │ ...budget and...
                    │  $110   │
                    └─────────┘
                        ↑
              Scrollable picker appears below value
```
- Swipe up/down → Change value
- Range: $50-$500 (step $10)
- Tap elsewhere → Dismiss picker

**Difficulty (tap on difficulty word):**
```
                              ┌─────────┐
                              │  Easy   │
...budget and medium diff...  │ Medium  │  ← selected (highlighted)
                              │  Hard   │
                              └─────────┘
                                  ↑
              Dropdown list appears below value
```
- Tap option → Select and dismiss
- Tap elsewhere → Dismiss without change

**Visual States:**

| State | Appearance |
|-------|------------|
| Default | Value in orange accent color, underlined or bold |
| Hover/Focus | Slightly darker, cursor indicates tappable |
| Editing | Control visible, value highlighted with background |

**Defaults:**
- People: 2
- Budget: $100
- Difficulty: Medium

**Interactions:**
- Tap highlighted value → Show its control
- Tap elsewhere / select value → Dismiss control
- Tap "Next" → Save to draft, navigate to Step 6

**Data Saved:** `draft.numPeople`, `draft.budget`, `draft.difficulty`

---

### Step 6: Schedule Grid

**Display:**
- Header: "Choose meals to plan"
- Subheader hint: "Select at least one meal to continue"
- Quick actions: "Select All" and "Deselect All" buttons
- Content: 7×3 grid (days × meals)
- Footer: "Generate Plan" button (disabled until at least 1 meal selected)

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│    Choose meals to plan             │
│    Select at least one meal         │
│                                     │
│    [Select All]  [Deselect All]     │
│                                     │
│           B      L      D           │
│  ─────────────────────────────────  │
│  Mon      [○]    [●]    [●]         │
│  Jan 27                             │
│                                     │
│  Tue      [○]    [●]    [●]         │
│  Jan 28                             │
│                                     │
│  Wed      [○]    [●]    [●]         │
│  Jan 29                             │
│                                     │
│  Thu      [○]    [●]    [●]         │
│  Jan 30                             │
│                                     │
│  Fri      [○]    [●]    [●]         │
│  Jan 31                             │
│                                     │
│  Sat      [●]    [●]    [●]         │
│  Feb 1                              │
│                                     │
│  Sun      [●]    [●]    [○]         │
│  Feb 2                              │
│                                     │
│        [ Generate Plan ]            │
│                                     │
└─────────────────────────────────────┘

○ = Unselected (border only)
● = Selected (filled with accent color)
```

**Quick Action Buttons:**
- "Select All" → Select all 21 meal slots
- "Deselect All" → Deselect all meal slots

**Validation:**
- At least 1 meal must be selected
- "Generate Plan" button disabled (grayed out) if no meals selected

**Interactions:**
- Tap cell → Toggle selection (unselected ↔ selected)
- Tap "Select All" → All cells become selected
- Tap "Deselect All" → All cells become unselected
- Tap "Generate Plan" (when enabled) → Save draft, navigate to Step 7

**Data Saved:** `draft.cookSchedule: CookSchedule`

---

### Step 7: Generating (Loading)

**Display:**
- Animated chef cooking different foods (center)
- Text: "Generating your menu book..."
- Progress indicator or elapsed time (optional)
- Secondary button: "Go to Home" (bottom, appears after minimum wait)
- Subtext: "Don't worry, we'll keep working on it in the background"

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│         👨‍🍳 (animated)              │
│                                     │
│    Generating your menu book...     │
│                                     │
│         ⏱️ 0:45                      │
│                                     │
│                                     │
│                                     │
│          [ Go to Home ]             │
│    We'll keep working in background │
│                                     │
└─────────────────────────────────────┘
```

**Minimum Wait Time:** 1 minute

The "Go to Home" button and success navigation are blocked until at least 1 minute has passed, even if API returns faster. This sets user expectations appropriately.

**API Call:**
```typescript
const menuBook = await api.generateMenuBook({
  specificPreferences: draft.specificPreferences,
  specificDisliked: draft.specificDisliked,
  numPeople: draft.numPeople,
  budget: draft.budget,
  difficulty: draft.difficulty,
  cookSchedule: draft.cookSchedule,
});
```

**Behavior:**
- Start timer when entering step
- Call API immediately
- Wait for BOTH: API success AND minimum 1 minute elapsed
- On success (after min wait) → Navigate to Step 8
- On timeout (2 minutes) → Show error message
- User taps "Go to Home" → Return to Home (MVP: generation stops)

**Error Message (after 2 min):**
"It's taking longer than usual. Please try again."

---

### Step 8: Plan Generated (Reuse Menu Open + Dual Buttons)

**Display:**
- Reuse Menu Open daily card design
- Left/right swipe to browse different days
- Bottom: Two side-by-side buttons: Modify | Shopping List

**Layout:**
```
┌─────────────────────────────────────┐
│ [←]  YOUR NEW MENU                  │
├─────────────────────────────────────┤
│           · ● · · · · ·             │  ← Swipe dots
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Monday              [+]       │  │
│  │ January 27                    │  │
│  │ 🍽️ 3 meals  🔥 1,350 cal      │  │
│  ├───────────────────────────────┤  │
│  │ 🌅 BREAKFAST                  │  │
│  │ Scrambled Eggs with Tomato    │  │
│  │ 15 min · 2 servings      320  │  │
│  ├───────────────────────────────┤  │
│  │ ☀️ LUNCH                      │  │
│  │ Chicken Caesar Salad          │  │
│  │ 20 min · 2 servings      450  │  │
│  ├───────────────────────────────┤  │
│  │ 🌙 DINNER                     │  │
│  │ Beef Stir-fry with Rice       │  │
│  │ 30 min · 2 servings      580  │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ [💬 Modify]    [🛒 Shopping List]   │  ← Dual buttons, equal width
└─────────────────────────────────────┘
```

**Header:**
- Back button (←) → Return to Home (discard new plan)
- Title: "YOUR NEW MENU" (uppercase, letter-spacing)

**Daily Card:**
- Same design as Menu Open
- Left/right swipe to browse 7 days

**Bottom Actions (Dual Buttons):**

| Button | Style | Action |
|--------|-------|--------|
| 💬 Modify | Secondary (white bg, gray border) | Open modification input modal |
| 🛒 Shopping List | Primary (olive green) | Generate shopping list → Step 10 |

**Button CSS:**
```css
/* Container */
.bottom-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px 36px;
}

/* Both buttons equal width */
.action-btn {
  flex: 1;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

/* Modify - Secondary */
.action-btn.secondary {
  background: #FFFFFF;
  color: #2C2C2C;
  border: 1px solid #EEEBE6;
}

/* Shopping List - Primary */
.action-btn.primary {
  background: #8B9469;
  color: white;
  border: none;
}
```

**Modify Plan Flow:**
1. Tap "💬 Modify"
2. Chat input modal appears
3. Character limit: 200 characters
4. On submit → Navigate to Step 7 (loading)
5. After plan regeneration → Return to Step 8

**API Call (Modification):**
```typescript
// 1. Modify plan
const modifiedPlan = await api.modifyMenuBook(
  currentPlan.id,
  modificationText,
  currentPlan
);

// 2. Auto-regenerate shopping list (when user clicks Shopping List button)
const shoppingList = await api.generateShoppingList(
  modifiedPlan.id,
  modifiedPlan
);
```

**Interactions:**
- Tap back (←) → Return to Home (confirm discard?)
- Swipe left/right → Navigate between days
- Tap any meal → Open Recipe Detail modal (Step 9)
- Tap "Modify" → Show chat input modal
- Tap "Shopping List" → **User confirms plan and triggers Shopping List generation** → Navigate to Step 10

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
┌─────────────────────────────────────┐
│ ✕                        📝  🗑️     │
├─────────────────────────────────────┤
│ Scrambled Eggs with Tomato          │
│                                     │
│ ⏱️ 15 min  👥 2  📊 Easy  🔥 180 cal │
├─────────────────────────────────────┤
│ Ingredients                         │
│ • 4 eggs                            │
│ • 2 tomatoes                        │
│ • 1 tbsp vegetable oil              │
│ • Salt                              │
├─────────────────────────────────────┤
│ Instructions                        │
│ 1. Beat eggs with a pinch of salt   │
│ 2. Dice tomatoes                    │
│ 3. Heat oil in pan over medium heat │
│ 4. Scramble eggs until just set     │
│ 5. Add tomatoes, mix gently, serve  │
├─────────────────────────────────────┤
│ Notes                        [Edit] │
│ Add a pinch of sugar for            │
│ better taste.                       │
└─────────────────────────────────────┘
```

**Interactions:**
- Tap X → Close modal, return to previous view
- Tap Edit Notes → Inline text editor for notes field
- Tap Delete → Confirm dialog → Remove meal from plan

---

### Step 10: Shopping List Loading

**Display:**
- Animated shopping cart with foods being added
- Text: "Generating your shopping list..."

**API Call:**
```typescript
const shoppingList = await api.generateShoppingList(
  currentPlan.id,
  currentPlan
);
```

**Behavior:**
- On success → Navigate to Shopping Page
- On error → Show error message + retry option
- Timeout: 2 minutes

---

### Step 11: Shopping List Result

Navigates to **Shopping Page** (`/shopping`) with newly generated list.

---

## State Persistence

### Draft Auto-Save

Every step change saves to localStorage via Zustand persist middleware:

```typescript
// Automatically persisted to localStorage key: 'omenu-draft'
useDraftStore.getState().setStep(3);
useDraftStore.getState().setSpecificPreferences(['Healthy', 'Chinese']);
```

### Resume Logic

**Important:** User always lands on Home page when opening the app.

Resume only happens when user navigates to `/create`:

```typescript
// On navigate to /create
const draft = useDraftStore.getState();
if (draft.currentStep > 1) {
  // Show resume prompt: "Continue where you left off?"
  // If yes → Navigate to draft.currentStep with pre-filled data
  // If no → Call resetDraft() and start fresh from Step 1
}
```

### Clear Draft

After successful plan generation (Step 8 loads):

```typescript
useDraftStore.getState().resetDraft();
```

---

## Error Handling

| Scenario | Timeout | User Feedback | Action |
|----------|---------|---------------|--------|
| API timeout | 2 min | "Taking longer than usual. Please try again." | Show "Try Again" button |
| API error | - | "Something went wrong" | Show "Try Again" button |
| Invalid response | - | "Couldn't process the response" | Show "Try Again" button |
| Network offline | - | "No internet connection" | Show retry when back online |

**Timeout Configuration:**
- Meal plan generation: 2 minutes
- Meal plan modification: 2 minutes  
- Shopping list generation: 2 minutes

---

## Menu Book Navigation (v3.5)

The Menu Open ↔ Menu Closed navigation uses internal state, not routes.

**Navigation Pattern:**
- Home (`/`) → Menu Open (default, current week)
- Tap grid button → Toggle to Menu Closed view (same route)
- Tap menu book → Load that week + Toggle to Menu Open view
- Tap back button → Toggle to Menu Open view

**State Management:**

```typescript
// In useAppStore
isMenuOpen: boolean;  // true = Menu Open view, false = Menu Closed view
setIsMenuOpen: (open: boolean) => void;
toggleMenuView: () => void;
```

**Route Structure:**

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Menu Open/Closed views (toggle via state) |
| `/shopping` | `ShoppingPage` | Shopping list |
| `/me` | `MyPage` | User preferences |
| `/create` | `CreatePlanPage` | 8-step create flow |

**Store for Menu Books (Each Week)**

```typescript
interface MenuBookState {
  menuBooks: MenuBook[];
  currentWeekId: string | null;
  addMenuBook: (book: MenuBook) => void;
  setCurrentWeek: (id: string) => void;
  updateShoppingList: (weekId: string, shoppingList: ShoppingList) => void;
}

interface MenuBook {
  id: string;
  weekStartDate: string;  // ISO date string
  weekEndDate: string;
  menuBook: MenuBook;
  shoppingList: ShoppingList | null;  // One-to-one relationship with MenuBook
  createdAt: string;
}
```

**Note:** Each MenuBook has a one-to-one relationship with a ShoppingList. When a menu book is modified, the shopping list should be regenerated.
```

**Note:** v3.5 uses `isMenuOpen` state to toggle between Menu Open and Menu Closed views within the Home Page. There is no separate `/menus` route.
