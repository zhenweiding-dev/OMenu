"""
Gemini API client for OMenu.

Handles all interactions with Google's Gemini API including:
- Per-day meal plan generation (to avoid token limits)
- Meal plan modification
- Shopping list generation
- Rate limiting for free tier (15 RPM)
"""

import json
import re
import logging
import asyncio
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from google import genai
from google.genai import types

from app.config import get_settings
from app.services.prompts import (
    multi_day_prompt,
    get_scheduled_days,
    get_day_meals,
    modification_prompt,
    shopping_list_prompt,
    format_preferences_for_gemini,
)
from app.models.schemas import (
    MealPlan,
    MealPlanStatus,
    WeekDays,
    DayMeals,
    ShoppingList,
    ShoppingItem,
    UserPreferences,
)

logger = logging.getLogger(__name__)

# Constants
GEMINI_TIMEOUT_SECONDS = 120  # Increased for full week generation
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 3  # Starting delay for exponential backoff
MAX_RETRY_DELAY = 30     # Maximum delay between retries


class GeminiTimeoutError(Exception):
    """Raised when Gemini API call times out."""
    pass


class GeminiRetryExhaustedError(Exception):
    """Raised when all retry attempts are exhausted."""
    pass


class IncompleteRecipeError(Exception):
    """Raised when Gemini returns incomplete recipe data (missing core fields)."""
    pass


class GeminiServerBusyError(Exception):
    """Raised when Gemini returns 503 (server overloaded)."""
    pass


class GeminiClient:
    """Client for interacting with Google Gemini API with rate limiting."""
    
    # Model name - easy to switch between models
    MODEL_NAME = "gemini-2.0-flash"
    
    def __init__(self):
        settings = get_settings()
        # New SDK: Create client with API key
        self.client = genai.Client(api_key=settings.gemini_api_key)
        
        # Generation config for all calls
        self.generation_config = types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=16384,  # Large enough for 7-day, 21-meal plans
        )
    
    def _is_retryable_error(self, error: Exception) -> bool:
        """
        Check if error is retryable (429 rate limit, 503 server busy, etc.)
        """
        error_str = str(error).lower()
        retryable_patterns = [
            "429",              # Rate limit (Too Many Requests)
            "503",              # Service unavailable
            "service unavailable",
            "overloaded",
            "resource exhausted",
            "rate limit",
            "quota exceeded",
            "temporarily unavailable",
            "too many requests",
        ]
        return any(pattern in error_str for pattern in retryable_patterns)
    
    async def _call_with_timeout_and_retry(
        self,
        prompt: str,
        operation_name: str = "API call"
    ) -> str:
        """
        Call Gemini API with timeout and exponential backoff retry.
        
        - Timeout: 120 seconds per call (paid API)
        - Retries: Up to 3 attempts with exponential backoff
        """
        last_error = None
        retry_delay = INITIAL_RETRY_DELAY
        
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info(f"{operation_name}: Attempt {attempt}/{MAX_RETRIES}")
                
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=self.MODEL_NAME,
                        contents=prompt,
                        config=self.generation_config,
                    ),
                    timeout=GEMINI_TIMEOUT_SECONDS
                )
                
                logger.info(f"{operation_name}: Success on attempt {attempt}")
                return response.text
                
            except asyncio.TimeoutError:
                last_error = GeminiTimeoutError(
                    f"{operation_name} timed out after {GEMINI_TIMEOUT_SECONDS}s"
                )
                logger.warning(f"{operation_name}: Timeout on attempt {attempt}")
                
            except Exception as e:
                last_error = e
                
                # Check if it's a 429/503 or other retryable error
                if self._is_retryable_error(e):
                    logger.warning(
                        f"{operation_name}: Rate limited/server busy on attempt {attempt}, "
                        f"will retry after {retry_delay}s. Error: {str(e)[:100]}"
                    )
                else:
                    logger.warning(f"{operation_name}: Error on attempt {attempt}: {e}")
            
            # Wait before retry (except on last attempt)
            if attempt < MAX_RETRIES:
                logger.info(f"Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                # Exponential backoff with cap
                retry_delay = min(retry_delay * 2, MAX_RETRY_DELAY)
        
        # All retries exhausted
        logger.error(f"{operation_name}: All {MAX_RETRIES} attempts failed")
        raise GeminiRetryExhaustedError(
            f"{operation_name} failed after {MAX_RETRIES} attempts: {last_error}"
        )
    
    def _clean_json_response(self, text: str) -> str:
        """
        Clean Gemini response to extract pure JSON.
        
        Removes markdown code blocks and extra whitespace.
        """
        # Remove markdown code blocks
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)
        return text.strip()
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from Gemini response."""
        cleaned = self._clean_json_response(text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response text: {cleaned[:500]}...")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
    
    async def generate_meal_plan(
        self,
        preferences: UserPreferences
    ) -> MealPlan:
        """
        Generate a complete weekly meal plan in a single API call.
        
        With paid API tier:
        - No rate limiting needed
        - Full week generated at once for consistency
        - Better context for varied recipes
        """
        plan_id = f"mp_{uuid.uuid4().hex[:8]}"
        prefs_dict = preferences.model_dump()
        default_servings = preferences.numPeople or 2
        
        # Get scheduled days and their meals
        scheduled_days = get_scheduled_days(prefs_dict)
        logger.info(f"Generating full week plan for {len(scheduled_days)} scheduled days: {scheduled_days}")
        
        # Build days_meals dict
        days_meals = {}
        for day in scheduled_days:
            days_meals[day] = get_day_meals(prefs_dict, day)
        
        # Generate all days in one call
        prompt = multi_day_prompt(days_meals, prefs_dict, None)
        
        for attempt in range(MAX_RETRIES):
            try:
                response = await self._call_with_timeout_and_retry(
                    prompt,
                    operation_name="Generate full week plan"
                )
                week_data = self._parse_json_response(response)
                
                # Sanitize all recipes
                all_days_data = {}
                for day in scheduled_days:
                    day_data = week_data.get(day, {})
                    all_days_data[day] = {}
                    for meal_type in ["breakfast", "lunch", "dinner"]:
                        recipe = day_data.get(meal_type)
                        if recipe is not None:
                            all_days_data[day][meal_type] = self._sanitize_recipe(
                                recipe, day, meal_type, default_servings
                            )
                        else:
                            all_days_data[day][meal_type] = None
                
                # Fill unscheduled days with null
                all_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
                for day in all_days:
                    if day not in all_days_data:
                        all_days_data[day] = {
                            "breakfast": None,
                            "lunch": None,
                            "dinner": None
                        }
                
                # Build MealPlan object
                days = self._build_week_days(all_days_data, default_servings)
                
                logger.info(f"Successfully generated meal plan: {plan_id}")
                return MealPlan(
                    id=plan_id,
                    createdAt=datetime.utcnow(),
                    status=MealPlanStatus.ready,
                    preferences=preferences,
                    days=days,
                )
                
            except ValueError as e:
                logger.warning(f"Week generation failed (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(INITIAL_RETRY_DELAY)
                    continue
                raise
        
        raise ValueError(f"Failed to generate meal plan after {MAX_RETRIES} attempts")
    
    async def modify_meal_plan(
        self,
        modification_text: str,
        current_plan: MealPlan
    ) -> MealPlan:
        """
        Modify an existing meal plan based on user input.
        
        Makes minimal changes to accommodate the user's request.
        Has 60s timeout and up to 3 retries.
        Will retry if Gemini returns incomplete recipe data.
        """
        prefs_json = format_preferences_for_gemini(
            current_plan.preferences.model_dump()
        )
        # Compact JSON to save tokens
        plan_json = json.dumps(
            current_plan.days.model_dump(),
            separators=(',', ':'),
            default=str
        )
        default_servings = current_plan.preferences.numPeople or 2
        
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                prompt = modification_prompt(modification_text, prefs_json, plan_json)
                
                response = await self._call_with_timeout_and_retry(
                    prompt,
                    operation_name=f"Modify meal plan: {modification_text[:50]}"
                )
                structured_data = self._parse_json_response(response)
                
                # Build WeekDays (may raise ValueError for missing core fields)
                days = self._build_week_days(structured_data, default_servings)
                
                return MealPlan(
                    id=current_plan.id,
                    createdAt=current_plan.createdAt,
                    status=MealPlanStatus.ready,
                    preferences=current_plan.preferences,
                    days=days,
                )
                
            except ValueError as e:
                # Core recipe field missing - need to regenerate
                last_error = str(e)
                logger.warning(
                    f"Incomplete recipe data in modification (attempt {attempt + 1}/{MAX_RETRIES}): {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(INITIAL_RETRY_DELAY)
                    continue
        
        # All retries exhausted
        raise IncompleteRecipeError(
            f"Failed to modify meal plan after {MAX_RETRIES} attempts. "
            f"Last error: {last_error}"
        )
    
    async def generate_shopping_list(
        self,
        meal_plan_id: str,
        meal_plan: MealPlan
    ) -> ShoppingList:
        """
        Generate a consolidated shopping list from a meal plan.
        
        Has 90s timeout and up to 3 retries.
        """
        # Compact JSON to save tokens
        plan_json = json.dumps(
            meal_plan.days.model_dump(),
            separators=(',', ':'),
            default=str
        )
        
        prompt = shopping_list_prompt(plan_json)
        
        response = await self._call_with_timeout_and_retry(
            prompt,
            operation_name="Generate shopping list"
        )
        data = self._parse_json_response(response)
        
        items = self._build_shopping_items(data.get("items", []))
        
        return ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:8]}",
            mealPlanId=meal_plan_id,
            createdAt=datetime.utcnow(),
            items=items,
        )
    
    def _build_week_days(self, data: Dict[str, Any], default_servings: int = 2) -> WeekDays:
        """Build WeekDays object from parsed JSON."""
        days_data = {}
        
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
            day_data = data.get(day, {})
            days_data[day] = DayMeals(
                breakfast=self._sanitize_recipe(day_data.get("breakfast"), day, "breakfast", default_servings),
                lunch=self._sanitize_recipe(day_data.get("lunch"), day, "lunch", default_servings),
                dinner=self._sanitize_recipe(day_data.get("dinner"), day, "dinner", default_servings),
            )
        
        return WeekDays(**days_data)
    
    def _sanitize_recipe(
        self, 
        recipe_data: Optional[Dict], 
        day: str, 
        meal_type: str,
        default_servings: int = 2
    ) -> Optional[Dict]:
        """
        Sanitize recipe data to ensure all required fields have valid values.
        
        Core fields (name, ingredients, instructions): Must exist, raise error if null
        Non-core fields: Use sensible defaults
          - estimatedTime: 30 min
          - servings: from preferences (numPeople)
          - difficulty: "medium"
          - totalCalories: 300
        """
        if recipe_data is None:
            return None
        
        # Check if this is actually a recipe object (not just null)
        if not isinstance(recipe_data, dict):
            return None
        
        # Core fields that MUST exist - raise error if missing
        recipe_name = recipe_data.get("name")
        if not recipe_name:
            raise ValueError(
                f"Recipe missing required field 'name' for {day} {meal_type}. "
                "Gemini response is incomplete, retry needed."
            )
        
        ingredients = recipe_data.get("ingredients")
        if not ingredients or (isinstance(ingredients, list) and len(ingredients) == 0):
            raise ValueError(
                f"Recipe '{recipe_name}' missing required field 'ingredients' for {day} {meal_type}. "
                "Gemini response is incomplete, retry needed."
            )
        
        instructions = recipe_data.get("instructions")
        if not instructions:
            raise ValueError(
                f"Recipe '{recipe_name}' missing required field 'instructions' for {day} {meal_type}. "
                "Gemini response is incomplete, retry needed."
            )
        
        # Non-core fields: use defaults if missing
        defaults_applied = []
        
        estimated_time = recipe_data.get("estimatedTime")
        if estimated_time is None:
            estimated_time = 30
            defaults_applied.append("estimatedTime=30")
        
        servings = recipe_data.get("servings")
        if servings is None:
            servings = default_servings
            defaults_applied.append(f"servings={default_servings}")
        
        difficulty = recipe_data.get("difficulty")
        if difficulty is None:
            difficulty = "medium"
            defaults_applied.append("difficulty=medium")
        
        total_calories = recipe_data.get("totalCalories")
        if total_calories is None:
            total_calories = 300
            defaults_applied.append("totalCalories=300")
        
        if defaults_applied:
            logger.warning(
                f"Recipe '{recipe_name}' ({day} {meal_type}): applied defaults [{', '.join(defaults_applied)}]"
            )
        
        # Sanitize ingredients - ensure all required fields exist
        sanitized_ingredients = []
        for ing in ingredients:
            if isinstance(ing, dict):
                sanitized_ing = {
                    "name": ing.get("name") or "Unknown",
                    "quantity": ing.get("quantity") if ing.get("quantity") is not None else 1,
                    "unit": ing.get("unit") or "",  # Empty string if null
                    "category": ing.get("category") or "others",
                }
                sanitized_ingredients.append(sanitized_ing)
        
        return {
            "id": recipe_data.get("id") or f"{day[:3]}-{meal_type}-001",
            "name": recipe_name,
            "ingredients": sanitized_ingredients,
            "instructions": instructions,
            "estimatedTime": estimated_time,
            "servings": servings,
            "difficulty": difficulty,
            "totalCalories": total_calories,
        }
    
    def _build_shopping_items(self, items_data: list) -> list[ShoppingItem]:
        """Build ShoppingItem list from parsed JSON."""
        items = []
        for i, item in enumerate(items_data):
            items.append(ShoppingItem(
                id=f"item_{i:03d}",
                name=item.get("name", "Unknown"),
                category=item.get("category", "others"),
                totalQuantity=item.get("totalQuantity", 0),
                unit=item.get("unit", ""),
                purchased=False,
                isManuallyAdded=False,
            ))
        return items


# Singleton instance
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create Gemini client singleton."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
