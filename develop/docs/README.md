# OMenu - AI-Powered Meal Planning App

## Overview

OMenu is an AI-powered meal planning application that helps users plan weekly meals, automatically generate shopping lists, and simplify home cooking workflows.

### Core Value Proposition

> "My wife and I discuss what to eat next week on weekends, then we make a grocery list based on the discussion. The following week, I cook based on the plan. I want to make an app that takes what people want to eat, or their health/food preferences, and generates a shopping list and daily cooking handbook."

### Core Flow

```
User Preferences → AI Generates Weekly Plan → User Adjusts → Generate Shopping List → Daily Cooking
```

## MVP Scope

### ✅ Included Features

| Feature | Description |
|---------|-------------|
| Create Meal Plan | Step-by-step guided creation (7 steps) |
| AI Plan Generation | Personalized weekly plan via Gemini API |
| View & Adjust Plan | View full plan, modify via chat |
| Shopping List | Auto-aggregated ingredients, manual add/check |
| User Preferences | Save and reuse preference settings |
| Recipe Details | View recipe details, edit notes |

### ❌ Not in MVP

| Feature | Reason |
|---------|--------|
| Calorie History | Non-core feature |
| Saved Recipes | Can iterate later |
| Full Recipe Edit | High complexity, only notes editing |
| Push Notifications | High cost, auto-display on next open instead |

## Documentation Index

| Document | Content |
|----------|---------|
| [Data Models](./docs/DATA_MODELS.md) | TypeScript types, storage strategy |
| [Pages & Flows](./docs/PAGES_AND_FLOWS.md) | Page structure, user flows, interactions |
| [UI Design](./docs/UI_DESIGN.md) | Colors, typography, icons, components |
| [Tech Stack](./docs/TECH_STACK.md) | Framework choices, deployment, API integration |

## Quick Start

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build
```

## Deployment

- Platform: Vercel
- Environment Variable: `VITE_GEMINI_API_KEY`

## Future Roadmap

1. **Phase 2**: iOS App (React Native)
2. **Phase 3**: Fridge photo recognition for ingredient suggestions
3. **Phase 4**: Daily cooking timeline with reminders
