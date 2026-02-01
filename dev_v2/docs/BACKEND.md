# Backend Architecture Guide

This document describes the Python FastAPI backend architecture for OMenu.

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
│   │   ├── meal_plans.py       # /api/meal-plans/* endpoints
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
from app.routers import meal_plans, shopping

app = FastAPI(
    title="OMenu API",
    description="AI-powered meal planning backend",
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
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["Meal Plans"])
app.include_router(shopping.router, prefix="/api/shopping-lists", tags=["Shopping Lists"])

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0"
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
from typing import Optional, List, Literal
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
    mustHaveItems: List[str] = []
    dislikedItems: List[str] = []
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=10, le=1000, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule

# ===== Ingredient =====

class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str
    category: IngredientCategory

# ===== Recipe =====

class Recipe(BaseModel):
    id: str
    name: str
    ingredients: List[Ingredient]
    instructions: str
    estimatedTime: int
    servings: int
    difficulty: Difficulty
    totalCalories: int
    notes: Optional[str] = None

# ===== Day Meals =====

class DayMeals(BaseModel):
    breakfast: Optional[Recipe] = None
    lunch: Optional[Recipe] = None
    dinner: Optional[Recipe] = None

# ===== Week Days =====

class WeekDays(BaseModel):
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals

# ===== Meal Plan =====

class MealPlanStatus(str, Enum):
    generating = "generating"
    ready = "ready"
    error = "error"

class MealPlan(BaseModel):
    id: str
    createdAt: datetime
    status: MealPlanStatus
    preferences: UserPreferences
    days: WeekDays

# ===== Shopping List =====

class ShoppingItem(BaseModel):
    id: str
    name: str
    category: IngredientCategory
    totalQuantity: float
    unit: str
    purchased: bool = False

class ShoppingList(BaseModel):
    id: str
    mealPlanId: str
    createdAt: datetime
    items: List[ShoppingItem]

# ===== API Requests =====

class GenerateMealPlanRequest(BaseModel):
    """Request body for POST /api/meal-plans/generate"""
    keywords: List[str] = []
    mustHaveItems: List[str] = []
    dislikedItems: List[str] = []
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=10, le=1000, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule

class ModifyMealPlanRequest(BaseModel):
    """Request body for POST /api/meal-plans/{id}/modify"""
    modification: str = Field(max_length=200)
    currentPlan: MealPlan

class GenerateShoppingListRequest(BaseModel):
    """Request body for POST /api/shopping-lists/generate"""
    mealPlanId: str
    mealPlan: MealPlan

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
        Based on original prompt_simple.py implementation.
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
        
        # Remove markdown code blocks
        cleaned = text.strip()
        cleaned = re.sub(r'^```json\s*\n?', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'^```\s*\n?', '', cleaned)
        cleaned = re.sub(r'\n?```\s*$', '', cleaned)
        cleaned = cleaned.strip()
        
        # Extract JSON object
        match = re.search(r'\{[\s\S]*\}', cleaned)
        if match:
            cleaned = match.group(0)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ParseError(f"Failed to parse JSON: {str(e)}")


class GeminiError(Exception):
    """Raised when Gemini API call fails."""
    pass


class ParseError(Exception):
    """Raised when response parsing fails."""
    pass


# Singleton instance
gemini_service = GeminiService()
```

### services/prompts.py

```python
"""
Prompt templates for Gemini API.
Based on original prompt_simple.py - uses two-step generation for meal plans.
"""

# ===== Schema Templates =====

meal_plan_structure = """{
    "monday": {
        "breakfast": {
            "id": "mon-breakfast-001",
            "name": "Scrambled Eggs with Tomato",
            "ingredients": [
                {"name": "eggs", "quantity": 2, "unit": "count", "category": "proteins"},
                {"name": "tomato", "quantity": 100, "unit": "g", "category": "vegetables"},
                {"name": "oil", "quantity": 15, "unit": "ml", "category": "seasonings"}
            ],
            "instructions": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
            "estimatedTime": 15,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 180
        },
        "lunch": { ... },
        "dinner": { ... }
    },
    "tuesday": { ... },
    ...
}"""


def meal_plan_prompt(user_preferences: str) -> str:
    """
    Step 1: Generate natural language meal plan.
    Keep prompt simple - let model be creative.
    """
    return f"""
    Task: Based on the user's preferences, generate a personalized meal plan in JSON format, every meal should include recipeName, ingredients and brief description.
    User Preferences: {user_preferences}
    """


def generate_structured_plan_prompt(extracted_plan: str) -> str:
    """
    Step 2: Convert natural language plan to structured JSON.
    """
    return f"""
    Task: Convert the following meal plan into a structured JSON format according to the schema.
    
    Meal Plan: {extracted_plan}
    
    Output Schema:
    {meal_plan_structure}
    
    RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
    """


def user_manipulation_prompt(
    user_input: str,
    user_preferences: str,
    previous_plan: str
) -> str:
    """
    Modify existing plan based on user request.
    """
    return f"""
    Task: based on user's new input, previous preferences and meal plan, adjust the meal plan accordingly. DO NOT change the format of the meal plan.
    Return exactly the same format as previous meal plan. Do minimal changes to accommodate user's new input.

    User's new input: {user_input}
    Previous user preferences: {user_preferences}
    Previous meal plan: {previous_plan}
    """


def generate_shopping_list_prompt(structured_plan: str) -> str:
    """
    Generate consolidated shopping list from meal plan.
    """
    return f"""
    Task: Convert the Meal Plan into a consolidated North American shopping list (JSON).
    
    CRITICAL RULES:
    1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories.
       - (e.g., "Beef strips" + "Flank steak" -> "Beef (Stir-fry cut)")
       - (e.g., "Scallions" + "Green onions" -> "Green Onions")
    
    2. **UNITS (North America)**:
       - **Meat/Bulk**: MUST use 'lbs' or 'oz'. (No grams).
       - **Produce**: MUST use 'count' or 'bunch'. (No 'stalks', 'slices').

    "predefinedCategories": [
        "proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others"
    ],
    
    Meal Plan: {structured_plan}
    
    Output Format:
    {{
        "items": [
            {{"name": "ingredient_name", "category": "predefined_category", "totalQuantity": 0, "unit": "unit"}},
            ...
        ]
    }}
    
    RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
    """
```

### routers/meal_plans.py

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import json

from app.models.schemas import (
    GenerateMealPlanRequest,
    ModifyMealPlanRequest,
    MealPlan,
    MealPlanStatus,
    WeekDays,
)
from app.services.gemini import gemini_service, GeminiError, ParseError
from app.services.prompts import (
    meal_plan_prompt,
    generate_structured_plan_prompt,
    user_manipulation_prompt,
)
from app.utils.validators import validate_meal_plan

router = APIRouter()


def convert_schedule_to_array_format(cook_schedule: dict) -> dict:
    """
    Convert boolean schedule format to array format for Gemini prompt.
    
    Input:  {"monday": {"breakfast": True, "lunch": True, "dinner": False}}
    Output: {"monday": ["breakfast", "lunch"]}
    """
    result = {}
    for day, meals in cook_schedule.items():
        selected = [meal for meal, enabled in meals.items() if enabled]
        result[day] = selected
    return result


@router.post("/generate", response_model=MealPlan)
async def generate_meal_plan(request: GenerateMealPlanRequest):
    """
    Generate a new meal plan using two-step process:
    1. Generate natural language meal plan
    2. Convert to structured JSON
    """
    try:
        # Build preferences for prompt (convert schedule to array format)
        preferences_dict = {
            "keywords": request.keywords,
            "mustHaveItems": request.mustHaveItems,
            "dislikedItems": request.dislikedItems,
            "budget": request.budget,
            "numPeople": request.numPeople,
            "difficulty": request.difficulty,
            "cookSchedule": convert_schedule_to_array_format(
                request.cookSchedule.model_dump()
            ),
        }
        preferences_str = json.dumps(preferences_dict, ensure_ascii=False, indent=2)
        
        # Step 1: Generate natural language meal plan
        step1_prompt = meal_plan_prompt(preferences_str)
        natural_plan = await gemini_service.generate(step1_prompt)
        
        if not natural_plan:
            raise HTTPException(status_code=500, detail="Empty response from meal plan generation")
        
        # Step 2: Convert to structured JSON
        step2_prompt = generate_structured_plan_prompt(natural_plan)
        structured_response = await gemini_service.generate(step2_prompt)
        
        # Parse structured response
        days_data = gemini_service.parse_json_response(structured_response)
        
        # Validate structure
        if not validate_meal_plan(days_data):
            raise HTTPException(status_code=500, detail="Invalid meal plan structure from AI")
        
        # Build response
        plan_id = f"mp_{uuid.uuid4().hex[:12]}"
        
        from app.models.schemas import UserPreferences
        preferences = UserPreferences(**request.model_dump())
        
        meal_plan = MealPlan(
            id=plan_id,
            createdAt=datetime.utcnow(),
            status=MealPlanStatus.ready,
            preferences=preferences,
            days=WeekDays(**days_data)
        )
        
        return meal_plan
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ParseError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/{plan_id}/modify", response_model=MealPlan)
async def modify_meal_plan(plan_id: str, request: ModifyMealPlanRequest):
    """
    Modify an existing meal plan based on user instructions.
    Single API call - modifies the structured plan directly.
    """
    try:
        # Convert preferences to string
        preferences_str = request.currentPlan.preferences.model_dump_json(indent=2)
        
        # Convert current plan to string
        previous_plan_str = request.currentPlan.model_dump_json(indent=2)
        
        # Generate modification prompt
        prompt = user_manipulation_prompt(
            user_input=request.modification,
            user_preferences=preferences_str,
            previous_plan=previous_plan_str
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
        if not validate_meal_plan(days_data):
            raise HTTPException(status_code=500, detail="Invalid meal plan structure from AI")
        
        # Build response with same ID
        meal_plan = MealPlan(
            id=plan_id,
            createdAt=datetime.utcnow(),
            status=MealPlanStatus.ready,
            preferences=request.currentPlan.preferences,
            days=WeekDays(**days_data)
        )
        
        return meal_plan
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ParseError as e:
        raise HTTPException(status_code=500, detail=str(e))
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
from app.services.prompts import generate_shopping_list_prompt
from app.utils.validators import validate_shopping_list

router = APIRouter()

@router.post("/generate", response_model=ShoppingList)
async def generate_shopping_list(request: GenerateShoppingListRequest):
    """Generate a shopping list from a meal plan."""
    try:
        # Generate prompt
        prompt = generate_shopping_list_prompt(request.mealPlan)
        
        # Call Gemini
        response_text = await gemini_service.generate(prompt)
        
        # Parse response
        list_data = gemini_service.parse_json_response(response_text)
        
        # Validate
        if not validate_shopping_list(list_data):
            raise HTTPException(status_code=500, detail="Invalid shopping list structure from AI")
        
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
            mealPlanId=request.mealPlanId,
            createdAt=datetime.utcnow(),
            items=items
        )
        
        return shopping_list
        
    except GeminiError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ParseError as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### utils/validators.py

```python
VALID_CATEGORIES = [
    "proteins", "vegetables", "fruits", "grains",
    "dairy", "seasonings", "pantry_staples", "others"
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]


def validate_recipe(recipe: dict) -> bool:
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
    
    if not isinstance(recipe.get("ingredients"), list):
        return False
    
    for ingredient in recipe["ingredients"]:
        required_ing = ["name", "quantity", "unit", "category"]
        for field in required_ing:
            if field not in ingredient:
                return False
        if ingredient["category"] not in VALID_CATEGORIES:
            return False
    
    return True


def validate_meal_plan(data: dict) -> bool:
    """Validate the complete weekly meal plan structure."""
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
            if not validate_recipe(recipe):
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
# Activate virtual environment
source venv/bin/activate

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
