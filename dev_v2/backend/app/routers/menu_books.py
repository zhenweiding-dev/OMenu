import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

# NOTE: This router was renamed from meal_plans.py to menu_books.py to match MenuBook terminology.
from app.models.schemas import (
    GenerateMenuBookRequest,
    MenuBook,
    MenuBookStatus,
    ModifyMenuBookRequest,
    ShoppingList,
    UserPreferences,
    WeekMenus,
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
from app.services.prompts import (
    menu_book_prompt,
    modification_prompt,
    structured_menu_prompt,
)
from app.utils.validators import DAYS, MEALS, validate_menus

router = APIRouter()


def _normalize_menus(raw_data: dict) -> dict:
    menus_data = raw_data.get("menus") or raw_data.get("days") or raw_data
    if not isinstance(menus_data, dict):
        raise ParseError("Menu data must be an object")

    normalized: dict[str, dict[str, list[dict]]] = {}
    for day in DAYS:
        day_data = menus_data.get(day, {}) if isinstance(menus_data.get(day), dict) else {}
        normalized_day: dict[str, list[dict]] = {}
        for meal in MEALS:
            value = day_data.get(meal, [])
            if value is None:
                meals = []
            elif isinstance(value, list):
                meals = value
            elif isinstance(value, dict):
                meals = [value]
            else:
                meals = []
            for dish in meals:
                if isinstance(dish, dict):
                    dish["source"] = "ai"
            normalized_day[meal] = meals
        normalized[day] = normalized_day

    if not validate_menus(normalized):
        raise ParseError("Invalid menu structure from AI")

    return normalized


@router.post("/generate", response_model=MenuBook)
async def generate_menu_book(request: GenerateMenuBookRequest) -> MenuBook:
    try:
        preferences = UserPreferences(
            keywords=request.keywords,
            preferredItems=request.preferredItems,
            dislikedItems=request.dislikedItems,
            numPeople=request.numPeople,
            budget=request.budget,
            difficulty=request.difficulty,
            cookSchedule=request.cookSchedule,
        )

        natural_prompt = menu_book_prompt(preferences)
        natural_menu = await gemini_service.generate(natural_prompt)

        structure_prompt = structured_menu_prompt(natural_menu, preferences)
        structured_response = await gemini_service.generate(structure_prompt)
        menu_data = gemini_service.parse_json_response(structured_response)

        normalized = _normalize_menus(menu_data)

        book_id = f"mb_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc)

        placeholder_list = ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:12]}",
            menuBookId=book_id,
            createdAt=created_at,
            items=[],
        )

        menu_book = MenuBook(
            id=book_id,
            createdAt=created_at,
            status=MenuBookStatus.ready,
            preferences=preferences,
            menus=WeekMenus(**normalized),
            shoppingList=placeholder_list,
        )
        return menu_book
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


@router.post("/{book_id}/modify", response_model=MenuBook)
async def modify_menu_book(book_id: str, request: ModifyMenuBookRequest) -> MenuBook:
    try:
        current_book = request.currentMenuBook
        prompt = modification_prompt(
            modification=request.modification,
            current_menu=current_book.menus.model_dump_json(indent=2),
            preferences=current_book.preferences,
        )

        response_text = await gemini_service.generate(prompt)
        menu_data = gemini_service.parse_json_response(response_text)
        normalized = _normalize_menus(menu_data)

        updated_book = MenuBook(
            id=book_id,
            createdAt=current_book.createdAt,
            status=MenuBookStatus.ready,
            preferences=current_book.preferences,
            menus=WeekMenus(**normalized),
            shoppingList=current_book.shoppingList,
        )
        return updated_book
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
