import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture(autouse=True)
def _set_test_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", "test-key"))


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
