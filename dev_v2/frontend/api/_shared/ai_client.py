"""Synchronous Gemini API client for Vercel serverless functions."""

import os
from functools import lru_cache

from _shared.exceptions import (
    GeminiError,
    GeminiOverloadedError,
    GeminiQuotaExceededError,
    GeminiSafetyError,
    GeminiTimeoutError,
)

try:
    import google.genai as genai
    _USING_NEW_SDK = True
except ImportError:
    import google.generativeai as genai
    _USING_NEW_SDK = False


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
GEMINI_TIMEOUT = float(os.environ.get("GEMINI_TIMEOUT_SECONDS", "120"))


class GeminiClient:
    def __init__(self, model_name: str | None = None, timeout_seconds: float | None = None):
        self._model_name = model_name or GEMINI_MODEL
        self._timeout_seconds = timeout_seconds or GEMINI_TIMEOUT
        self._model = None
        self._client = None

        if not _USING_NEW_SDK:
            genai.configure(api_key=GEMINI_API_KEY)

    @property
    def model(self):
        if self._model is None:
            self._model = genai.GenerativeModel(self._model_name)
        return self._model

    @property
    def client(self):
        if not _USING_NEW_SDK:
            raise GeminiError("google.genai client unavailable in legacy SDK mode.")
        if self._client is None:
            self._client = genai.Client(api_key=GEMINI_API_KEY)
        return self._client

    def generate(self, prompt: str, *, response_mime_type: str | None = None, response_schema=None) -> str:
        if not GEMINI_API_KEY:
            raise GeminiError("GEMINI_API_KEY is not configured.")

        base_config = {
            "temperature": 0.7,
            "max_output_tokens": 65536,
        }
        base_config.update(self._thinking_config())
        if response_mime_type:
            base_config["response_mime_type"] = response_mime_type
        if response_schema:
            base_config["response_schema"] = response_schema

        try:
            if _USING_NEW_SDK:
                response = self.client.models.generate_content(
                    model=self._model_name,
                    contents=prompt,
                    config=base_config,
                )
            else:
                response = self.model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "max_output_tokens": 65536,
                    },
                )

            self._check_safety_feedback(response)
            text = self._extract_text(response)

            if not text:
                raise GeminiError("Empty response from Gemini")

            return text

        except GeminiError:
            raise
        except Exception as exc:
            from google.api_core import exceptions as google_exceptions
            if isinstance(exc, google_exceptions.ResourceExhausted):
                raise GeminiQuotaExceededError() from exc
            if isinstance(exc, google_exceptions.ServiceUnavailable):
                raise GeminiOverloadedError() from exc
            if isinstance(exc, google_exceptions.DeadlineExceeded):
                raise GeminiTimeoutError() from exc
            if isinstance(exc, google_exceptions.PermissionDenied):
                raise GeminiSafetyError() from exc
            if isinstance(exc, google_exceptions.GoogleAPICallError):
                raise GeminiError(exc.message or str(exc)) from exc
            raise GeminiError(f"Gemini API error: {exc}") from exc

    def generate_json(self, prompt: str) -> str:
        return self.generate(prompt, response_mime_type="application/json")

    def _thinking_config(self) -> dict:
        if not _USING_NEW_SDK:
            return {}
        model = (self._model_name or "").lower()
        if model.startswith("gemini-3"):
            return {"thinking_config": {"thinking_level": "MINIMAL"}}
        if "2.5" in model:
            return {"thinking_config": {"thinking_budget": 0}}
        return {}

    def _extract_text(self, response) -> str:
        try:
            candidates = getattr(response, "candidates", None)
            if not candidates:
                return ""
            first = candidates[0]
            content = getattr(first, "content", None)
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
        except Exception:
            return ""

    def _check_safety_feedback(self, response) -> None:
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

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            finish_reason = getattr(candidate, "finish_reason", None)
            if not finish_reason:
                continue
            reason = str(finish_reason).upper()
            if "SAFETY" in reason:
                raise GeminiSafetyError()
            if "MAX_TOKENS" in reason:
                raise GeminiError(f"Gemini response reached max token limit for model {self._model_name}")


_client_instance = None

def get_gemini_client() -> GeminiClient:
    global _client_instance
    if _client_instance is None:
        _client_instance = GeminiClient()
    return _client_instance
