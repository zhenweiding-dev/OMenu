import json
from pathlib import Path
from threading import Lock
from typing import Optional

from pydantic import ValidationError

from app.models.schemas import UserState

_STATE_LOCK = Lock()
_DATA_PATH = Path(__file__).resolve().parent / "data" / "state.json"


def load_state() -> UserState:
    with _STATE_LOCK:
        if not _DATA_PATH.exists():
            return UserState()
        try:
            payload = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
            return UserState.model_validate(payload)
        except (json.JSONDecodeError, ValidationError):
            return UserState()


def save_state(state: UserState) -> None:
    with _STATE_LOCK:
        _DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        payload = state.model_dump(mode="json")
        _DATA_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
