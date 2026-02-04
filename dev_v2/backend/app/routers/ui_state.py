"""UI State API routes - stores view preferences."""
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.storage import load_ui_state, save_ui_state

router = APIRouter()


class UIStatePayload(BaseModel):
    currentWeekId: Optional[str] = None
    currentDayIndex: int = Field(default=0, ge=0, le=6)
    isMenuOpen: bool = True


@router.get("", response_model=UIStatePayload)
async def get_ui_state() -> UIStatePayload:
    """Get UI state (selected week, day index, menu open state)."""
    data = load_ui_state()
    return UIStatePayload(
        currentWeekId=data.get("currentWeekId"),
        currentDayIndex=data.get("currentDayIndex", 0),
        isMenuOpen=data.get("isMenuOpen", True),
    )


@router.put("", response_model=UIStatePayload)
async def update_ui_state(payload: UIStatePayload) -> UIStatePayload:
    """Update UI state."""
    save_ui_state(payload.model_dump())
    return payload
