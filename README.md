<p align="center">
  <img src="dev_v2/frontend/public/app-icons/omenu-icon-256x256.png" width="80" alt="OMenu Logo" />
</p>

<h1 align="center">OMenu</h1>
<p align="center"><strong>Planning, Shopping, Cooking for Every Family</strong></p>
<p align="center">AI-powered weekly meal planner built with Gemini 3</p>

<p align="center">
  <a href="https://o-menu.vercel.app/">Live Demo</a> ·
  <a href="https://gemini3.devpost.com/">Gemini 3 Hackathon 2026</a>
</p>

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/welcome.png" width="200" alt="Welcome" />
  <img src="docs/screenshots/menu.png" width="200" alt="Weekly Menu" />
  <img src="docs/screenshots/recipe.png" width="200" alt="Recipe Detail" />
  <img src="docs/screenshots/shopping.png" width="200" alt="Shopping List" />
</p>

---

## What is OMenu?

OMenu turns a few taps into a complete **Plan → Shop → Cook** loop, powered by Gemini 3. Users express preferences in natural language, pick a weekly schedule, and OMenu generates three deeply linked outputs:

- **Menu Book** — a full week of meals, browsable by day
- **Cooking Handbook** — tap any dish for exact ingredients with quantities matched to your household, step-by-step instructions, cook time, difficulty, and calories
- **Shopping List** — ingredients consolidated across every recipe, categorized, unit-converted, and ready to check off at the store

Change one dish, and the shopping list updates. Add a dish manually, and AI never overwrites it. The three outputs form a closed loop — not a chat response, but a structured, interactive, persistent application with AI as the engine.

---

## How It Works — The 2.5-Step AI Pipeline

OMenu doesn't send a single prompt to Gemini 3. It runs a **2.5-step orchestrated pipeline** where each step solves a distinct hard problem, and each output precisely constrains the next:

```
Creativity → Structure → Precision
```

**Step 1 — Creative Outline + Draft Shopping List**

Deliberately unstructured — just dish names and ingredient names, no recipes or quantities. This frees Gemini 3 to focus its full reasoning on the multi-constraint optimization: taste, dislikes, budget, people, schedule, nutrition, variety, and ingredient reuse — all at once, within a capped ingredient count (~12–36 items).

**Step 2 — Structured Menu + Cooking Handbook**

Step 1's output locks down the ingredient space. With the "what" decided, Gemini 3 concentrates on the "how" — exact quantities, step-by-step instructions, calorie estimates, cook times. Structured JSON output simultaneously produces the daily cookbook and lays the data foundation for Step 3.

**Step 2.5 — Shopping List Consolidation**

Merging near-duplicates across up to 21 meals, converting heterogeneous units to North American standards, calculating aggregated quantities, and categorizing for grocery-store navigation. Complex enough to need the model's full attention as a dedicated step.

Each step is validated and normalized by a Python layer (category correction, quantity coercion, seasoning zero-out) before reaching the frontend.

---

## Gemini 3 Integration

| Config | Value |
| --- | --- |
| Model | `gemini-3-flash-preview` via `google.genai` SDK |
| Output Mode | `response_mime_type: "application/json"` — native structured output |
| Thinking | `thinking_level: MINIMAL` — optimized for structured output speed |
| Temperature | 0.7 |
| Max Output Tokens | 65,536 |

---

## Features

- **Natural-Language Preferences** — curated chips spanning diet, cuisine, time, lifestyle, taste, and ingredients, plus free text input
- **AI Menu Generation** — Gemini 3 creates a complete weekly menu respecting all constraints
- **Day-by-Day View** — browse breakfast, lunch, and dinner with swipe navigation
- **Cooking Handbook** — full recipe detail with exact quantities, instructions, time, calories
- **Smart Shopping List** — auto-generated, categorized, consolidated across all recipes
- **Natural-Language Modification** — "make Wednesday dinner vegetarian" triggers minimal AI edits
- **Manual + AI Coexistence** — manually added dishes are never overwritten
- **Multi-Week Support** — create and manage menus for different weeks
- **Guest Mode** — zero-friction onboarding, no login required
- **Responsive Design** — mobile-first with desktop phone-frame layout and guided path panel

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini 3 API (via Vercel Serverless Functions, Python) |
| Deployment | Vercel |

---

## Architecture

```
User Preferences (natural-language chips + config)
        ↓
React + Vite + Tailwind + Zustand (mobile-first SPA)
        ↓
Serverless Python API (Vercel)
        ↓
┌─────────────────────────────────────────────────────┐
│  GEMINI 3 PIPELINE — Creativity → Structure → Precision  │
│                                                     │
│  Step 1: Creative Outline + Draft Shopping List     │
│       ↓                                             │
│  Step 2: Structured Menu + Cooking Handbook         │
│       ↓                                             │
│  Step 2.5: Shopping List Consolidation              │
└─────────────────────────────────────────────────────┘
        ↓
Validators + Normalizers (Python)
        ↓
Frontend Stores → Supabase Postgres (persistence)
```

---

## Project Structure

```
dev_v2/
├── frontend/
│   ├── src/                  # React source code
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── stores/           # Zustand state stores
│   │   ├── services/         # API & data services
│   │   └── lib/              # Utilities (Supabase client, helpers)
│   ├── api/                  # Vercel Python serverless functions
│   │   ├── generate-menu.py
│   │   ├── generate-shopping-list.py
│   │   ├── modify-menu.py
│   │   └── _shared/          # Shared Python modules (prompts, parser, validators, client)
│   └── public/               # Static assets
└── backend/                  # Legacy FastAPI backend (reference)
```

---

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/generate-menu` | POST | Generate a weekly menu from user preferences (Steps 1 + 2) |
| `/api/modify-menu` | POST | Modify an existing menu with natural-language requests |
| `/api/generate-shopping-list` | POST | Consolidate ingredients into a categorized shopping list (Step 2.5) |

All endpoints require a valid Supabase JWT in the `Authorization` header.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://ai.google.dev/) key

### Setup

```bash
cd dev_v2/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Fill in your `.env`:

```env
# Client
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server (Vercel serverless)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3-flash-preview
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Development

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run test      # Run tests
npm run lint      # Lint check
```

### Deploy

The project is configured for [Vercel](https://vercel.com). Push to your connected branch and it deploys automatically — frontend as static files, `api/` directory as Python serverless functions.

---

## License

Built for the [Gemini 3 Hackathon 2026](https://gemini3.devpost.com/).
