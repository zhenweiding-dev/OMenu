"""Shopping list generation service."""

import uuid
from datetime import datetime, timezone

from app.core.exceptions import ParseError
from app.models import ShoppingItem, ShoppingList, WeekMenus
from app.services.ai.client import GeminiClient, get_gemini_client
from app.services.ai.parser import ResponseParser
from app.services.ai.prompts import PromptBuilder
from app.services.validators import ShoppingValidator


class ShoppingService:
    """Service for generating shopping lists from menus."""

    def __init__(self, client: GeminiClient | None = None) -> None:
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()
        self._validator = ShoppingValidator()

    async def generate(self, menu_book_id: str, menus: WeekMenus) -> ShoppingList:
        """Generate a shopping list from weekly menus.

        Args:
            menu_book_id: ID of the associated menu book.
            menus: Weekly menus to extract ingredients from.

        Returns:
            Consolidated ShoppingList.
        """
        prompt = self._prompts.shopping_list(menus)
        response_text = await self._client.generate(prompt)
        data = self._parser.parse_json(response_text)

        # Validate and build items
        raw_items = data.get("items", [])
        if not isinstance(raw_items, list):
            raise ParseError("Shopping list items must be an array")

        items = []
        for idx, raw_item in enumerate(raw_items):
            if not isinstance(raw_item, dict):
                continue

            item_data = self._validator.normalize_item(raw_item, idx)
            if item_data:
                items.append(ShoppingItem(**item_data))

        return ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:12]}",
            menuBookId=menu_book_id,
            createdAt=datetime.now(timezone.utc),
            items=items,
        )


def get_shopping_service() -> ShoppingService:
    """Get shopping service instance."""
    return ShoppingService()
