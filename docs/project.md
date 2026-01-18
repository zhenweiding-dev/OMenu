# OMenu

## Project Idea

"I'm considering a new app. It comes from my daily life. My wife will discuss what to eat for next week on weekend. and we will make a grocery list based on the discussion. So the following week, I will cook base on the plan. I hope to make an app. It takes into what people want to eat next week or just their willing for health or good food. then give a shopping list and evey day handbook for food(when to do what). I think this will make life easier and ai has many things to do in the whole process."

## Comments from Claude

> Why This Idea Has Potential  

>1. Real Problem, Clear Value: Meal planning → grocery list → daily cooking instructions is a workflow millions of households struggle with. The "wow" comes from AI handling the entire chain seamlessly.
>2. Multimodal Opportunities: Gemini 3's strengths (reasoning, multimodal, low latency) map perfectly:

>- Voice/text input: "We want something healthy, maybe Asian-inspired, and my wife is craving soup".
>- Image input: Snap your fridge/pantry to factor in what you already have
>- Structured output: Shopping list + daily cooking timeline

>3. Personalization Depth: This isn't just recipe search — it's reasoning about:

> - Nutritional balance across the week
> - Ingredient reuse (buy chicken once, use in 3 dishes)
> - Prep optimization (marinate Monday night for Tuesday dinner)
> - Preferences, allergies, budget constraints

## MVP Scope

Input → Weekly meal plan → Shopping list → Daily cooking handbook

## Ideal Core User Paths

### 1. Give Requirements

#### 1.1 Preferences (! easy to start with)

- "What do u want to eat this week!"
  - Special foods to include
  - Suggestions + search bar (! database + AI generated)
    - ! Search for a recipe database
    - ! AI generate or user input based on name
    - ! Recipe data structure needed
  - ! Future function: take pictures from fridge to suggest meals based on available ingredients
- Special needs
  - Diet? Eat healthy? Nutrition goals?
  - Children?
  - Allergies? Dietary restrictions?
  - Cooking difficulty?
  - Preferred styles/cuisines (not so important)
  - Disliked foods to exclude (low priority)

#### 1.2 Date Issues

- Which meal do you need to plan for? (breakfast/lunch/dinner or choose below for each day)
- Which days you need to plan for?
  - Specific days of the week
  - Whole week
- Cook time for each meal

#### 1.3 Basic Info

- Number of people
- Budget
- Time to cook

#### 1.4 Choose Manual or Auto Plan

- Auto plan: generate full plan based on preferences and date issues
- Manual plan or partly manual: choose meals for each day from suggestions

### 2. Generate Meal Plan - AI Powered

- Based on requirements, generate meal plan for specified days and meals
  - Generate preferences list
    - A full list then organize? Or step by step?
    - Must have foods
    - Must restrictions
    - Consider cooking time and budget
    - Consider variety and balance
    - ...
  - Provide recipe details for each meal (maybe need to be separated from meal plan generation to save tokens)
    - Ingredients list and usage amounts
    - Step by step cooking instructions with estimated time, including prep time
    - Nutritional info

### 3. Allow User to Review and Adjust Meal Plan

- Show full meal plan in calendar view
- Allow user to swap meals, remove meals, add meals
- Allow user to view recipe details for each meal

### 4. Generate Shopping List Based on Meal Plan

- Categorized by food types (produce, dairy, meat, pantry staples, etc.)
- Quantities needed for each ingredient
- Option to adjust serving sizes and update shopping list accordingly
- Show as a to-do list format for easy shopping

## Daily User Interface

Four main sections: Today + Plan + Shopping List + Personal Page

### Shopping List

- Can be checked off as items are purchased
- Can be reviewed all the time
- Items can be added or removed manually, without affecting meal plan

### Meal Plan for the Day

- List view of meals for the day
- Default view shows detailed timeline for what to do now, or later, including prep time, cook time, etc.
  - Example:
    - 10:00am - prep ingredients for lunch (15 min)
    - 10:15am - cook lunch (30 min)
    - 10:45am - lunch is ready!
- Past items become greyed out, and the timeline can be scrolled to see upcoming tasks or past tasks, with vibration
- Default muted notifications, but can be turned on for reminders