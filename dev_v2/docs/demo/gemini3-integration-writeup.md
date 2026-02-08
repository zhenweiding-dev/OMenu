# Gemini 3 Integration Write-Up (OMenu)

## Gemini Integration: The Core Intelligence Engine

OMenu leverages **Gemini 3 (`gemini-3-flash-preview`) as its central reasoning engine**, making it indispensable to every core function. The application implements a sophisticated **three-stage AI pipeline** where Gemini 3 orchestrates constrained creativity with production-grade reliability.

**Stage 1: Intelligent Planning** – Gemini 3 generates a weekly meal outline and draft shopping list under strict constraints: no leftovers, no repeated main dishes, dynamic ingredient caps (24-36 items), and maximum ingredient reuse. This demonstrates Gemini 3's ability to balance creativity with complex multi-constraint optimization.

**Stage 2: Structured Recipe Generation** – The outline feeds back into Gemini 3 using **JSON mode with structured schemas**, producing complete recipes with categorized ingredients, instructions, nutritional data, and timing. A critical innovation: Gemini 3 may only add pantry staples—no new non-pantry items—forcing ingredient consolidation across the week.

**Stage 3: Smart Consolidation** – Gemini 3 merges ingredients across all meals into an optimized shopping list, intelligently combining quantities and standardizing units.

**Gemini 3-Specific Features:**
- **MINIMAL thinking configuration** for token efficiency
- **Structured JSON schemas** for deterministic outputs
- **Async generation** with comprehensive error handling
- **Context-aware modifications** using natural language requests

Every menu generation, modification, and shopping list requires 2-3 Gemini API calls. Without Gemini 3's reasoning capabilities, OMenu simply cannot function—it's the brain that transforms preferences into practical, optimized meal plans.
