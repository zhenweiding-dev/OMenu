"""Shopping list API endpoints."""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import AppException
from app.models import GenerateShoppingListRequest, ShoppingList
from app.services import get_shopping_service

router = APIRouter()


@router.post("/generate", response_model=ShoppingList)
async def generate_shopping_list(request: GenerateShoppingListRequest) -> ShoppingList:
    """Generate a shopping list from weekly menus."""
    try:
        service = get_shopping_service()
        return await service.generate(
            menu_book_id=request.menuBookId,
            menus=request.menus,
        )

    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.to_dict()) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail={"code": "INTERNAL_ERROR", "message": str(exc)},
        ) from exc
