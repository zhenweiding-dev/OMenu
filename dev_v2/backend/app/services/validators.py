"""Validation utilities for menu and shopping data."""

import re
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
FRESH_VEGETABLE_OVERRIDES = frozenset(
    [
        "green bean",
        "green beans",
        "green onion",
        "scallion",
        "spring onion",
        "onion",
        "garlic",
        "shallot",
        "leek",
    ]
)
SEASONING_KEYWORDS = frozenset(
    [
        "salt",
        "pepper",
        "oil",
        "olive oil",
        "vegetable oil",
        "canola oil",
        "avocado oil",
        "sesame oil",
        "coconut oil",
        "butter",
        "ghee",
        "soy sauce",
        "vinegar",
        "balsamic vinegar",
        "rice vinegar",
        "apple cider vinegar",
        "white vinegar",
        "red wine vinegar",
        "fish sauce",
        "oyster sauce",
        "hoisin",
        "teriyaki",
        "miso",
        "garlic powder",
        "onion powder",
        "paprika",
        "cumin",
        "chili powder",
        "cayenne",
        "chili flakes",
        "oregano",
        "basil",
        "thyme",
        "rosemary",
        "cinnamon",
        "nutmeg",
        "ginger",
        "ground ginger",
        "turmeric",
        "curry powder",
        "five spice",
        "italian seasoning",
        "bay leaf",
        "vanilla",
        "vanilla extract",
        "lemon juice",
        "lime juice",
        "garlic",
        "onion",
        "shallot",
    ]
)

PANTRY_KEYWORDS = frozenset(
    [
        "rice",
        "pasta",
        "spaghetti",
        "penne",
        "noodle",
        "noodles",
        "ramen",
        "udon",
        "soba",
        "couscous",
        "quinoa",
        "bulgur",
        "barley",
        "flour",
        "all-purpose flour",
        "bread flour",
        "cornmeal",
        "breadcrumbs",
        "panko",
        "oats",
        "oatmeal",
        "rolled oats",
        "bread",
        "tortilla",
        "bagel",
        "pita",
        "wrap",
        "canned beans",
        "black beans",
        "kidney beans",
        "pinto beans",
        "white beans",
        "navy beans",
        "garbanzo beans",
        "chickpeas",
        "lentils",
        "tomato sauce",
        "canned tomatoes",
        "tomato paste",
        "diced tomatoes",
        "crushed tomatoes",
        "marinara",
        "salsa",
        "stock",
        "broth",
        "vegetable broth",
        "chicken broth",
        "beef broth",
        "coconut milk",
        "peanut butter",
        "honey",
        "sugar",
        "brown sugar",
        "maple syrup",
        "jam",
        "jelly",
        "mustard",
        "ketchup",
        "mayonnaise",
        "hot sauce",
        "sriracha",
        "bbq sauce",
        "canned corn",
        "canned tuna",
        "tuna",
        "canned salmon",
        "salmon",
        "beans",
    ]
)


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
        name_key = name.strip().lower()
        if any(keyword in name_key for keyword in FRESH_VEGETABLE_OVERRIDES) and "powder" not in name_key:
            category = "vegetables"
        elif any(keyword in name_key for keyword in PANTRY_KEYWORDS):
            category = "pantry_staples"
        elif any(keyword in name_key for keyword in SEASONING_KEYWORDS):
            category = "seasonings"
        elif category not in VALID_CATEGORIES:
            category = "others"

        def _coerce_quantity(value: Any) -> float:
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                match = re.search(r"-?\d+(\.\d+)?", value)
                if match:
                    try:
                        return float(match.group(0))
                    except ValueError:
                        return 0.0
            return 0.0

        total_quantity = _coerce_quantity(raw_item.get("totalQuantity", 0))
        unit = str(raw_item.get("unit", "")).strip()
        if category == "seasonings":
            total_quantity = 0
            unit = ""

        return {
            "id": f"item_{uuid.uuid4().hex[:8]}",
            "name": name.strip()[:50],  # Limit name length
            "category": category,
            "totalQuantity": total_quantity,
            "unit": unit,
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
