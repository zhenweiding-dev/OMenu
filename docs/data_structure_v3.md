# Data Structures - OMenu v3 (User Journey & Data Flow)

## User Journey & Data Operations

This version integrates **user operations** → **system processing** → **UI display** → **data structures involved**.

---

## Journey 1: Collect Preferences & Generate Initial Meal Plan

### Step 1.1: Combined Preferences & Recipe Selection Input

| Aspect | Details |
|--------|---------|
| **User Operation** | User opens app, sees unified input interface: "What do you want to eat this week?" |
| **User Actions** | 1. Enter custom food mood/recipe preferences in main input box 2. Select/deselect mood tags and specific recipes shown as scrollable tags below |
| **System Processes** | Collect combined food mood and recipe preferences |
| **UI Displays** | Main input box (prominent) + scrollable tag list below (mood tags: "healthy", "quick meals", "budget friendly", etc. + recipe suggestions) + ability to add custom recipes |
| **Data Created** | `userPreferenceInput.json` |

**Data Structure: userPreferenceInput.json** (merged from previous userMoodInput + foodChoiceInput)
```json
{
    "// notes": "Unified input combining food mood and recipe preferences. UI: large text box + scrollable tags below.",
    "// ui_layout": "Main input box for custom text | Below: scrollable tags (moods + recipes) user can select/deselect",
    "userPrompt": "I want to eat healthy meals with chicken and broccoli, but also include some pasta and salad options.",
    "// userPrompt_notes": "Primary text input - flexible user preference statement",
    "selectedMoodTags": ["healthy", "chinese food"],
    "// selectedMoodTags_options": ["healthy", "quick meals", "budget friendly", "easy cook", "variety", "vegetarian"],
    "suggestedMoodTags": ["healthy", "quick meals", "budget friendly", "easy cook", "variety", "vegetarian", "italian food", "mediterranean"],
    "preferredRecipes": ["番茄鸡蛋", "清炒西兰花"],
    "// preferredRecipes_notes": "Specific dishes user wants included",
    "suggestedRecipes": ["红烧茄子", "鱼香肉丝", "豆腐汤", "意大利面", "凯撒沙拉"],
    "// suggestedRecipes_source": "Generated from database based on mood tags + userPrompt"
}
```

---

### Step 1.2: Basic Preferences

| Aspect | Details |
|--------|---------|
| **User Operation** | User sees "Choose to let magic happen!" form |
| **User Actions** | Slide to choose number of people (default 1), select cooking difficulty, other preferences hidden in advanced settings on top right |
| **System Processes** | Validate and store preferences |
| **UI Displays** | Number input, difficulty dropdown |
| **Data Created/Updated** | `basicPreferences.json` |

**Data Structure: basicPreferences.json**
```json
{
    "// notes": "Essential cooking setup",
    "numberOfPeople": 1,
    "// numberOfPeople_unit": "number of people, default: 1",
    "cookDifficulty": "easy",
    "// cookDifficulty_options": ["easy", "a litte more effort", "changllenge"]
}
```

---

### Step 1.3: Extended Preferences

| Aspect | Details |
|--------|---------|
| **User Operation** | User sees additional preference options on the top right corner (advanced settings) |
| **User Actions** | Select mood tags (e.g., "healthy", "budget friendly"), dietary restrictions, set budget, cooking time, cuisines; enter additional notes |
| **System Processes** | Collect all extended preferences including merged food mood tags |
| **UI Displays** | Multi-select dropdowns, number inputs, "others" is hidden from UI but captured for AI |
| **Data Created/Updated** | `extendedPreferences.json` |

**Data Structure: extendedPreferences.json**
```json
{
    "// notes": "Detailed user constraints and special requirements. Now includes merged food mood tags.",
    "moodTags": ["healthy", "budget friendly"],
    "// moodTags_options": ["healthy", "quick meals", "budget friendly", "easy cook", "variety", "vegetarian"],
    "// moodTags_default": ["budget friendly"],
    "// moodTags_notes": "Food mood preferences merged into extended preferences (Step 1.1 mood selection)",
    "dietaryRestrictions": ["vegetarian", "gluten-free"],
    "// dietaryRestrictions_options": ["vegetarian", "vegan", "keto", "paleo", "gluten-free", "peanut-free", "dairy-free"],
    "budget": 70,
    "// budget_unit": "USD per person per week, leave empty if not specified",
    "preferredCuisines": ["chinese", "italian", "mediterranean"],
    "// preferredCuisines_options": ["italian", "mexican", "chinese", "indian", "mediterranean", "american", "japanese", "thai"],
    "cookTimePerMeal": 30,
    "// cookTimePerMeal_unit": "minutes, default: 0 no limit",
    "others": "I prefer less spicy food, prefer seafood occasionally",
    "// others_notes": "CRITICAL: not for user display, only for AI understanding of unstructured preferences",
    "cookSchedule": {
        "// notes": "Which meals to plan for each day",
        "monday": ["breakfast", "lunch", "dinner"],
        "tuesday": ["breakfast", "lunch", "dinner"],
        "wednesday": ["breakfast", "lunch", "dinner"],
        "thursday": ["breakfast", "lunch", "dinner"],
        "friday": ["breakfast", "lunch", "dinner"],
        "saturday": ["breakfast", "lunch", "dinner"],
        "sunday": ["breakfast", "lunch", "dinner"]
    }
}
```

---

### Step 1.4: Trigger AI to Parse Preferences

> happens only when user clicks "Generate Plan" button

| Aspect | Details |
|--------|---------|
| **User Operation** | User clicks "Generate Plan" button |
| **System Processes** | 1. Collect all user inputs (unified preferences, recipes, basic, extended) 2. Send to AI for preference parsing |
| **UI Displays** | Loading spinner with message "Creating your personalized meal plan..." |
| **Data Flow** | userPreferenceInput + basicPreferences + extendedPreferences → AI parsing request |

**Data Structure: preferenceParsingRequest.json**
```json
{
    "// notes": "AI first parses user input to extract complete profile, avoiding information loss",
    "userInputData": {
        "userPrompt": "I want to eat healthy meals with chicken and broccoli, but also include some pasta and salad options.",
        "selectedMoodTags": ["healthy", "chinese food"],
        "selectedRecipes": ["番茄鸡蛋", "清炒西兰花"],
        "basicPrefs": {
            "numberOfPeople": 2,
            "cookDifficulty": "easy"
        },
        "extendedPrefs": {
            "moodTags": ["healthy", "budget friendly"],
            "dietaryRestrictions": ["vegetarian", "gluten-free"],
            "budget": 70,
            "cookTimePerMeal": 30,
            "others": "I prefer less spicy food"
        }
    },
    "parsingPrompt": "Parse and normalize the user input into a complete preference profile. Extract all explicit and implicit preferences. If a field is missing, leave it empty. Return normalized preferenceProfile in JSON format, ensuring no information loss.",
    "responseFormat": {
        "preferenceProfile": {
            "userMoods": "array of selected moods",
            "preferredRecipes": "array of recipe names",
            "ingredientPreferences": "inferred from userPrompt and others field",
            "dietaryRestrictions": "array",
            "budget": "number or null",
            "cookTimePerMeal": "number or null",
            "numberOfPeople": "number",
            "cookDifficulty": "string",
            "others": "unstructured preferences not fitting predefined fields",
            "cookSchedule": "object with days and meals"
        }
    }
}
```

**AI Output: preferenceProfile.json** (stored for future reference)
```json
{
    "// notes": "Normalized and complete user preference profile after AI parsing",
    "profileId": "profile_20240601_user123",
    "createdAt": "2024-06-01T10:00:00Z",
    "userMoods": ["healthy", "chinese food"],
    "preferredRecipes": ["番茄鸡蛋", "清炒西兰花"],
    "ingredientPreferences": ["chicken", "broccoli", "pasta", "vegetables"],
    "// ingredientPreferences_notes": "Inferred from userPrompt + others field",
    "dietaryRestrictions": ["vegetarian", "gluten-free"],
    "budget": 70,
    "cookTimePerMeal": 30,
    "numberOfPeople": 2,
    "cookDifficulty": "easy",
    "others": "I prefer less spicy food, prefer seafood occasionally",
    "cookSchedule": {
        "monday": ["breakfast", "lunch", "dinner"],
        "tuesday": ["breakfast", "lunch", "dinner"],
        "wednesday": ["breakfast", "lunch", "dinner"],
        "thursday": ["breakfast", "lunch", "dinner"],
        "friday": ["breakfast", "lunch", "dinner"],
        "saturday": ["breakfast", "lunch", "dinner"],
        "sunday": ["breakfast", "lunch", "dinner"]
    }
}
```

---

### Step 1.5: Generate Initial Meal Plan

| Aspect | Details |
|--------|---------|
| **System Processes** | AI generates personalized weekly meal plan based on `preferenceProfile.json`. Each recipe includes calorie information. |
| **UI Displays** | Loading spinner still visible |
| **Data Flow** | preferenceProfile.json → AI generation → mealPlan.json |

**Data Structure: mealPlanGenerationRequest.json**
```json
{
    "// notes": "AI generates personalized weekly meal plan based on parsed preferences",
    "preferenceProfile": {
        "// reference": "Use output from Step 1.4 (preferenceProfile.json)"
    },
    "generationPrompt": "Based on the complete preference profile, generate a personalized weekly meal plan. The plan must: 1. Include all user-preferred recipes 2. Respect all dietary restrictions 3. Stay within budget if specified, can override if necessary 4. Adhere to cooking time limits 5. Ensure nutritional balance and variety throughout the week 6. Honor the 'others' preferences. Return meal plan in specified format.",
    "responseFormat": {
        "structure": "json",
        "schema": {
            "day": "string (monday-sunday)",
            "meals": {
                "breakfast|lunch|dinner": {
                    "recipeName": "string",
                    "ingredients": [
                        {
                            "name": "string",
                            "quantity": "number",
                            "unit": "string (g, count, ml, bottle, spoon, etc.)"
                        }
                    ],
                    "recipeDetails": "string (step-by-step instructions)",
                    "estimatedTime": "number (minutes)",
                    "servings": "number",
                    "difficulty": "string",
                    "totalCalories": "number (total calories for all servings)"
                }
            }
        }
    }
}
```

**AI Output: mealPlan.json** (includes calorie info)
```json
{
    "// notes": "Weekly meal plan generated by AI. Basis for shopping list and daily timeline. Includes totalCalories per recipe.",
    "planId": "plan_20240601_user123",
    "createdAt": "2024-06-01T10:00:00Z",
    "monday": {
        "breakfast": {
            "recipeId": "recipe_001",
            "recipeName": "番茄鸡蛋",
            "ingredients": [
                {"name": "eggs", "quantity": 2, "unit": "count"},
                {"name": "tomato", "quantity": 100, "unit": "g"},
                {"name": "oil", "quantity": 15, "unit": "ml"}
            ],
            "recipeDetails": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
            "estimatedTime": 15,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 180
        },
        "lunch": {
            "recipeId": "recipe_002",
            "recipeName": "清炒西兰花",
            "ingredients": [
                {"name": "broccoli", "quantity": 200, "unit": "g"},
                {"name": "garlic", "quantity": 20, "unit": "g"},
                {"name": "oil", "quantity": 15, "unit": "ml"}
            ],
            "recipeDetails": "1. Clean broccoli... 2. Heat oil... 3. Stir fry...",
            "estimatedTime": 20,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 220
        },
        "dinner": {
            "recipeId": "recipe_003",
            "recipeName": "番茄意大利面",
            "ingredients": [
                {"name": "pasta", "quantity": 200, "unit": "g"},
                {"name": "tomato sauce", "quantity": 100, "unit": "ml"},
                {"name": "parmesan", "quantity": 20, "unit": "g"}
            ],
            "recipeDetails": "1. Boil pasta... 2. Prepare sauce... 3. Mix...",
            "estimatedTime": 25,
            "servings": 2,
            "difficulty": "easy",
            "totalCalories": 450
        }
    }
}
```

---

### Step 1.6: Display Meal Plan

| Aspect | Details |
|--------|---------|
| **System Processes** | Parse mealPlan.json and render in UI |
| **UI Displays** | Weekly meal plan with recipe names, ingredients, cooking time, and **total calories** per dish, may not fully display all details |
| **User Can** | View recipes, see ingredients and cooking time; click on a recipe for detailed options (regenerate single recipe, delete, move to another date); or click "Continue to Shopping List" |

---

## Journey 2: Generate Shopping List

### Step 2.1: AI-Powered Shopping List Generation

| Aspect | Details |
|--------|---------|
| **User Operation** | User clicks "View Shopping List" or equivalent |
| **System Processes** | 1. Send mealPlan.json to AI 2. AI extracts, aggregates, and categorizes all ingredients 3. Generate shoppingList.json with pre-defined categories |
| **UI Displays** | Loading brief moment, then shopping list in categorized format |
| **Data Flow** | mealPlan.json → AI categorization & generation → shoppingList.json |

**Data Structure: shoppingListGenerationRequest.json**
```json
{
    "// notes": "AI generates shopping list by extracting and categorizing ingredients from meal plan",
    "mealPlan": {
        "// reference": "mealPlan.json with all meals and ingredients"
    },
    "predefinedCategories": [
        "proteins", "vegetables", "fruits", "grains", "dairy", "oils_condiments", "spices_seasonings", "pantry_staples", "others"
    ],
    "// predefinedCategories_notes": "Fixed categories for consistent organization. Each ingredient must be assigned to exactly one category.",
    "generationPrompt": "Extract all ingredients from the meal plan. For each ingredient, provide: 1. Ingredient name 2. Total quantity across all meals (sum identical ingredients) 3. Unit (g, count, ml, bottle, spoon, etc.) 4. Category from predefined list 5. Estimated price (optional). Ensure quantity units are consistent and realistic. Return in JSON format.",
    "responseFormat": {
        "shoppingList": [
            {
                "id": "ingredient_001",
                "name": "string",
                "category": "one of predefinedCategories",
                "totalQuantity": "number",
                "unit": "string",
                "estimatedPrice": "number or null"
            }
        ]
    }
}
```

**AI Output: shoppingList.json** (pre-categorized, fixed categories)
```json
{
    "// notes": "Shopping list AI-generated from mealPlan. Pre-defined categories, user can add/remove items independently.",
    "// generation_method": "AI extraction and categorization from mealPlan.json",
    "planId": "plan_20240601_user123",
    "createdAt": "2024-06-01T10:30:00Z",
    "predefinedCategories": ["proteins", "vegetables", "fruits", "grains", "dairy", "oils_condiments", "spices_seasonings", "pantry_staples", "others"],
    "shoppingList": [
        {
            "id": "ingredient_001",
            "name": "eggs",
            "category": "proteins",
            "totalQuantity": 12,
            "unit": "count",
            "estimatedPrice": 8.99,
            "isPurchased": false,
            "notes": ""
        },
        {
            "id": "ingredient_002",
            "name": "broccoli",
            "category": "vegetables",
            "totalQuantity": 800,
            "unit": "g",
            "estimatedPrice": 5.50,
            "isPurchased": false,
            "notes": ""
        },
        {
            "id": "ingredient_003",
            "name": "tomato",
            "category": "vegetables",
            "totalQuantity": 300,
            "unit": "g",
            "estimatedPrice": 3.20,
            "isPurchased": false,
            "notes": ""
        },
        {
            "id": "ingredient_004",
            "name": "pasta",
            "category": "grains",
            "totalQuantity": 200,
            "unit": "g",
            "estimatedPrice": 2.50,
            "isPurchased": false,
            "notes": ""
        }
    ],
    "userAddedItems": [
        {
            "// notes": "User can freely add items independent of mealPlan. Does not affect mealPlan.",
            "id": "user_item_001",
            "name": "butter",
            "category": "dairy",
            "totalQuantity": 100,
            "unit": "g",
            "estimatedPrice": 3.50,
            "isPurchased": false,
            "notes": "Added by user"
        }
    ],
    "summary": {
        "totalItems": 20,
        "totalCost": 65.50,
        "budgetRemaining": 4.50
    }
}
```

---

### Step 2.2: Display Shopping List

| Aspect | Details |
|--------|---------|
| **UI Displays** | Shopping list in to-do format, organized by pre-defined categories (proteins, vegetables, fruits, grains, dairy, oils/condiments, spices/seasonings, pantry staples, others) |
| **User Can** | Check off items as purchased, add/remove items manually, adjust quantities, see budget tracking |

---

## Journey 2.5: User Adds Custom Recipe

### Step 2.5.1: Input Custom Recipe

| Aspect | Details |
|--------|---------|
| **User Operation** | User clicks "Add Custom Recipe" button (available in meal plan and daily views, beside the date/meal) |
| **User Input** | 1. Recipe name (e.g., "My favorite pasta") 2. Cooking steps/details (free text) |
| **System Processes** | 1. Capture recipe name and instructions 2. Send to AI for ingredient parsing |
| **UI Displays** | Modal form with two input fields: recipe name + cooking steps, loading spinner during AI processing |
| **Data Flow** | userCustomRecipe input → AI parsing → ingredientParsing.json |

**Data Structure: userCustomRecipeInput.json**
```json
{
    "// notes": "User-provided custom recipe without structured ingredients",
    "recipeName": "My favorite pasta",
    "recipeDetails": "Boil pasta for 10 minutes. In a pan, heat olive oil and garlic. Add fresh tomatoes, simmer for 5 minutes. Mix cooked pasta with sauce. Top with parmesan cheese. Serves 2.",
    "estimatedTime": null,
    "// estimatedTime_notes": "User may not provide, AI can infer from recipeDetails"
}
```

---

### Step 2.5.2: AI Parses Ingredients from Recipe

| Aspect | Details |
|--------|---------|
| **System Processes** | AI analyzes recipe text to extract ingredients, quantities, and estimated cooking time |
| **UI Displays** | Still loading spinner |
| **Data Flow** | userCustomRecipeInput → AI parsing → ingredientParsingResult.json |

**Data Structure: ingredientParsingRequest.json**
```json
{
    "// notes": "AI request to parse ingredients from free-text recipe",
    "userRecipe": {
        "recipeName": "My favorite pasta",
        "recipeDetails": "Boil pasta for 10 minutes. In a pan, heat olive oil and garlic. Add fresh tomatoes, simmer for 5 minutes. Mix cooked pasta with sauce. Top with parmesan cheese. Serves 2."
    },
    "parsingPrompt": "Extract all ingredients and quantities from the recipe text. For each ingredient, identify: 1. Ingredient name 2. Quantity and unit (g, count, ml, bottle, spoon, etc.) 3. Estimated serving size. Also estimate total cooking time and difficulty level. Return in JSON format. Be conservative with quantity estimates based on cooking methods described.",
    "responseFormat": {
        "recipeName": "string",
        "ingredients": [
            {
                "name": "string",
                "quantity": "number",
                "unit": "string"
            }
        ],
        "recipeDetails": "string (same as input)",
        "estimatedTime": "number (minutes)",
        "servings": "number (estimated from recipe)",
        "difficulty": "string (easy/medium/hard)",
        "totalCalories": "number or null (optional, only if inferable)"
    }
}
```

**AI Output: ingredientParsingResult.json**
```json
{
    "// notes": "Parsed recipe with extracted ingredients",
    "recipeName": "My favorite pasta",
    "ingredients": [
        {"name": "pasta", "quantity": 200, "unit": "g"},
        {"name": "olive oil", "quantity": 30, "unit": "ml"},
        {"name": "garlic", "quantity": 30, "unit": "g"},
        {"name": "tomato", "quantity": 300, "unit": "g"},
        {"name": "parmesan cheese", "quantity": 40, "unit": "g"}
    ],
    "recipeDetails": "Boil pasta for 10 minutes. In a pan, heat olive oil and garlic. Add fresh tomatoes, simmer for 5 minutes. Mix cooked pasta with sauce. Top with parmesan cheese. Serves 2.",
    "estimatedTime": 20,
    "servings": 2,
    "difficulty": "easy",
    "totalCalories": 580
}
```

---

### Step 2.5.3: Add Recipe to Meal Plan & Update Shopping List

| Aspect | Details |
|--------|---------|
| **System Processes** | 1. Create new recipe entry 2. Add to specified day/meal 3. If adding to meal plan, recalculate shoppingList.json 4. Aggregate new ingredients into shopping list |
| **UI Updates** | Show confirmation, update meal plan and/or shopping list |
| **Data Flow** | ingredientParsingResult → mealPlan.json (optional) + shoppingList.json |

**Cascade Updates:**
- If user adds recipe to a specific meal slot: Update mealPlan.json for that day/meal
- Recalculate shoppingList.json: add new ingredients or update quantities of existing ingredients
- If ingredients already in shopping list, sum the quantities
- Display updated counts in UI

---

## Journey 3: Daily Meal Planning & Execution

### Step 3.1: View Today's Meal Plan

| Aspect | Details |
|--------|---------|
| **User Operation** | User navigates to "Today" or daily view |
| **System Processes** | 1. Get current date 2. Extract today's meals from mealPlan.json 3. Compare current time with scheduled meal times 4. Determine status (upcoming/current/past) 5. Generate dailyMealPlan.json |
| **UI Displays** | Timeline showing breakfast, lunch, dinner with current time indicator |
| **Data Flow** | mealPlan.json + current time → dailyMealPlan.json |

**Data Structure: dailyMealPlan.json**
```json
{
    "// notes": "Daily meal plan formatted for timeline UI. Derived from mealPlan + display metadata.",
    "// rendering_logic": "Timeline shows current/upcoming meals. As real time progresses, 'current' meal shifts upward. User can add/edit/remove from timeline.",
    "date": "2024-06-01",
    "dayOfWeek": "monday",
    "weather": "Sunny",
    "luckyWord": "Carpe Diem",
    "sourceDate": "2024-06-01",
    "// sourceDate_notes": "Which day from mealPlan.json this dailyMealPlan is derived from",
    "timeline": [
        {
            "// notes": "Timeline items ordered by scheduledTime. Status updates based on real-time comparison.",
            "mealType": "breakfast",
            "scheduledTime": "08:00",
            "status": "upcoming",
            "// status_options": ["upcoming", "current", "past"],
            "// status_logic": "Determined by comparing scheduledTime with current time. 'current' if within estimatedTime window.",
            "recipeId": "recipe_001",
            "recipeName": "番茄鸡蛋",
            "ingredients": [
                {"name": "eggs", "quantity": 2, "unit": "count"},
                {"name": "tomato", "quantity": 100, "unit": "g"},
                {"name": "oil", "quantity": 15, "unit": "ml"}
            ],
            "recipeDetails": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
            "estimatedTime": 15,
            "servings": 2,
            "difficulty": "easy",
            "notes": ""
        },
        {
            "// notes": "As real time progresses, earlier meals transition from 'current' to 'past', next meal becomes 'current'",
            "mealType": "lunch",
            "scheduledTime": "12:30",
            "status": "upcoming",
            "recipeId": "recipe_002",
            "recipeName": "清炒西兰花",
            "ingredients": [
                {"name": "broccoli", "quantity": 200, "unit": "g"},
                {"name": "garlic", "quantity": 20, "unit": "g"},
                {"name": "oil", "quantity": 15, "unit": "ml"}
            ],
            "recipeDetails": "1. Clean broccoli... 2. Heat oil... 3. Stir fry...",
            "estimatedTime": 20,
            "servings": 2,
            "difficulty": "easy",
            "notes": ""
        },
        {
            "// notes": "User can edit/remove/add meals directly from timeline. Changes update mealPlan + shoppingList.",
            "mealType": "dinner",
            "scheduledTime": "19:00",
            "status": "upcoming",
            "recipeId": "recipe_003",
            "recipeName": "番茄意大利面",
            "ingredients": [
                {"name": "pasta", "quantity": 200, "unit": "g"},
                {"name": "tomato sauce", "quantity": 100, "unit": "ml"},
                {"name": "parmesan", "quantity": 20, "unit": "g"}
            ],
            "recipeDetails": "1. Boil pasta... 2. Prepare sauce... 3. Mix...",
            "estimatedTime": 25,
            "servings": 2,
            "difficulty": "easy",
            "notes": ""
        }
    ],
    "userActions": {
        "// notes": "User can modify meals directly from timeline view",
        "canAdd": true,
        "canEdit": true,
        "canRemove": true,
        "// cascade_logic": "Meal modifications in dailyMealPlan should sync back to mealPlan and trigger shoppingList update"
    }
}
```

---

### Step 3.2: Real-Time Timeline Updates

| Aspect | Details |
|--------|---------|
| **System Processes** | Every minute, update status of meals based on current time |
| **UI Display Changes** | Meals transition: "upcoming" → "current" → "past" as time progresses |
| **Greyed Out** | Past meals appear greyed out in UI |

**Timeline Status Logic:**
```
Current time: 11:45 AM

Timeline before update:
- breakfast (08:00): past ✓ (greyed out)
- lunch (12:30): upcoming ⏰
- dinner (19:00): upcoming

After 12:30 PM (lunch time):
- breakfast (08:00): past ✓ (greyed out)
- lunch (12:30): current 🍽️ (highlight)
- dinner (19:00): upcoming ⏰
```

---

### Step 3.3: Enhanced Meal Plan Interaction (Chat & Single-Recipe Operations)

| Aspect | Details |
|--------|---------|
| **User Operations** | 1. **Chat-based refinement**: Click "Refine Plan" button to open dialog, enter natural language feedback 2. **Single recipe actions**: Click on any recipe to open options (regenerate replacement recipe, delete, move to another date) |
| **UI Displays** | Dialog box for chat input (option 1) OR recipe action menu (option 2) |
| **Data Flow** | User input → AI processing → updated mealPlan.json |

#### Option 1: Chat-Based Meal Plan Refinement

| Aspect | Details |
|--------|---------|
| **User Operation** | User clicks "Refine Plan" and types feedback (e.g., "Add more vegetarian meals on Wednesday and Thursday, I'm tired of pasta") |
| **System Processes** | 1. Capture feedback 2. Send to AI with current mealPlan & preferenceProfile 3. AI regenerates entire week with updated preferences 4. Replace mealPlan.json 5. Recalculate shoppingList.json |
| **UI Updates** | Updated meal plan displayed, shopping list refreshed |

**Data Structure: chatRefinementRequest.json**
```json
{
    "// notes": "User provides natural language feedback for whole meal plan refinement via chat dialog",
    "currentMealPlan": {
        "// reference": "mealPlan.json - current week's plan"
    },
    "preferenceProfile": {
        "// reference": "preferenceProfile.json - existing user preferences"
    },
    "userFeedback": "Add more vegetarian meals on Wednesday and Thursday, I'm tired of pasta",
    "refinementPrompt": "based on the existing preferenceProfile and userFeedback, regenerate the weekly meal plan accordingly. If userfeeback contradicts existing preferences, prioritize user feedback but still respect other constraints. Only change meals as necessary. The plan must: 1. Include all user-preferred recipes 2. Respect all dietary restrictions 3. Stay within budget if specified, can override if necessary 4. Adhere to cooking time limits 5. Ensure nutritional balance and variety throughout the week 6. Honor the 'others' preferences. Return meal plan in specified format.",
    "responseFormat": {
        "structure": "json",
        "schema": {
            "day": "string (monday-sunday)",
            "meals": {
                "breakfast|lunch|dinner": {
                    "recipeName": "string",
                    "ingredients": [
                        {
                            "name": "string",
                            "quantity": "number",
                            "unit": "string (g, count, ml, bottle, spoon, etc.)"
                        }
                    ],
                    "recipeDetails": "string (step-by-step instructions)",
                    "estimatedTime": "number (minutes)",
                    "servings": "number",
                    "difficulty": "string",
                    "totalCalories": "number (total calories for all servings)"
                }
            }
        }
    }
}
```

#### Option 2: Single Recipe Operations

| Aspect | Details |
|--------|---------|
| **User Operation** | User clicks on a specific recipe to access action menu: [Regenerate Replacement Recipe] [Delete] [Move to Another Date] |
| **System Processes** | Based on selected action, execute operation and cascade updates |

**Subcase 2a: Regenerate Single Recipe**

| Aspect | Details |
|--------|---------|
| **User Action** | Selects "Regenerate This Recipe" from recipe menu |
| **System Processes** | 1. AI generates alternative recipe for same meal slot 2. Consider: same dietary restrictions, similar cook time, complementary to other meals in the day 3. Replace recipe in mealPlan 4. Recalculate shoppingList (remove old ingredients, add new) |
| **Data Flow** | Current meal info + preferenceProfile → AI generation → updated mealPlan + shoppingList |

**Data Structure: singleRecipeRegenerationRequest.json**
```json
{
    "// notes": "AI generates alternative recipe for single meal slot, respecting existing meal plan context",
    "currentRecipe": {
        "day": "monday",
        "mealType": "lunch",
        "recipeId": "recipe_002",
        "recipeName": "清炒西兰花",
        "// reference": "Details from mealPlan.json"
    },
    "mealContext": {
        "// notes": "Other meals on same day to ensure complementary choices",
        "breakfast": "番茄鸡蛋",
        "lunch": "清炒西兰花",
        "dinner": "番茄意大利面"
    },
    "preferenceProfile": {
        "// reference": "preferenceProfile.json for constraints"
    },
    "regenerationPrompt": "Generate ONE alternative recipe to replace the lunch meal. The new recipe must: 1. Respect all dietary restrictions 2. do not repeat with other meals 3. Stay within budget if specified, can override if necessary 4. Adhere to cooking time limits 5. Ensure nutritional balance and variety throughout the week 6. Honor the 'others' preferences. Return meal plan in specified format.",
    "responseFormat": {
        "recipeName": "string",
        "ingredients": [{"name": "string", "quantity": "number", "unit": "string"}],
        "recipeDetails": "string",
        "estimatedTime": "number",
        "servings": "number",
        "difficulty": "string",
        "totalCalories": "number"
    }
}
```

**Subcase 2b: Delete Recipe**

| Aspect | Details |
|--------|---------|
| **User Action** | Selects "Delete" from recipe menu |
| **System Processes** | 1. Remove recipe from mealPlan.json for that day/meal slot 2. Remove associated ingredients from shoppingList 3. Update day to show meal slot as empty |
| **Data Flow** | mealPlan (recipe removed) → shoppingList (ingredients removed/updated) |

**Subcase 2c: Move to Another Date**

| Aspect | Details |
|--------|---------|
| **User Action** | Selects "Move to Another Date", chooses target day and meal type |
| **System Processes** | 1. Remove recipe from current day/meal slot 2. Add recipe to target day/meal slot 3. shoppingList remains same (same ingredients, just moved) 4. Adjust meal at old slot (can be empty or regenerate) |
| **Data Flow** | mealPlan (recipe moved) → mealPlan updated for both days |

---

### Step 3.4: User Modifies Daily Meals (Timeline-Based Edits)

| Aspect | Details |
|--------|---------|
| **User Operation** | User removes lunch, adds a different recipe, or edits a recipe directly from daily timeline |
| **System Processes** | 1. Update dailyMealPlan.json 2. Cascade update to mealPlan.json 3. Recalculate shoppingList.json |
| **UI Updates** | Timeline reflects changes immediately |
| **Data Flow** | dailyMealPlan (user edit) → mealPlan → shoppingList |

---

## Journey 4: Regenerate Meal Plan

### Step 4.1: Full Plan Regeneration (Merged with Step 3.3 Chat-Based Refinement)

| Aspect | Details |
|--------|---------|
| **Note** | This is now handled through **Step 3.3 Option 1: Chat-Based Meal Plan Refinement**. User clicks "Refine Plan" dialog to provide feedback for entire meal plan adjustment. |

---

### Step 4.2: Update All Dependent Data

| Aspect | Details |
|--------|---------|
| **System Processes** | 1. Update mealPlan.json 2. Recalculate shoppingList.json 3. Update dailyMealPlan.json for today |
| **UI Displays** | New meal plan, updated shopping list, new timeline |
| **Data Flow** | preferenceProfile → mealPlan → shoppingList, dailyMealPlan |

---

## Reference Database

### Food Database - Recipe Library

**Data Structure: recipeDatabase.json** (stored separately, referenced by recipeId)

```json
{
    "// notes": "Master database of recipes. Unit: Recipe/Dish (e.g., 番茄鸡蛋), NOT individual ingredients.",
    "recipeId": "recipe_001",
    "name": "番茄鸡蛋",
    "cuisine": "chinese",
    "tags": ["vegetarian", "quick meal", "breakfast", "lunch"],
    "ingredients": [
        {
            "// notes": "All food items here are labeled as 'ingredient'",
            "name": "eggs",
            "quantity": 2,
            "unit": "count",
            "quantityPerServing": 1,
            "unitPerServing": "count"
        },
        {
            "name": "tomato",
            "quantity": 100,
            "unit": "g",
            "quantityPerServing": 50,
            "unitPerServing": "g"
        },
        {
            "name": "oil",
            "quantity": 15,
            "unit": "ml",
            "quantityPerServing": 7.5,
            "unitPerServing": "ml"
        }
    ],
    "recipeDetails": "1. Beat eggs... 2. Stir fry tomato... 3. Mix together...",
    "estimatedTime": 15,
    "// estimatedTime_unit": "minutes, includes prep and cook time",
    "defaultServings": 2,
    "difficulty": "easy",
    "totalCalories": 180,
    "// totalCalories_notes": "Total calories for default servings (e.g., 2 people). Calculated as: nutritionPer100g.calories × total weight / 100",
    "nutritionPer100g": {
        "calories": 90,
        "protein": "8g",
        "fat": "12g",
        "carbs": "8g"
    },
    "notes": ""
}
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY 1: Preferences & Initial Meal Plan                      │
└─────────────────────────────────────────────────────────────────┘

  User Input (steps 1.1-1.4)
    ↓
  userMoodInput + foodChoiceInput + basicPreferences + extendedPreferences
    ↓
  [AI Step 1: Parse] → preferenceProfile.json
    ↓
  [AI Step 2: Generate] → mealPlan.json
    ↓
  UI: Display weekly meal plan with calorie info per recipe

┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY 2: Shopping List (AI-Powered)                            │
└─────────────────────────────────────────────────────────────────┘

  mealPlan.json
    ↓
  [AI: Extract & categorize all ingredients with fixed categories]
    ↓
  shoppingList.json (pre-categorized: proteins, vegetables, etc.)
    ↓
  UI: Display categorized shopping list with checkboxes
    ↓
  User can: check off, add items, remove items, adjust quantities
    ↓
  shoppingList remains independent from mealPlan

┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY 2.5: User Adds Custom Recipe (AI-Parsed)                │
└─────────────────────────────────────────────────────────────────┘

  User inputs: recipe name + cooking steps (free text)
    ↓
  [AI: Parse ingredients & quantities from recipe text]
    ↓
  ingredientParsingResult.json (with parsed ingredients + calories)
    ↓
  User adds recipe to specific meal slot or as available option
    ↓
  [Cascade updates] → mealPlan.json (optional) + shoppingList.json
    ├→ If added to meal plan: ingredients aggregated into shopping list
    └→ Existing ingredient quantities summed, new items added

┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY 3: Daily Meal Timeline with Chat & Recipe Interactions  │
└─────────────────────────────────────────────────────────────────┘

  mealPlan.json + current time
    ↓
  [Extract today's meals, calculate status based on time]
    ↓
  dailyMealPlan.json
    ↓
  UI: Display timeline with current/upcoming/past meals + calorie info
    ↓
  Real-time updates: as time progresses, status shifts
    ↓
  User can perform three types of interactions:
    ├→ [Option 1] Chat-based refinement: Entire meal plan regeneration
    │   ├→ User provides natural language feedback
    │   ├→ [AI: Regenerate whole week respecting feedback]
    │   └→ Replace mealPlan.json + recalculate shoppingList.json
    │
    ├→ [Option 2a] Regenerate single recipe: Alternative for one meal
    │   ├→ [AI: Generate replacement respecting meal context]
    │   └→ Update mealPlan + recalculate shoppingList
    │
    ├→ [Option 2b] Delete recipe: Remove meal slot
    │   └→ Update mealPlan + remove ingredients from shoppingList
    │
    ├→ [Option 2c] Move recipe to another date
    │   └→ Update mealPlan (recipe moved between days)
    │
    └→ [Option 3] Timeline-based edits: Add/edit/remove directly
        └→ [Cascade] → mealPlan + shoppingList updated

┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY 4: Full Plan Regeneration (Chat-Based, via Step 3.3)   │
└─────────────────────────────────────────────────────────────────┘

  User clicks "Refine Plan" dialog (handled in JOURNEY 3, Option 1)
    ↓
  currentMealPlan + preferenceProfile + userFeedback
    ↓
  [AI: Regenerate entire weekly meal plan with updated preferences]
    ↓
  new mealPlan.json (replaces previous)
    ↓
  [Cascade updates]
    ├→ shoppingList.json (recalculated with AI categorization)
    └→ dailyMealPlan.json (refreshed)
    ↓
  UI: All views updated with new data
```

---

## Key Data Relationships

| From | To | Operation | Trigger |
|------|-----|-----------|---------|
| userPreferenceInput, basicPreferences, extendedPreferences | preferenceParsingRequest | Combine & merge | User clicks "Generate Plan" |
| preferenceProfile | mealPlanGenerationRequest | Reference | AI parsing complete |
| mealPlan | shoppingListGenerationRequest | Extract ingredients | User views shopping list |
| mealPlan | dailyMealPlan | Extract today + calculate status | User views daily/today |
| userCustomRecipeInput (free text) | ingredientParsingRequest | Parse recipe | User submits custom recipe |
| ingredientParsingResult | mealPlan + shoppingList | Add/aggregate | User adds custom recipe |
| userFeedback + mealPlan + preferenceProfile | chatRefinementRequest | Chat-based regeneration | User clicks "Refine Plan" (Journey 3, Option 1) |
| currentRecipe + mealContext + preferenceProfile | singleRecipeRegenerationRequest | Replace one recipe | User clicks "Regenerate This Recipe" (Journey 3, Option 2a) |
| mealPlan (recipe removed) | shoppingList | Remove ingredients | User deletes recipe (Journey 3, Option 2b) |
| mealPlan (recipe moved) | mealPlan | Move between days | User selects "Move to Another Date" (Journey 3, Option 2c) |
| dailyMealPlan (user edit) | mealPlan | Update corresponding day | User edits timeline (Journey 3, Option 3) |
| mealPlan (any update) | shoppingList | Recalculate with AI | mealPlan changed |

---

## Data Lifecycle

### Persistent Data (Stored Long-term)
- `preferenceProfile.json` - User's preference profile (updated on regeneration)
- `mealPlan.json` - Current weekly meal plan (replaced on regeneration or updated on single recipe change)
- `shoppingList.json` - Current shopping list (updated when mealPlan changes or user modifies)
- `recipeDatabase.json` - Master recipe library (system-maintained)

### Temporary Data (Intermediate, Not Stored)
- `userPreferenceInput.json` - User input during preference collection
- `basicPreferences.json` - Basic preference form data
- `extendedPreferences.json` - Extended preference form data
- `preferenceParsingRequest.json` - Request to AI for preference parsing
- `mealPlanGenerationRequest.json` - Request to AI for meal plan generation
- `shoppingListGenerationRequest.json` - Request to AI for shopping list generation
- `userCustomRecipeInput.json` - User's free-text recipe
- `ingredientParsingRequest.json` - Request to AI for ingredient extraction
- `chatRefinementRequest.json` - Chat feedback for plan refinement
- `singleRecipeRegenerationRequest.json` - Request to regenerate single recipe

### Real-Time Data (Updated Frequently)
- `dailyMealPlan.json` - Updates status every minute based on current time
- `shoppingList.json` - Updates when user checks off items or when mealPlan changes
- `shoppingList.userAddedItems` - User-managed items, updated as user adds/removes

### User-Managed Data (Independent)
- `shoppingList.userAddedItems` - Items user manually adds (not cascaded to mealPlan)
- `shoppingList.isPurchased` - Checked off by user during shopping
- `ingredientParsingResult` - Temporarily stored until user confirms adding recipe

---

## General Notes & Conventions

- **All JSON structures** include `// notes`, `// options`, `// unit`, `// logic` documentation
- **Quantity units** support multiple formats: g, count, ml, bottle, spoon, etc.
- **'others' field** in extendedPreferences is critical for capturing user preferences not in predefined fields
- **Calorie tracking**: Every recipe now includes `totalCalories` for the default serving size
- **Shopping list AI-generated**: Fixed category set ensures consistent organization across regenerations
- **Single recipe actions** (regenerate/delete/move) cascade to both mealPlan and shoppingList
- **User-added ingredients** in shopping list are independent - they don't affect mealPlan
- **Daily timeline respects real-time** - status changes as time progresses
- **Chat-based refinement** allows natural language feedback for intelligent meal plan regeneration
- **Custom recipes** are parsed by AI to extract ingredients, enabling seamless integration

