<p align="center">
  <img src="dev_v2/frontend/public/app-icons/omenu-icon-256x256.png" alt="OMenu Logo" width="120" />
</p>

<h1 align="center">OMenu</h1>

<p align="center">
  AI-powered weekly meal planner built with Gemini
</p>

<p align="center">
  <a href="https://o-menu.vercel.app/">Live Demo</a>
</p>

---

## Screenshots

<!-- Replace placeholder paths with your actual screenshot files -->

<p align="center">
  <img src="docs/screenshots/welcome.png" alt="Welcome Page" width="200" />
  <img src="docs/screenshots/menu.png" alt="Weekly Menu" width="200" />
  <img src="docs/screenshots/recipe.png" alt="Recipe Detail" width="200" />
  <img src="docs/screenshots/shopping.png" alt="Shopping List" width="200" />
</p>

---

## What is OMenu?

OMenu is an intelligent meal planning app that generates personalized weekly menus using Google's Gemini API. Tell it your preferred cuisines, dietary restrictions, budget, and schedule — it creates a full week of meals with recipes and an organized shopping list.

## Features

- **AI Menu Generation** — Gemini creates a complete weekly menu based on your preferences (cuisines, dislikes, budget, difficulty, number of people)
- **Day-by-Day View** — Browse breakfast, lunch, and dinner for each day with swipe navigation
- **Recipe Details** — View ingredients, step-by-step instructions, cook time, and calorie estimates
- **Shopping List** — Auto-generated and categorized by ingredient type (proteins, vegetables, dairy, etc.)
- **Multi-Week Support** — Create and manage menus for different weeks
- **Menu Editing** — Add, remove, or modify individual meals manually
- **User Profiles** — Save your preferences for faster planning next time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini API (via Vercel Serverless Functions, Python) |
| Deployment | Vercel |

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
│   │   └── _shared/          # Shared Python modules
│   └── public/               # Static assets
└── backend/                  # Legacy FastAPI backend (reference)
```

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

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-menu` | POST | Generate a weekly menu from user preferences |
| `/api/modify-menu` | POST | Modify an existing menu |
| `/api/generate-shopping-list` | POST | Generate a categorized shopping list from recipes |

All endpoints require a valid Supabase JWT in the `Authorization` header.

## License

This project was built for the [Google Gemini API Developer Competition](https://ai.google.dev/competition).
