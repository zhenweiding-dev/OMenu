"""Shopping list generation service (synchronous for Vercel)."""

import uuid
from datetime import datetime, timezone

from _shared.exceptions import ParseError
from _shared.ai_client import GeminiClient, get_gemini_client
from _shared.parser import ResponseParser
from _shared.prompts import PromptBuilder
from _shared.validators import ShoppingValidator


class ShoppingService:
    def __init__(self, client: GeminiClient | None = None):
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()
        self._validator = ShoppingValidator()

    def generate(self, menu_book_id: str, menus: dict) -> dict:
        prompt = self._prompts.shopping_list(menus)
        response_text = self._client.generate_json(prompt)
        data = self._parser.parse_json(response_text)

        raw_items = data.get("items", [])
        if not isinstance(raw_items, list):
            raise ParseError("Shopping list items must be an array")

        items = []
        for idx, raw_item in enumerate(raw_items):
            if not isinstance(raw_item, dict):
                continue
            item_data = self._validator.normalize_item(raw_item, idx)
            if item_data:
                items.append(item_data)

        return {
            "id": f"sl_{uuid.uuid4().hex[:12]}",
            "menuBookId": menu_book_id,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "items": items,
        }


def get_shopping_service() -> ShoppingService:
    return ShoppingService()
