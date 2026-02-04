"""Profile / User Preferences API routes."""
from fastapi import APIRouter, HTTPException

from app.models.schemas import UserPreferences
from app.storage import load_profile, save_profile

router = APIRouter()


@router.get("", response_model=UserPreferences | None)
async def get_profile() -> UserPreferences | None:
    """Get user preferences/profile."""
    return load_profile()


@router.put("", response_model=UserPreferences)
async def update_profile(payload: UserPreferences) -> UserPreferences:
    """Update user preferences/profile."""
    save_profile(payload)
    return payload
