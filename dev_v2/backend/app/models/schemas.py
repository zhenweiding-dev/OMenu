from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


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


class MealPlanStatus(str, Enum):
    generating = "generating"
    ready = "ready"
    error = "error"


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


class UserPreferences(BaseModel):
    keywords: List[str] = Field(default_factory=list)
    mustHaveItems: List[str] = Field(default_factory=list)
    dislikedItems: List[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str
    category: IngredientCategory


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


class DayMeals(BaseModel):
    breakfast: Optional[Recipe] = None
    lunch: Optional[Recipe] = None
    dinner: Optional[Recipe] = None


class WeekDays(BaseModel):
    monday: DayMeals
    tuesday: DayMeals
    wednesday: DayMeals
    thursday: DayMeals
    friday: DayMeals
    saturday: DayMeals
    sunday: DayMeals


class MealPlan(BaseModel):
    id: str
    createdAt: datetime
    status: MealPlanStatus
    preferences: UserPreferences
    days: WeekDays


class ShoppingItem(BaseModel):
    id: str
    name: str
    category: IngredientCategory
    totalQuantity: float
    unit: str
    purchased: bool = False
    isManuallyAdded: Optional[bool] = None


class ShoppingList(BaseModel):
    id: str
    mealPlanId: str
    createdAt: datetime
    items: List[ShoppingItem]


class GenerateMealPlanRequest(BaseModel):
    keywords: List[str] = Field(default_factory=list)
    mustHaveItems: List[str] = Field(default_factory=list)
    dislikedItems: List[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class ModifyMealPlanRequest(BaseModel):
    modification: str = Field(max_length=200)
    currentPlan: MealPlan


class GenerateShoppingListRequest(BaseModel):
    mealPlanId: str
    mealPlan: MealPlan


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail] = Field(default_factory=list)
