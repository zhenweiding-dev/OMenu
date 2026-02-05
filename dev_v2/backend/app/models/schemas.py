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


class MenuBookStatus(str, Enum):
    generating = "generating"
    ready = "ready"
    error = "error"


class DishSource(str, Enum):
    ai = "ai"
    manual = "manual"


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
    preferredItems: List[str] = Field(default_factory=list)
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


class Dish(BaseModel):
    id: str
    name: str
    ingredients: List[Ingredient]
    instructions: str
    estimatedTime: int
    servings: int
    difficulty: Difficulty
    totalCalories: int
    source: DishSource
    notes: Optional[str] = None


class Menu(BaseModel):
    breakfast: List[Dish] = Field(default_factory=list)
    lunch: List[Dish] = Field(default_factory=list)
    dinner: List[Dish] = Field(default_factory=list)


class WeekMenus(BaseModel):
    monday: Menu
    tuesday: Menu
    wednesday: Menu
    thursday: Menu
    friday: Menu
    saturday: Menu
    sunday: Menu


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
    menuBookId: str
    createdAt: datetime
    items: List[ShoppingItem]


class MenuBook(BaseModel):
    id: str
    createdAt: datetime
    status: MenuBookStatus
    preferences: UserPreferences
    menus: WeekMenus
    shoppingList: ShoppingList


class GenerateMenuBookRequest(BaseModel):
    keywords: List[str] = Field(default_factory=list)
    preferredItems: List[str] = Field(default_factory=list)
    dislikedItems: List[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class ModifyMenuBookRequest(BaseModel):
    modification: str = Field(max_length=200)
    currentMenuBook: MenuBook


class GenerateShoppingListRequest(BaseModel):
    menuBookId: str
    menus: WeekMenus


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail] = Field(default_factory=list)


class UserState(BaseModel):
    preferences: Optional[UserPreferences] = None
    menuBooks: List[MenuBook] = Field(default_factory=list)
    currentWeekId: Optional[str] = None
    currentDayIndex: int = Field(default=0, ge=0, le=6)
    isMenuOpen: bool = True
