"""User-related domain models."""

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import Difficulty


class MealSelection(BaseModel):
    """Which meals are scheduled for a single day."""

    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False


class CookSchedule(BaseModel):
    """Weekly cooking schedule indicating which meals to prepare."""

    monday: MealSelection
    tuesday: MealSelection
    wednesday: MealSelection
    thursday: MealSelection
    friday: MealSelection
    saturday: MealSelection
    sunday: MealSelection


class UserPreferences(BaseModel):
    """User's meal planning preferences."""

    keywords: list[str] = Field(default_factory=list)
    preferredItems: list[str] = Field(default_factory=list)
    dislikedItems: list[str] = Field(default_factory=list)
    numPeople: int = Field(ge=1, le=10, default=2)
    budget: int = Field(ge=50, le=500, default=100)
    difficulty: Difficulty = Difficulty.medium
    cookSchedule: CookSchedule
