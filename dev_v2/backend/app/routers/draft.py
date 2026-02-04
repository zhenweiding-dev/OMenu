"""Draft State API routes - stores in-progress plan creation."""
from fastapi import APIRouter

from app.models.schemas import DraftState
from app.storage import clear_draft, load_draft, save_draft

router = APIRouter()


@router.get("", response_model=DraftState | None)
async def get_draft() -> DraftState | None:
    """Get current draft state."""
    return load_draft()


@router.put("", response_model=DraftState)
async def update_draft(payload: DraftState) -> DraftState:
    """Save/update draft state."""
    save_draft(payload)
    return payload


@router.delete("", status_code=204)
async def delete_draft() -> None:
    """Clear draft state."""
    clear_draft()
