"""Dish and ingredient domain models."""

from typing import Optional

from pydantic import BaseModel

from app.models.enums import Difficulty, DishSource, IngredientCategory


class Ingredient(BaseModel):
    """A single ingredient in a dish."""

    name: str
    quantity: float
    unit: str
    category: IngredientCategory


class Dish(BaseModel):
    """A recipe/dish with ingredients and cooking instructions."""

    id: str
    name: str
    ingredients: list[Ingredient]
    instructions: str
    estimatedTime: int  # in minutes
    servings: int
    difficulty: Difficulty
    totalCalories: int
    source: DishSource
    notes: Optional[str] = None
