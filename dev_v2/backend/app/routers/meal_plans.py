import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
	GenerateMealPlanRequest,
	MealPlan,
	MealPlanStatus,
	ModifyMealPlanRequest,
	UserPreferences,
	WeekDays,
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
	meal_plan_prompt,
	modification_prompt,
	structured_plan_prompt,
)
from app.utils.validators import validate_meal_plan

router = APIRouter()


@router.post("/generate", response_model=MealPlan)
async def generate_meal_plan(request: GenerateMealPlanRequest) -> MealPlan:
	try:
		preferences = UserPreferences(
			keywords=request.keywords,
			mustHaveItems=request.mustHaveItems,
			dislikedItems=request.dislikedItems,
			numPeople=request.numPeople,
			budget=request.budget,
			difficulty=request.difficulty,
			cookSchedule=request.cookSchedule,
		)

		natural_prompt = meal_plan_prompt(preferences)
		natural_plan = await gemini_service.generate(natural_prompt)

		structure_prompt = structured_plan_prompt(natural_plan, preferences)
		structured_response = await gemini_service.generate(structure_prompt)
		days_data = gemini_service.parse_json_response(structured_response)

		if "days" in days_data:
			days_data = days_data["days"]

		if not validate_meal_plan(days_data):
			raise ParseError("Invalid meal plan structure from AI")

		plan_id = f"mp_{uuid.uuid4().hex[:12]}"
		meal_plan = MealPlan(
			id=plan_id,
			createdAt=datetime.now(timezone.utc),
			status=MealPlanStatus.ready,
			preferences=preferences,
			days=WeekDays(**days_data),
		)
		return meal_plan
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


@router.post("/{plan_id}/modify", response_model=MealPlan)
async def modify_meal_plan(plan_id: str, request: ModifyMealPlanRequest) -> MealPlan:
	try:
		prompt = modification_prompt(
			modification=request.modification,
			current_plan=request.currentPlan.model_dump_json(indent=2),
			preferences=request.currentPlan.preferences.model_dump_json(indent=2),
		)

		response_text = await gemini_service.generate(prompt)
		plan_data = gemini_service.parse_json_response(response_text)

		if "days" in plan_data:
			days_data = plan_data["days"]
		else:
			days_data = plan_data

		if not validate_meal_plan(days_data):
			raise ParseError("Invalid meal plan structure from AI")

		updated_plan = MealPlan(
			id=plan_id,
			createdAt=datetime.now(timezone.utc),
			status=MealPlanStatus.ready,
			preferences=request.currentPlan.preferences,
			days=WeekDays(**days_data),
		)
		return updated_plan
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
