# Gemini 3 Integration Summary (OMenu)

OMenu uses Gemini 3 for weekly menu planning and shopping list generation. The backend (Python, google-genai SDK) calls Gemini 3 (default model: `gemini-3-flash-preview`) in a multi-step pipeline that balances creativity with structure.

1. **Outline + Draft List (Step 1)**: Gemini 3 generates a meal outline and a draft shopping list of non-pantry ingredients. The ingredient cap is dynamic based on planned meals and people count. Rules prevent leftovers and repeated main dishes while encouraging ingredient reuse.
2. **Structured Menus (Step 2)**: The outline and draft list are fed back to Gemini 3 to produce structured JSON menus with recipes and ingredient categories. New non-pantry ingredients are disallowed; only pantry staples and seasonings may be added when needed.
3. **Shopping List (Step 3)**: Gemini 3 consolidates the structured menus into a shopping list with unit rules. Server-side normalization and validation enforce categories and quantities.

Users can request modifications. We send the current menu and the user's change request to Gemini 3 to make minimal diffs while preserving structure. All responses are parsed as strict JSON and validated before being saved; failures surface as retryable UI states. This makes Gemini 3 central to OMenu's menu reasoning, recipe generation, and list consolidation, with deterministic guardrails for production stability.
