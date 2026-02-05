"""Menu generation service."""

import uuid
from datetime import datetime, timezone

from app.core.exceptions import ParseError
from app.models import (
    MenuBook,
    MenuBookStatus,
    ShoppingList,
    UserPreferences,
    WeekMenus,
)
from app.services.ai.client import GeminiClient, get_gemini_client
from app.services.ai.parser import ResponseParser
from app.services.ai.prompts import PromptBuilder
from app.services.validators import MenuValidator

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
MEALS = ("breakfast", "lunch", "dinner")


class MenuService:
    """Service for generating and modifying menu books."""

    def __init__(self, client: GeminiClient | None = None) -> None:
        self._client = client or get_gemini_client()
        self._parser = ResponseParser()
        self._prompts = PromptBuilder()
        self._validator = MenuValidator()

    async def generate(self, preferences: UserPreferences) -> MenuBook:
        """Generate a new menu book based on user preferences.

        Args:
            preferences: User's meal planning preferences.

        Returns:
            Complete MenuBook with menus and placeholder shopping list.
        """
        # Step 1: Generate natural language menu
        natural_prompt = self._prompts.menu_book(preferences)
        natural_menu = await self._client.generate(natural_prompt)

        # Step 2: Convert to structured JSON
        structure_prompt = self._prompts.structured_menu(natural_menu, preferences)
        structured_response = await self._client.generate(structure_prompt)
        menu_data = self._parser.parse_json(structured_response)

        # Normalize and validate
        normalized = self._normalize_menus(menu_data)

        # Build menu book
        book_id = f"mb_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc)

        placeholder_list = ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:12]}",
            menuBookId=book_id,
            createdAt=created_at,
            items=[],
        )

        return MenuBook(
            id=book_id,
            createdAt=created_at,
            status=MenuBookStatus.ready,
            preferences=preferences,
            menus=WeekMenus(**normalized),
            shoppingList=placeholder_list,
        )

    async def modify(
        self, book_id: str, modification: str, current_book: MenuBook
    ) -> MenuBook:
        """Modify an existing menu book.

        Args:
            book_id: ID of the menu book to modify.
            modification: User's modification request.
            current_book: Current state of the menu book.

        Returns:
            Modified MenuBook.
        """
        prompt = self._prompts.modification(
            modification=modification,
            current_menu=current_book.menus.model_dump_json(indent=2),
            preferences=current_book.preferences,
        )

        response_text = await self._client.generate(prompt)
        menu_data = self._parser.parse_json(response_text)
        normalized = self._normalize_menus(menu_data)

        return MenuBook(
            id=book_id,
            createdAt=current_book.createdAt,
            status=MenuBookStatus.ready,
            preferences=current_book.preferences,
            menus=WeekMenus(**normalized),
            shoppingList=current_book.shoppingList,
        )

    def _normalize_menus(self, raw_data: dict) -> dict:
        """Normalize menu data from AI response."""
        menus_data = raw_data.get("menus") or raw_data.get("days") or raw_data
        if not isinstance(menus_data, dict):
            raise ParseError("Menu data must be an object")

        normalized: dict[str, dict[str, list[dict]]] = {}

        for day in DAYS:
            day_data = menus_data.get(day, {})
            if not isinstance(day_data, dict):
                day_data = {}

            normalized_day: dict[str, list[dict]] = {}
            for meal in MEALS:
                value = day_data.get(meal, [])
                if value is None:
                    meals = []
                elif isinstance(value, list):
                    meals = value
                elif isinstance(value, dict):
                    meals = [value]
                else:
                    meals = []

                # Ensure AI source is set
                for dish in meals:
                    if isinstance(dish, dict):
                        dish["source"] = "ai"

                normalized_day[meal] = meals

            normalized[day] = normalized_day

        if not self._validator.validate_menus(normalized):
            raise ParseError("Invalid menu structure from AI")

        return normalized


def get_menu_service() -> MenuService:
    """Get menu service instance."""
    return MenuService()
