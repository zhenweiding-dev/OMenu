"""Dependency injection for the application."""

from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings


def get_config() -> Settings:
    """Get application settings."""
    return get_settings()


ConfigDep = Annotated[Settings, Depends(get_config)]
