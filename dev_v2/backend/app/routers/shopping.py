import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    GenerateShoppingListRequest,
    IngredientCategory,
    ShoppingItem,
    ShoppingList,
)
from app.services.gemini import (
    GeminiError,
    GeminiOverloadedError,
    GeminiQuotaExceededError,
    GeminiSafetyError,
    GeminiTimeoutError,
    ParseError,
    gemini_service,
)
from app.services.prompts import shopping_list_prompt
from app.utils.validators import validate_shopping_list

router = APIRouter()


@router.post("/generate", response_model=ShoppingList)
async def generate_shopping_list(request: GenerateShoppingListRequest) -> ShoppingList:
    try:
        prompt = shopping_list_prompt(request.menus)
        response_text = await gemini_service.generate(prompt)
        list_data = gemini_service.parse_json_response(response_text)

        if not validate_shopping_list(list_data):
            raise ParseError("Invalid shopping list structure from AI")

        list_id = f"sl_{uuid.uuid4().hex[:12]}"
        items = [
            ShoppingItem(
                id=f"item_{uuid.uuid4().hex[:8]}",
                name=item["name"],
                category=IngredientCategory(item["category"]),
                totalQuantity=item.get("totalQuantity", 0),
                unit=item.get("unit", ""),
                purchased=False,
            )
            for item in list_data.get("items", [])
        ]

        shopping_list = ShoppingList(
            id=list_id,
            menuBookId=request.menuBookId,
            createdAt=datetime.now(timezone.utc),
            items=items,
        )
        return shopping_list
    except GeminiTimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail={"code": "GEMINI_TIMEOUT", "message": str(exc)},
        ) from exc
    except GeminiQuotaExceededError as exc:
        raise HTTPException(
            status_code=429,
            detail={"code": "GEMINI_QUOTA_EXCEEDED", "message": str(exc)},
        ) from exc
    except GeminiOverloadedError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "GEMINI_OVERLOADED", "message": str(exc)},
        ) from exc
    except GeminiSafetyError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "GEMINI_SAFETY_BLOCKED", "message": str(exc)},
        ) from exc
    except GeminiError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "GEMINI_ERROR", "message": str(exc)},
        ) from exc
    except ParseError as exc:
        raise HTTPException(
            status_code=500,
            detail={"code": "PARSE_ERROR", "message": str(exc)},
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(
            status_code=500,
            detail={"code": "INTERNAL_ERROR", "message": str(exc)},
        ) from exc
