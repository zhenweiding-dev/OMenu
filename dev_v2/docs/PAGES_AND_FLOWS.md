# Pages and User Flows

## App Structure (v3.4 - Menu Book Concept)

```
App
├── Home Page (/) - Menu Book
│   ├── Menu Open (default) - 当周每日详情，左右滑动
│   └── Menu Closed - 所有菜单本网格
├── Shopping Page (/shopping)
├── My Page (/me)
└── Create Plan Flow (/create)
    ├── Step 1: Welcome + Begin
    ├── Step 2: Keywords
    ├── Step 3: Must-Have Items
    ├── Step 4: Disliked Items
    ├── Step 5: People & Budget (Sentence Style)
    ├── Step 6: Schedule Grid
    ├── Step 7: Generating (Loading)
    ├── Step 8: Plan Generated (复用 Menu Open + 双按钮)
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
| Top Right | Grid icon button | Navigate to Menu Closed view |

### Menu Closed Header

| Position | Element | Action |
|----------|---------|--------|
| Top Left | Back button | Return to Menu Open |
| Center | "MY MENUS" (title) | - |

---

## Page Specifications

### 1. Home Page (`/`) - Menu Book

**Core Concept:** 将周计划比作一本餐厅菜单，打开菜单看每日详情，关闭菜单看所有菜单本。

**Two View States:**

| State | Description |
|-------|-------------|
| **Menu Open** (default) | 当周菜单打开，展示每日详情卡片，左右滑动切换日期 |
| **Menu Closed** | 所有菜单本网格，每本代表一周，点击打开 |

**States:**

| State | Display |
|-------|---------|
| Empty | "No menu yet" + "Create Menu" button |
| Has Plan | Menu Open view with daily cards |
| Menu Closed | Grid of all menu books |

---

#### Menu Open (Default Home View)

**Purpose:** 展示当周每日餐食详情，左右滑动浏览不同日期。

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
- Title: "THIS WEEK" (绿色大写, letter-spacing: 2px)
- Subtitle: Date range (灰色小字)
- Grid button (右上角) → 进入 Menu Closed

**Swipe Indicator:**
- 7 个小圆点代表一周
- 当前日期高亮 (accent 色, 拉长)
- 极简设计，无箭头

**Daily Menu Card:**
- **Header:**
  - 周几 (24px 粗体)
  - 日期 (13px 灰色)
  - 统计: "X meals · X cal"
  - **右上角 + 按钮**: 手动添加餐
- **Meal Items:**
  - 彩色图标 (早餐橙 / 午餐绿 / 晚餐紫)
  - 餐类型 (大写小字)
  - 菜名 (15px 粗体)
  - 时间 · 份数
  - 卡路里 (右侧绿色)

**Interactions:**
- 左右滑动 → 切换日期
- 点击餐食 → 打开 Recipe Detail modal
- 点击右上角 + 按钮 → 手动添加餐 (future)
- 点击右上角网格按钮 → 进入 Menu Closed

---

#### Menu Closed (All Menus Grid)

**Purpose:** 展示所有菜单本，每本代表一周计划。

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
- Back button → Return to Menu Open
- Title: "MY MENUS"

**Menu Book Card:**
- **Cover:** 
  - 食物 emoji 组合 (展示当周出现的食材)
  - 渐变背景
- **THIS WEEK 标签:** 当前周顶部绿色横条
- **Info Footer:**
  - 日期范围
  - "X meals · $X"

**Add New Card:**
- 虚线边框
- "+" 图标 + "New Menu" 文字
- 点击 → Navigate to `/create`

**Interactions:**
- 点击菜单本 → 打开该周 (Menu Open)
- 点击 "New Menu" → Navigate to `/create`
- 点击返回 → Return to Menu Open

---

### 2. Shopping Page (`/shopping`)

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

### 3. My Page (`/me`)

**Purpose:** User preferences management.

**Layout:**
- Header: "Profile" (no settings button)
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

**Future: Meal Plan History** *(Not in MVP)*
- List of past meal plans
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

**Data Saved:** `draft.dislikedItems: string[]`

---

### Step 5: People, Budget & Difficulty (Inline Sentence Style)

**Design Reference:** [Google Arts & Culture - Food Mood](https://artsandculture.google.com/experiment/food-mood/HwHnGalZ3up0EA?hl=en)

**Display:**
- Single sentence with inline editable values (highlighted in accent color)
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
│  The meal plan is for 2 people      │
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
The meal plan is for [n] people with $[X] budget and [difficulty] difficulty to cook.
```

- Static text: Primary text color (`#2C2C2C`)
- Editable values: Accent color (`#8B9469` or orange like reference)

**Inline Controls (appear on tap):**

**People (tap on number):**
```
The meal plan is for [-] 2 [+] people...
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
The meal plan is... │  $100   │ ...budget and...
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
| Default | Value in accent color, underlined or bold |
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
- Text: "Generating your meal plan..."
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
│    Generating your meal plan...     │
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
const mealPlan = await api.generateMealPlan({
  keywords: draft.keywords,
  mustHaveItems: draft.mustHaveItems,
  dislikedItems: draft.dislikedItems,
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

### Step 8: Plan Generated (复用 Menu Open + 双按钮)

**Display:**
- 复用 Menu Open 的每日卡片设计
- 左右滑动浏览不同日期
- 底部两个并排按钮：Modify | Shopping List

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
│ [💬 Modify]    [🛒 Shopping List]   │  ← 双按钮，同等权重
└─────────────────────────────────────┘
```

**Header:**
- Back button (←) → Return to Home (discard new plan)
- Title: "YOUR NEW MENU" (大写, letter-spacing)

**Daily Card:**
- 与 Menu Open 完全相同
- 左右滑动浏览 7 天

**Bottom Actions (双按钮):**

| Button | Style | Action |
|--------|-------|--------|
| 💬 Modify | Secondary (白底灰边) | 打开修改输入框 |
| 🛒 Shopping List | Primary (绿色) | 生成购物清单 → Step 10 |

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
const modifiedPlan = await api.modifyMealPlan(
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
- Tap "Shopping List" → Navigate to Step 10
- Tap "Modify Plan" → Show chat input
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
// Automatically persisted to localStorage key: 'omenu_meal_plan_draft'
useDraftStore.getState().setStep(3);
useDraftStore.getState().setKeywords(['Healthy', 'Chinese']);
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

## Menu Book State (v3.4)

The Menu Open ↔ Menu Closed state is managed in navigation, not stored in global state.

**Navigation Pattern:**
- Home (`/`) → Menu Open (default)
- Click grid button → Navigate to Menu Closed view (could be `/menus` or modal)
- Click menu book → Return to Menu Open with selected week
- Click back → Return to Menu Open

**Optional: Store for Multiple Menu Books**

```typescript
interface MenuBookState {
  menuBooks: MenuBook[];
  currentWeekId: string | null;
  addMenuBook: (book: MenuBook) => void;
  setCurrentWeek: (id: string) => void;
}

interface MenuBook {
  id: string;
  weekStartDate: string;  // ISO date string
  weekEndDate: string;
  mealPlan: MealPlan;
  createdAt: string;
}
```

**Note:** v3.4 移除了 `viewMode: 'daily' | 'plan'` 状态，因为不再有 Daily View / Plan View 切换。
