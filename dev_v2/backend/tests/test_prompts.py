from datetime import datetime, timezone

from app.models.dish import Dish, Ingredient
from app.models.enums import Difficulty, DishSource, MenuBookStatus
from app.models.menu import Menu, MenuBook, WeekMenus
from app.models.shopping import ShoppingList
from app.models.user import CookSchedule, MealSelection, UserPreferences
from app.services.ai.prompts import PromptBuilder


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


def test_meal_outline_prompt_mentions_budget() -> None:
    prompt = PromptBuilder().meal_outline(_sample_preferences(), ingredient_limit=20)
    assert "mealOutline" in prompt
    assert "draftShoppingList" in prompt
    assert "BudgetUSD" in prompt


def test_structured_menu_prompt_mentions_servings() -> None:
    preferences = _sample_preferences()
    prompt = PromptBuilder().structured_menu_from_outline(
        meal_outline={"monday": {"lunch": ["Sample Dish"]}},
        draft_shopping_list=[{"name": "chicken", "category": "proteins"}],
        preferences=preferences,
    )
    assert "DraftShoppingList" in prompt
    assert str(preferences.numPeople) in prompt
    assert "RETURN ONLY THE RAW JSON OBJECT" in prompt


def test_modification_prompt_includes_request() -> None:
    book = _sample_menu_book()
    prompt = PromptBuilder().modification("Add more veggies", book.menus.model_dump(), book.preferences)
    assert "Add more veggies" in prompt
    assert "RETURN ONLY THE MODIFIED JSON OBJECT" in prompt


def test_shopping_list_prompt_contains_rules() -> None:
    menus = _sample_menu_book().menus
    prompt = PromptBuilder().shopping_list(menus)
    assert "Generate a consolidated shopping list" in prompt
    assert "Valid categories" in prompt
