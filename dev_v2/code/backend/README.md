# OMenu Backend

AI-powered meal planning backend using FastAPI and Google Gemini.

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_key_here
```

### 3. Run Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Or run directly
python -m app.main
```

### 4. Test API

Open http://localhost:8000/docs for interactive API documentation.

Health check:
```bash
curl http://localhost:8000/api/health
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/meal-plans/generate` | POST | Generate weekly meal plan |
| `/api/meal-plans/{id}/modify` | POST | Modify existing meal plan |
| `/api/shopping-lists/generate` | POST | Generate shopping list |

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI entry point
│   ├── config.py         # Environment configuration
│   ├── routers/          # API route handlers
│   │   ├── health.py
│   │   ├── meal_plans.py
│   │   └── shopping.py
│   ├── services/         # Business logic
│   │   ├── gemini.py     # Gemini API client
│   │   └── prompts.py    # Prompt templates
│   └── models/           # Pydantic schemas
│       └── schemas.py
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Architecture Notes

- **Stateless**: No database, all data stored in frontend (IndexedDB)
- **Two-step Generation**: Natural language → Structured JSON for better results
- **Validation**: All Gemini responses validated with Pydantic

## Testing

```bash
pytest tests/
```
