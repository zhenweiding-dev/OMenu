# Devpost Demo Video Script (Gemini 3 Hackathon)

Length target: 2:30-3:00

1. **0:00-0:10 - Hook / Title**
   On screen: App logo + "OMenu - Weekly Menu + Shopping List, powered by Gemini 3".
   Voiceover: "This is OMenu, a Gemini 3 powered assistant that plans a full week of meals and generates a clean, editable shopping list."

2. **0:10-0:35 - Preferences & Constraints**
   On screen: Create flow, add preferred ingredients and dislikes, set people/budget/difficulty.
   Voiceover: "Users enter preferences, dislikes, budget, difficulty, and number of people. These constraints become the inputs to Gemini 3."

3. **0:35-0:55 - Schedule Selection**
   On screen: Select cooking days and meal slots.
   Voiceover: "Next, choose when to cook. The schedule is passed to Gemini 3 so only selected meals are generated."

4. **0:55-1:15 - Gemini 3 Generation**
   On screen: Loading state.
   Voiceover: "We run a multi-step Gemini 3 pipeline: first a meal outline with a draft list of unique ingredients, then a structured JSON menu constrained to that list, and finally a consolidated shopping list."

5. **1:15-1:40 - Review & Modify**
   On screen: Weekly menu view, open a recipe detail, then "Modify Menu" modal and send to AI.
   Voiceover: "The user reviews the menu, opens recipes, and can ask Gemini 3 to modify specific meals. We apply minimal diffs and keep the structured format intact."

6. **1:40-2:05 - Generate Shopping List**
   On screen: Tap "Generate Shopping List" and show shopping list page with categories.
   Voiceover: "With one click, Gemini 3 produces a categorized shopping list with normalized units, ready for weekly grocery trips."

7. **2:05-2:30 - Edit & Use**
   On screen: Check off items, add a manual item, edit a quantity.
   Voiceover: "The list is fully editable - check items, add your own, or adjust quantities. Manual edits stay user-controlled."

8. **2:30-2:55 - Recap / Close**
   On screen: Return to menu + list overview.
   Voiceover: "OMenu turns preferences into a complete week of meals and shopping in minutes, with Gemini 3 doing the heavy lifting. Thanks for watching."

Optional on-screen callouts: "Gemini 3 API", "Structured JSON output", "Server-side validation".
