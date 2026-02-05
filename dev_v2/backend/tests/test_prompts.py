from datetime import datetime, timezone

from app.models.schemas import (
    CookSchedule,
    Difficulty,
    Dish,
    DishSource,
    Ingredient,
    MealSelection,
    Menu,
    MenuBook,
    MenuBookStatus,
    ShoppingList,
    UserPreferences,
    WeekMenus,
)
from app.services.prompts import (
    menu_book_prompt,
    modification_prompt,
    shopping_list_prompt,
    structured_menu_prompt,
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
        specificPreferences=["chicken"],
        specificDisliked=["mushrooms"],
        numPeople=2,
        budget=120,
        difficulty=Difficulty.medium,
        cookSchedule=_sample_schedule(),
    )


def _sample_menu_book() -> MenuBook:
    dish = Dish(
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
        source=DishSource.ai,
    )
    menus = WeekMenus(
        monday=Menu(lunch=[dish]),
        tuesday=Menu(),
        wednesday=Menu(),
        thursday=Menu(),
        friday=Menu(),
        saturday=Menu(),
        sunday=Menu(),
    )
    created_at = datetime.now(timezone.utc)
    shopping_list = ShoppingList(
        id="sl_test",
        menuBookId="mb_test",
        createdAt=created_at,
        items=[],
    )
    return MenuBook(
        id="mb_test",
        createdAt=created_at,
        status=MenuBookStatus.ready,
        preferences=_sample_preferences(),
        menus=menus,
        shoppingList=shopping_list,
    )


def test_menu_book_prompt_mentions_budget() -> None:
    prompt = menu_book_prompt(_sample_preferences())
    assert "$120" in prompt
    assert "Grilled" not in prompt  # ensures prompt is template, not actual meals


def test_structured_menu_prompt_mentions_servings() -> None:
    preferences = _sample_preferences()
    prompt = structured_menu_prompt("Sample menu text", preferences)
    assert str(preferences.numPeople) in prompt
    assert "RETURN ONLY THE RAW JSON OBJECT" in prompt


def test_modification_prompt_includes_request() -> None:
    book = _sample_menu_book()
    prompt = modification_prompt("Add more veggies", book.menus.model_dump_json(indent=2), book.preferences)
    assert "Add more veggies" in prompt
    assert "RETURN ONLY THE MODIFIED JSON OBJECT" in prompt


def test_shopping_list_prompt_contains_rules() -> None:
    menus = _sample_menu_book().menus
    prompt = shopping_list_prompt(menus)
    assert "Generate a consolidated shopping list" in prompt
    assert "Valid categories" in prompt
