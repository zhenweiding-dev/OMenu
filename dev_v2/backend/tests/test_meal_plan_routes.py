import json
from datetime import datetime, timezone

import pytest

from app.services.gemini import GeminiTimeoutError, ParseError, gemini_service


@pytest.fixture
def sample_preferences() -> dict:
    schedule = {
        "monday": {"breakfast": False, "lunch": True, "dinner": True},
        "tuesday": {"breakfast": False, "lunch": False, "dinner": False},
        "wednesday": {"breakfast": False, "lunch": False, "dinner": False},
        "thursday": {"breakfast": False, "lunch": False, "dinner": False},
        "friday": {"breakfast": False, "lunch": False, "dinner": False},
        "saturday": {"breakfast": False, "lunch": False, "dinner": False},
        "sunday": {"breakfast": False, "lunch": False, "dinner": False},
    }
    return {
        "keywords": ["quick"],
        "mustHaveItems": ["chicken"],
        "dislikedItems": ["mushrooms"],
        "numPeople": 2,
        "budget": 150,
        "difficulty": "easy",
        "cookSchedule": schedule,
    }


def _empty_week() -> dict:
    day_template = {"breakfast": None, "lunch": None, "dinner": None}
    return {
        "monday": dict(day_template),
        "tuesday": dict(day_template),
        "wednesday": dict(day_template),
        "thursday": dict(day_template),
        "friday": dict(day_template),
        "saturday": dict(day_template),
        "sunday": dict(day_template),
    }


@pytest.mark.asyncio
async def test_generate_meal_plan_success(async_client, monkeypatch, sample_preferences):
    responses = [
        "Here is a draft meal plan",
        json.dumps({"days": _empty_week()}),
    ]

    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return responses.pop(0)

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/meal-plans/generate",
        json=sample_preferences,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["preferences"]["budget"] == 150
    assert body["days"]["monday"]["lunch"] is None


@pytest.mark.asyncio
async def test_generate_meal_plan_invalid_ai_payload(async_client, monkeypatch, sample_preferences):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return "{}"

    def fake_parse(_: str) -> dict:
        raise ParseError("bad data")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)
    monkeypatch.setattr(gemini_service, "parse_json_response", fake_parse)

    response = await async_client.post(
        "/api/meal-plans/generate",
        json=sample_preferences,
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"


@pytest.mark.asyncio
async def test_generate_meal_plan_timeout(async_client, monkeypatch, sample_preferences):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        raise GeminiTimeoutError("timeout")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/meal-plans/generate",
        json=sample_preferences,
    )

    assert response.status_code == 504
    body = response.json()
    assert body["detail"]["code"] == "GEMINI_TIMEOUT"


@pytest.fixture
def sample_plan(sample_preferences: dict) -> dict:
    return {
        "id": "mp_existing",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "status": "ready",
        "preferences": sample_preferences,
        "days": _empty_week(),
    }


@pytest.mark.asyncio
async def test_modify_meal_plan_success(async_client, monkeypatch, sample_plan):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return json.dumps({"days": _empty_week()})

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/meal-plans/mp_existing/modify",
        json={
            "modification": "Add more vegetarian options",
            "currentPlan": sample_plan,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "mp_existing"
    assert body["days"]["friday"]["dinner"] is None


@pytest.mark.asyncio
async def test_modify_meal_plan_parse_error(async_client, monkeypatch, sample_plan):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return json.dumps({"days": _empty_week()})

    def fake_parse(_: str) -> dict:
        raise ParseError("bad data")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)
    monkeypatch.setattr(gemini_service, "parse_json_response", fake_parse)

    response = await async_client.post(
        "/api/meal-plans/mp_existing/modify",
        json={
            "modification": "Increase protein",
            "currentPlan": sample_plan,
        },
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"
