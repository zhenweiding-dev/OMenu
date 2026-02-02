"""
Meal plans router.

Endpoints:
- POST /api/meal-plans/generate - Generate new meal plan
- POST /api/meal-plans/{id}/modify - Modify existing meal plan
"""

import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    GenerateMealPlanRequest,
    ModifyMealPlanRequest,
    MealPlan,
    UserPreferences,
)
from app.services.gemini import (
    get_gemini_client,
    GeminiTimeoutError,
    GeminiRetryExhaustedError,
    IncompleteRecipeError,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/meal-plans", tags=["Meal Plans"])


@router.post("/generate", response_model=MealPlan)
async def generate_meal_plan(request: GenerateMealPlanRequest):
    """
    Generate a new weekly meal plan based on user preferences.
    
    This endpoint uses a two-step Gemini API process:
    1. Generate natural language meal plan (creative)
    2. Convert to structured JSON (reliable)
    
    Timeout: 60s per step, up to 3 retries each.
    """
    try:
        # Convert request to UserPreferences
        preferences = UserPreferences(
            keywords=request.keywords,
            mustHaveItems=request.mustHaveItems,
            dislikedItems=request.dislikedItems,
            numPeople=request.numPeople,
            budget=request.budget,
            difficulty=request.difficulty,
            cookSchedule=request.cookSchedule,
        )
        
        client = get_gemini_client()
        meal_plan = await client.generate_meal_plan(preferences)
        
        logger.info(f"Generated meal plan: {meal_plan.id}")
        return meal_plan
    
    except (GeminiTimeoutError, GeminiRetryExhaustedError) as e:
        logger.error(f"Gemini API failed: {e}")
        raise HTTPException(
            status_code=504,
            detail="It's taking longer than usual. Please try again."
        )
    except IncompleteRecipeError as e:
        logger.error(f"Incomplete recipe data after retries: {e}")
        raise HTTPException(
            status_code=502,
            detail="AI returned incomplete data. Please try again."
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate meal plan: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate meal plan. Please try again."
        )


@router.post("/{plan_id}/modify", response_model=MealPlan)
async def modify_meal_plan(plan_id: str, request: ModifyMealPlanRequest):
    """
    Modify an existing meal plan based on user input.
    
    Makes minimal changes to accommodate the user's request
    while preserving the rest of the plan.
    
    Timeout: 60s, up to 3 retries.
    """
    try:
        client = get_gemini_client()
        modified_plan = await client.modify_meal_plan(
            modification_text=request.modification,
            current_plan=request.currentPlan,
        )
        
        logger.info(f"Modified meal plan: {plan_id}")
        return modified_plan
    
    except (GeminiTimeoutError, GeminiRetryExhaustedError) as e:
        logger.error(f"Gemini API failed: {e}")
        raise HTTPException(
            status_code=504,
            detail="It's taking longer than usual. Please try again."
        )
    except IncompleteRecipeError as e:
        logger.error(f"Incomplete recipe data after retries: {e}")
        raise HTTPException(
            status_code=502,
            detail="AI returned incomplete data. Please try again."
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to modify meal plan: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to modify meal plan. Please try again."
        )
