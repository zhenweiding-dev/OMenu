"""Menu Extras API routes - stores extra meals added to menu books."""
from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.schemas import Recipe
from app.storage import load_menu_extras, save_menu_extras

router = APIRouter()

# Type: { bookId: { day: { mealType: Recipe[] } } }
MenuExtrasType = Dict[str, Dict[str, Dict[str, List[Recipe]]]]


class MenuExtrasPayload(BaseModel):
    extras: MenuExtrasType = {}


@router.get("", response_model=MenuExtrasPayload)
async def get_menu_extras() -> MenuExtrasPayload:
    """Get all menu extras."""
    return MenuExtrasPayload(extras=load_menu_extras())


@router.put("", response_model=MenuExtrasPayload)
async def update_menu_extras(payload: MenuExtrasPayload) -> MenuExtrasPayload:
    """Update menu extras."""
    save_menu_extras(payload.extras)
    return payload
