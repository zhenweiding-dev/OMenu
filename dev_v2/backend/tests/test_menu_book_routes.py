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
        "specificPreferences": ["chicken"],
        "specificDisliked": ["mushrooms"],
        "numPeople": 2,
        "budget": 150,
        "difficulty": "easy",
        "cookSchedule": schedule,
    }


def _empty_week() -> dict:
    day_template = {"breakfast": [], "lunch": [], "dinner": []}
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
async def test_generate_menu_book_success(async_client, monkeypatch, sample_preferences):
    responses = [
        "Here is a draft menu",
        json.dumps({"menus": _empty_week()}),
    ]

    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return responses.pop(0)

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/menu-books/generate",
        json=sample_preferences,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["preferences"]["budget"] == 150
    assert body["menus"]["monday"]["lunch"] == []


@pytest.mark.asyncio
async def test_generate_menu_book_invalid_ai_payload(async_client, monkeypatch, sample_preferences):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return "{}"

    def fake_parse(_: str) -> dict:
        raise ParseError("bad data")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)
    monkeypatch.setattr(gemini_service, "parse_json_response", fake_parse)

    response = await async_client.post(
        "/api/menu-books/generate",
        json=sample_preferences,
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"


@pytest.mark.asyncio
async def test_generate_menu_book_timeout(async_client, monkeypatch, sample_preferences):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        raise GeminiTimeoutError("timeout")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/menu-books/generate",
        json=sample_preferences,
    )

    assert response.status_code == 504
    body = response.json()
    assert body["detail"]["code"] == "GEMINI_TIMEOUT"


@pytest.fixture
def sample_menu_book(sample_preferences: dict) -> dict:
    created_at = datetime.now(timezone.utc).isoformat()
    return {
        "id": "mb_existing",
        "createdAt": created_at,
        "status": "ready",
        "preferences": sample_preferences,
        "menus": _empty_week(),
        "shoppingList": {
            "id": "sl_existing",
            "menuBookId": "mb_existing",
            "createdAt": created_at,
            "items": [],
        },
    }


@pytest.mark.asyncio
async def test_modify_menu_book_success(async_client, monkeypatch, sample_menu_book):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return json.dumps({"menus": _empty_week()})

    monkeypatch.setattr(gemini_service, "generate", fake_generate)

    response = await async_client.post(
        "/api/menu-books/mb_existing/modify",
        json={
            "modification": "Add more vegetarian options",
            "currentMenuBook": sample_menu_book,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "mb_existing"
    assert body["menus"]["friday"]["dinner"] == []


@pytest.mark.asyncio
async def test_modify_menu_book_parse_error(async_client, monkeypatch, sample_menu_book):
    async def fake_generate(prompt: str, timeout_seconds: float | None = None) -> str:
        return json.dumps({"menus": _empty_week()})

    def fake_parse(_: str) -> dict:
        raise ParseError("bad data")

    monkeypatch.setattr(gemini_service, "generate", fake_generate)
    monkeypatch.setattr(gemini_service, "parse_json_response", fake_parse)

    response = await async_client.post(
        "/api/menu-books/mb_existing/modify",
        json={
            "modification": "Increase protein",
            "currentMenuBook": sample_menu_book,
        },
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"
