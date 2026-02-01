"""
Pydantic models for OMenu API.

These models define the data structures used across the application.
They match the TypeScript interfaces in the frontend.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Enums
# =============================================================================

class IngredientCategory(str, Enum):
    """Category for ingredients in shopping list."""
    proteins = "proteins"
    vegetables = "vegetables"
    fruits = "fruits"
    grains = "grains"
    dairy = "dairy"
    seasonings = "seasonings"  # NO quantity displayed
    pantry_staples = "pantry_staples"
    others = "others"


class Difficulty(str, Enum):
    """Recipe difficulty level."""
    easy = "easy"
    medium = "medium"
    hard = "hard"


class MealPlanStatus(str, Enum):
    """Status of meal plan generation."""
    generating = "generating"
    ready = "ready"
    error = "error"


# =============================================================================
# Core Models
# =============================================================================

class Ingredient(BaseModel):
    """Single ingredient in a recipe."""
    name: str
    quantity: float
    unit: str
    category: IngredientCategory


class Recipe(BaseModel):
    """A meal recipe with ingredients and instructions."""
    id: str
    name: str
    ingredients: List[Ingredient]
    instructions: str
    estimatedTime: int  # minutes
    servings: int
    difficulty: Difficulty
    totalCalories: int
    notes: Optional[str] = None


# =============================================================================
# Schedule Models
# =============================================================================

class MealSelection(BaseModel):
    """Boolean flags for each meal of a day."""
    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False


class CookSchedule(BaseModel):
    """Weekly cooking schedule (which meals to plan)."""
    monday: MealSelection
    tuesday: MealSelection
    wednesday: MealSelection
    thursday: MealSelection
    friday: MealSelection
    saturday: MealSelection
    sunday: MealSelection


# =============================================================================
# Meal Plan Models
# =============================================================================

class DayMeals(BaseModel):
    """All meals for a single day."""
    breakfast: Optional[Recipe] = None
    lunch: Optional[Recipe] = None
    dinner: Optional[Recipe] = None


class WeekDays(BaseModel):
    """All days of the week with their meals."""
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals


class UserPreferences(BaseModel):
    """User preferences for meal plan generation."""
    keywords: List[str] = Field(default_factory=list)
    mustHaveItems: List[str] = Field(default_factory=list)
    dislikedItems: List[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class MealPlan(BaseModel):
    """Complete weekly meal plan."""
    id: str
    createdAt: datetime
    status: MealPlanStatus
    preferences: UserPreferences
    days: WeekDays


# =============================================================================
# Shopping List Models
# =============================================================================

class ShoppingItem(BaseModel):
    """Single item in shopping list."""
    id: str
    name: str
    category: IngredientCategory
    totalQuantity: float
    unit: str
    purchased: bool = False
    isManuallyAdded: Optional[bool] = None


class ShoppingList(BaseModel):
    """Complete shopping list for a meal plan."""
    id: str
    mealPlanId: str
    createdAt: datetime
    items: List[ShoppingItem]


# =============================================================================
# API Request/Response Models
# =============================================================================

class GenerateMealPlanRequest(BaseModel):
    """Request body for meal plan generation."""
    keywords: List[str] = Field(default_factory=list)
    mustHaveItems: List[str] = Field(default_factory=list)
    dislikedItems: List[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class ModifyMealPlanRequest(BaseModel):
    """Request body for meal plan modification."""
    modification: str = Field(..., max_length=200)
    currentPlan: MealPlan


class GenerateShoppingListRequest(BaseModel):
    """Request body for shopping list generation."""
    mealPlanId: str
    mealPlan: MealPlan


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: datetime
