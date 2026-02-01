"""
Gemini API client for OMenu.

Handles all interactions with Google's Gemini API including:
- Two-step meal plan generation
- Meal plan modification
- Shopping list generation
"""

import json
import re
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import get_settings
from app.services.prompts import (
    meal_plan_prompt,
    structured_plan_prompt,
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


class GeminiClient:
    """Client for interacting with Google Gemini API."""
    
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
            ),
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
        Generate a complete meal plan using two-step process.
        
        Step 1: Generate natural language plan (creative)
        Step 2: Convert to structured JSON (reliable)
        """
        plan_id = f"mp_{uuid.uuid4().hex[:8]}"
        prefs_json = format_preferences_for_gemini(preferences.model_dump())
        
        # Step 1: Generate natural language plan
        step1_prompt = meal_plan_prompt(prefs_json)
        logger.info("Step 1: Generating natural language meal plan...")
        
        step1_response = await self.model.generate_content_async(step1_prompt)
        natural_plan = step1_response.text
        logger.debug(f"Step 1 response length: {len(natural_plan)}")
        
        # Step 2: Convert to structured JSON
        step2_prompt = structured_plan_prompt(natural_plan)
        logger.info("Step 2: Converting to structured JSON...")
        
        step2_response = await self.model.generate_content_async(step2_prompt)
        structured_data = self._parse_json_response(step2_response.text)
        
        # Build MealPlan object
        days = self._build_week_days(structured_data)
        
        return MealPlan(
            id=plan_id,
            createdAt=datetime.utcnow(),
            status=MealPlanStatus.ready,
            preferences=preferences,
            days=days,
        )
    
    async def modify_meal_plan(
        self,
        modification_text: str,
        current_plan: MealPlan
    ) -> MealPlan:
        """
        Modify an existing meal plan based on user input.
        
        Makes minimal changes to accommodate the user's request.
        """
        prefs_json = format_preferences_for_gemini(
            current_plan.preferences.model_dump()
        )
        plan_json = json.dumps(
            current_plan.days.model_dump(),
            indent=2,
            default=str
        )
        
        prompt = modification_prompt(modification_text, prefs_json, plan_json)
        logger.info(f"Modifying meal plan with: {modification_text}")
        
        response = await self.model.generate_content_async(prompt)
        structured_data = self._parse_json_response(response.text)
        
        days = self._build_week_days(structured_data)
        
        return MealPlan(
            id=current_plan.id,
            createdAt=current_plan.createdAt,
            status=MealPlanStatus.ready,
            preferences=current_plan.preferences,
            days=days,
        )
    
    async def generate_shopping_list(
        self,
        meal_plan_id: str,
        meal_plan: MealPlan
    ) -> ShoppingList:
        """
        Generate a consolidated shopping list from a meal plan.
        """
        plan_json = json.dumps(
            meal_plan.days.model_dump(),
            indent=2,
            default=str
        )
        
        prompt = shopping_list_prompt(plan_json)
        logger.info("Generating shopping list...")
        
        response = await self.model.generate_content_async(prompt)
        data = self._parse_json_response(response.text)
        
        items = self._build_shopping_items(data.get("items", []))
        
        return ShoppingList(
            id=f"sl_{uuid.uuid4().hex[:8]}",
            mealPlanId=meal_plan_id,
            createdAt=datetime.utcnow(),
            items=items,
        )
    
    def _build_week_days(self, data: Dict[str, Any]) -> WeekDays:
        """Build WeekDays object from parsed JSON."""
        days_data = {}
        
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
            day_data = data.get(day, {})
            days_data[day] = DayMeals(
                breakfast=day_data.get("breakfast"),
                lunch=day_data.get("lunch"),
                dinner=day_data.get("dinner"),
            )
        
        return WeekDays(**days_data)
    
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
