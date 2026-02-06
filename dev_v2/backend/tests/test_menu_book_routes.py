from datetime import datetime, timezone

import pytest

from app.core.exceptions import GeminiTimeoutError, ParseError
from app.api.v1 import menu_books as menu_books_router


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
    created_at = datetime.now(timezone.utc).isoformat()
    menu_book = {
        "id": "mb_test",
        "createdAt": created_at,
        "status": "ready",
        "preferences": sample_preferences,
        "menus": _empty_week(),
        "shoppingList": {
            "id": "sl_test",
            "menuBookId": "mb_test",
            "createdAt": created_at,
            "items": [],
        },
    }

    class FakeMenuService:
        async def generate(self, preferences):  # noqa: D401
            return menu_book

    monkeypatch.setattr(menu_books_router, "get_menu_service", lambda: FakeMenuService())

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
    class FakeMenuService:
        async def generate(self, preferences):  # noqa: D401
            raise ParseError("bad data")

    monkeypatch.setattr(menu_books_router, "get_menu_service", lambda: FakeMenuService())

    response = await async_client.post(
        "/api/menu-books/generate",
        json=sample_preferences,
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"


@pytest.mark.asyncio
async def test_generate_menu_book_timeout(async_client, monkeypatch, sample_preferences):
    class FakeMenuService:
        async def generate(self, preferences):  # noqa: D401
            raise GeminiTimeoutError("timeout")

    monkeypatch.setattr(menu_books_router, "get_menu_service", lambda: FakeMenuService())

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
    class FakeMenuService:
        async def modify(self, book_id, modification, current_book):  # noqa: D401
            return sample_menu_book

    monkeypatch.setattr(menu_books_router, "get_menu_service", lambda: FakeMenuService())

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
    class FakeMenuService:
        async def modify(self, book_id, modification, current_book):  # noqa: D401
            raise ParseError("bad data")

    monkeypatch.setattr(menu_books_router, "get_menu_service", lambda: FakeMenuService())

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
