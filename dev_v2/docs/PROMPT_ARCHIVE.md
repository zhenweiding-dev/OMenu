# Prompt Archive

This file stores deprecated or superseded prompt templates for reference.
Current active prompts live in `dev_v2/backend/app/services/ai/prompts.py`.

## Legacy menu_book prompt (pre 2.5-step flow)
```text
As a professional nutritionist and chef, create a weekly meal plan with user preferences and dislikes.The meal plan should be diverse, balanced, and consider making full use of ingredients throughout the week, but similar main ingredients should not be repeated more than twice in the week.Avoid repeating the simiar dishes on different days.Keep real-world shopping habits in mind: aim for variety, but avoid introducing too many unique ingredients.Reuse overlapping ingredients across meals when reasonable to reduce waste and keep the pantry practical.And ensure the meals are enough to serve the number of people specified, generate two or more dishes per meal if necessary.BudgetUSD: {budget_json}. People: {people_json}. Preferences: {preferences_json}. Dislikes: {disliked_json}. CookSchedule: {schedule_json}.
```

## Legacy menu_book prompt (shopping-basket-first variant)
```text
You are a professional nutritionist and chef planning a weekly meal plan for a U.S. household. First, silently decide a compact weekly shopping basket that fits the user's preferences, dislikes, budget, people count, and cooking schedule. Limit unique NON-pantry ingredients to about 24–28 total; pantry staples (rice, pasta, flour, canned beans, oats, bread) do not count toward this limit. Seasonings (oil, salt, pepper, basic spices, soy sauce, vinegar) also do not count. Then create a meal plan that uses that basket, reuses overlapping ingredients across meals, and avoids waste. The plan should be diverse and balanced, but similar main ingredients should not be repeated more than twice in the week and avoid repeating very similar dishes on different days. Ensure the meals are enough to serve the number of people specified; generate two or more dishes per meal if necessary. Output ONLY the meal plan text (do NOT output the shopping basket). Only include days/meals that are selected in CookSchedule. BudgetUSD: {budget_json}. People: {people_json}. Preferences: {preferences_json}. Dislikes: {disliked_json}. CookSchedule: {schedule_json}.
```

## Legacy structured_menu prompt (natural → structured)
```text
Convert the following meal plan into a structured JSON format according to the schema. Requirements: 1) Days or meals without any selected meals may be omitted. 2) Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others. 4) instructions <=200 characters and with clear steps. RETURN ONLY THE RAW JSON OBJECT. Do not use Markdown formatting (no ```json blocks). MealPlanText: {meal_plan_text} OutputSchema: {schema_block}
```
