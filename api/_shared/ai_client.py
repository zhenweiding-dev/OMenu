"""Synchronous Gemini API client for Vercel serverless functions."""

import os
import sys
import time

from google import genai
from google.genai import errors as genai_errors

from _shared.exceptions import (
    GeminiError,
    GeminiOverloadedError,
    GeminiQuotaExceededError,
    GeminiSafetyError,
    GeminiTimeoutError,
)


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
# Comma-separated, tried in order; the next model is used when one fails
# (quota, overload, timeout, unsupported request). Unset or empty uses this chain.
DEFAULT_GEMINI_MODELS = "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemma-4-26b-a4b-it"


def _parse_models(value: str) -> list[str]:
    return [name.strip() for name in value.split(",") if name.strip()]


GEMINI_MODELS = _parse_models(os.environ.get("GEMINI_MODEL", "")) or _parse_models(DEFAULT_GEMINI_MODELS)
# Upper bound for a single attempt on one model.
GEMINI_TIMEOUT = float(os.environ.get("GEMINI_TIMEOUT_SECONDS") or "60")
# Vercel stops the function at 180 s (vercel.json maxDuration); keep 10 s for
# parsing and sending the response. Shared by all calls of one request.
REQUEST_BUDGET_SECONDS = 170.0
# Below this much remaining budget a new attempt cannot finish, so stop trying.
MIN_ATTEMPT_SECONDS = 5.0

# Status codes the Gemini API uses for temporary capacity problems
# (e.g. 503 "This model is currently experiencing high demand").
_OVERLOADED_CODES = {500, 502, 503}


def _is_timeout(exc: Exception) -> bool:
    # google-genai 3.x raises the timeout of its HTTP library (httpx2.ReadTimeout,
    # a TimeoutException subclass); match by class name so this module does not
    # import that transitive dependency.
    return isinstance(exc, TimeoutError) or any(
        cls.__name__ == "TimeoutException" for cls in type(exc).__mro__
    )


def _model_config(model: str) -> dict:
    """Per-model generation settings that differ between model families."""
    name = model.lower()
    if name.startswith("gemma-"):
        # Gemma 4 thinks unless told otherwise and caps output at 32,768 tokens.
        return {"max_output_tokens": 32768, "thinking_config": {"thinking_level": "minimal"}}
    if name.startswith("gemini-3"):
        # Accepted by the 3.x Flash Lite models; gemini-3.8-flash rejects MINIMAL (400),
        # which makes the client move on to the next model.
        return {"max_output_tokens": 65536, "thinking_config": {"thinking_level": "MINIMAL"}}
    if "2.5" in name:
        return {"max_output_tokens": 65536, "thinking_config": {"thinking_budget": 0}}
    return {"max_output_tokens": 65536}


class GeminiClient:
    def __init__(
        self,
        models: list[str] | None = None,
        timeout_seconds: float | None = None,
        deadline: float | None = None,
    ):
        self._models = list(models or GEMINI_MODELS)
        self._timeout_seconds = timeout_seconds or GEMINI_TIMEOUT
        # time.monotonic() value after which no new attempt is started.
        self._deadline = deadline
        self._client = None

    @classmethod
    def for_request(cls) -> "GeminiClient":
        return cls(deadline=time.monotonic() + REQUEST_BUDGET_SECONDS)

    @property
    def client(self):
        if self._client is None:
            self._client = genai.Client(api_key=GEMINI_API_KEY)
        return self._client

    def generate(self, prompt: str, *, response_mime_type: str | None = None) -> str:
        if not GEMINI_API_KEY:
            raise GeminiError("GEMINI_API_KEY is not configured.")

        last_error: GeminiError | None = None
        for model in self._models:
            timeout = self._attempt_timeout()
            if timeout is None:
                break
            try:
                return self._generate_once(model, prompt, timeout, response_mime_type)
            except GeminiSafetyError:
                raise
            except GeminiError as exc:
                last_error = exc
                print(f"[gemini] {model} failed ({exc.code}): {exc.message}", file=sys.stderr, flush=True)
        raise last_error or GeminiTimeoutError()

    def _attempt_timeout(self) -> float | None:
        if self._deadline is None:
            return self._timeout_seconds
        remaining = self._deadline - time.monotonic()
        if remaining < MIN_ATTEMPT_SECONDS:
            return None
        return min(self._timeout_seconds, remaining)

    def _generate_once(self, model, prompt, timeout, response_mime_type) -> str:
        config = _model_config(model)
        # HttpOptions.timeout is in milliseconds.
        config["http_options"] = {"timeout": int(timeout * 1000)}
        if response_mime_type:
            config["response_mime_type"] = response_mime_type

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=config,
            )
        except genai_errors.APIError as exc:
            if exc.code == 429:
                raise GeminiQuotaExceededError() from exc
            if exc.code in _OVERLOADED_CODES:
                raise GeminiOverloadedError() from exc
            if exc.code == 504:
                raise GeminiTimeoutError() from exc
            raise GeminiError(f"Gemini API error {exc.code}: {exc.message or exc}") from exc
        except Exception as exc:
            if _is_timeout(exc):
                raise GeminiTimeoutError() from exc
            # Connection and SDK errors can carry internal details; log them, show a fixed text.
            print(f"[gemini] {model} request failed: {exc!r}", file=sys.stderr, flush=True)
            raise GeminiError("Could not reach Gemini.") from exc

        self._check_safety_feedback(response, model)
        text = self._extract_text(response)
        if not text:
            raise GeminiError("Empty response from Gemini")
        return text

    def generate_json(self, prompt: str) -> str:
        return self.generate(prompt, response_mime_type="application/json")

    def _extract_text(self, response) -> str:
        """Join the answer parts of the first candidate, skipping thought parts.

        Some models (e.g. Gemma 4) return a part flagged `thought` before the
        answer; parsing that part as JSON fails.
        """
        try:
            candidates = getattr(response, "candidates", None)
            if not candidates:
                return ""
            content = getattr(candidates[0], "content", None)
            parts = getattr(content, "parts", None) or []
            texts = [
                part.text
                for part in parts
                if getattr(part, "text", None) and not getattr(part, "thought", False)
            ]
            return "".join(texts).strip()
        except Exception:
            return ""

    def _check_safety_feedback(self, response, model: str) -> None:
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
                raise GeminiError(f"Gemini response reached max token limit for model {model}")


def get_gemini_client() -> GeminiClient:
    # A new client per request, so each request gets its own time budget.
    return GeminiClient.for_request()
