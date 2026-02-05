"""Validation utilities for menu and shopping data."""

import uuid
from typing import Any

VALID_CATEGORIES = frozenset([
    "proteins",
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "seasonings",
    "pantry_staples",
    "others",
])

VALID_DAYS = frozenset([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
])

VALID_MEALS = frozenset(["breakfast", "lunch", "dinner"])

VALID_DIFFICULTIES = frozenset(["easy", "medium", "hard"])


class MenuValidator:
    """Validator for menu structures."""

    def validate_dish(self, dish: dict) -> bool:
        """Check if a dish has required fields and valid values."""
        required = {
            "id",
            "name",
            "ingredients",
            "instructions",
            "estimatedTime",
            "servings",
            "difficulty",
            "totalCalories",
            "source",
        }
        if not required.issubset(dish.keys()):
            return False

        if dish.get("difficulty") not in VALID_DIFFICULTIES:
            return False

        if dish.get("source") not in ("ai", "manual"):
            return False

        return True

    def validate_menus(self, menus: dict) -> bool:
        """Validate the complete menu structure."""
        if not isinstance(menus, dict):
            return False

        for day in VALID_DAYS:
            day_data = menus.get(day)
            if not isinstance(day_data, dict):
                return False

            for meal in VALID_MEALS:
                meal_dishes = day_data.get(meal)
                if meal_dishes is None:
                    continue

                if not isinstance(meal_dishes, list):
                    return False

                for dish in meal_dishes:
                    if isinstance(dish, dict) and not self.validate_dish(dish):
                        return False

        return True


class ShoppingValidator:
    """Validator for shopping list items."""

    def normalize_item(self, raw_item: dict, index: int) -> dict[str, Any] | None:
        """Normalize and validate a shopping item.

        Args:
            raw_item: Raw item data from AI.
            index: Item index for ID generation.

        Returns:
            Normalized item dict or None if invalid.
        """
        name = raw_item.get("name")
        if not name or not isinstance(name, str):
            return None

        category = raw_item.get("category", "others")
        if category not in VALID_CATEGORIES:
            category = "others"

        return {
            "id": f"item_{uuid.uuid4().hex[:8]}",
            "name": name.strip()[:50],  # Limit name length
            "category": category,
            "totalQuantity": float(raw_item.get("totalQuantity", 0)),
            "unit": str(raw_item.get("unit", "")).strip(),
            "purchased": False,
        }

    def validate_item(self, item: dict) -> bool:
        """Check if a shopping item is valid."""
        required = {"id", "name", "category"}
        if not required.issubset(item.keys()):
            return False

        if item.get("category") not in VALID_CATEGORIES:
            return False

        return True
