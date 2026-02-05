"""Domain models for the OMenu application.

This module re-exports all models for convenient importing.
"""

from app.models.dish import Dish, Ingredient
from app.models.enums import (
    Difficulty,
    DishSource,
    IngredientCategory,
    MenuBookStatus,
)
from app.models.menu import Menu, MenuBook, WeekMenus
from app.models.requests import (
    ErrorDetail,
    ErrorResponse,
    GenerateMenuBookRequest,
    GenerateShoppingListRequest,
    ModifyMenuBookRequest,
)
from app.models.shopping import ShoppingItem, ShoppingList
from app.models.state import UserState
from app.models.user import CookSchedule, MealSelection, UserPreferences

__all__ = [
    # Enums
    "Difficulty",
    "IngredientCategory",
    "MenuBookStatus",
    "DishSource",
    # Dish models
    "Ingredient",
    "Dish",
    # User models
    "MealSelection",
    "CookSchedule",
    "UserPreferences",
    # Menu models
    "Menu",
    "WeekMenus",
    "MenuBook",
    # Shopping models
    "ShoppingItem",
    "ShoppingList",
    # State models
    "UserState",
    # Request models
    "GenerateMenuBookRequest",
    "ModifyMenuBookRequest",
    "GenerateShoppingListRequest",
    "ErrorDetail",
    "ErrorResponse",
]
