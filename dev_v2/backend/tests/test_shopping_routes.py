import json
from datetime import datetime, timezone

import pytest

from app.services.gemini import GeminiTimeoutError, gemini_service


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
    assert body["menuBookId"] == "mb_existing"
    assert len(body["items"]) == 1
    assert body["items"][0]["category"] == "proteins"


@pytest.mark.asyncio
async def test_generate_shopping_list_invalid_category(async_client, monkeypatch, sample_menus):
    payload = {
        "menuBookId": "mb_existing",
        "menus": sample_menus,
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
async def test_generate_shopping_list_timeout(async_client, monkeypatch, sample_menus):
    payload = {
        "menuBookId": "mb_existing",
        "menus": sample_menus,
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
