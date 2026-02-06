"""Response parsing utilities for AI-generated content."""

import json
from typing import Any

from app.core.exceptions import ParseError


class ResponseParser:
    """Parser for AI-generated responses."""

    @staticmethod
    def parse_json(text: str) -> dict[str, Any]:
        """Parse JSON from AI response, handling markdown code blocks.

        Args:
            text: Raw text response from AI.

        Returns:
            Parsed JSON as dictionary.

        Raises:
            ParseError: If parsing fails.
        """
        if not text:
            raise ParseError("Empty response from Gemini")

        cleaned = text.strip()

        # Remove markdown code block wrappers
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
            # Attempt to salvage JSON object from surrounding text
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                snippet = cleaned[start : end + 1]
                try:
                    return json.loads(snippet)
                except json.JSONDecodeError:
                    pass
            raise ParseError(f"Failed to parse JSON: {exc}") from exc
