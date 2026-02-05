from functools import lru_cache
from typing import List

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables."""

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    # NOTE: Include common Vite dev ports to prevent CORS failures during local development.
    cors_origins: List[str] | str = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]
    )
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @model_validator(mode="after")
    def _normalize_cors_origins(self) -> "Settings":
        if isinstance(self.cors_origins, str):
            self.cors_origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return self


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""

    return Settings()


settings = get_settings()
