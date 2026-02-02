# Test Report: 健康减脂用户

**Model**: `gemini-2.0-flash`
**Timestamp**: 2026-02-01T16:24:27.552250
**Duration**: 13.68s
**Status**: ✅ PASSED

## Summary

- Expected recipes: 12
- Generated recipes: 12
- Validation issues: 0

## User Preferences

```json
{
  "keywords": [
    "健康",
    "低卡",
    "高蛋白",
    "减脂"
  ],
  "mustHaveItems": [
    "鸡胸肉",
    "西兰花",
    "鸡蛋"
  ],
  "dislikedItems": [
    "油炸食品",
    "甜食"
  ],
  "numPeople": 1,
  "budget": 80,
  "difficulty": "easy",
  "cookSchedule": {
    "monday": {
      "breakfast": true,
      "lunch": true,
      "dinner": true
    },
    "tuesday": {
      "breakfast": true,
      "lunch": true,
      "dinner": true
    },
    "wednesday": {
      "breakfast": false,
      "lunch": true,
      "dinner": true
    },
    "thursday": {
      "breakfast": false,
      "lunch": true,
      "dinner": true
    },
    "friday": {
      "breakfast": false,
      "lunch": true,
      "dinner": true
    },
    "saturday": {
      "breakfast": false,
      "lunch": false,
      "dinner": false
    },
    "sunday": {
      "breakfast": false,
      "lunch": false,
      "dinner": false
    }
  }
}
```

## Prompt Sent to Gemini

```
Task: Generate a personalized meal plan in structured JSON format.

Schedule: monday:[breakfast,lunch,dinner] tuesday:[breakfast,lunch,dinner] wednesday:[lunch,dinner] thursday:[lunch,dinner] friday:[lunch,dinner]
Unscheduled meals should be null.

User Preferences: {"keywords":["\u5065\u5eb7","\u4f4e\u5361","\u9ad8\u86cb\u767d","\u51cf\u8102"],"mustHaveItems":["\u9e21\u80f8\u8089","\u897f\u5170\u82b1","\u9e21\u86cb"],"dislikedItems":["\u6cb9\u70b8\u98df\u54c1","\u751c\u98df"],"numPeople":1,"budget":80,"difficulty":"easy","cookSchedule":{"monday":["breakfast","lunch","dinner"],"tuesday":["breakfast","lunch","dinner"],"wednesday":["lunch","dinner"],"thursday":["lunch","dinner"],"friday":["lunch","dinner"],"saturday":[],"sunday":[]}}

Output Schema:
{"monday":{"breakfast":recipe|null,"lunch":recipe|null,"dinner":recipe|null},"tuesday":...,...,"sunday":...}

Recipe Schema:
{"id":"day-meal-001","name":"Recipe Name","ingredients":[{"name":"x","quantity":1,"unit":"g","category":"proteins"}],"instructions":"1. Step... 2. Step...","estimatedTime":30,"servings":2,"difficulty":"medium","totalCalories":300}

Requirements:
1. All 7 days must be present (monday through sunday)
2. Each day has breakfast, lunch, dinner (null if not scheduled)
3. Recipe ID format: {day}-{meal}-{number} (e.g., "mon-breakfast-001")
4. Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others
5. For seasonings: quantity can be 0, unit can be empty

RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

## Raw Response from Gemini

```json
```json
{"monday":{"breakfast":{"id":"mon-breakfast-001","name":"High-Protein Scrambled Eggs with Chicken Breast and Broccoli","ingredients":[{"name":"Chicken Breast","quantity":100,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":100,"unit":"g","category":"vegetables"},{"name":"Eggs","quantity":3,"unit":"","category":"proteins"},{"name":"Salt","quantity":1,"unit":"g","category":"seasonings"},{"name":"Pepper","quantity":1,"unit":"g","category":"seasonings"}],"instructions":"1. Dice chicken breast and broccoli into small pieces. 2. Scramble eggs in a bowl with salt and pepper. 3. Sauté chicken breast and broccoli in a pan until cooked. 4. Pour scrambled eggs into the pan and cook until set.","estimatedTime":15,"servings":1,"difficulty":"easy","totalCalories":350},"lunch":{"id":"mon-lunch-001","name":"Grilled Chicken Salad with Broccoli","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":150,"unit":"g","category":"vegetables"},{"name":"Lettuce","quantity":50,"unit":"g","category":"vegetables"},{"name":"Olive Oil","quantity":1,"unit":"tbsp","category":"pantry_staples"},{"name":"Lemon Juice","quantity":1,"unit":"tbsp","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Grill chicken breast until cooked through. 2. Chop broccoli and lettuce. 3. Slice grilled chicken breast. 4. Combine chicken, broccoli, and lettuce in a bowl. 5. Drizzle with olive oil and lemon juice. Season with salt and pepper.","estimatedTime":20,"servings":1,"difficulty":"easy","totalCalories":400},"dinner":{"id":"mon-dinner-001","name":"Baked Chicken with Broccoli and Quinoa","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":200,"unit":"g","category":"vegetables"},{"name":"Quinoa","quantity":50,"unit":"g","category":"grains"},{"name":"Olive Oil","quantity":1,"unit":"tbsp","category":"pantry_staples"},{"name":"Garlic Powder","quantity":0,"unit":"","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Preheat oven to 375°F (190°C). 2. Cook quinoa according to package directions. 3. Toss broccoli with olive oil, garlic powder, salt, and pepper. 4. Bake chicken breast and broccoli for 20-25 minutes, or until chicken is cooked through. 5. Serve chicken and broccoli with quinoa.","estimatedTime":40,"servings":1,"difficulty":"easy","totalCalories":450}},"tuesday":{"breakfast":{"id":"tue-breakfast-001","name":"Omelet with Chicken and Broccoli","ingredients":[{"name":"Eggs","quantity":3,"unit":"","category":"proteins"},{"name":"Chicken Breast (cooked)","quantity":50,"unit":"g","category":"proteins"},{"name":"Broccoli (cooked)","quantity":50,"unit":"g","category":"vegetables"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Whisk eggs with salt and pepper. 2. Dice cooked chicken breast and broccoli. 3. Pour egg mixture into a non-stick pan. 4. Add chicken and broccoli to one side of the omelet. 5. Fold the omelet in half and cook until set.","estimatedTime":15,"servings":1,"difficulty":"easy","totalCalories":300},"lunch":{"id":"tue-lunch-001","name":"Chicken and Broccoli Stir-fry","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":200,"unit":"g","category":"vegetables"},{"name":"Soy Sauce (low sodium)","quantity":1,"unit":"tbsp","category":"pantry_staples"},{"name":"Ginger (minced)","quantity":1,"unit":"tsp","category":"seasonings"},{"name":"Garlic (minced)","quantity":1,"unit":"clove","category":"seasonings"},{"name":"Olive Oil","quantity":1,"unit":"tsp","category":"pantry_staples"}],"instructions":"1. Cut chicken breast into small pieces. 2. Stir-fry chicken in olive oil until cooked through. 3. Add broccoli, soy sauce, ginger, and garlic. 4. Cook until broccoli is tender-crisp.","estimatedTime":20,"servings":1,"difficulty":"easy","totalCalories":380},"dinner":{"id":"tue-dinner-001","name":"Chicken and Broccoli Soup","ingredients":[{"name":"Chicken Breast","quantity":100,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":150,"unit":"g","category":"vegetables"},{"name":"Chicken Broth (low sodium)","quantity":500,"unit":"ml","category":"pantry_staples"},{"name":"Onion (diced)","quantity":50,"unit":"g","category":"vegetables"},{"name":"Carrot (diced)","quantity":50,"unit":"g","category":"vegetables"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Dice chicken breast, onion, and carrot. 2. Sauté onion and carrot in a pot until softened. 3. Add chicken broth and bring to a boil. 4. Add chicken breast and broccoli. 5. Simmer until chicken is cooked through and broccoli is tender. Season with salt and pepper.","estimatedTime":30,"servings":1,"difficulty":"easy","totalCalories":320}},"wednesday":{"breakfast":null,"lunch":{"id":"wed-lunch-001","name":"Chicken Broccoli Salad Wrap","ingredients":[{"name":"Chicken Breast (cooked)","quantity":100,"unit":"g","category":"proteins"},{"name":"Broccoli (cooked)","quantity":100,"unit":"g","category":"vegetables"},{"name":"Plain Greek Yogurt","quantity":2,"unit":"tbsp","category":"dairy"},{"name":"Whole Wheat Tortilla","quantity":1,"unit":"","category":"grains"},{"name":"Lemon Juice","quantity":1,"unit":"tsp","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Dice cooked chicken and broccoli. 2. Mix chicken, broccoli, Greek yogurt, lemon juice, salt, and pepper in a bowl. 3. Spread the mixture onto a whole wheat tortilla. 4. Wrap and enjoy.","estimatedTime":10,"servings":1,"difficulty":"easy","totalCalories":350},"dinner":{"id":"wed-dinner-001","name":"Broccoli and Chicken Casserole","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli Florets","quantity":200,"unit":"g","category":"vegetables"},{"name":"Plain Greek Yogurt","quantity":100,"unit":"g","category":"dairy"},{"name":"Cheddar Cheese (shredded, low-fat)","quantity":30,"unit":"g","category":"dairy"},{"name":"Garlic Powder","quantity":0,"unit":"","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Preheat oven to 375°F (190°C). 2. Cook chicken breast and broccoli. 3. Dice chicken and mix with broccoli, Greek yogurt, salt, pepper, and garlic powder. 4. Place mixture in a baking dish. 5. Top with cheddar cheese. 6. Bake for 20 minutes, or until cheese is melted and bubbly.","estimatedTime":45,"servings":1,"difficulty":"easy","totalCalories":420}},"thursday":{"breakfast":null,"lunch":{"id":"thu-lunch-001","name":"Leftover Broccoli and Chicken Casserole","ingredients":[{"name":"Broccoli and Chicken Casserole","quantity":1,"unit":"serving","category":"others"}],"instructions":"Reheat and eat.","estimatedTime":5,"servings":1,"difficulty":"easy","totalCalories":420},"dinner":{"id":"thu-dinner-001","name":"Chicken Stir-fry with Broccoli and Brown Rice","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":200,"unit":"g","category":"vegetables"},{"name":"Brown Rice","quantity":50,"unit":"g","category":"grains"},{"name":"Soy Sauce (low sodium)","quantity":1,"unit":"tbsp","category":"pantry_staples"},{"name":"Ginger (minced)","quantity":1,"unit":"tsp","category":"seasonings"},{"name":"Garlic (minced)","quantity":1,"unit":"clove","category":"seasonings"},{"name":"Olive Oil","quantity":1,"unit":"tsp","category":"pantry_staples"}],"instructions":"1. Cook brown rice according to package directions. 2. Cut chicken breast into small pieces. 3. Stir-fry chicken in olive oil until cooked through. 4. Add broccoli, soy sauce, ginger, and garlic. 5. Cook until broccoli is tender-crisp. 6. Serve over brown rice.","estimatedTime":30,"servings":1,"difficulty":"easy","totalCalories":480}},"friday":{"breakfast":null,"lunch":{"id":"fri-lunch-001","name":"Chicken and Broccoli Bowl","ingredients":[{"name":"Chicken Breast (grilled)","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli (steamed)","quantity":150,"unit":"g","category":"vegetables"},{"name":"Quinoa","quantity":50,"unit":"g","category":"grains"},{"name":"Avocado","quantity":50,"unit":"g","category":"fruits"},{"name":"Lemon Juice","quantity":1,"unit":"tbsp","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Cook quinoa according to package directions. 2. Slice grilled chicken breast and steam broccoli. 3. Dice avocado. 4. Combine all ingredients in a bowl. Drizzle with lemon juice and season with salt and pepper.","estimatedTime":20,"servings":1,"difficulty":"easy","totalCalories":450},"dinner":{"id":"fri-dinner-001","name":"Baked Chicken and Broccoli with Lemon","ingredients":[{"name":"Chicken Breast","quantity":150,"unit":"g","category":"proteins"},{"name":"Broccoli","quantity":200,"unit":"g","category":"vegetables"},{"name":"Lemon","quantity":0.5,"unit":"","category":"fruits"},{"name":"Olive Oil","quantity":1,"unit":"tbsp","category":"pantry_staples"},{"name":"Garlic (minced)","quantity":1,"unit":"clove","category":"seasonings"},{"name":"Salt","quantity":0,"unit":"","category":"seasonings"},{"name":"Pepper","quantity":0,"unit":"","category":"seasonings"}],"instructions":"1. Preheat oven to 400°F (200°C). 2. Toss broccoli with olive oil, minced garlic, salt, and pepper. 3. Place chi

... (truncated, total 10371 chars)
```

## Processing Steps

- Step 1: Building prompt...
-   - Scheduled days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
-   - Expected recipes: 12
-   - Prompt length: 1566 chars
- Step 2: Calling gemini-2.0-flash...
-   - Response length: 10371 chars
- Step 3: Cleaning response...
-   - Cleaned length: 10359 chars
- Step 4: Parsing JSON...
-   - JSON parsed successfully
- Step 5: Validating recipes...
-   - Found 12/12 recipes
-   - Validation issues: 0
- Completed in 13.68s

## Validation Results

| Day | Meal | Recipe Name | Status | Issues |
|-----|------|-------------|--------|--------|
| monday | breakfast | High-Protein Scrambled Eggs wi | ✅ | - |
| monday | lunch | Grilled Chicken Salad with Bro | ✅ | - |
| monday | dinner | Baked Chicken with Broccoli an | ✅ | - |
| tuesday | breakfast | Omelet with Chicken and Brocco | ✅ | - |
| tuesday | lunch | Chicken and Broccoli Stir-fry | ✅ | - |
| tuesday | dinner | Chicken and Broccoli Soup | ✅ | - |
| wednesday | lunch | Chicken Broccoli Salad Wrap | ✅ | - |
| wednesday | dinner | Broccoli and Chicken Casserole | ✅ | - |
| thursday | lunch | Leftover Broccoli and Chicken  | ✅ | - |
| thursday | dinner | Chicken Stir-fry with Broccoli | ✅ | - |
| friday | lunch | Chicken and Broccoli Bowl | ✅ | - |
| friday | dinner | Baked Chicken and Broccoli wit | ✅ | - |

## Final Parsed Data

```json
{
  "monday": {
    "breakfast": {
      "id": "mon-breakfast-001",
      "name": "High-Protein Scrambled Eggs with Chicken Breast and Broccoli",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 100,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 100,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Eggs",
          "quantity": 3,
          "unit": "",
          "category": "proteins"
        },
        {
          "name": "Salt",
          "quantity": 1,
          "unit": "g",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 1,
          "unit": "g",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Dice chicken breast and broccoli into small pieces. 2. Scramble eggs in a bowl with salt and pepper. 3. Sauté chicken breast and broccoli in a pan until cooked. 4. Pour scrambled eggs into the pan and cook until set.",
      "estimatedTime": 15,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 350
    },
    "lunch": {
      "id": "mon-lunch-001",
      "name": "Grilled Chicken Salad with Broccoli",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 150,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Lettuce",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Olive Oil",
          "quantity": 1,
          "unit": "tbsp",
          "category": "pantry_staples"
        },
        {
          "name": "Lemon Juice",
          "quantity": 1,
          "unit": "tbsp",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Grill chicken breast until cooked through. 2. Chop broccoli and lettuce. 3. Slice grilled chicken breast. 4. Combine chicken, broccoli, and lettuce in a bowl. 5. Drizzle with olive oil and lemon juice. Season with salt and pepper.",
      "estimatedTime": 20,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 400
    },
    "dinner": {
      "id": "mon-dinner-001",
      "name": "Baked Chicken with Broccoli and Quinoa",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 200,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Quinoa",
          "quantity": 50,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Olive Oil",
          "quantity": 1,
          "unit": "tbsp",
          "category": "pantry_staples"
        },
        {
          "name": "Garlic Powder",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Preheat oven to 375°F (190°C). 2. Cook quinoa according to package directions. 3. Toss broccoli with olive oil, garlic powder, salt, and pepper. 4. Bake chicken breast and broccoli for 20-25 minutes, or until chicken is cooked through. 5. Serve chicken and broccoli with quinoa.",
      "estimatedTime": 40,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 450
    }
  },
  "tuesday": {
    "breakfast": {
      "id": "tue-breakfast-001",
      "name": "Omelet with Chicken and Broccoli",
      "ingredients": [
        {
          "name": "Eggs",
          "quantity": 3,
          "unit": "",
          "category": "proteins"
        },
        {
          "name": "Chicken Breast (cooked)",
          "quantity": 50,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli (cooked)",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Whisk eggs with salt and pepper. 2. Dice cooked chicken breast and broccoli. 3. Pour egg mixture into a non-stick pan. 4. Add chicken and broccoli to one side of the omelet. 5. Fold the omelet in half and cook until set.",
      "estimatedTime": 15,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 300
    },
    "lunch": {
      "id": "tue-lunch-001",
      "name": "Chicken and Broccoli Stir-fry",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 200,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Soy Sauce (low sodium)",
          "quantity": 1,
          "unit": "tbsp",
          "category": "pantry_staples"
        },
        {
          "name": "Ginger (minced)",
          "quantity": 1,
          "unit": "tsp",
          "category": "seasonings"
        },
        {
          "name": "Garlic (minced)",
          "quantity": 1,
          "unit": "clove",
          "category": "seasonings"
        },
        {
          "name": "Olive Oil",
          "quantity": 1,
          "unit": "tsp",
          "category": "pantry_staples"
        }
      ],
      "instructions": "1. Cut chicken breast into small pieces. 2. Stir-fry chicken in olive oil until cooked through. 3. Add broccoli, soy sauce, ginger, and garlic. 4. Cook until broccoli is tender-crisp.",
      "estimatedTime": 20,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 380
    },
    "dinner": {
      "id": "tue-dinner-001",
      "name": "Chicken and Broccoli Soup",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 100,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 150,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Chicken Broth (low sodium)",
          "quantity": 500,
          "unit": "ml",
          "category": "pantry_staples"
        },
        {
          "name": "Onion (diced)",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Carrot (diced)",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Dice chicken breast, onion, and carrot. 2. Sauté onion and carrot in a pot until softened. 3. Add chicken broth and bring to a boil. 4. Add chicken breast and broccoli. 5. Simmer until chicken is cooked through and broccoli is tender. Season with salt and pepper.",
      "estimatedTime": 30,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 320
    }
  },
  "wednesday": {
    "breakfast": null,
    "lunch": {
      "id": "wed-lunch-001",
      "name": "Chicken Broccoli Salad Wrap",
      "ingredients": [
        {
          "name": "Chicken Breast (cooked)",
          "quantity": 100,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli (cooked)",
          "quantity": 100,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Plain Greek Yogurt",
          "quantity": 2,
          "unit": "tbsp",
          "category": "dairy"
        },
        {
          "name": "Whole Wheat Tortilla",
          "quantity": 1,
          "unit": "",
          "category": "grains"
        },
        {
          "name": "Lemon Juice",
          "quantity": 1,
          "unit": "tsp",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Dice cooked chicken and broccoli. 2. Mix chicken, broccoli, Greek yogurt, lemon juice, salt, and pepper in a bowl. 3. Spread the mixture onto a whole wheat tortilla. 4. Wrap and enjoy.",
      "estimatedTime": 10,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 350
    },
    "dinner": {
      "id": "wed-dinner-001",
      "name": "Broccoli and Chicken Casserole",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli Florets",
          "quantity": 200,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Plain Greek Yogurt",
          "quantity": 100,
          "unit": "g",
          "category": "dairy"
        },
        {
          "name": "Cheddar Cheese (shredded, low-fat)",
          "quantity": 30,
          "unit": "g",
          "category": "dairy"
        },
        {
          "name": "Garlic Powder",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Preheat oven to 375°F (190°C). 2. Cook chicken breast and broccoli. 3. Dice chicken and mix with broccoli, Greek yogurt, salt, pepper, and garlic powder. 4. Place mixture in a baking dish. 5. Top with cheddar cheese. 6. Bake for 20 minutes, or until cheese is melted and bubbly.",
      "estimatedTime": 45,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 420
    }
  },
  "thursday": {
    "breakfast": null,
    "lunch": {
      "id": "thu-lunch-001",
      "name": "Leftover Broccoli and Chicken Casserole",
      "ingredients": [
        {
          "name": "Broccoli and Chicken Casserole",
          "quantity": 1,
          "unit": "serving",
          "category": "others"
        }
      ],
      "instructions": "Reheat and eat.",
      "estimatedTime": 5,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 420
    },
    "dinner": {
      "id": "thu-dinner-001",
      "name": "Chicken Stir-fry with Broccoli and Brown Rice",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 200,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Brown Rice",
          "quantity": 50,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Soy Sauce (low sodium)",
          "quantity": 1,
          "unit": "tbsp",
          "category": "pantry_staples"
        },
        {
          "name": "Ginger (minced)",
          "quantity": 1,
          "unit": "tsp",
          "category": "seasonings"
        },
        {
          "name": "Garlic (minced)",
          "quantity": 1,
          "unit": "clove",
          "category": "seasonings"
        },
        {
          "name": "Olive Oil",
          "quantity": 1,
          "unit": "tsp",
          "category": "pantry_staples"
        }
      ],
      "instructions": "1. Cook brown rice according to package directions. 2. Cut chicken breast into small pieces. 3. Stir-fry chicken in olive oil until cooked through. 4. Add broccoli, soy sauce, ginger, and garlic. 5. Cook until broccoli is tender-crisp. 6. Serve over brown rice.",
      "estimatedTime": 30,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 480
    }
  },
  "friday": {
    "breakfast": null,
    "lunch": {
      "id": "fri-lunch-001",
      "name": "Chicken and Broccoli Bowl",
      "ingredients": [
        {
          "name": "Chicken Breast (grilled)",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli (steamed)",
          "quantity": 150,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Quinoa",
          "quantity": 50,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Avocado",
          "quantity": 50,
          "unit": "g",
          "category": "fruits"
        },
        {
          "name": "Lemon Juice",
          "quantity": 1,
          "unit": "tbsp",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Cook quinoa according to package directions. 2. Slice grilled chicken breast and steam broccoli. 3. Dice avocado. 4. Combine all ingredients in a bowl. Drizzle with lemon juice and season with salt and pepper.",
      "estimatedTime": 20,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 450
    },
    "dinner": {
      "id": "fri-dinner-001",
      "name": "Baked Chicken and Broccoli with Lemon",
      "ingredients": [
        {
          "name": "Chicken Breast",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Broccoli",
          "quantity": 200,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Lemon",
          "quantity": 0.5,
          "unit": "",
          "category": "fruits"
        },
        {
          "name": "Olive Oil",
          "quantity": 1,
          "unit": "tbsp",
          "category": "pantry_staples"
        },
        {
          "name": "Garlic (minced)",
          "quantity": 1,
          "unit": "clove",
          "category": "seasonings"
        },
        {
          "name": "Salt",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Pepper",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "1. Preheat oven to 400°F (200°C). 2. Toss broccoli with olive oil, minced garlic, salt, and pepper. 3. Place chicken breast and broccoli on a baking sheet. 4. Squeeze lemon juice over chicken and broccoli. 5. Bake for 20-25 minutes, or until chicken is cooked through and broccoli is tender.",
      "estimatedTime": 30,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 400
    }
  },
  "saturday": {
    "breakfast": null,
    "lunch": null,
    "dinner": null
  },
  "sunday": {
    "breakfast": null,
    "lunch": null,
    "dinner": null
  }
}
```
