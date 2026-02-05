"""Menu and menu book domain models."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.dish import Dish
from app.models.enums import MenuBookStatus
from app.models.shopping import ShoppingList
from app.models.user import UserPreferences


class Menu(BaseModel):
    """A single day's menu with three meals."""

    breakfast: list[Dish] = Field(default_factory=list)
    lunch: list[Dish] = Field(default_factory=list)
    dinner: list[Dish] = Field(default_factory=list)


class WeekMenus(BaseModel):
    """A full week of daily menus."""

    monday: Menu
    tuesday: Menu
    wednesday: Menu
    thursday: Menu
    friday: Menu
    saturday: Menu
    sunday: Menu


class MenuBook(BaseModel):
    """A complete weekly meal plan with menus and shopping list."""

    id: str
    createdAt: datetime
    status: MenuBookStatus
    preferences: UserPreferences
    menus: WeekMenus
    shoppingList: ShoppingList
