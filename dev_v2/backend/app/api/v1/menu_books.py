"""Menu books API endpoints."""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import AppException
from app.models import (
    GenerateMenuBookRequest,
    MenuBook,
    ModifyMenuBookRequest,
    UserPreferences,
)
from app.services import get_menu_service

router = APIRouter()


@router.post("/generate", response_model=MenuBook)
async def generate_menu_book(request: GenerateMenuBookRequest) -> MenuBook:
    """Generate a new weekly menu book based on user preferences."""
    try:
        preferences = UserPreferences(
            specificPreferences=request.specificPreferences,
            specificDisliked=request.specificDisliked,
            numPeople=request.numPeople,
            budget=request.budget,
            difficulty=request.difficulty,
            cookSchedule=request.cookSchedule,
        )

        service = get_menu_service()
        return await service.generate(preferences)

    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.to_dict()) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail={"code": "INTERNAL_ERROR", "message": str(exc)},
        ) from exc


@router.post("/{book_id}/modify", response_model=MenuBook)
async def modify_menu_book(book_id: str, request: ModifyMenuBookRequest) -> MenuBook:
    """Modify an existing menu book based on user feedback."""
    try:
        service = get_menu_service()
        return await service.modify(
            book_id=book_id,
            modification=request.modification,
            current_book=request.currentMenuBook,
        )

    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.to_dict()) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail={"code": "INTERNAL_ERROR", "message": str(exc)},
        ) from exc
