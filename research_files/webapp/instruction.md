# HANDBOOK FOR WEBAPP

This document provides step-by-step instructions for deploying the web application.

## PAGES AND VIEWS

1. **Home Page**
    - Main view : next or current meal paln, if not exist, show empty view to add meal plan. Two buttons at the top right corner: one for viewing the full week meal plan, another for adding a new meal plan.
        - To view full week meal plan, click the left buttion to clipse daily details and change to meal plan overview page.
        - To add new meal plan, click the right button to navigate to add new meal plan pages.
    - bottum bar : `today_view`, `shopping_view`, `my_view`, click to navigate.shidesh

2. **Shopping Page**
    - Main view : show shopping list for current week meal plan, can check/uncheck items, change/add/remove items.
    - bottum bar : `today_view`, `shopping_view`, `my_view`, click to navigate.

3. **My Page**
    - Main view : show user profile, settings at top. Below show user's preferences, saved recipes, and other personal data(maybe calorie count history).
    - preferences : show user updated preferences for meal plans, can edit. Update eveytime when user create a new meal plan and use existing preferences as default values. Details:
        - keywords, must have items, disliked items, people, budget, difficulty.
    - saved recipes : show user saved/favorited recipes, can view details or remove from favorites or add new recipes.
    - bottum bar : `today_view`, `shopping_view`, `my_view`, click to navigate.

4. **Week Meal Plan Page**
    - Main view : show the whole meal plan in a scrollable view, each day can be expanded to see details, can add/edit meals for each day. can add new meal plan from top button.
    - top bar : back button to return to home page.

5. **Add New Meal Plan Pages**
    - Main view : a step-by-step pages to create a new meal plan, including selecting recipes, setting portion sizes, and scheduling meals.
    **Eveything is saved locally in real time.User can go back to main home page or kill the app at any time without breaking the process. When user came back to add meal plan page, continue from last step.**
    - Details :
        - Step 1 : show welcome world: "Let's plan meals for next week!"(an flash circle image with different foods on the top) and flash into next step after 1 second.
        **Step 2, Step 3 and Step 4 share samilar layout design**:
        - Step 2 : show welcome world: "Choose some keywords for your meal plan"(background image with different foods) and show some keyword options (with colorful tags) below, user can select multiple keywords, and add custom keywords with an input box and add button at the bottom, then click next button to go to next step.
            - default keywords: Quick, Easy, Healthy, Vegetarian, Dairy-Free, Low-Carb, High-Protein, Kid-Friendly, Chinese, Italian, Mexican, Budget-friendly...
        - Step 3 : show welcome world: "Select something you must have"(background image with different foods) and show a list of recipe and ingredients with colorful tags and according icons, user can select multiple items and add custom keywords with an input box and add button at the bottom,, then click next button to go to next step.
            - default options: Eggs, Bread, Milk, Cheese, Chicken, Fish, Rice, Pasta, Beans, Nuts, and some popular recipe in different countries. Each option has an according icon.
        - Step 4 : show welcome world: "Select the things you don't like"(background image with icons of default items) and show some ingredients options with colorful tags, user can select multiple options and add custom , then click next button to go to next step.
            - default options: peanut, cucumber, garlic, seafood, spicy, ginger, corianer and some common disliked ingredients or allergens. Each option has an according icon.
        - Step 5 : show welcome world: "The meal plan is for n people with $X budget and middle difficulty to cook"(background image with different foods) and show subtract and add button around the number of people, and budget and be scrolled to set the total budget, then click next button to go to next step.

        - Step 6 : show welcome world: "Choose meals needed to be planned" with a sheet view below, user can select breakfast, lunch, and dinner for each day of the week. Each row represents a day, and each column represents a meal (breakfast, lunch, dinner). If user click a meal cell, change the color from unselected to selected, and vice versa. After selection, click generate button to begin generating the meal plan.

        **generate structured user preferences data according to user inputs in previous steps. Send to GEMINI to generate meal plan, use the logic in API/prompt_simple.py**

        - Step 7 : show loading view with text "Generating your meal plan..." and a loading spinner. The loading spinner is an animated chef cooking different foods.
            - After receiving the generated meal plan from GEMINI, navigate to the Meal Plan Overview Page to display the generated meal plan.
            - User can click button at the bottom to go back to home page without breaking the process and contining generating meal plan in background. After meal plan is generated, display in the home page directly.
            - If doesn't receive expencted data structure from GEMINI or an error occurs, show a message in the loading view: "It takes longer than usual. We are working on it. You can go back to home page and check later." with a button to go back to home page.

        - Step 8 : Meal Plan Overview Page
            - Main view : show the generated meal plan in a scrollable view. For user chosen meals, display in daily cards, each day contains breakfast, lunch, and dinner rows. If user did not choose a meal, show "Not Planned". Meal plan shows in the rows with recipe name , portion size, and estimated calories. User can click each meal to see and operate detailed recipe view in a floating window.
            - Bottom bar : at the bottom, show floating action buttion with "chat to modify" to open an input box to send modification requests to GEMINI and update meal plan accordingly, and "Generate Shopping List" button to generate shopping list based on the meal plan and navigate to shopping page.
            **if user shoose to modify meal plan, use the similar logic in API/prompt_simple.py to generate modification prompt and send to GEMINI. Then goback to step 7 loading view.**

        - Step 9 : Detailed Recipe View (Floating Window)
            - Main view : when user clicks on a meal in the meal plan overview page, show a floating window with detailed recipe information, including nutritional info, ingredients, instructions, and special notes(if empty, show empty). User can edit/favorite/delete the recipe using buttons at the top right corner. Every elements are editable, user can click to modify.
            - Close button : at the top left corner, a close button to exit the floating window and return to the meal plan overview page.

        - Step 10 : showing loading view with text "Generating your shopping list..." and a loading spinner. The loading spinner is an animated different foods being added to a shopping cart.
            - After receiving the generated shopping list from GEMINI, navigate to the Shopping Page to display the generated shopping list.
            **use the logic in API/prompt_simple.py to generate shopping list prompt and send to GEMINI. Then goback to step 10 loading view.**

        - Step 11 : Go to main **Shopping Page**
            - Main view : show the generated shopping list in a scrollable view. Each item shows in different categories and user can expand/collapse each category. Each item displays name, quantity, and a checkbox to mark as purchased. User can edit/add/remove items.
            - user can edit the shopping list items directly by clicking on them to modify name and quantity.
            - an "Add Item" button at the top right to add new items to the shopping list. Pop up an input box to enter item name, other details are optional.
            - categories(show in this order):"proteins", "vegetables", "fruits", "grains", "dairy", "oils_condiments", "spices_seasonings", "pantry_staples", "others"
                - "oils_condiments" and  "spices_seasonings" showing without quantity.
