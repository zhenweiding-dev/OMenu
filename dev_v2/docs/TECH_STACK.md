# Tech Stack Overview

This document provides an overview of the technology choices for OMenu. For detailed implementation guides, see:
- [Frontend Guide](./FRONTEND.md) - React application details
- [Backend Guide](./BACKEND.md) - FastAPI server details

---

## Architecture Decision

OMenu uses a **separated frontend-backend architecture**.

### Why Separation?

| Challenge with Monolith | Solution with Separation |
|-------------------------|--------------------------|
| API keys exposed in browser | Keys stored securely in backend |
| Hard to debug AI responses | Test API endpoints independently |
| Can't reuse for mobile app | Same backend serves all platforms |
| Complex state + API mixed | Clear separation of concerns |
| Difficult vibe coding | Modular, testable components |

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌─────────────┐                    ┌─────────────┐        │
│   │   React     │                    │   iOS App   │        │
│   │   Web App   │                    │  (Future)   │        │
│   └──────┬──────┘                    └──────┬──────┘        │
│          │                                  │                │
│          └─────────────┬────────────────────┘                │
│                        │                                     │
│                   REST API                                   │
│                        │                                     │
│          ┌─────────────▼─────────────┐                      │
│          │     Python FastAPI        │                      │
│          │                           │                      │
│          │  • Prompt Management      │                      │
│          │  • Gemini Integration     │                      │
│          │  • Response Validation    │                      │
│          └─────────────┬─────────────┘                      │
│                        │                                     │
│          ┌─────────────▼─────────────┐                      │
│          │     Google Gemini API     │                      │
│          └───────────────────────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | - | Base component library |
| Zustand | 4.x | State management (UI only) |
| React Router | 6.x | Client-side routing |
| Lucide React | 0.x | UI icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.109+ | Web framework |
| Pydantic | 2.x | Data validation |
| Uvicorn | 0.27+ | ASGI server |
| google-generativeai | 0.4+ | Gemini SDK |

### External Services

| Service | Purpose |
|---------|---------|
| Google Gemini API | AI meal plan generation |
| Vercel | Frontend hosting |
| Railway / Render | Backend hosting |

---

## Data Flow

### Generate Meal Plan

```
1. User completes create flow (Steps 1-6)
2. Frontend sends POST /api/meal-plans/generate
3. Backend builds prompt from preferences
4. Backend calls Gemini API
5. Backend validates & parses response
6. Backend returns MealPlan to frontend
7. Frontend displays in Step 8
```

### Modify Meal Plan

```
1. User types modification request
2. Frontend sends POST /api/meal-plans/{id}/modify
3. Backend builds modification prompt
4. Backend calls Gemini API
5. Backend validates & returns modified MealPlan
6. Frontend displays updated plan
7. Shopping list should be regenerated after modification
```

### Generate Shopping List

```
1. User taps "Generate Shopping List" (from Step 8 or existing MenuBook)
2. Frontend sends POST /api/shopping-lists/generate
3. Backend builds shopping list prompt
4. Backend calls Gemini API
5. Backend validates, aggregates, & returns ShoppingList
6. Frontend stores ShoppingList in corresponding MenuBook
7. Frontend displays in Shopping Page
```

**Key Concept:** Each MenuBook (weekly plan) has a one-to-one relationship with a ShoppingList. When switching weeks, the Shopping Page displays the corresponding week's list.

---

## State Management Strategy

### Frontend State (Zustand)

**UI state only** - no business data:

| Store | Purpose |
|-------|---------|
| `useAppStore` | MenuBooks (mealPlan + shoppingList per week), current week, view state |
| `useDraftStore` | Create flow draft (persisted to localStorage) |
| `useShoppingStore` | Shopping list UI state (purchased items, manual additions) |

### Backend State

**Stateless** in MVP - no database:
- Each API call is independent
- Generated data returned directly to frontend
- Frontend stores received data in Zustand

### Persistence

| Data | Storage | Location |
|------|---------|----------|
| Create flow draft | localStorage | Frontend |
| User preferences | localStorage | Frontend |
| Menu books (meal plans + shopping lists) | In-memory (Zustand) | Frontend |

---

## Development Workflow

### Recommended Order

1. **Backend API first**
   - Implement endpoints
   - Test with curl/Postman
   - Verify Gemini responses

2. **Frontend with mock data**
   - Build UI components
   - Use mock responses
   - Test user flows

3. **Integration**
   - Connect frontend to backend
   - End-to-end testing

### Local Development

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Testing

| Layer | Tool | Command |
|-------|------|---------|
| Backend | pytest | `pytest tests/ -v` |
| Backend | curl | Manual API testing |
| Frontend | Vitest | `npm run test` |
| E2E | Playwright | `npm run test:e2e` |

---

## Deployment

### Frontend (Vercel)

1. Connect GitHub repo
2. Set environment variable: `VITE_API_BASE_URL`
3. Auto-deploy on push to main

### Backend (Railway)

1. Connect GitHub repo
2. Set environment variables: `GEMINI_API_KEY`, `CORS_ORIGINS`
3. Auto-deploy on push to main

### Environment Variables

**Frontend (.env.local)**
```
VITE_API_BASE_URL=http://localhost:8000
```

**Backend (.env)**
```
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173
```

---

## Future Considerations

### iOS App (Phase 2)

Same backend serves iOS app:
- React Native frontend
- AsyncStorage instead of localStorage
- Same API calls

### Database (Phase 3)

When adding user accounts:
- PostgreSQL or MongoDB
- User authentication (JWT)
- Meal plan history storage

### Caching (Optimization)

If scaling needed:
- Redis for session/response caching
- CDN for static assets
