import pytest

from app.core.exceptions import GeminiTimeoutError, ParseError
from app.api.v1 import shopping as shopping_router


@pytest.fixture
def sample_menus() -> dict:
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
async def test_generate_shopping_list_success(async_client, monkeypatch, sample_menus):
    payload = {
        "menuBookId": "mb_existing",
        "menus": sample_menus,
    }

    result = {
        "id": "sl_test",
        "menuBookId": "mb_existing",
        "createdAt": "2025-01-01T00:00:00Z",
        "items": [
            {
                "id": "item_test",
                "name": "chicken breast",
                "category": "proteins",
                "totalQuantity": 4,
                "unit": "pieces",
                "purchased": False,
            }
        ],
    }

    class FakeShoppingService:
        async def generate(self, menu_book_id, menus):  # noqa: D401
            return result

    monkeypatch.setattr(shopping_router, "get_shopping_service", lambda: FakeShoppingService())

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["menuBookId"] == "mb_existing"
    assert len(body["items"]) == 1
    assert body["items"][0]["category"] == "proteins"


@pytest.mark.asyncio
async def test_generate_shopping_list_invalid_category(async_client, monkeypatch, sample_menus):
    payload = {
        "menuBookId": "mb_existing",
        "menus": sample_menus,
    }

    class FakeShoppingService:
        async def generate(self, menu_book_id, menus):  # noqa: D401
            raise ParseError("bad data")

    monkeypatch.setattr(shopping_router, "get_shopping_service", lambda: FakeShoppingService())

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 500
    body = response.json()
    assert body["detail"]["code"] == "PARSE_ERROR"


@pytest.mark.asyncio
async def test_generate_shopping_list_timeout(async_client, monkeypatch, sample_menus):
    payload = {
        "menuBookId": "mb_existing",
        "menus": sample_menus,
    }

    class FakeShoppingService:
        async def generate(self, menu_book_id, menus):  # noqa: D401
            raise GeminiTimeoutError("timeout")

    monkeypatch.setattr(shopping_router, "get_shopping_service", lambda: FakeShoppingService())

    response = await async_client.post(
        "/api/shopping-lists/generate",
        json=payload,
    )

    assert response.status_code == 504
    body = response.json()
    assert body["detail"]["code"] == "GEMINI_TIMEOUT"
