"""Validation utilities for menu and shopping data."""

import re
import uuid

VALID_CATEGORIES = frozenset([
    "proteins", "vegetables", "fruits", "grains",
    "dairy", "seasonings", "pantry_staples", "others",
])

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
MEALS = ("breakfast", "lunch", "dinner")

VALID_DIFFICULTIES = frozenset(["easy", "medium", "hard"])


def normalize_category(value) -> str:
    """The AI's own category when it is a valid one, else "others"."""
    category = str(value or "").strip().lower().replace(" ", "_")
    return category if category in VALID_CATEGORIES else "others"


_UNICODE_FRACTIONS = {"½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125}


def coerce_quantity(value) -> float:
    """A number from the AI's quantity, also when it comes as text such as "2 cups", "1/2" or "1 ½"."""
    if isinstance(value, bool):
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return 0.0
    text = value
    for symbol, number in _UNICODE_FRACTIONS.items():
        text = text.replace(symbol, f" {number}")
    text = re.sub(r"(\d+)\s*/\s*(\d+)", lambda m: f" {int(m.group(1)) / int(m.group(2)) if int(m.group(2)) else 0}", text)
    # A whole number followed by a fraction ("1 0.5" after the replacements above) adds up.
    match = re.match(r"\s*(\d+(?:\.\d+)?)(?:\s+(0?\.\d+))?", text)
    if match:
        return round(float(match.group(1)) + (float(match.group(2)) if match.group(2) else 0.0), 2)
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return round(float(match.group(0)), 2) if match else 0.0


class ShoppingValidator:
    def normalize_item(self, raw_item: dict, index: int) -> dict | None:
        name = raw_item.get("name")
        if not name or not isinstance(name, str):
            return None

        category = normalize_category(raw_item.get("category"))
        total_quantity = coerce_quantity(raw_item.get("totalQuantity", 0))
        unit = str(raw_item.get("unit", "")).strip()
        # Oils, sauces and spices are assumed to be at home, so the list shows no amount.
        if category == "seasonings":
            total_quantity = 0
            unit = ""

        return {
            "id": f"item_{uuid.uuid4().hex[:8]}",
            "name": name.strip()[:50],
            "category": category,
            "totalQuantity": total_quantity,
            "unit": unit,
            "purchased": False,
        }
