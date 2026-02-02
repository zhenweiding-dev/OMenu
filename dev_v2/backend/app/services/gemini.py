import json
import logging
from functools import partial
from typing import Any, Optional

import anyio
from anyio import fail_after
try:  # Prefer modern SDK; fall back to legacy only if unavailable.
    import google.genai as genai  # type: ignore
    _USING_NEW_SDK = True
except ImportError:  # pragma: no cover - fallback path for legacy environments
    import google.generativeai as genai  # type: ignore
    _USING_NEW_SDK = False
from google.api_core import exceptions as google_exceptions

from app.config import settings


logger = logging.getLogger(__name__)


class GeminiError(Exception):
    """Raised when Gemini API returns an error."""


class GeminiTimeoutError(GeminiError):
    """Raised when Gemini request exceeds configured timeout."""


class GeminiSafetyError(GeminiError):
    """Raised when Gemini blocks content due to safety filters."""


class GeminiOverloadedError(GeminiError):
    """Raised when Gemini service is temporarily unavailable."""


class GeminiQuotaExceededError(GeminiError):
    """Raised when Gemini quota limits are exceeded."""


class ParseError(Exception):
    """Raised when response parsing fails."""


class GeminiService:
    def __init__(self, model_name: str = "gemini-3-flash-preview", timeout_seconds: float = 120.0) -> None:
        self._model_name = model_name
        self._model: Optional[Any] = None
        self._client: Optional[Any] = None
        self._timeout_seconds = timeout_seconds
        if not _USING_NEW_SDK:
            genai.configure(api_key=settings.gemini_api_key)

    @property
    def model(self) -> Any:
        if self._model is None:
            self._model = genai.GenerativeModel(self._model_name)
        return self._model

    @property
    def client(self) -> Any:
        if not _USING_NEW_SDK:
            raise GeminiError("google.genai client unavailable in legacy SDK mode.")
        if self._client is None:
            self._client = genai.Client(api_key=settings.gemini_api_key)
        return self._client

    async def generate(self, prompt: str, timeout_seconds: Optional[float] = None) -> str:
        if not settings.gemini_api_key:
            raise GeminiError("GEMINI_API_KEY is not configured.")
        timeout = timeout_seconds or self._timeout_seconds
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
            self._raise_for_prompt_feedback(response)
            text = self._extract_text_from_response(response)
            if not text:
                raise GeminiError("Empty response from Gemini")
            return text
        except TimeoutError as exc:
            raise GeminiTimeoutError("Gemini generation timed out.") from exc
        except GeminiError:
            raise
        except google_exceptions.ResourceExhausted as exc:
            raise GeminiQuotaExceededError("Gemini quota exceeded.") from exc
        except google_exceptions.ServiceUnavailable as exc:
            raise GeminiOverloadedError("Gemini service unavailable.") from exc
        except google_exceptions.DeadlineExceeded as exc:
            raise GeminiTimeoutError("Gemini request deadline exceeded.") from exc
        except google_exceptions.PermissionDenied as exc:
            raise GeminiSafetyError("Gemini safety filters blocked the request.") from exc
        except google_exceptions.GoogleAPICallError as exc:
            raise GeminiError(exc.message or str(exc)) from exc
        except Exception as exc:  # pragma: no cover - SDK errors
            raise GeminiError(f"Gemini API error: {exc}") from exc

    def _extract_text_from_response(self, response: Any) -> str:
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
        except Exception:  # pragma: no cover - defensive guard
            logger.debug("Failed to extract text from Gemini response", exc_info=True)
            return ""

    def _raise_for_prompt_feedback(self, response: Any) -> None:
        feedback = getattr(response, "prompt_feedback", None)
        if feedback is not None:
            block_reason = getattr(feedback, "block_reason", None)
            if block_reason:
                reason = str(block_reason).upper()
                if "SAFETY" in reason:
                    raise GeminiSafetyError("Gemini safety filters blocked the content.")
                raise GeminiError(f"Gemini blocked the prompt: {reason}.")
            safety_ratings = getattr(feedback, "safety_ratings", None)
            if safety_ratings:
                for rating in safety_ratings:
                    if getattr(rating, "blocked", False):
                        raise GeminiSafetyError("Gemini safety filters blocked the content.")

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            finish_reason = getattr(candidate, "finish_reason", None)
            if not finish_reason:
                continue
            reason = str(finish_reason).upper()
            if "SAFETY" in reason:
                raise GeminiSafetyError("Gemini safety filters blocked the content.")
            if "MAX_TOKENS" in reason:
                logger.warning("Gemini response reached max token limit for model %s", self._model_name)

    def parse_json_response(self, text: str) -> dict[str, Any]:
        if not text:
            raise ParseError("Empty response from Gemini")

        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ParseError(f"Failed to parse JSON: {exc}") from exc


gemini_service = GeminiService()
