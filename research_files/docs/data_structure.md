# Data Structures

## Preferences

MVP version:

- app launch.  
- "what do you want to eat this week!"  
- An input box followed by suggested prompt tags. "I want to ..."

```json
{
    # userPrompt.json
    suggerstedPrompts: ["healthy", "quick meals", "budget friendly", "variety", "chinese food", "italian food"],
    userPrompt: "I want to eat healthy meals with chicken and broccoli, but also include some pasta and salad options."
    userChoosedPrompts: ["healthy", "chinese food"]
}
```

- "Any special foods to include?"
- input box with suggestions (chicken, broccoli, etc)

```json

# foodchoices.json

{
    "suggestedFoods": ["hongshaoqiezi", "yuxiangrousi", , "tofusoup"],
    "preferFoods": ["chicken", "broccoli"],
    "aiChooseFoods": ["pasta", "salad"],
}

# food data base.json

{ "name": "chicken", Recipe:{
        ingredientsList: ["ingredients": 30g, "..."], #per person, per meal
        recipeDetails: "step by step cooking instructions with estimated time, including prep time",
        estimatedTime: 30, # in minutes
    }, "tags": ["meat", "protein", "dinner", "quick meal", "Chinese food] }

```

- "Choose some info to let magic happen!"

```json

# beginPreferences.json

{
    numberOfPeople: 2, 
    cookDifficulty: "easy", # easy, medium, hard
}

# other preferences.json

{
    dietaryRestrictions: ["vegetarian", "peanuts", "gluten", "mushrooms", "pickles"], # vegetarian, vegan, keto, paleo, gluten-free
    budget: 70, # weekly budget in dollars per person
    lifestyle: ["healthy", "quickMeals", "budgetFriendly"], # healthy, quickMeals, budgetFriendly
    preferredCuisines: ["italian", "mexican", "chinese"], # italian, mexican, chinese, indian, mediterranean, american
    others: "something not listed"
    cookTimePerMeal: 30 # in minutes
    cookSchedule: {
        "monday": ["breakfast", "lunch", "dinner"],
        "tuesday": ["breakfast", "lunch", "dinner"],
        "wednesday": ["breakfast", "lunch", "dinner"],
        "thursday": ["breakfast", "lunch", "dinner"],
        "friday": ["breakfast", "lunch", "dinner"],
        "saturday": ["breakfast", "lunch", "dinner"],
        "sunday": ["breakfast", "lunch", "dinner"],
    }
}


```

## Meal Plan Generation

- generate personalized prompt for user
- send to AI to generate meal plan

```json

# promptForAI.json

{
    personalizedPrompt: "based on" {userPrompt} + {userChoosedPrompts} + {prefreFoods} + {beginPreferences} + {otherPreferences} "to generate a fully user perferences, including: {
        preferFoods(leave blank if none),
        dietaryRestrictions(leave blank if none),
        lifestyle(leave blank if none),
        preferredCuisines(leave blank if none),
        numberOfPeople,
        budget(keep origninal if none),
        cookDifficulty(keep origninal if none),
        cookTimePerMeal(keep origninal if none),
        cookSchedule(keep origninal if none)
    } "if some preferences are not inluded in the data structure, keep that message in others."

    Recipe:{
        ingredientsList: ["ingredients": 30g, "..."], #per person, per meal
        recipeDetails: "step by step cooking instructions with estimated time, including prep time",
        estimatedTime: 30, # in minutes
        }

    mealPlanRequest: "generate a meal plan for the week based on the above preferences. Ensure variety and balance throughout the week while adhering to the specified dietary restrictions and budget. Return in json format with day, mealType(breakfast/lunch/dinner), recipe(Recipe includes ingredientsList(ingredients+weight), recipeDetails(step by step cooking instructions with estimated time, including prep time), estimatedTime). "
}
```

- beautiful waiting screen while AI is generating meal plan
- receive meal plan from AI and display to user

```json
# mealPlan.json

{
    "monday": {
        "breakfast": {
            Recipe:{
                ingredientsList: ["eggs": 2, "spinach": 50g, "tomato": 30g],
                recipeDetails: "1. Beat the eggs... 2. Cook spinach... ",
                estimatedTime: 15,
            }
        },
        "lunch": {
            Recipe:{
                ingredientsList: ["chicken": 150g, "broccoli": 100g, "rice": 200g],
                recipeDetails: "1. Marinate chicken... 2. Steam broccoli... ",
                estimatedTime: 30,
            }
        },
        "dinner": {
            Recipe1:{
                ingredientsList: ["pasta": 200g, "tomato sauce": 100g, "parmesan": 20g],
                recipeDetails: "1. Boil pasta... 2. Prepare sauce... ",
                estimatedTime: 25,
            }
            Recipe2:{
                ingredientsList: ["pasta": 200g, "tomato sauce": 100g, "parmesan": 20g],
                recipeDetails: "1. Boil pasta... 2. Prepare sauce... ",
                estimatedTime: 25,
            }

        }
    },
    ...
}
```

## Meal Plan Adjustment

- meal plan show in list view (calendar view in future)
- user can click to see recipe details, swap meals, remove meals, add meals manually, use same data structure as mealPlan.json

- also user can add prompt to regenerate meal plan

```json
#regeneratePrompt.json

{
    additionalPrompt: "I want more vegetarian options and less pasta dishes."
    additionalPersonalizedPrompt: "based on" {additionalPrompt} "to adjust" {fully user preferences} ", if some preferences are not inluded in the data structure, keep that message in "

    regenerateRequest: "based on the previous meal plan and the" {additionalPersonalizedPrompt}", regenerate the meal plan. Ensure variety and balance throughout the week while adhering to the specified dietary restrictions and budget. Return in json format with day, mealType(breakfast/lunch/dinner), recipe(Recipe includes ingredientsList(ingredients+weight), recipeDetails(step by step cooking instructions with estimated time, including prep time), estimatedTime). "
}
```

- user may regenerate meal plan a couple of times until satisfied.

## shopping list generation

- based on final meal plan, generate shopping list

- not sure if AI is needed here, maybe just a simple calculation based on meal plan data structure and ignore some ingredients that user may already have

```json
# shoppingList.json
{
    "type": ["produce", "dairy", "meat", "pantry staples", "..."],
    "nemae": ["ingredient1", "ingredient2", "..."],
    "quantity": {"g":int,"count":int, "bottle":int, ...}, # quantity needed for each ingredient
}
```

- show shopping list to user in to-do list format
- allow user to adjust serving sizes and update shopping list accordingly
- data is independent with meal plan, user can add or remove items manually
- allow user to check off items as they are purchased

## Daily User Interface Data Structure

- use timline structure to show daily meal plan, user can scroll to see past and future days
- each day show breakfast, lunch, dinner with recipe name and brief info
- timeline goes with current time to show what to eat now or later, including prep time, cook time, etc.
- meal plan can be added or removed or edited here

```json
# dailyMealPlan.json

{
    "date": "2024-06-01 Monday Sunny",
    "luckyWord": "Carpe Diem",
    "meals": {
        "breakfast": {
            "time": "08:00",
            "Recipe":{
                "ingredientsList": {"eggs": 2, "spinach": 50, "tomato": 30},
                "recipeDetails": "1. Beat the eggs... 2. Cook spinach... ",
                "estimatedTime": 15,
            }
        },
        "lunch": {
            "time": "12:30",
            "Recipe":{
                "ingredientsList": {"chicken": 150, "broccoli": 100, "rice": 200},
                "recipeDetails": "1. Marinate chicken... 2. Steam broccoli... ",
                "estimatedTime": 30,
            }
        },
        "dinner": {
            "time": "19:00",
            "Recipe":{
                "ingredientsList": {"pasta": 200, "tomato sauce": 100, "parmesan": 20},
                "recipeDetails": "1. Boil pasta... 2. Prepare sauce... ",
                "estimatedTime": 25,
            }
        }
    }
}
```
