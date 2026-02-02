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

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEALS = ["breakfast", "lunch", "dinner"]
VALID_DIFFICULTIES = ["easy", "medium", "hard"]


def validate_recipe(recipe: dict) -> bool:
    if recipe is None:
        return True

    required_fields = [
        "id",
        "name",
        "ingredients",
        "instructions",
        "estimatedTime",
        "servings",
        "difficulty",
        "totalCalories",
    ]

    for field in required_fields:
        if field not in recipe:
            return False

    if recipe.get("difficulty") not in VALID_DIFFICULTIES:
        return False

    ingredients = recipe.get("ingredients")
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


def validate_meal_plan(data: dict) -> bool:
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

            if not validate_recipe(day_data[meal]):
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
