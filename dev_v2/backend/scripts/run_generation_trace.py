import argparse
import asyncio
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.models.user import CookSchedule, MealSelection, UserPreferences
from app.models.menu import WeekMenus
from app.services.ai.client import GeminiClient
from app.services.ai.parser import ResponseParser
from app.services.ai.prompts import PromptBuilder
from app.services.menu_service import MenuService
from app.services.shopping_service import ShoppingService


@dataclass
class TraceStep:
    prompt: str
    raw_response: str | None
    parsed: Any | None
    normalized: Any | None
    error: str | None = None


def _default_preferences() -> UserPreferences:
    schedule = CookSchedule(
        monday=MealSelection(breakfast=False, lunch=True, dinner=True),
        tuesday=MealSelection(breakfast=False, lunch=True, dinner=True),
        wednesday=MealSelection(breakfast=False, lunch=True, dinner=True),
        thursday=MealSelection(breakfast=False, lunch=True, dinner=True),
        friday=MealSelection(breakfast=True, lunch=True, dinner=True),
        saturday=MealSelection(breakfast=True, lunch=True, dinner=True),
        sunday=MealSelection(breakfast=True, lunch=True, dinner=True),
    )
    return UserPreferences(
        specificPreferences=["quick", "high protein", "asian flavors"],
        specificDisliked=["tree nuts"],
        numPeople=2,
        budget=120,
        difficulty="medium",
        cookSchedule=schedule,
    )


def _load_preferences(path: str | None) -> UserPreferences:
    if not path:
        return _default_preferences()
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    return UserPreferences(**payload)


async def run_trace(preferences: UserPreferences) -> dict[str, Any]:
    prompts = PromptBuilder()
    parser = ResponseParser()
    menu_service = MenuService()
    shopping_service = ShoppingService()
    client = GeminiClient()

    trace: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "preferences": json.loads(preferences.model_dump_json()),
        "steps": {},
    }

    # Step 1: outline + draft list
    ingredient_limit = menu_service._estimate_ingredient_limit(preferences)
    step1_prompt = prompts.meal_outline(preferences, ingredient_limit)
    step1 = TraceStep(prompt=step1_prompt, raw_response=None, parsed=None, normalized=None)
    try:
        step1.raw_response = await client.generate_json(step1_prompt)
        step1.parsed = parser.parse_json(step1.raw_response)
        outline = step1.parsed.get("mealOutline") if isinstance(step1.parsed, dict) else None
        draft_list = step1.parsed.get("draftShoppingList") if isinstance(step1.parsed, dict) else None
        normalized_list = menu_service._normalize_draft_list(draft_list or [])
        step1.normalized = {
            "mealOutline": outline,
            "draftShoppingList": normalized_list,
        }
    except Exception as exc:  # noqa: BLE001
        step1.error = str(exc)
    trace["steps"]["step1_outline"] = asdict(step1)

    # Step 2: structured menu
    step2 = TraceStep(prompt="", raw_response=None, parsed=None, normalized=None)
    try:
        outline = step1.normalized.get("mealOutline") if step1.normalized else None
        draft_list = step1.normalized.get("draftShoppingList") if step1.normalized else None
        step2.prompt = prompts.structured_menu_from_outline(
            meal_outline=outline or {},
            draft_shopping_list=draft_list or [],
            preferences=preferences,
        )
        step2.raw_response = await client.generate_json(step2.prompt)
        step2.parsed = parser.parse_json(step2.raw_response)
        normalized_menu = menu_service._normalize_menus(
            step2.parsed,
            schedule=preferences.cookSchedule,
            preferences=preferences,
        )
        step2.normalized = normalized_menu
    except Exception as exc:  # noqa: BLE001
        step2.error = str(exc)
    trace["steps"]["step2_structured_menu"] = asdict(step2)

    # Step 3: shopping list
    step3 = TraceStep(prompt="", raw_response=None, parsed=None, normalized=None)
    try:
        if step2.normalized:
            menus = WeekMenus(**step2.normalized)
            step3.prompt = prompts.shopping_list(menus)
            step3.raw_response = await client.generate_json(step3.prompt)
            step3.parsed = parser.parse_json(step3.raw_response)
            raw_items = step3.parsed.get("items", []) if isinstance(step3.parsed, dict) else []
            normalized_items = []
            for idx, raw_item in enumerate(raw_items):
                item_data = shopping_service._validator.normalize_item(raw_item, idx)
                if item_data:
                    normalized_items.append(item_data)
            step3.normalized = {"items": normalized_items}
    except Exception as exc:  # noqa: BLE001
        step3.error = str(exc)
    trace["steps"]["step3_shopping_list"] = asdict(step3)

    return trace


async def main() -> None:
    parser = argparse.ArgumentParser(description="Run full AI generation trace.")
    parser.add_argument("--preferences", type=str, default=None, help="Path to preferences JSON file")
    parser.add_argument("--output", type=str, default=None, help="Output log file path")
    args = parser.parse_args()

    preferences = _load_preferences(args.preferences)
    trace = await run_trace(preferences)

    output_dir = Path("dev_v2/backend/logs")
    output_dir.mkdir(parents=True, exist_ok=True)
    if args.output:
        output_path = Path(args.output)
    else:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"ai_trace_{timestamp}.json"

    output_path.write_text(json.dumps(trace, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Trace saved to {output_path}")


if __name__ == "__main__":
    asyncio.run(main())
