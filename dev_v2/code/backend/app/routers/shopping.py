"""
Shopping lists router.

Endpoints:
- POST /api/shopping-lists/generate - Generate shopping list from meal plan
"""

import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    GenerateShoppingListRequest,
    ShoppingList,
)
from app.services.gemini import (
    get_gemini_client,
    GeminiTimeoutError,
    GeminiRetryExhaustedError,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shopping-lists", tags=["Shopping Lists"])


@router.post("/generate", response_model=ShoppingList)
async def generate_shopping_list(request: GenerateShoppingListRequest):
    """
    Generate a consolidated shopping list from a meal plan.
    
    The list merges similar ingredients and uses North American units.
    Seasonings have quantity set to 0 (not displayed in UI).
    
    Timeout: 60s, up to 3 retries.
    """
    try:
        client = get_gemini_client()
        shopping_list = await client.generate_shopping_list(
            meal_plan_id=request.mealPlanId,
            meal_plan=request.mealPlan,
        )
        
        logger.info(f"Generated shopping list: {shopping_list.id}")
        return shopping_list
    
    except (GeminiTimeoutError, GeminiRetryExhaustedError) as e:
        logger.error(f"Gemini API failed: {e}")
        raise HTTPException(
            status_code=504,
            detail="It's taking longer than usual. Please try again."
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate shopping list: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate shopping list. Please try again."
        )
