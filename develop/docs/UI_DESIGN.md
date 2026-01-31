# UI Design Specification

## Design Philosophy

- **Warm & Inviting**: Light, food-friendly colors that feel like a cozy kitchen
- **Clean & Minimal**: Black line art on cream background, no visual clutter
- **Consistent**: Unified component styles across all pages

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Cream Background | `#FFFBF5` | App background, cards |
| Warm White | `#FFFFFF` | Modal backgrounds, inputs |
| Soft Yellow | `#FFF8E7` | Highlighted sections, selected states |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary Text | `#1A1A1A` | Headings, body text |
| Secondary Text | `#666666` | Subtitles, hints |
| Disabled Text | `#AAAAAA` | Disabled states, placeholders |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Accent Orange | `#FF9500` | Primary buttons, highlights |
| Success Green | `#34C759` | Checkmarks, success states |
| Error Red | `#FF3B30` | Error messages, delete actions |

### Tag Colors (for keywords/items selection)

Use pastel versions for tag backgrounds, darker for text:

| Category | Background | Text |
|----------|------------|------|
| Default | `#F0F0F0` | `#333333` |
| Selected | `#FFE4B5` | `#8B4513` |
| Cuisine (Chinese, Italian...) | `#E8F5E9` | `#2E7D32` |
| Diet (Healthy, Low-Carb...) | `#E3F2FD` | `#1565C0` |
| Difficulty | `#FFF3E0` | `#E65100` |

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
| H1 | 28px | 700 | Page titles |
| H2 | 22px | 600 | Section headers |
| H3 | 18px | 600 | Card titles |
| Body | 16px | 400 | Regular text |
| Body Small | 14px | 400 | Secondary info |
| Caption | 12px | 400 | Labels, hints |

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

- **Stroke width**: 1.5px - 2px
- **Color**: `#1A1A1A` (primary text color)
- **Size standards**:
  - Navigation: 24px
  - Action buttons: 20px
  - Inline icons: 16px
  - Food item icons: 32px (in selection lists)

### Common UI Icons (Lucide)

| Action | Icon Name |
|--------|-----------|
| Home | `Home` |
| Shopping | `ShoppingCart` |
| Profile | `User` |
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
background: #FF9500;
color: #FFFFFF;
border-radius: 12px;
padding: 12px 24px;
font-size: 16px;
font-weight: 600;
```

**Secondary Button:**
```css
background: transparent;
color: #1A1A1A;
border: 1.5px solid #1A1A1A;
border-radius: 12px;
padding: 12px 24px;
```

**Text Button:**
```css
background: transparent;
color: #FF9500;
padding: 8px 16px;
```

### Cards

```css
background: #FFFFFF;
border-radius: 16px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
```

### Input Fields

```css
background: #FFFFFF;
border: 1.5px solid #E0E0E0;
border-radius: 12px;
padding: 12px 16px;
font-size: 16px;

/* Focus state */
border-color: #FF9500;
outline: none;
```

### Tags/Chips

**Unselected:**
```css
background: #F0F0F0;
color: #333333;
border-radius: 20px;
padding: 8px 16px;
font-size: 14px;
```

**Selected:**
```css
background: #FFE4B5;
color: #8B4513;
border: 1.5px solid #DEB887;
```

### Checkboxes (Shopping List)

```css
/* Unchecked */
width: 24px;
height: 24px;
border: 2px solid #AAAAAA;
border-radius: 6px;

/* Checked */
background: #34C759;
border-color: #34C759;
/* Show white checkmark icon */
```

### Bottom Navigation

```css
background: #FFFFFF;
border-top: 1px solid #F0F0F0;
padding: 8px 0 24px 0; /* Extra bottom for safe area */
height: 60px; /* Plus safe area */

/* Active tab */
color: #FF9500;

/* Inactive tab */
color: #AAAAAA;
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
┌─────────────────────────────────────┐
│           B     L     D            │
├─────────────────────────────────────┤
│ Mon      [○]   [●]   [●]           │
│ Tue      [○]   [●]   [●]           │
│ Wed      [○]   [●]   [●]           │
│ Thu      [○]   [●]   [●]           │
│ Fri      [○]   [●]   [●]           │
│ Sat      [●]   [●]   [●]           │
│ Sun      [●]   [●]   [○]           │
└─────────────────────────────────────┘

○ = Unselected (border only)
● = Selected (filled with accent color)
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
        cream: '#FFFBF5',
        'warm-white': '#FFFFFF',
        'soft-yellow': '#FFF8E7',
        'primary-text': '#1A1A1A',
        'secondary-text': '#666666',
        'disabled-text': '#AAAAAA',
        accent: '#FF9500',
        success: '#34C759',
        error: '#FF3B30',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'tag': '20px',
        'modal': '24px',
      },
      spacing: {
        'safe-bottom': '24px',
      }
    }
  }
}
```
