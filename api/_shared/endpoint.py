"""Request handling shared by the api/*.py functions: auth, JSON body, limits, errors."""

import json
import sys
import traceback

from _shared.auth import verify_token
from _shared.exceptions import AppException, ValidationError
from _shared.validators import DAYS, MEALS, VALID_DIFFICULTIES

# A full week for 10 people is about 60 KB of JSON; much larger bodies do not
# come from the app and would only spend Gemini quota.
MAX_BODY_BYTES = 256 * 1024
# The limits below match what the UI lets a user enter.
MAX_MODIFICATION_CHARS = 200
MIN_PEOPLE, MAX_PEOPLE = 1, 10
MIN_BUDGET, MAX_BUDGET = 50, 500
MAX_TAGS = 100  # the UI does not cap the number of custom tags
MAX_TAG_CHARS = 100  # the UI allows 40


def handle_post(request, run) -> None:
    """Verify the Supabase token, parse the JSON body, send back run(body) as JSON."""
    try:
        verify_token(request.headers.get("Authorization"))
        result = run(_read_json_body(request))
        _send_json(request, 200, result)
    except AppException as exc:
        _send_json(request, exc.status_code, exc.to_dict())
    except Exception:
        traceback.print_exc(file=sys.stderr)
        _send_json(request, 500, {"code": "INTERNAL_ERROR", "message": "Unexpected server error."})


def _read_json_body(request) -> dict:
    try:
        length = int(request.headers.get("Content-Length") or 0)
    except ValueError:
        raise ValidationError("Invalid Content-Length header.")
    if length < 0 or length > MAX_BODY_BYTES:
        raise ValidationError("Request body is too large.")
    try:
        body = json.loads(request.rfile.read(length) or b"null")
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ValidationError("Request body must be JSON.")
    if not isinstance(body, dict):
        raise ValidationError("Request body must be a JSON object.")
    return body


def _send_json(request, status: int, payload: dict) -> None:
    data = json.dumps(payload).encode()
    request.send_response(status)
    request.send_header("Content-Type", "application/json")
    request.send_header("Content-Length", str(len(data)))
    request.end_headers()
    request.wfile.write(data)


def _is_int(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _is_number(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def require_string(value, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{name} is required.")
    return value


def check_modification(value) -> str:
    text = require_string(value, "modification").strip()
    if len(text) > MAX_MODIFICATION_CHARS:
        raise ValidationError(f"modification must be at most {MAX_MODIFICATION_CHARS} characters.")
    return text


def check_preferences(value) -> dict:
    if not isinstance(value, dict):
        raise ValidationError("preferences must be an object.")
    people = value.get("numPeople")
    if not _is_int(people) or not MIN_PEOPLE <= people <= MAX_PEOPLE:
        raise ValidationError(f"numPeople must be between {MIN_PEOPLE} and {MAX_PEOPLE}.")
    budget = value.get("budget")
    if not _is_number(budget) or not MIN_BUDGET <= budget <= MAX_BUDGET:
        raise ValidationError(f"budget must be between {MIN_BUDGET} and {MAX_BUDGET}.")
    difficulty = value.get("difficulty", "medium")
    if not isinstance(difficulty, str) or difficulty not in VALID_DIFFICULTIES:
        raise ValidationError("difficulty must be easy, medium or hard.")
    for key in ("specificPreferences", "specificDisliked"):
        tags = value.get(key, [])
        if (
            not isinstance(tags, list)
            or len(tags) > MAX_TAGS
            or not all(isinstance(tag, str) and len(tag) <= MAX_TAG_CHARS for tag in tags)
        ):
            raise ValidationError(f"{key} must be a list of at most {MAX_TAGS} items of up to {MAX_TAG_CHARS} characters.")
    schedule = value.get("cookSchedule")
    if (
        not isinstance(schedule, dict)
        or not set(schedule) <= set(DAYS)
        or not all(isinstance(meals, dict) and set(meals) <= set(MEALS) for meals in schedule.values())
    ):
        raise ValidationError("cookSchedule must map weekdays to breakfast/lunch/dinner flags.")
    return value


def check_menus(value) -> dict:
    """Weekday -> meal -> list of dishes; the dishes themselves are normalized later."""
    if (
        not isinstance(value, dict)
        or not value
        or not set(value) <= set(DAYS)
        or not all(
            isinstance(day, dict)
            and set(day) <= set(MEALS)
            and all(isinstance(dishes, list) for dishes in day.values())
            for day in value.values()
        )
    ):
        raise ValidationError("menus must map weekdays to breakfast/lunch/dinner dish lists.")
    return value
