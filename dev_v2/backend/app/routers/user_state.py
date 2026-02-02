from fastapi import APIRouter

from app.models.schemas import UserState
from app.storage import load_state, save_state

router = APIRouter()


@router.get("", response_model=UserState)
async def get_user_state() -> UserState:
    return load_state()


@router.put("", response_model=UserState)
async def put_user_state(payload: UserState) -> UserState:
    save_state(payload)
    return payload
