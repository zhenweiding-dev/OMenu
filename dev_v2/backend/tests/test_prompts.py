from datetime import datetime, timezone

from app.models.schemas import (
    CookSchedule,
    DayMeals,
    Difficulty,
    Ingredient,
    MealPlan,
    MealPlanStatus,
    MealSelection,
    Recipe,
    UserPreferences,
    WeekDays,
)
from app.services.prompts import (
    meal_plan_prompt,
    modification_prompt,
    shopping_list_prompt,
    structured_plan_prompt,
)


def _sample_schedule() -> CookSchedule:
    selection = MealSelection(breakfast=False, lunch=True, dinner=True)
    empty = MealSelection()
    return CookSchedule(
        monday=selection,
        tuesday=empty,
        wednesday=empty,
        thursday=empty,
        friday=empty,
        saturday=empty,
        sunday=empty,
    )


def _sample_preferences() -> UserPreferences:
    return UserPreferences(
        keywords=["healthy"],
        mustHaveItems=["chicken"],
        dislikedItems=["mushrooms"],
        numPeople=2,
        budget=120,
        difficulty=Difficulty.medium,
        cookSchedule=_sample_schedule(),
    )


def _sample_meal_plan() -> MealPlan:
    recipe = Recipe(
        id="mon-lunch-001",
        name="Grilled Chicken Bowl",
        ingredients=[
            Ingredient(name="chicken", quantity=2, unit="breasts", category="proteins"),
            Ingredient(name="rice", quantity=1, unit="cup", category="grains"),
        ],
        instructions="1. Grill chicken. 2. Serve with rice.",
        estimatedTime=30,
        servings=2,
        difficulty=Difficulty.easy,
        totalCalories=600,
    )
    days = WeekDays(
        monday=DayMeals(lunch=recipe),
        tuesday=DayMeals(),
        wednesday=DayMeals(),
        thursday=DayMeals(),
        friday=DayMeals(),
        saturday=DayMeals(),
        sunday=DayMeals(),
    )
    return MealPlan(
        id="mp_test",
        createdAt=datetime.now(timezone.utc),
        status=MealPlanStatus.ready,
        preferences=_sample_preferences(),
        days=days,
    )


def test_meal_plan_prompt_mentions_budget() -> None:
    prompt = meal_plan_prompt(_sample_preferences())
    assert "$120" in prompt
    assert "Grilled" not in prompt  # ensures prompt is template, not actual meals


def test_structured_plan_prompt_mentions_servings() -> None:
    preferences = _sample_preferences()
    prompt = structured_plan_prompt("Sample plan text", preferences)
    assert str(preferences.numPeople) in prompt
    assert "RETURN ONLY THE RAW JSON OBJECT" in prompt


def test_modification_prompt_includes_request() -> None:
    plan = _sample_meal_plan()
    prompt = modification_prompt("Add more veggies", plan.model_dump_json(indent=2), plan.preferences.model_dump_json(indent=2))
    assert "Add more veggies" in prompt
    assert "RETURN ONLY THE MODIFIED JSON OBJECT" in prompt


def test_shopping_list_prompt_contains_rules() -> None:
    prompt = shopping_list_prompt(_sample_meal_plan())
    assert "Generate a consolidated shopping list" in prompt
    assert "Valid categories" in prompt
