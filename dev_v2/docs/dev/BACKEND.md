# Backend Architecture Guide

This document describes the Python FastAPI backend architecture for OMenu.

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

---

## MVP Architecture Note

> **Stateless Backend**: For MVP, the backend is a pure AI generation service with no database.
> - All data persistence is handled by the frontend (IndexedDB)
> - Backend receives generation requests, calls Gemini API, returns structured data
> - No user accounts, no server-side storage

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.109+ | Web framework |
| Pydantic | 2.x | Data validation |
| Uvicorn | 0.27+ | ASGI server |
| google-generativeai | 0.4+ | Gemini SDK |
| python-dotenv | 1.0+ | Environment management |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── menu_books.py       # /api/menu-books/* endpoints
│   │   └── shopping.py         # /api/shopping-lists/* endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini.py           # Gemini API client
│   │   └── prompts.py          # Prompt templates
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   │
│   └── utils/
│       ├── __init__.py
│       └── validators.py       # Response validation helpers
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # pytest fixtures
│   ├── test_prompts.py         # Prompt generation tests
│   ├── test_gemini.py          # Gemini service tests
│   └── test_api.py             # API endpoint tests
│
├── .env.example                # Example environment variables
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Core Files

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import menu_books, shopping

app = FastAPI(
    title="OMenu API",
    description="AI-powered menu bookning backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(menu_books.router, prefix="/api/menu-books", tags=["Menu Books"])
app.include_router(shopping.router, prefix="/api/shopping-lists", tags=["Shopping Lists"])

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
```

### config.py

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str
    cors_origins: List[str] = ["http://localhost:5173"]
    environment: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### models/schemas.py

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ===== Enums =====

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class IngredientCategory(str, Enum):
    proteins = "proteins"
    vegetables = "vegetables"
    fruits = "fruits"
    grains = "grains"
    dairy = "dairy"
    seasonings = "seasonings"
    pantry_staples = "pantry_staples"
    others = "others"

class MenuBookStatus(str, Enum):
    generating = "generating"
    ready = "ready"
    error = "error"

# ===== Meal Schedule =====

class MealSelection(BaseModel):
    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False

class CookSchedule(BaseModel):
    monday: MealSelection
    tuesday: MealSelection
    wednesday: MealSelection
    thursday: MealSelection
    friday: MealSelection
    saturday: MealSelection
    sunday: MealSelection

# ===== User Preferences (Request) =====

class UserPreferences(BaseModel):
    keywords: List[str] = []
    preferredItems: List[str] = []
    dislikedItems: List[str] = []
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)  # USD, step $10
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule

# ===== Ingredient =====

class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str
    category: IngredientCategory

# ===== Dish =====

class Dish(BaseModel):
    id: str  # Format: {day}-{meal}-{number}, e.g., "mon-breakfast-001"
    name: str
    ingredients: List[Ingredient]
    instructions: str
    estimatedTime: int  # Minutes
    servings: int
    difficulty: Difficulty
    totalCalories: int
    notes: Optional[str] = None

# ===== Day Meals =====

class DayMeals(BaseModel):
    breakfast: Optional[Dish] = None
    lunch: Optional[Dish] = None
    dinner: Optional[Dish] = None

# ===== Week Days =====

class WeekDays(BaseModel):
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals

# ===== Menu Book =====

class MenuBook(BaseModel):
    id: str  # Prefix: "mb_"
    createdAt: datetime
    status: MenuBookStatus
    preferences: UserPreferences
    days: WeekDays

# ===== Shopping List =====

class ShoppingItem(BaseModel):
    id: str  # Prefix: "item_"
    name: str
    category: IngredientCategory
    totalQuantity: float  # 0 for seasonings (not displayed in UI)
    unit: str  # Empty string for seasonings
    purchased: bool = False
    isManuallyAdded: Optional[bool] = None

class ShoppingList(BaseModel):
    id: str  # Prefix: "sl_"
    menuBookId: str
    createdAt: datetime
    items: List[ShoppingItem]

# ===== API Requests =====

class GenerateMenuBookRequest(BaseModel):
    """Request body for POST /api/menu-books/generate"""
    keywords: List[str] = []
    preferredItems: List[str] = []
    dislikedItems: List[str] = []
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)  # USD, step $10
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule

class ModifyMenuBookRequest(BaseModel):
    """Request body for POST /api/menu-books/{id}/modify"""
    modification: str = Field(max_length=200)
    currentPlan: MenuBook

class GenerateShoppingListRequest(BaseModel):
    """Request body for POST /api/shopping-lists/generate"""
    menuBookId: str
    menuBook: MenuBook

# ===== API Responses =====

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail] = []
```

### services/gemini.py

```python
import google.generativeai as genai
from app.config import settings
import json
import re

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


class GeminiError(Exception):
    """Raised when Gemini API returns an error."""
    pass


class ParseError(Exception):
    """Raised when response parsing fails."""
    pass


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate(self, prompt: str) -> str:
        """
        Send prompt to Gemini and return text response.
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 8192,
                }
            )
            return self._extract_text_from_response(response)
        except Exception as e:
            raise GeminiError(f"Gemini API error: {str(e)}")
    
    def _extract_text_from_response(self, response) -> str:
        """
        Extract text content from Gemini API response.
        """
        try:
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    parts = candidate.content.parts
                    if parts and hasattr(parts[0], 'text'):
                        text = parts[0].text
                        if text:
                            return text.strip()
            return ""
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""
    
    def parse_json_response(self, text: str) -> dict:
        """
        Parse JSON from Gemini response, handling markdown code blocks.
        """
        if not text:
            raise ParseError("Empty response from Gemini")
        
        # Remove markdown code blocks if present
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ParseError(f"Failed to parse JSON: {str(e)}")


# Singleton instance
gemini_service = GeminiService()
```

### services/prompts.py

```python
from app.models.schemas import MenuBook, UserPreferences, CookSchedule


def menu_book_prompt(preferences: UserPreferences) -> str:
    """
    Generate prompt for natural language menu book (Step 1 of 2-step process).
    """
    schedule_str = _format_cook_schedule(preferences.cookSchedule)
    
    return f"""You are a professional menu bookner. Create a weekly menu book based on these preferences:

**Preferences:**
- Keywords/Style: {', '.join(preferences.keywords) if preferences.keywords else 'Any'}
- Must include: {', '.join(preferences.preferredItems) if preferences.preferredItems else 'None specified'}
- Avoid: {', '.join(preferences.dislikedItems) if preferences.dislikedItems else 'None'}
- Number of people: {preferences.numPeople}
- Weekly budget: ${preferences.budget} USD
- Difficulty level: {preferences.difficulty.value}

**Schedule (meals to plan):**
{schedule_str}

Please create a detailed menu book. For each scheduled meal, include:
1. Dish name
2. Ingredients with quantities
3. Brief cooking instructions
4. Estimated cooking time
5. Estimated calories per serving

Format your response as a clear, organized menu book."""


def structured_menu_prompt(natural_menu: str, preferences: UserPreferences) -> str:
    """
    Generate prompt to convert natural language plan to structured JSON (Step 2 of 2-step process).
    """
    return f"""Convert this menu book into the exact JSON structure below.

**Natural Language Menu Book:**
{natural_menu}

**Required JSON Structure:**
{{
  "monday": {{
    "breakfast": {{ "id": "mon-breakfast-001", "name": "...", "ingredients": [...], "instructions": "...", "estimatedTime": 15, "servings": {preferences.numPeople}, "difficulty": "easy|medium|hard", "totalCalories": 350 }} | null,
    "lunch": {{ ... }} | null,
    "dinner": {{ ... }} | null
  }},
  "tuesday": {{ ... }},
  ...
  "sunday": {{ ... }}
}}

**Ingredient Structure:**
{{ "name": "eggs", "quantity": 4, "unit": "count", "category": "proteins|vegetables|fruits|grains|dairy|seasonings|pantry_staples|others" }}

**Rules:**
- Use null for meals not in the schedule
- Seasonings (oils, sauces, spices) have quantity: 0, unit: ""
- ID format: {{day}}-{{meal}}-{{number}} (e.g., "mon-breakfast-001")
- Instructions as single string with numbered steps

RETURN ONLY THE RAW JSON OBJECT. No markdown, no explanation."""


def modification_prompt(modification: str, current_plan: str, preferences: str) -> str:
    """
    Generate prompt for modifying an existing menu book.
    """
    return f"""Modify this menu book based on the user's request.

**User Request:**
{modification}

**Current Preferences:**
{preferences}

**Current Plan:**
{current_plan}

Apply the user's requested changes while maintaining the same JSON structure.
Only change what's necessary to fulfill the request.

RETURN ONLY THE MODIFIED JSON OBJECT. No markdown, no explanation."""


def shopping_list_prompt(menus: WeekMenus) -> str:
    """
    Generate prompt for shopping list generation.
    """
    menus_json = menus.model_dump_json()

    return f"""Task: Generate a consolidated shopping list from the weekly menus (North American units).

CRITICAL RULES:
1. MERGE AGGRESSIVELY: Combine interchangeable ingredients into broad categories.
2. UNITS (North America): Meat/Bulk use 'lbs' or 'oz'; produce uses 'count' or 'bunch'.
3. Valid categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others.
4. Seasonings set totalQuantity to 0 and unit to "".
5. Limit the list to at most 12 items; keep names <=4 words.

Menus: {menus_json}

Output Format:
{{
  "items": [
    {{ "name": "Chicken Breast", "category": "proteins", "totalQuantity": 2, "unit": "lbs" }},
    {{ "name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": "" }},
    ...
  ]
}}

RETURN ONLY THE RAW JSON OBJECT. No markdown, no explanation."""


def _format_cook_schedule(schedule: CookSchedule) -> str:
    """Format cook schedule as readable string."""
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    lines = []
    
    for day in days:
        day_schedule = getattr(schedule, day)
        meals = []
        if day_schedule.breakfast:
            meals.append("breakfast")
        if day_schedule.lunch:
            meals.append("lunch")
        if day_schedule.dinner:
            meals.append("dinner")
        
        if meals:
            lines.append(f"- {day.capitalize()}: {', '.join(meals)}")
    
    return '\n'.join(lines) if lines else "- No meals scheduled"
```

### routers/menu_books.py

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from app.models.schemas import (
    GenerateMenuBookRequest,
    ModifyMenuBookRequest,
    MenuBook,
    MenuBookStatus,
    WeekDays,
    UserPreferences
)
from app.services.gemini import gemini_service, GeminiError, ParseError
from app.services.prompts import menu_book_prompt, structured_menu_prompt, modification_prompt
from app.utils.validators import validate_menus

router = APIRouter()


@router.post("/generate", response_model=MenuBook)
async def generate_menu_book(request: GenerateMenuBookRequest):
    """
    Generate a new menu book using two-step Gemini API process.
    Step 1: Generate natural language plan
    Step 2: Convert to structured JSON
    """
    try:
        # Build preferences object
        preferences = UserPreferences(
            keywords=request.keywords,
            preferredItems=request.preferredItems,
            dislikedItems=request.dislikedItems,
            numPeople=request.numPeople,
            budget=request.budget,
            difficulty=request.difficulty,
            cookSchedule=request.cookSchedule
        )
        
        # Step 1: Generate natural language plan
        natural_prompt = menu_book_prompt(preferences)
        natural_menu = await gemini_service.generate(natural_prompt)
        
        if not natural_menu:
            raise GeminiError("Empty response from Gemini (Step 1)")
        
        # Step 2: Convert to structured JSON
        structure_prompt = structured_menu_prompt(natural_menu, preferences)
        structured_response = await gemini_service.generate(structure_prompt)
        
        # Parse JSON response
        days_data = gemini_service.parse_json_response(structured_response)
        
        # Extract days if nested in full plan structure
        if "days" in days_data:
            days_data = days_data["days"]
        
        # Validate structure
        if not validate_menus(days_data):
            raise ParseError("Invalid menu book structure from AI")
        
        # Build response
        plan_id = f"mb_{uuid.uuid4().hex[:12]}"
        menu_book = MenuBook(
            id=plan_id,
            createdAt=datetime.utcnow(),
            status=MenuBookStatus.ready,
            preferences=preferences,
            days=WeekDays(**days_data)
        )
        
        return menu_book
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail={"code": "GEMINI_ERROR", "message": str(e)})
    except ParseError as e:
        raise HTTPException(status_code=500, detail={"code": "PARSE_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "INTERNAL_ERROR", "message": f"Unexpected error: {str(e)}"})


@router.post("/{plan_id}/modify", response_model=MenuBook)
async def modify_menu_book(plan_id: str, request: ModifyMenuBookRequest):
    """
    Modify an existing menu book based on user instructions.
    Single API call - modifies the structured plan directly.
    """
    try:
        # Generate modification prompt
        prompt = modification_prompt(
            modification=request.modification,
            current_plan=request.currentPlan.model_dump_json(indent=2),
            preferences=request.currentPlan.preferences.model_dump_json(indent=2)
        )
        
        # Call Gemini
        response_text = await gemini_service.generate(prompt)
        
        # Parse response
        plan_data = gemini_service.parse_json_response(response_text)
        
        # Extract days if nested in full plan structure
        if "days" in plan_data:
            days_data = plan_data["days"]
        else:
            days_data = plan_data
        
        # Validate
        if not validate_menus(days_data):
            raise ParseError("Invalid menu book structure from AI")
        
        # Build response with same ID
        menu_book = MenuBook(
            id=plan_id,
            createdAt=datetime.utcnow(),
            status=MenuBookStatus.ready,
            preferences=request.currentPlan.preferences,
            days=WeekDays(**days_data)
        )
        
        return menu_book
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail={"code": "GEMINI_ERROR", "message": str(e)})
    except ParseError as e:
        raise HTTPException(status_code=500, detail={"code": "PARSE_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "INTERNAL_ERROR", "message": str(e)})
```

### routers/shopping.py

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from app.models.schemas import (
    GenerateShoppingListRequest,
    ShoppingList,
    ShoppingItem,
    IngredientCategory
)
from app.services.gemini import gemini_service, GeminiError, ParseError
from app.services.prompts import shopping_list_prompt
from app.utils.validators import validate_shopping_list

router = APIRouter()


@router.post("/generate", response_model=ShoppingList)
async def generate_shopping_list(request: GenerateShoppingListRequest):
    """Generate a shopping list from a menu book."""
    try:
        # Generate prompt
        prompt = shopping_list_prompt(request.menus)
        
        # Call Gemini
        response_text = await gemini_service.generate(prompt)
        
        # Parse response
        list_data = gemini_service.parse_json_response(response_text)
        
        # Validate
        if not validate_shopping_list(list_data):
            raise ParseError("Invalid shopping list structure from AI")
        
        # Build response
        list_id = f"sl_{uuid.uuid4().hex[:12]}"
        items = [
            ShoppingItem(
                id=f"item_{uuid.uuid4().hex[:8]}",
                name=item["name"],
                category=IngredientCategory(item["category"]),
                totalQuantity=item.get("totalQuantity", 0),
                unit=item.get("unit", ""),
                purchased=False
            )
            for item in list_data.get("items", [])
        ]
        
        shopping_list = ShoppingList(
            id=list_id,
            menuBookId=request.menusId,
            createdAt=datetime.utcnow(),
            items=items
        )
        
        return shopping_list
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail={"code": "GEMINI_ERROR", "message": str(e)})
    except ParseError as e:
        raise HTTPException(status_code=500, detail={"code": "PARSE_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "INTERNAL_ERROR", "message": str(e)})
```

### utils/validators.py

```python
"""
Response validation helpers for Gemini API responses.
"""

VALID_CATEGORIES = [
    "proteins", "vegetables", "fruits", "grains",
    "dairy", "seasonings", "pantry_staples", "others"
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]
VALID_DIFFICULTIES = ["easy", "medium", "hard"]


def validate_dish(recipe: dict) -> bool:
    """Validate a single recipe object."""
    if recipe is None:
        return True  # null is valid (meal not scheduled)
    
    required_fields = [
        "id", "name", "ingredients", "instructions",
        "estimatedTime", "servings", "difficulty", "totalCalories"
    ]
    
    for field in required_fields:
        if field not in recipe:
            return False
    
    # Validate difficulty
    if recipe.get("difficulty") not in VALID_DIFFICULTIES:
        return False
    
    # Validate ingredients
    if not isinstance(recipe.get("ingredients"), list):
        return False
    
    for ingredient in recipe["ingredients"]:
        if not validate_ingredient(ingredient):
            return False
    
    return True


def validate_ingredient(ingredient: dict) -> bool:
    """Validate a single ingredient object."""
    required_fields = ["name", "quantity", "unit", "category"]
    
    for field in required_fields:
        if field not in ingredient:
            return False
    
    if ingredient["category"] not in VALID_CATEGORIES:
        return False
    
    # Quantity must be a number
    if not isinstance(ingredient.get("quantity"), (int, float)):
        return False
    
    return True


def validate_menus(data: dict) -> bool:
    """Validate the complete weekly menu book structure."""
    if not isinstance(data, dict):
        return False
    
    for day in DAYS:
        if day not in data:
            return False
        
        day_data = data[day]
        if not isinstance(day_data, dict):
            return False
        
        for meal in MEALS:
            if meal not in day_data:
                return False
            
            recipe = day_data[meal]
            if not validate_dish(recipe):
                return False
    
    return True


def validate_shopping_list(data: dict) -> bool:
    """Validate shopping list structure."""
    if "items" not in data or not isinstance(data["items"], list):
        return False
    
    for item in data["items"]:
        required_fields = ["name", "category"]
        for field in required_fields:
            if field not in item:
                return False
        if item["category"] not in VALID_CATEGORIES:
            return False
    
    return True
```

---

## Requirements

### requirements.txt

```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
google-generativeai>=0.4.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.26.0
```

---

## Environment Variables

### .env.example

```
# Gemini API
GEMINI_API_KEY=your_api_key_here

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Environment
ENVIRONMENT=development
```

---

## Running the Server

### Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload --port 8000
```

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Testing

### Run All Tests

```bash
pytest tests/ -v
```

### Test Prompts Only (No API Call)

```bash
pytest tests/test_prompts.py -v
```

### Test with Coverage

```bash
pytest tests/ --cov=app --cov-report=html
```

---

## API Testing with cURL

### Health Check

```bash
curl http://localhost:8000/api/health
```

### Generate Menu Book

```bash
curl -X POST http://localhost:8000/api/menu-books/generate \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["healthy", "quick"],
    "preferredItems": ["chicken", "rice"],
    "dislikedItems": ["mushrooms"],
    "numPeople": 2,
    "budget": 100,
    "difficulty": "medium",
    "cookSchedule": {
      "monday": {"breakfast": false, "lunch": true, "dinner": true},
      "tuesday": {"breakfast": false, "lunch": true, "dinner": true},
      "wednesday": {"breakfast": false, "lunch": true, "dinner": true},
      "thursday": {"breakfast": false, "lunch": true, "dinner": true},
      "friday": {"breakfast": false, "lunch": true, "dinner": true},
      "saturday": {"breakfast": true, "lunch": true, "dinner": true},
      "sunday": {"breakfast": true, "lunch": true, "dinner": false}
    }
  }'
```

---

## Deployment

### Railway

1. Create new project, connect GitHub repo
2. Add environment variables in Railway dashboard
3. Railway auto-detects Python and deploys

**Procfile** (optional):
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Fly.io

```bash
# Install flyctl
fly launch
fly secrets set GEMINI_API_KEY=your_key
fly deploy
```
