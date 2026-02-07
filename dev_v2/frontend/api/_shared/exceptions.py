"""Centralized exception hierarchy."""


class AppException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code

    def to_dict(self):
        return {"code": self.code, "message": self.message}


class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR", status_code=422)


class ParseError(AppException):
    def __init__(self, message: str):
        super().__init__(message, code="PARSE_ERROR", status_code=500)


class GeminiError(AppException):
    def __init__(self, message: str):
        super().__init__(message, code="GEMINI_ERROR", status_code=503)


class GeminiTimeoutError(GeminiError):
    def __init__(self, message: str = "Gemini generation timed out."):
        super().__init__(message)
        self.code = "GEMINI_TIMEOUT"
        self.status_code = 504


class GeminiSafetyError(GeminiError):
    def __init__(self, message: str = "Gemini safety filters blocked the content."):
        super().__init__(message)
        self.code = "GEMINI_SAFETY_BLOCKED"
        self.status_code = 422


class GeminiOverloadedError(GeminiError):
    def __init__(self, message: str = "Gemini service unavailable."):
        super().__init__(message)
        self.code = "GEMINI_OVERLOADED"
        self.status_code = 503


class GeminiQuotaExceededError(GeminiError):
    def __init__(self, message: str = "Gemini quota exceeded."):
        super().__init__(message)
        self.code = "GEMINI_QUOTA_EXCEEDED"
        self.status_code = 429
