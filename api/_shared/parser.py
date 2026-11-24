"""Response parsing utilities for AI-generated content."""

import json

from _shared.exceptions import ParseError


class ResponseParser:
    @staticmethod
    def parse_json(text: str) -> dict:
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
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                snippet = cleaned[start : end + 1]
                try:
                    return json.loads(snippet)
                except json.JSONDecodeError:
                    pass
            raise ParseError(f"Failed to parse JSON: {exc}") from exc
