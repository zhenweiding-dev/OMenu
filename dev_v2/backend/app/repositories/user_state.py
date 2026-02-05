"""User state repository for persistent storage."""

import json
import logging
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Protocol

from pydantic import ValidationError

from app.core.config import settings
from app.models.state import UserState

logger = logging.getLogger(__name__)


class IUserStateRepository(Protocol):
    """Interface for user state persistence."""

    def load(self) -> UserState:
        """Load user state from storage."""
        ...

    def save(self, state: UserState) -> None:
        """Save user state to storage."""
        ...


class UserStateRepository:
    """JSON file-based user state repository with thread-safe operations."""

    def __init__(self, data_path: Path | None = None) -> None:
        self._data_path = data_path or (settings.data_dir / "state.json")
        self._lock = Lock()

    def load(self) -> UserState:
        """Load user state from JSON file.

        Returns empty UserState if file doesn't exist or is invalid.
        """
        with self._lock:
            if not self._data_path.exists():
                logger.debug("State file not found, returning empty state")
                return UserState()
            try:
                payload = json.loads(self._data_path.read_text(encoding="utf-8"))
                return UserState.model_validate(payload)
            except (json.JSONDecodeError, ValidationError) as e:
                logger.warning(f"Failed to load state file: {e}")
                return UserState()

    def save(self, state: UserState) -> None:
        """Save user state to JSON file."""
        with self._lock:
            self._data_path.parent.mkdir(parents=True, exist_ok=True)
            payload = state.model_dump(mode="json")
            self._data_path.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            logger.debug("User state saved successfully")


@lru_cache
def get_user_state_repository() -> UserStateRepository:
    """Get cached user state repository instance."""
    return UserStateRepository()
