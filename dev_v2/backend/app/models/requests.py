"""API request and response models."""

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import Difficulty
from app.models.menu import MenuBook, WeekMenus
from app.models.user import CookSchedule


class GenerateMenuBookRequest(BaseModel):
    """Request to generate a new menu book."""

    specificPreferences: list[str] = Field(default_factory=list)
    specificDisliked: list[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule


class ModifyMenuBookRequest(BaseModel):
    """Request to modify an existing menu book."""

    modification: str = Field(max_length=200)
    currentMenuBook: MenuBook


class GenerateShoppingListRequest(BaseModel):
    """Request to generate a shopping list from menus."""

    menuBookId: str
    menus: WeekMenus


class ErrorDetail(BaseModel):
    """Details about a specific error."""

    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Standard error response format."""

    code: str
    message: str
    details: list[ErrorDetail] = Field(default_factory=list)
