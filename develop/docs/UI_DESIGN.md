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
| H1 | 26px | 600 | Page titles (e.g., "OMenu") |
| H2 | 22px | 600 | Create flow headers |
| H3 | 16px | 600 | Card titles (day names) |
| Body | 15px | 400 | Regular text, meal names |
| Body Small | 13px | 400 | Secondary info, calories |
| Caption | 12px | 400 | Meta info (time, difficulty) |
| Nav Label | 11px | 400/500 | Bottom nav labels |
| Section Label | 11px | 400 | Tag group labels (uppercase) |

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

### Bottom Navigation Icons (Custom SVG)

The bottom nav uses custom icons that reflect the app's food/meal planning purpose:

| Tab | Icon | Description |
|-----|------|-------------|
| Today | Fork & Knife | Represents meals and eating |
| List | Checklist | Shopping list with checkmarks |
| Me | Heart | Personal preferences and favorites |

**Icon Specifications:**
- Size: 22px × 22px
- Stroke width: 1.8px
- Active color: `#8B9469` (accent)
- Inactive color: `#B5B5B5` (disabled text)

**SVG Code:**

Today (Fork & Knife):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="7" y1="2" x2="7" y2="22" stroke-linecap="round"/>
  <path d="M21 15V2a5 5 0 00-5 5v6h4" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="18" y1="13" x2="18" y2="22" stroke-linecap="round"/>
</svg>
```

List (Checklist):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
  <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
  <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
  <polyline points="4 6 4.5 6.5 6 5" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="4 12 4.5 12.5 6 11" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="4 18 4.5 18.5 6 17" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Me (Heart):
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
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
      }
    }
  }
}
```
