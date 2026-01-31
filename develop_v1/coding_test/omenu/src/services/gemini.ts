import type {
  UserPreferences,
  WeekDays,
  GeminiMealPlanResponse,
  GeminiShoppingListResponse,
} from '@/types';
import {
  extractTextFromResponse,
  parseJsonResponse,
  validateMealPlan,
  validateShoppingList,
  compactJson,
} from '@/utils/helpers';
import { GEMINI_API_URL, API_TIMEOUT_MS } from '@/utils/constants';

// ===== API Key =====
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY is not set');
  }
  return key;
};

// ===== Generic API Call =====
async function callGemini(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${getApiKey()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return extractTextFromResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API request timed out');
    }
    throw error;
  }
}

// ===== Prompt Templates =====
function generateMealPlanPrompt(preferences: UserPreferences): string {
  const prefsJson = compactJson(preferences);
  
  return `Generate a weekly meal plan as JSON based on these preferences:

${prefsJson}

Rules:
- Generate recipes ONLY where cookSchedule is true, use null where false
- NEVER include ingredients from dislikedItems
- Include mustHaveItems across the week
- Use North American units (lbs, oz, count, cups, tbsp)
- Seasonings: set quantity=0, unit=""

Recipe format:
{
  "id": "mon-breakfast-001",
  "name": "Recipe Name",
  "ingredients": [{"name": "eggs", "quantity": 4, "unit": "count", "category": "proteins"}],
  "instructions": "Step 1: Do this.\nStep 2: Do that.\nStep 3: Serve.",
  "estimatedTime": 15,
  "servings": 2,
  "difficulty": "easy",
  "totalCalories": 320
}

IMPORTANT: instructions must be a single string with steps separated by newlines (\n), NOT an array.

Categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others

Output structure:
{
  "monday": {"breakfast": {recipe} or null, "lunch": {recipe} or null, "dinner": {recipe} or null},
  "tuesday": {...},
  "wednesday": {...},
  "thursday": {...},
  "friday": {...},
  "saturday": {...},
  "sunday": {...}
}

Return RAW JSON only. No markdown, no explanation.`;
}

function generateShoppingListPrompt(mealPlan: WeekDays): string {
  const planJson = compactJson(mealPlan);
  
  return `Convert this meal plan into a shopping list JSON:

${planJson}

Rules:
- Merge similar ingredients (e.g., "beef strips" + "flank steak" → "Beef")
- Units: meat=lbs/oz, produce=count/bunch, liquids=cups/tbsp
- Seasonings: totalQuantity=0, unit=""
- Sort by category: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others

Output format:
{
  "items": [
    {"name": "Eggs", "category": "proteins", "totalQuantity": 12, "unit": "count"},
    {"name": "Soy Sauce", "category": "seasonings", "totalQuantity": 0, "unit": ""}
  ]
}

Return RAW JSON only. No markdown, no explanation.`;
}

function generateModificationPrompt(
  userInput: string,
  preferences: UserPreferences,
  currentPlan: WeekDays
): string {
  const prefsJson = compactJson(preferences);
  const planJson = compactJson(currentPlan);
  
  return `Modify this meal plan based on the user's request.

User's Request: ${userInput}

Original Preferences:
${prefsJson}

Current Meal Plan:
${planJson}

Rules:
- Make MINIMAL changes to satisfy the request
- Keep the EXACT same JSON structure
- Still respect dislikedItems
- Generate new recipe IDs for modified recipes

Return RAW JSON only. No markdown, no explanation.`;
}

// ===== API Functions =====
export async function generateMealPlan(
  preferences: UserPreferences
): Promise<GeminiMealPlanResponse> {
  const prompt = generateMealPlanPrompt(preferences);
  console.log('Generating meal plan with prompt length:', prompt.length);
  
  const responseText = await callGemini(prompt);
  console.log('Raw API response:', responseText.substring(0, 500));
  
  const parsed = parseJsonResponse<GeminiMealPlanResponse>(responseText);
  console.log('Parsed response:', parsed ? 'success' : 'failed');
  
  if (!parsed) {
    throw new Error('Failed to parse meal plan response');
  }
  
  const isValid = validateMealPlan(parsed);
  console.log('Validation result:', isValid);
  
  if (!isValid) {
    console.error('Invalid meal plan structure:', JSON.stringify(parsed).substring(0, 500));
    throw new Error('Invalid meal plan structure');
  }
  
  return parsed;
}

export async function modifyMealPlan(
  userInput: string,
  preferences: UserPreferences,
  currentPlan: WeekDays
): Promise<GeminiMealPlanResponse> {
  const prompt = generateModificationPrompt(userInput, preferences, currentPlan);
  const responseText = await callGemini(prompt);
  
  const parsed = parseJsonResponse<GeminiMealPlanResponse>(responseText);
  
  if (!parsed) {
    throw new Error('Failed to parse modified meal plan response');
  }
  
  if (!validateMealPlan(parsed)) {
    throw new Error('Invalid meal plan structure');
  }
  
  return parsed;
}

export async function generateShoppingList(
  mealPlan: WeekDays
): Promise<GeminiShoppingListResponse> {
  const prompt = generateShoppingListPrompt(mealPlan);
  const responseText = await callGemini(prompt);
  
  const parsed = parseJsonResponse<GeminiShoppingListResponse>(responseText);
  
  if (!parsed) {
    throw new Error('Failed to parse shopping list response');
  }
  
  if (!validateShoppingList(parsed)) {
    throw new Error('Invalid shopping list structure');
  }
  
  return parsed;
}
