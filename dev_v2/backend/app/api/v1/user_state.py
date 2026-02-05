"""User state API endpoints."""

from fastapi import APIRouter

from app.models import UserState
from app.repositories import get_user_state_repository

router = APIRouter()


@router.get("", response_model=UserState)
async def get_user_state() -> UserState:
    """Retrieve the current user state."""
    repository = get_user_state_repository()
    return repository.load()


@router.put("", response_model=UserState)
async def save_user_state(state: UserState) -> UserState:
    """Save user state to persistent storage."""
    repository = get_user_state_repository()
    repository.save(state)
    return state
