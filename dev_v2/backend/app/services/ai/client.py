"""Gemini API client for AI content generation."""

import logging
from functools import lru_cache, partial
from typing import Any, Optional

import anyio
from anyio import fail_after
from google.api_core import exceptions as google_exceptions

from app.core.config import settings
from app.core.exceptions import (
    GeminiError,
    GeminiOverloadedError,
    GeminiQuotaExceededError,
    GeminiSafetyError,
    GeminiTimeoutError,
)

# Prefer modern SDK; fall back to legacy if unavailable
try:
    import google.genai as genai  # type: ignore

    _USING_NEW_SDK = True
except ImportError:  # pragma: no cover
    import google.generativeai as genai  # type: ignore

    _USING_NEW_SDK = False

logger = logging.getLogger(__name__)


class GeminiClient:
    """Client for interacting with Google's Gemini API."""

    def __init__(
        self,
        model_name: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self._model_name = model_name or settings.gemini_model
        self._timeout_seconds = timeout_seconds or settings.gemini_timeout_seconds
        self._model: Optional[Any] = None
        self._client: Optional[Any] = None

        if not _USING_NEW_SDK:
            genai.configure(api_key=settings.gemini_api_key)

    @property
    def model(self) -> Any:
        """Lazy-loaded GenerativeModel instance (legacy SDK)."""
        if self._model is None:
            self._model = genai.GenerativeModel(self._model_name)
        return self._model

    @property
    def client(self) -> Any:
        """Lazy-loaded Client instance (modern SDK)."""
        if not _USING_NEW_SDK:
            raise GeminiError("google.genai client unavailable in legacy SDK mode.")
        if self._client is None:
            self._client = genai.Client(api_key=settings.gemini_api_key)
        return self._client

    async def generate(self, prompt: str, timeout_seconds: float | None = None) -> str:
        """Generate content using Gemini API.

        Args:
            prompt: The prompt to send to the model.
            timeout_seconds: Optional timeout override.

        Returns:
            Generated text response.

        Raises:
            GeminiError: On API errors.
            GeminiTimeoutError: On timeout.
            GeminiSafetyError: On content blocked.
            GeminiQuotaExceededError: On quota exceeded.
            GeminiOverloadedError: On service unavailable.
        """
        if not settings.gemini_api_key:
            raise GeminiError("GEMINI_API_KEY is not configured.")

        timeout = timeout_seconds or self._timeout_seconds
        logger.info(f"Generating with model={self._model_name}, prompt_len={len(prompt)}")

        try:
            with fail_after(timeout):
                if _USING_NEW_SDK:
                    response = await anyio.to_thread.run_sync(
                        partial(
                            self.client.models.generate_content,
                            model=self._model_name,
                            contents=prompt,
                            config={
                                "temperature": 0.7,
                                "max_output_tokens": 8192,
                            },
                        )
                    )
                else:
                    response = await anyio.to_thread.run_sync(
                        partial(
                            self.model.generate_content,
                            prompt,
                            generation_config={
                                "temperature": 0.7,
                                "max_output_tokens": 8192,
                            },
                        )
                    )

            self._check_safety_feedback(response)
            text = self._extract_text(response)

            if not text:
                raise GeminiError("Empty response from Gemini")

            return text

        except TimeoutError as exc:
            raise GeminiTimeoutError() from exc
        except GeminiError:
            raise
        except google_exceptions.ResourceExhausted as exc:
            raise GeminiQuotaExceededError() from exc
        except google_exceptions.ServiceUnavailable as exc:
            raise GeminiOverloadedError() from exc
        except google_exceptions.DeadlineExceeded as exc:
            raise GeminiTimeoutError() from exc
        except google_exceptions.PermissionDenied as exc:
            raise GeminiSafetyError() from exc
        except google_exceptions.GoogleAPICallError as exc:
            raise GeminiError(exc.message or str(exc)) from exc
        except Exception as exc:  # pragma: no cover
            logger.error(f"Gemini API error: {type(exc).__name__}: {exc}")
            raise GeminiError(f"Gemini API error: {exc}") from exc

    def _extract_text(self, response: Any) -> str:
        """Extract text content from Gemini response."""
        try:
            candidates = getattr(response, "candidates", None)
            if not candidates:
                return ""

            first_candidate = candidates[0]
            content = getattr(first_candidate, "content", None)
            if not content:
                return ""

            parts = getattr(content, "parts", None)
            if not parts:
                return ""

            for part in parts:
                text = getattr(part, "text", "")
                if text:
                    return text.strip()

            return ""
        except Exception:  # pragma: no cover
            logger.debug("Failed to extract text from Gemini response", exc_info=True)
            return ""

    def _check_safety_feedback(self, response: Any) -> None:
        """Check for safety blocks or content filters."""
        # Check prompt feedback
        feedback = getattr(response, "prompt_feedback", None)
        if feedback is not None:
            block_reason = getattr(feedback, "block_reason", None)
            if block_reason:
                reason = str(block_reason).upper()
                if "SAFETY" in reason:
                    raise GeminiSafetyError()
                raise GeminiError(f"Gemini blocked the prompt: {reason}.")

            safety_ratings = getattr(feedback, "safety_ratings", None)
            if safety_ratings:
                for rating in safety_ratings:
                    if getattr(rating, "blocked", False):
                        raise GeminiSafetyError()

        # Check candidate finish reasons
        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            finish_reason = getattr(candidate, "finish_reason", None)
            if not finish_reason:
                continue

            reason = str(finish_reason).upper()
            if "SAFETY" in reason:
                raise GeminiSafetyError()
            if "MAX_TOKENS" in reason:
                raise GeminiError(
                    f"Gemini response reached max token limit for model {self._model_name}"
                )


@lru_cache
def get_gemini_client() -> GeminiClient:
    """Get cached Gemini client instance."""
    return GeminiClient()
