import json
from datetime import datetime, timezone

import pytest

from app.services.gemini import GeminiTimeoutError, gemini_service


@pytest.fixture
def sample_plan() -> dict:
    day_template = {"breakfast": None, "lunch": None, "dinner": None}
    week = {
        "monday": dict(day_template),
        "tuesday": dict(day_template),
        "wednesday": dict(day_template),
        "thursday": dict(day_template),
        "friday": dict(day_template),
        "saturday": dict(day_template),
        "sunday": dict(day_template),
    }
    schedule = {
        "monday": {"breakfast": False, "lunch": True, "dinner": True},
        "tuesday": {"breakfast": False, "lunch": False, "dinner": False},
        "wednesday": {"breakfast": False, "lunch": False, "dinner": False},
        "thursday": {"breakfast": False, "lunch": False, "dinner": False},
        "friday": {"breakfast": False, "lunch": False, "dinner": False},
        "saturday": {"breakfast": False, "lunch": False, "dinner": False},
        "sunday": {"breakfast": False, "lunch": False, "dinner": False},
    }
    preferences = {
        "keywords": ["quick"],
        "mustHaveItems": ["chicken"],
        "dislikedItems": ["mushrooms"],
        "numPeople": 2,
        "budget": 150,
        "difficulty": "easy",
        "cookSchedule": schedule,
    }
    return {
        "id": "mp_existing",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "status": "ready",
        "preferences": preferences,
        "days": week,
    }


@pytest.mark.asyncio
async def test_generate_shopping_list_success(async_client, monkeypatch, sample_plan):
    payload = {
        "mealPlanId": sample_plan["id"],
        "mealPlan": sample_plan,
    }

    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return json.dumps(
            {
                "items": [
                    {
                        "name": "chicken breast",
                        "category": "proteins",
                        "totalQuantity": 4,
                        "unit": "pieces",
                    }
                ]
            }
        )

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mealPlanId"] == sample_plan["id"]
    assert len(body["items"]) == 1
    assert body["items"][0]["category"] == "proteins"


@pytest.mark.asyncio
async def test_generate_shopping_list_invalid_category(async_client, monkeypatch, sample_plan):
    payload = {
        "mealPlanId": sample_plan["id"],
        "mealPlan": sample_plan,
    }

    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return "{}"

    def fake_parse(_: str) -> dict:
        return {
            "items": [
                {
                    "name": "mystery ingredient",
                    "category": "invalid",
                    "totalQuantity": 1,
                    "unit": "bag",
                }
            ]
        }

    monkeypatch.setattr(gemini_service, "generate", fake_generate)
    monkeypatch.setattr(gemini_service, "parse_json_response", fake_parse)

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"


@pytest.mark.asyncio
async def test_generate_shopping_list_timeout(async_client, monkeypatch, sample_plan):
    payload = {
        "mealPlanId": sample_plan["id"],
        "mealPlan": sample_plan,
    }

    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        raise GeminiTimeoutError("timeout")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 504
    body = response.json()
    assert body["detail"]["code"] == "GEMINI_TIMEOUT"
