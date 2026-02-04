"""
Separated storage for different data types.
Each data type has its own file for clean separation.
"""
import json
from pathlib import Path
from threading import Lock
from typing import List, Optional

from pydantic import ValidationError

from app.models.schemas import (
    DraftState,
    MenuBook,
    Recipe,
    UserPreferences,
)

_DATA_DIR = Path(__file__).resolve().parent / "data"
_PROFILE_PATH = _DATA_DIR / "profile.json"
_MENU_BOOKS_DIR = _DATA_DIR / "menu_books"
_UI_STATE_PATH = _DATA_DIR / "ui_state.json"
_DRAFT_PATH = _DATA_DIR / "draft.json"
_MENU_EXTRAS_PATH = _DATA_DIR / "menu_extras.json"

_LOCK = Lock()


def _ensure_dirs() -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    _MENU_BOOKS_DIR.mkdir(parents=True, exist_ok=True)


# ========== Profile / Preferences ==========


def load_profile() -> Optional[UserPreferences]:
    with _LOCK:
        if not _PROFILE_PATH.exists():
            return None
        try:
            payload = json.loads(_PROFILE_PATH.read_text(encoding="utf-8"))
            return UserPreferences.model_validate(payload)
        except (json.JSONDecodeError, ValidationError):
            return None


def save_profile(profile: UserPreferences) -> None:
    with _LOCK:
        _ensure_dirs()
        payload = profile.model_dump(mode="json")
        _PROFILE_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


# ========== Menu Books ==========


def load_all_menu_books() -> List[MenuBook]:
    with _LOCK:
        if not _MENU_BOOKS_DIR.exists():
            return []
        books: List[MenuBook] = []
        for file_path in _MENU_BOOKS_DIR.glob("*.json"):
            try:
                payload = json.loads(file_path.read_text(encoding="utf-8"))
                books.append(MenuBook.model_validate(payload))
            except (json.JSONDecodeError, ValidationError):
                continue
        # Sort by createdAt descending (newest first)
        books.sort(key=lambda b: b.mealPlan.createdAt, reverse=True)
        return books


def load_menu_book(book_id: str) -> Optional[MenuBook]:
    with _LOCK:
        file_path = _MENU_BOOKS_DIR / f"{book_id}.json"
        if not file_path.exists():
            return None
        try:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            return MenuBook.model_validate(payload)
        except (json.JSONDecodeError, ValidationError):
            return None


def save_menu_book(book: MenuBook) -> None:
    with _LOCK:
        _ensure_dirs()
        file_path = _MENU_BOOKS_DIR / f"{book.id}.json"
        payload = book.model_dump(mode="json")
        file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def delete_menu_book(book_id: str) -> bool:
    with _LOCK:
        file_path = _MENU_BOOKS_DIR / f"{book_id}.json"
        if file_path.exists():
            file_path.unlink()
            return True
        return False


# ========== UI State ==========


class UIState:
    def __init__(
        self,
        current_week_id: Optional[str] = None,
        current_day_index: int = 0,
        is_menu_open: bool = True,
    ):
        self.currentWeekId = current_week_id
        self.currentDayIndex = current_day_index
        self.isMenuOpen = is_menu_open


def load_ui_state() -> dict:
    with _LOCK:
        if not _UI_STATE_PATH.exists():
            return {"currentWeekId": None, "currentDayIndex": 0, "isMenuOpen": True}
        try:
            return json.loads(_UI_STATE_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {"currentWeekId": None, "currentDayIndex": 0, "isMenuOpen": True}


def save_ui_state(state: dict) -> None:
    with _LOCK:
        _ensure_dirs()
        _UI_STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


# ========== Draft State ==========


def load_draft() -> Optional[DraftState]:
    with _LOCK:
        if not _DRAFT_PATH.exists():
            return None
        try:
            payload = json.loads(_DRAFT_PATH.read_text(encoding="utf-8"))
            return DraftState.model_validate(payload)
        except (json.JSONDecodeError, ValidationError):
            return None


def save_draft(draft: DraftState) -> None:
    with _LOCK:
        _ensure_dirs()
        payload = draft.model_dump(mode="json")
        _DRAFT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def clear_draft() -> None:
    with _LOCK:
        if _DRAFT_PATH.exists():
            _DRAFT_PATH.unlink()


# ========== Menu Extras ==========

MenuExtrasType = dict[str, dict[str, dict[str, List[Recipe]]]]


def load_menu_extras() -> MenuExtrasType:
    with _LOCK:
        if not _MENU_EXTRAS_PATH.exists():
            return {}
        try:
            payload = json.loads(_MENU_EXTRAS_PATH.read_text(encoding="utf-8"))
            # Validate recipes within the nested structure
            result: MenuExtrasType = {}
            for book_id, days in payload.items():
                result[book_id] = {}
                for day, meals in days.items():
                    result[book_id][day] = {}
                    for meal_type, recipes in meals.items():
                        result[book_id][day][meal_type] = [
                            Recipe.model_validate(r) for r in recipes
                        ]
            return result
        except (json.JSONDecodeError, ValidationError):
            return {}


def save_menu_extras(extras: MenuExtrasType) -> None:
    with _LOCK:
        _ensure_dirs()
        # Convert Recipe objects to dicts
        payload: dict = {}
        for book_id, days in extras.items():
            payload[book_id] = {}
            for day, meals in days.items():
                payload[book_id][day] = {}
                for meal_type, recipes in meals.items():
                    payload[book_id][day][meal_type] = [
                        r.model_dump(mode="json") if hasattr(r, "model_dump") else r
                        for r in recipes
                    ]
        _MENU_EXTRAS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
