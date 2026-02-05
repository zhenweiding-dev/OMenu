"""Application state models."""

from typing import Optional

from pydantic import BaseModel, Field

from app.models.menu import MenuBook
from app.models.user import UserPreferences


class UserState(BaseModel):
    """Persistent user state including preferences and menu history."""

    preferences: Optional[UserPreferences] = None
    menuBooks: list[MenuBook] = Field(default_factory=list)
    currentWeekId: Optional[str] = None
    currentDayIndex: int = Field(default=0, ge=0, le=6)
    isMenuOpen: bool = True
