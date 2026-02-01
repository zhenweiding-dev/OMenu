# UI Design Specification

## Design Philosophy

- **Warm & Inviting**: Paper-like neutral tones that feel natural and calming
- **Clean & Minimal**: Black line art on off-white background, no visual clutter
- **Consistent**: Unified component styles across all pages

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Paper | `#FAF9F7` | App background |
| Paper Dark | `#F5F4F1` | Secondary backgrounds, empty state icons |
| Card White | `#FFFFFF` | Cards, modals, bottom nav |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary Text | `#2C2C2C` | Headings, body text |
| Secondary Text | `#7A7A7A` | Subtitles, hints, meta info |
| Disabled Text | `#B5B5B5` | Disabled states, placeholders, inactive icons |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Accent (Olive Green) | `#8B9469` | Primary buttons, active nav, selected states |
| Accent Light | `#A8AD8B` | Hover states, secondary accents |
| Accent Orange | `#D97706` | Inline editable values (Step 5 sentence) |
| Accent Orange Light | `#FEF3E2` | Selected option background |
| Success | `#6B9B76` | Checkmarks, success states |
| Error | `#C67B7B` | Error messages, delete actions |

### Dividers & Borders

| Name | Hex | Usage |
|------|-----|-------|
| Divider | `#EEEBE6` | Card borders, section dividers |
| Tag Border | `#D4D0C8` | Unselected tag borders |
| Tag Selected Border | `#A68A64` | Selected tag borders |

### Tag Colors

| State | Background | Border | Text |
|-------|------------|--------|------|
| Unselected | `transparent` | `#D4D0C8` | `#7A7A7A` |
| Selected | `#F0EBE3` | `#A68A64` | `#8B9469` |

---

## Typography

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Page Header | 12-13px | 600 | "THIS WEEK", "MY MENUS" (uppercase, letter-spacing: 1.5-2px) |
| Weekday Title | 24px | 700 | Daily card weekday (e.g., "Monday") |
| H2 | 22px | 600 | Create flow headers |
| H3 | 16px | 600 | Section titles |
| Body | 15px | 600 | Meal names |
| Body Small | 13px | 400 | Date, secondary info |
| Caption | 12px | 400 | Meta info (time, difficulty), date range |
| Meal Type | 11px | 600 | "BREAKFAST", "LUNCH", "DINNER" (uppercase) |
| Nav Label | 10px | 500 | Bottom nav labels |
| Stats | 11px | 400 | "X meals · $X" |

### Header Typography (v3.4)

```css
/* Page Title - e.g., "THIS WEEK" */
.header-title {
  font-size: 12px;
  font-weight: 600;
  color: #8B9469;  /* accent color */
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Page Subtitle - e.g., "Jan 27 – Feb 2" */
.header-subtitle {
  font-size: 11px;
  color: #7A7A7A;
  margin-top: 4px;
}
```

### Daily Card Header Typography (v3.4)

```css
/* Weekday - Large */
.daily-menu-weekday {
  font-size: 24px;
  font-weight: 700;
  color: #2C2C2C;
  letter-spacing: -0.5px;
}

/* Date - Small */
.daily-menu-date {
  font-size: 13px;
  color: #7A7A7A;
  margin-top: 2px;
}

/* Meta Stats */
.daily-menu-meta {
  font-size: 12px;
  color: #7A7A7A;
  margin-top: 10px;
}
```

### Line Heights

- Headings: 1.2
- Body: 1.5
- Compact (tags, buttons): 1.3

---

## Iconography

### Icon Libraries

| Type | Source | Notes |
|------|--------|-------|
| UI Icons | [Lucide](https://lucide.dev) | Navigation, actions, controls |
| Food Icons | [SVG Repo](https://svgrepo.com) | Ingredients, food items (line style) |

### Icon Style

- **Stroke width**: 1.8px
- **Color**: `#2C2C2C` (primary text color)
- **Size standards**:
  - Bottom Navigation: 22px
  - Header actions: 22px
  - Inline icons: 16px
  - Food item icons: 32px (in selection lists)

### Common UI Icons (Lucide)

| Action | Icon Name |
|--------|-----------|
| Add | `Plus` |
| Close | `X` |
| Back | `ChevronLeft` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Check | `Check` |
| Expand | `ChevronDown` |
| Collapse | `ChevronUp` |
| Settings | `Settings` |
| Time | `Clock` |
| Servings | `Users` |
| Calories | `Flame` |
| Menu | `Menu` (3 horizontal lines) |

### Bottom Navigation Icons (v3.4)

The bottom nav uses icons that reflect the app's menu book concept:

| Tab | Icon | Description |
|-----|------|-------------|
| Plan | Book | Represents meal plan as a menu book |
| List | Checklist | Shopping list with checkmarks |
| Me | Person | User profile and preferences |

**Icon Specifications:**
- Size: 22px × 22px
- Stroke width: 1.8px
- Active color: `#8B9469` (accent)
- Inactive color: `#B5B5B5` (disabled text)

**SVG Code:**

Plan (Book):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

List (Checklist):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
  <rect x="9" y="3" width="6" height="4" rx="1"/>
  <path d="M9 12l2 2 4-4"/>
</svg>
```

Me (Person):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <circle cx="12" cy="8" r="4"/>
  <path d="M20 21a8 8 0 10-16 0"/>
</svg>
```

---

## Spacing System

Use 4px base unit:

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing between related elements |
| sm | 8px | Default gap between small elements |
| md | 16px | Standard padding, margins |
| lg | 24px | Section spacing |
| xl | 32px | Page padding, large gaps |
| xxl | 48px | Major section separations |

---

## Components

### Buttons

**Primary Button:**
```css
background: #8B9469;
color: #FFFFFF;
border: none;
border-radius: 8px;
padding: 14px 28px;
font-size: 15px;
font-weight: 500;
```

**Secondary Button:**
```css
background: transparent;
color: #2C2C2C;
border: 1px solid #2C2C2C;
border-radius: 8px;
padding: 14px 28px;
font-size: 15px;
font-weight: 500;
```

**Text Button:**
```css
background: transparent;
color: #8B9469;
padding: 8px 16px;
font-weight: 500;
```

### Cards

```css
background: #FFFFFF;
border-radius: 12px;
padding: 16px;
border: 1px solid #EEEBE6;
```

Note: Cards use a subtle border instead of shadow for a cleaner, paper-like feel.

### Daily Menu Card (v3.4)

The main card showing a single day's meals.

```css
/* Card Container */
.daily-menu-card {
  background: #FFFFFF;
  border-radius: 20px;  /* More rounded */
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #EEEBE6;
}

/* Card Header */
.daily-menu-header {
  padding: 20px 20px 16px;
  background: #F8F6F2;  /* Slightly darker than card */
  border-bottom: 1px solid #EEEBE6;
  position: relative;
}

/* Add Meal Button (top right of header) */
.add-meal-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1.5px dashed #D4D0C8;
  background: white;
}

/* Meal Item Row */
.meal-item {
  padding: 14px 20px;
  border-bottom: 1px solid #EEEBE6;
  display: flex;
  gap: 14px;
  align-items: center;
}

/* Meal Icon Wrapper */
.meal-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* Meal Icon Colors */
.meal-icon-wrapper.breakfast { background: #FEF3E2; }  /* Warm orange */
.meal-icon-wrapper.lunch { background: #E8F5E9; }     /* Light green */
.meal-icon-wrapper.dinner { background: #EDE7F6; }    /* Light purple */

/* Calories (right side) */
.meal-calories {
  font-size: 13px;
  font-weight: 600;
  color: #8B9469;
}
```

### Menu Book Card (v3.4)

Cards in the Menu Closed grid view.

```css
/* Menu Book Container */
.menu-book {
  background: #FFFFFF;
  border-radius: 16px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #EEEBE6;
  overflow: hidden;
}

/* Cover Area */
.menu-book-cover {
  flex: 1;
  background: linear-gradient(145deg, #FAF8F5 0%, #F0EDE8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
}

/* Food Emoji Grid */
.food-icons {
  font-size: 22px;
  line-height: 1.4;
  text-align: center;
}

/* Info Footer */
.menu-book-info {
  padding: 12px 14px;
  background: white;
  border-top: 1px solid #EEEBE6;
}

/* Current Week Badge */
.menu-book.current::before {
  content: 'THIS WEEK';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #8B9469;
  color: white;
  font-size: 9px;
  padding: 5px 0;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Add New Card */
.menu-book.add-new {
  border: 2px dashed #EEEBE6;
  background: transparent;
  box-shadow: none;
}
```

### Bottom Action Buttons (v3.4)

Used in Step 8 (Plan Generated) with two equal-weight buttons.

```css
/* Container */
.bottom-actions {
  padding: 16px 20px 36px;
  border-top: 1px solid #EEEBE6;
  display: flex;
  gap: 12px;
}

/* Both buttons */
.action-btn {
  flex: 1;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Secondary (Modify) */
.action-btn.secondary {
  background: #FFFFFF;
  color: #2C2C2C;
  border: 1px solid #EEEBE6;
}

/* Primary (Shopping List) */
.action-btn.primary {
  background: #8B9469;
  color: white;
  border: none;
}
```

### Swipe Indicator (v3.4)

Minimal dots indicating swipeable days.

```css
.swipe-indicator {
  display: flex;
  justify-content: center;
  padding: 8px 0 14px;
}

.swipe-dots {
  display: flex;
  gap: 5px;
}

.swipe-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #EEEBE6;
}

.swipe-dot.active {
  background: #8B9469;
  width: 16px;
  border-radius: 2.5px;
}
```

### Input Fields

```css
background: #FFFFFF;
border: 1px solid #D4D0C8;
border-radius: 8px;
padding: 12px 16px;
font-size: 15px;
color: #2C2C2C;

/* Placeholder */
color: #B5B5B5;

/* Focus state */
border-color: #8B9469;
outline: none;
```

### Tags/Chips (Compact Style)

Tags use a compact, minimal style with transparent background and subtle borders.

**Unselected:**
```css
background: transparent;
color: #7A7A7A;
border: 1px solid #D4D0C8;
border-radius: 6px;
padding: 6px 12px;
font-size: 13px;
```

**Selected:**
```css
background: #F0EBE3;
color: #8B9469;
border: 1px solid #A68A64;
font-weight: 500;
```

**Hover (unselected):**
```css
border-color: #A8AD8B;
color: #2C2C2C;
```

**Layout Notes:**
- Tags are grouped by category with section labels
- Section labels: `font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #7A7A7A;`
- Gap between tags: 8px
- Padding in container: 16px 20px

### Checkboxes (Shopping List)

```css
/* Unchecked */
width: 22px;
height: 22px;
border: 1.5px solid #B5B5B5;
border-radius: 4px;
background: transparent;

/* Checked */
background: #6B9B76;
border-color: #6B9B76;
/* Show white checkmark icon */
```

### Vertical Scroll Picker (Budget, Difficulty)

```css
/* Container */
height: 120px;
overflow: hidden;
position: relative;

/* Selection highlight area */
background: #F0EBE3;
border-radius: 8px;
height: 40px;
position: absolute;
top: 50%;
transform: translateY(-50%);

/* Option text */
font-size: 18px;
line-height: 40px;
text-align: center;

/* Selected option */
color: #2C2C2C;
font-weight: 600;

/* Non-selected options */
color: #B5B5B5;
font-weight: 400;
```

Visual example:
```
    ┌─────────────┐
    │    $90      │  ← dimmed (#B5B5B5)
    ├─────────────┤
    │   $100      │  ← selected (highlighted bg #F0EBE3)
    ├─────────────┤
    │   $110      │  ← dimmed (#B5B5B5)
    └─────────────┘
```

### Inline Add Input (for tags)

```css
/* Container - appears as a tag with dashed border */
background: transparent;
border: 1px dashed #D4D0C8;
border-radius: 6px;
padding: 6px 10px;
display: inline-flex;
align-items: center;
gap: 4px;
color: #7A7A7A;
font-size: 13px;

/* Plus icon */
width: 14px;
height: 14px;
stroke: #7A7A7A;
stroke-width: 2;

/* Expanded input state */
border-style: solid;
border-color: #8B9469;

/* Input field */
border: none;
background: transparent;
font-size: 13px;
width: 100px;
max-length: 20;
color: #2C2C2C;

/* Character count hint */
font-size: 10px;
color: #B5B5B5;
```

### Inline Sentence Controls (Step 5)

**Design Reference:** [Google Arts & Culture - Food Mood](https://artsandculture.google.com/experiment/food-mood/HwHnGalZ3up0EA?hl=en)

**Sentence Text:**
```css
/* Static text */
font-size: 24px;
font-weight: 500;
line-height: 1.6;
color: #2C2C2C;

/* Editable value (highlighted) */
color: #D97706; /* Orange accent, or use #8B9469 for olive */
font-weight: 600;
cursor: pointer;
transition: opacity 0.15s ease;

/* Editable value - hover */
opacity: 0.8;
```

**People Counter (inline +/- buttons):**
```css
/* Container - appears inline when tapped */
display: inline-flex;
align-items: center;
gap: 8px;

/* +/- buttons */
width: 28px;
height: 28px;
border-radius: 6px;
background: #F0EBE3;
border: 1px solid #D4D0C8;
color: #2C2C2C;
font-size: 18px;
cursor: pointer;

/* Number display */
min-width: 24px;
text-align: center;
font-weight: 600;
color: #D97706;
```

**Budget Picker (scrollable dropdown):**
```css
/* Dropdown container */
position: absolute;
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
padding: 8px 0;
max-height: 180px;
overflow-y: auto;
min-width: 100px;

/* Option item */
padding: 10px 16px;
font-size: 18px;
color: #7A7A7A;
cursor: pointer;
text-align: center;

/* Option item - selected */
color: #D97706;
font-weight: 600;
background: #FEF3E2;

/* Option item - hover */
background: #F5F4F1;
```

**Difficulty Dropdown:**
```css
/* Same as Budget Picker styles */
/* Options: Easy, Medium, Hard */
```

**Animation:**
```css
/* Dropdown appear */
animation: dropdownFadeIn 0.15s ease-out;

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Bottom Navigation

```css
background: #FFFFFF;
border-top: 1px solid #EEEBE6;
padding: 8px 0 28px 0; /* Extra bottom for safe area */

/* Tab item */
display: flex;
flex-direction: column;
align-items: center;
gap: 4px;

/* Tab icon */
width: 22px;
height: 22px;
stroke-width: 1.8;

/* Tab label */
font-size: 11px;

/* Active state */
color: #8B9469;
font-weight: 500;

/* Inactive state */
color: #B5B5B5;
```

### Modal/Floating Window

```css
background: #FFFFFF;
border-radius: 24px 24px 0 0; /* Bottom sheet style */
/* Or full modal: */
border-radius: 24px;
box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
```

---

## Layout Patterns

### Page Layout

```
┌─────────────────────────┐
│       Header (56px)     │
├─────────────────────────┤
│                         │
│                         │
│      Main Content       │
│    (scrollable area)    │
│                         │
│                         │
├─────────────────────────┤
│   Bottom Nav (60px+)    │
└─────────────────────────┘
```

### Create Flow Step Layout

```
┌─────────────────────────┐
│                         │
│    Background Image     │
│    (top 40% of screen)  │
│                         │
├─────────────────────────┤
│      Header Text        │
├─────────────────────────┤
│                         │
│    Selection Content    │
│    (scrollable tags)    │
│                         │
├─────────────────────────┤
│ [Custom Input] [Add]    │
├─────────────────────────┤
│      [Next Button]      │
│         (fixed)         │
└─────────────────────────┘
```

### Schedule Grid (Step 6)

```
┌─────────────────────────────────────────┐
│              B      L      D            │
├─────────────────────────────────────────┤
│ Mon         [○]    [●]    [●]           │
│ Jan 27                                  │
│                                         │
│ Tue         [○]    [●]    [●]           │
│ Jan 28                                  │
│                                         │
│ Wed         [○]    [●]    [●]           │
│ Jan 29                                  │
│                                         │
│ Thu         [○]    [●]    [●]           │
│ Jan 30                                  │
│                                         │
│ Fri         [○]    [●]    [●]           │
│ Jan 31                                  │
│                                         │
│ Sat         [●]    [●]    [●]           │
│ Feb 1                                   │
│                                         │
│ Sun         [●]    [●]    [○]           │
│ Feb 2                                   │
└─────────────────────────────────────────┘

○ = Unselected (border only)
● = Selected (filled with accent color)

- Day name: 16px, font-weight 500
- Date: 12px, color: secondary-text (#666666)
```

---

## Animation Guidelines

### Transitions

| Type | Duration | Easing |
|------|----------|--------|
| Page navigation | 300ms | ease-in-out |
| Modal open/close | 250ms | ease-out |
| Button press | 100ms | ease-in |
| Tag selection | 150ms | ease-out |

### Loading Animations

**Step 7 (Generating Plan):**
- Animated chef character
- Cooking motion with different food items appearing
- Loop duration: 2-3 seconds

**Step 10 (Generating Shopping List):**
- Shopping cart icon
- Food items flying into cart
- Loop duration: 2 seconds

### Micro-interactions

- Button press: Scale down to 0.98
- Tag select: Brief scale up to 1.05, then back
- Checkbox: Checkmark draws in with slight bounce
- Card tap: Subtle lift shadow increase

---

## Responsive Considerations

### Mobile First (Primary)

- Target width: 375px - 428px
- Touch targets: Minimum 44px × 44px
- Thumb-friendly bottom navigation

### Tablet/Desktop (Secondary)

- Max content width: 600px (centered)
- Larger touch targets not required
- Consider side navigation for desktop

---

## Accessibility

- Color contrast: Minimum 4.5:1 for text
- Touch targets: Minimum 44px
- Focus states: Visible outline for keyboard navigation
- Screen reader: Proper labels on all interactive elements

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
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
        'accent-orange': '#D97706',       // For inline sentence values
        'accent-orange-light': '#FEF3E2', // For selected option background
        success: '#6B9B76',
        error: '#C67B7B',
        divider: '#EEEBE6',
        'tag-border': '#D4D0C8',
        'tag-selected-bg': '#F0EBE3',
        'tag-selected-border': '#A68A64',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'tag': '6px',
        'modal': '24px',
      },
      spacing: {
        'safe-bottom': '28px',
      },
      fontSize: {
        'nav-label': '11px',
        'section-label': '11px',
        'tag': '13px',
        'sentence': '24px', // For Step 5 sentence
      }
    }
  }
}
```
