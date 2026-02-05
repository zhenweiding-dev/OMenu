# OMenu - AI-Powered Menu Planning App

## Overview

OMenu is an AI-powered menu planning application that helps users plan weekly menus, automatically generate shopping lists, and simplify home cooking workflows.

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

### Core Value Proposition

> "My wife and I discuss what to eat next week on weekends, then we make a grocery list based on the discussion. The following week, I cook based on the plan. I want to make an app that takes what people want to eat, or their health/food preferences, and generates a shopping list and daily cooking handbook."

### Core Flow

```
User Preferences → AI Generates Weekly Menu Book → User Adjusts → Generate Shopping List → Daily Cooking
```

---

## Documentation Index

| Folder | File | Description |
|--------|------|-------------|
| **Root** | `README.md` | Project overview (this file) |
| | `TECH_STACK.md` | Technologies and versions |
| | `CHANGELOG.md` | Version history |
| | `IMPLEMENTATION_CHECKLIST.md` | Development progress tracker |
| **design/** | `PAGES_AND_FLOWS.md` | Pages, user flows, interactions |
| | `UI_DESIGN.md` | Visual design, colors, components |
| | `DATA_MODELS.md` | TypeScript + Pydantic data structures |
| **dev/** | `FRONTEND.md` | React frontend architecture |
| | `BACKEND.md` | FastAPI backend architecture |
| | `API_SPEC.md` | REST API endpoints |
| | `API_PROMPTS.md` | Gemini prompt design |
| **testing/** | `TEST_SPECIFICATION.md` | Test strategy |
| | `TEST_CHECKLIST.md` | Test checklist |
| | `test_instruction.md` | Test execution guide |
| | `test-mocks.ts` | Mock data |
| | `test-handlers.ts` | MSW request handlers |
| | `e2e-tests.spec.ts` | E2E test cases |
| **demo/** | `omenu-ui-demo-v4.html` | Static UI prototype |

---

## Architecture

OMenu uses a **separated frontend-backend architecture** for better maintainability, testability, and cross-platform support.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                             │
│                                                             │
│    ┌─────────────────┐           ┌─────────────────┐       │
│    │   React Web     │           │   iOS App       │       │
│    │   (Vite + TS)   │           │   (Future)      │       │
│    └────────┬────────┘           └────────┬────────┘       │
│             │                             │                 │
│             └──────────────┬──────────────┘                 │
│                            │                                │
│                    REST API (JSON)                          │
│                            │                                │
│             ┌──────────────▼──────────────┐                │
│             │      Python FastAPI         │                │
│             │                             │                │
│             │  • Prompt Management        │                │
│             │  • Gemini Integration       │                │
│             │  • Response Validation      │                │
│             │  • Data Persistence         │                │
│             └──────────────┬──────────────┘                │
│                            │                                │
│             ┌──────────────▼──────────────┐                │
│             │       Google Gemini         │                │
│             └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Benefit | Description |
|---------|-------------|
| **Security** | API keys stored in backend only, not exposed to clients |
| **Debuggability** | Test API endpoints independently with curl/Postman |
| **Reusability** | Same backend serves web, iOS, and future platforms |
| **Maintainability** | Clear separation of UI logic and business logic |
| **Testability** | Unit test prompts and validation without UI |

---

## Project Structure

```
omenu/
├── frontend/                      # React Web Application
│   ├── public/
│   │   ├── icons/                # Food SVG icons
│   │   └── images/               # Background images
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # BottomNav, Header, PageContainer
│   │   │   ├── home/            # Home page components
│   │   │   ├── shopping/        # Shopping page components
│   │   │   ├── create/          # Create flow step components
│   │   │   └── common/          # Shared components (Tag, MealCard)
│   │   ├── pages/               # Route page components
│   │   ├── stores/              # Zustand stores (UI state only)
│   │   ├── services/
│   │   │   └── api.ts           # Backend API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Helper functions, constants
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                       # Python FastAPI Server
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── routers/
│   │   │   ├── menu_books.py    # /api/menu-books endpoints
│   │   │   └── shopping.py      # /api/shopping-lists endpoints
│   │   ├── services/
│   │   │   ├── gemini.py        # Gemini API client
│   │   │   └── prompts.py       # Prompt templates
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   └── utils/
│   │       └── validators.py    # Response validation helpers
│   ├── tests/
│   │   ├── test_prompts.py      # Prompt generation tests
│   │   └── test_api.py          # API endpoint tests
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                          # Documentation
│   ├── README.md                 # This file
│   ├── CHANGELOG.md              # Version history and changes
│   ├── API_SPEC.md               # REST API specification
│   ├── DATA_MODELS.md            # Data structures (TS + Pydantic)
│   ├── PAGES_AND_FLOWS.md        # UI pages and user flows
│   ├── UI_DESIGN.md              # Visual design specification
│   ├── FRONTEND.md               # Frontend architecture details
│   ├── BACKEND.md                # Backend architecture details
│   └── API_PROMPTS.md            # Gemini prompt templates
│
└── README.md                      # Project root readme
```

---

## MVP Scope

### ✅ Included Features

| Feature | Description |
|---------|-------------|
| Create Menu Book | Step-by-step guided creation (7 steps) |
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
| User Authentication | MVP uses local storage, no accounts |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run development server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local: VITE_API_BASE_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### API Testing (without frontend)

```bash
# Health check
curl http://localhost:8000/api/health

# Generate menu book
curl -X POST http://localhost:8000/api/menu-books/generate \
  -H "Content-Type: application/json" \
  -d '{"keywords":["healthy","quick"],"numPeople":2,"budget":100,...}'
```

---

## Development Workflow

### Recommended Order

1. **Backend First**: Get all API endpoints working and tested
2. **Mock Data**: Use sample responses for frontend development
3. **Frontend Integration**: Connect frontend to real backend
4. **End-to-End Testing**: Test complete flows

### Testing Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| Backend API | pytest | Unit test endpoints and services |
| Backend API | curl/Postman | Manual integration testing |
| Frontend | Vitest | Component unit tests |
| E2E | Playwright | Full user flow testing |

---

## Documentation Index

| Document | Content |
|----------|---------|
| [Changelog](./CHANGELOG.md) | Version history and migration notes |
| [API Specification](./API_SPEC.md) | REST endpoint definitions |
| [Data Models](./DATA_MODELS.md) | TypeScript + Pydantic type definitions |
| [Pages & Flows](./PAGES_AND_FLOWS.md) | UI structure and user flows |
| [UI Design](./UI_DESIGN.md) | Colors, typography, components |
| [Frontend Guide](./FRONTEND.md) | React app architecture |
| [Backend Guide](./BACKEND.md) | FastAPI server architecture |
| [Prompt Templates](./API_PROMPTS.md) | Gemini prompt specifications |

---

## Deployment

### Backend

| Platform | Notes |
|----------|-------|
| Railway | Recommended, easy Python deployment |
| Render | Free tier available |
| Fly.io | Good for global distribution |

### Frontend

| Platform | Notes |
|----------|-------|
| Vercel | Recommended, optimal for Vite/React |
| Netlify | Alternative option |

### Environment Variables

**Backend (Production)**
```
GEMINI_API_KEY=your_production_key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
```

**Frontend (Production)**
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

---

## Future Roadmap

1. **Phase 2**: iOS App (React Native) - reuse backend API
2. **Phase 3**: User authentication and cloud sync
3. **Phase 4**: Fridge photo recognition for ingredient suggestions
4. **Phase 5**: Daily cooking timeline with reminders
