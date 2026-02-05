VALID_CATEGORIES = [
    "proteins",
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "seasonings",
    "pantry_staples",
    "others",
]

VALID_SOURCES = ["ai", "manual"]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]
VALID_DIFFICULTIES = ["easy", "medium", "hard"]


def validate_dish(dish: dict) -> bool:
    if not isinstance(dish, dict):
        return False

    required_fields = [
        "id",
        "name",
        "ingredients",
        "instructions",
        "estimatedTime",
        "servings",
        "difficulty",
        "totalCalories",
        "source",
    ]

    for field in required_fields:
        if field not in dish:
            return False

    if dish.get("difficulty") not in VALID_DIFFICULTIES:
        return False

    if dish.get("source") not in VALID_SOURCES:
        return False

    ingredients = dish.get("ingredients")
    if not isinstance(ingredients, list):
        return False

    for ingredient in ingredients:
        if not validate_ingredient(ingredient):
            return False

    return True


def validate_ingredient(ingredient: dict) -> bool:
    required_fields = ["name", "quantity", "unit", "category"]

    for field in required_fields:
        if field not in ingredient:
            return False

    if ingredient["category"] not in VALID_CATEGORIES:
        return False

    if not isinstance(ingredient.get("quantity"), (int, float)):
        return False

    return True


def validate_menus(data: dict) -> bool:
    if not isinstance(data, dict):
        return False

    for day in DAYS:
        if day not in data:
            return False

        day_data = data[day]
        if not isinstance(day_data, dict):
            return False

        for meal in MEALS:
            if meal not in day_data:
                return False

            meals = day_data[meal]
            if not isinstance(meals, list):
                return False

            for dish in meals:
                if not validate_dish(dish):
                    return False

    return True


def validate_shopping_list(data: dict) -> bool:
    if "items" not in data or not isinstance(data["items"], list):
        return False

    for item in data["items"]:
        required_fields = ["name", "category"]
        for field in required_fields:
            if field not in item:
                return False
        if item["category"] not in VALID_CATEGORIES:
            return False

    return True
