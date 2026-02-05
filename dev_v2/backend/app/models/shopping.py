"""Shopping list domain models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import IngredientCategory


class ShoppingItem(BaseModel):
    """A single item in the shopping list."""

    id: str
    name: str
    category: IngredientCategory
    totalQuantity: float
    unit: str
    purchased: bool = False
    isManuallyAdded: Optional[bool] = None


class ShoppingList(BaseModel):
    """A shopping list derived from a menu book."""

    id: str
    menuBookId: str
    createdAt: datetime
    items: list[ShoppingItem]
