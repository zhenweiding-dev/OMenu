"""Centralized exception hierarchy for the application."""

from typing import Any


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code

    def to_dict(self) -> dict[str, Any]:
        return {"code": self.code, "message": self.message}


class ValidationError(AppException):
    """Raised when data validation fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="VALIDATION_ERROR", status_code=422)


class ParseError(AppException):
    """Raised when response parsing fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="PARSE_ERROR", status_code=500)


# --- Gemini API Exceptions ---


class GeminiError(AppException):
    """Base exception for Gemini API errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="GEMINI_ERROR", status_code=503)


class GeminiTimeoutError(GeminiError):
    """Raised when Gemini request exceeds configured timeout."""

    def __init__(self, message: str = "Gemini generation timed out.") -> None:
        super().__init__(message)
        self.code = "GEMINI_TIMEOUT"
        self.status_code = 504


class GeminiSafetyError(GeminiError):
    """Raised when Gemini blocks content due to safety filters."""

    def __init__(self, message: str = "Gemini safety filters blocked the content.") -> None:
        super().__init__(message)
        self.code = "GEMINI_SAFETY_BLOCKED"
        self.status_code = 422


class GeminiOverloadedError(GeminiError):
    """Raised when Gemini service is temporarily unavailable."""

    def __init__(self, message: str = "Gemini service unavailable.") -> None:
        super().__init__(message)
        self.code = "GEMINI_OVERLOADED"
        self.status_code = 503


class GeminiQuotaExceededError(GeminiError):
    """Raised when Gemini quota limits are exceeded."""

    def __init__(self, message: str = "Gemini quota exceeded.") -> None:
        super().__init__(message)
        self.code = "GEMINI_QUOTA_EXCEEDED"
        self.status_code = 429
