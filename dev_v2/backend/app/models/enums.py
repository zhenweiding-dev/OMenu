"""Enumeration types for the application."""

from enum import Enum


class Difficulty(str, Enum):
    """Recipe difficulty levels."""

    easy = "easy"
    medium = "medium"
    hard = "hard"


class IngredientCategory(str, Enum):
    """Categories for ingredients and shopping items."""

    proteins = "proteins"
    vegetables = "vegetables"
    fruits = "fruits"
    grains = "grains"
    dairy = "dairy"
    seasonings = "seasonings"
    pantry_staples = "pantry_staples"
    others = "others"


class MenuBookStatus(str, Enum):
    """Status of a menu book generation."""

    generating = "generating"
    ready = "ready"
    error = "error"


class DishSource(str, Enum):
    """Origin of a dish recipe."""

    ai = "ai"
    manual = "manual"
