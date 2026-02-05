import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.models.schemas import (
    CookSchedule,
    GenerateMenuBookRequest,
    MealSelection,
    Menu,
    MenuBook,
    MenuBookStatus,
    ShoppingList,
    UserPreferences,
    WeekMenus,
)
from app.services.gemini import ParseError, gemini_service
from app.services.prompts import menu_book_prompt, shopping_list_prompt, structured_menu_prompt
from app.utils.validators import validate_menus, validate_shopping_list


def to_json(data: object) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)


def build_schedule() -> CookSchedule:
    # Use a slimmed-down schedule to keep Gemini outputs manageable for the demo run.
    return CookSchedule(
        monday=MealSelection(dinner=True),
        tuesday=MealSelection(lunch=True),
        wednesday=MealSelection(lunch=True, dinner=True),
        thursday=MealSelection(),
        friday=MealSelection(dinner=True),
        saturday=MealSelection(breakfast=True, lunch=True),
        sunday=MealSelection(),
    )


def build_request(schedule: CookSchedule) -> GenerateMenuBookRequest:
    return GenerateMenuBookRequest(
        keywords=["healthy", "quick"],
        preferredItems=["chicken", "rice"],
        dislikedItems=["mushrooms"],
        numPeople=2,
        budget=120,
        difficulty="medium",
        cookSchedule=schedule,
    )


def build_report_header(timestamp: str) -> list[str]:
    return ["# Backend End-to-End Run — 2026-02-01", "", f"**Timestamp:** {timestamp}", ""]


def render_section(title: str, body: str) -> str:
    return f"### {title}\n\n{body.strip()}\n"


def render_prompt_section(title: str, prompt: str, response: str) -> str:
    return render_section(
        title,
        "\n".join(
            [
                "**Prompt**",
                "",
                f"```\n{prompt}\n```",
                "",
                "**Gemini Response**",
                "",
                f"```\n{response}\n```",
            ]
        ),
    )


def ensure_menu_payload(raw: dict) -> dict:
    if "menus" in raw:
        return raw["menus"]
    if "days" in raw:
        return raw["days"]
    return raw


def coerce_menus(payload: dict) -> WeekMenus:
    return WeekMenus(**{day: Menu(**payload.get(day, {})) for day in payload})


async def main() -> None:
    schedule = build_schedule()
    request_body = build_request(schedule)
    preferences = UserPreferences(**request_body.model_dump())

    step1_prompt = menu_book_prompt(preferences)
    step1_response = await gemini_service.generate(step1_prompt)

    compact_menu = step1_response
    try:
        parsed_menu = gemini_service.parse_json_response(step1_response)
        compact_menu = json.dumps(parsed_menu, ensure_ascii=False, separators=(",", ":"))
    except ParseError:
        pass

    step2_prompt = structured_menu_prompt(compact_menu, preferences)
    step2_response = await gemini_service.generate(step2_prompt)
    structured_data = gemini_service.parse_json_response(step2_response)
    menus_payload = ensure_menu_payload(structured_data)
    menus_valid = validate_menus(menus_payload)

    created_at = datetime.now(timezone.utc)
    shopping_list = ShoppingList(
        id="sl_fulltest",
        menuBookId="mb_fulltest",
        createdAt=created_at,
        items=[],
    )
    menu_book = MenuBook(
        id="mb_fulltest",
        createdAt=created_at,
        status=MenuBookStatus.ready,
        preferences=preferences,
        menus=coerce_menus(menus_payload),
        shoppingList=shopping_list,
    )

    step3_prompt = shopping_list_prompt(menu_book.menus)
    step3_response = await gemini_service.generate(step3_prompt)
    shopping_data = gemini_service.parse_json_response(step3_response)
    shopping_valid = validate_shopping_list(shopping_data)

    timestamp = datetime.now(timezone.utc).isoformat()
    parts: list[str] = build_report_header(timestamp)
    parts.append(render_section("Request Payload", f"```json\n{to_json(request_body.model_dump())}\n```"))
    parts.append(render_prompt_section("Step 1 — Natural Language Prompt", step1_prompt, step1_response))

    step2_body = "\n".join(
        [
            "**Prompt**",
            "",
            f"```\n{step2_prompt}\n```",
            "",
            "**Gemini Raw Response**",
            "",
            f"```\n{step2_response}\n```",
            "",
            "**Parsed Menus (validated)**",
            "",
            f"```json\n{to_json(menus_payload)}\n```",
            "",
            f"Validation Result: {'✅' if menus_valid else '❌'}",
        ]
    )
    parts.append(render_section("Step 2 — Structured Menu", step2_body))

    step3_body = "\n".join(
        [
            "**Prompt**",
            "",
            f"```\n{step3_prompt}\n```",
            "",
            "**Gemini Raw Response**",
            "",
            f"```\n{step3_response}\n```",
            "",
            "**Parsed Items (validated)**",
            "",
            f"```json\n{to_json(shopping_data)}\n```",
            "",
            f"Validation Result: {'✅' if shopping_valid else '❌'}",
        ]
    )
    parts.append(render_section("Step 3 — Shopping List", step3_body))

    report_path = Path(__file__).resolve().parents[2] / "docs" / "testing" / "backend-full-run-2026-02-01.md"
    report_path.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"✅ Report written to {report_path}")


if __name__ == "__main__":
    asyncio.run(main())
