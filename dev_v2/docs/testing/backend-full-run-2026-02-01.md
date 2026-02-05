# Backend End-to-End Run — 2026-02-01

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

**Timestamp:** 2026-02-02T06:28:27.001573+00:00

### Request Payload

```json
{
    "healthy",
    "quick"
  ],
  "specificPreferences": [
    "chicken",
    "rice"
  ],
  "specificDisliked": [
    "mushrooms"
  ],
  "numPeople": 2,
  "budget": 120,
  "difficulty": "medium",
  "cookSchedule": {
    "monday": {
      "breakfast": false,
      "lunch": false,
      "dinner": true
    },
    "tuesday": {
      "breakfast": false,
      "lunch": true,
      "dinner": false
    },
    "wednesday": {
      "breakfast": false,
      "lunch": true,
      "dinner": true
    },
    "thursday": {
      "breakfast": false,
      "lunch": false,
      "dinner": false
    },
    "friday": {
      "breakfast": false,
      "lunch": false,
      "dinner": true
    },
    "saturday": {
      "breakfast": true,
      "lunch": true,
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

### Step 1 — Natural Language Prompt

**Prompt**

```
Task: Based on the user's preferences, generate a personalized menu book in JSON format; every meal must include recipeName, ingredients, and a brief description. Keep the JSON compact by limiting each meal to at most 5 ingredients and a description under 25 words.
```

**Gemini Response**

```
```json
{
  "menuBook": {
    "monday": {
      "dinner": {
        "recipeName": "Lemon Ginger Chicken Stir-fry",
        "ingredients": ["Chicken breast", "Brown rice", "Broccoli", "Ginger", "Soy sauce"],
        "description": "A quick, healthy stir-fry featuring tender chicken and crisp broccoli served over a bed of brown rice."
      }
    },
    "tuesday": {
      "lunch": {
        "recipeName": "Mediterranean Chicken Rice Salad",
        "ingredients": ["Cooked chicken", "Rice", "Cucumber", "Cherry tomatoes", "Feta cheese"],
        "description": "A refreshing chilled salad mixing chicken and rice with fresh vegetables and a light vinaigrette."
      }
    },
    "wednesday": {
      "lunch": {
        "recipeName": "Healthy Chicken Rice Soup",
        "ingredients": ["Chicken thighs", "Rice", "Carrots", "Celery", "Chicken broth"],
        "description": "A comforting soup packed with protein and vegetables for a nutritious and warming midday meal."
      },
      "dinner": {
        "recipeName": "Garlic Butter Chicken & Rice",
        "ingredients": ["Chicken breast", "Rice", "Garlic", "Spinach", "Butter"],
        "description": "Pan-seared chicken seasoned with garlic and butter, served alongside fluffy rice and wilted spinach."
      }
    },
    "friday": {
      "dinner": {
        "recipeName": "Turmeric Roasted Chicken Rice",
        "ingredients": ["Chicken drumsticks", "Rice", "Turmeric", "Onion", "Peas"],
        "description": "Vibrant turmeric-spiced chicken roasted to perfection and served over a fragrant bed of rice and peas."
      }
    },
    "saturday": {
      "breakfast": {
        "recipeName": "Savory Rice & Egg Bowl",
        "ingredients": ["Rice", "Eggs", "Green onions", "Soy sauce", "Sesame oil"],
        "description": "A quick morning bowl featuring warm rice topped with a soft-boiled egg and savory seasonings."
      },
      "lunch": {
        "recipeName": "Pesto Chicken Rice Wrap",
        "ingredients": ["Chicken", "Rice", "Pesto", "Tortilla", "Bell pepper"],
        "description": "A portable lunch wrap filled with chicken, rice, and zesty pesto for a quick energy boost."
      }
    }
  }
}
```
```

### Step 2 — Structured Plan

**Prompt**

```
Task: Convert the following menu book into a structured JSON format according to the schema. Menu Book: {"menuBook":{"monday":{"dinner":{"recipeName":"Lemon Ginger Chicken Stir-fry","ingredients":["Chicken breast","Brown rice","Broccoli","Ginger","Soy sauce"],"description":"A quick, healthy stir-fry featuring tender chicken and crisp broccoli served over a bed of brown rice."}},"tuesday":{"lunch":{"recipeName":"Mediterranean Chicken Rice Salad","ingredients":["Cooked chicken","Rice","Cucumber","Cherry tomatoes","Feta cheese"],"description":"A refreshing chilled salad mixing chicken and rice with fresh vegetables and a light vinaigrette."}},"wednesday":{"lunch":{"recipeName":"Healthy Chicken Rice Soup","ingredients":["Chicken thighs","Rice","Carrots","Celery","Chicken broth"],"description":"A comforting soup packed with protein and vegetables for a nutritious and warming midday meal."},"dinner":{"recipeName":"Garlic Butter Chicken & Rice","ingredients":["Chicken breast","Rice","Garlic","Spinach","Butter"],"description":"Pan-seared chicken seasoned with garlic and butter, served alongside fluffy rice and wilted spinach."}},"friday":{"dinner":{"recipeName":"Turmeric Roasted Chicken Rice","ingredients":["Chicken drumsticks","Rice","Turmeric","Onion","Peas"],"description":"Vibrant turmeric-spiced chicken roasted to perfection and served over a fragrant bed of rice and peas."}},"saturday":{"breakfast":{"recipeName":"Savory Rice & Egg Bowl","ingredients":["Rice","Eggs","Green onions","Soy sauce","Sesame oil"],"description":"A quick morning bowl featuring warm rice topped with a soft-boiled egg and savory seasonings."},"lunch":{"recipeName":"Pesto Chicken Rice Wrap","ingredients":["Chicken","Rice","Pesto","Tortilla","Bell pepper"],"description":"A portable lunch wrap filled with chicken, rice, and zesty pesto for a quick energy boost."}}}} Output Schema: {"monday":{"breakfast":{"id":"mon-breakfast-001","name":"Scrambled Eggs with Tomato","ingredients":[{"name":"eggs","quantity":2,"unit":"count","category":"proteins"},{"name":"tomato","quantity":100,"unit":"g","category":"vegetables"},{"name":"oil","quantity":15,"unit":"ml","category":"seasonings"}],"instructions":"1. Beat eggs... 2. Stir fry tomato... 3. Mix together...","estimatedTime":15,"servings":2,"difficulty":"easy","totalCalories":180},"lunch":"{ ... }","dinner":"{ ... }"},"tuesday":"{ ... }","...":"..."} Requirements: 1) All 7 days present (monday through sunday). 2) Each day has breakfast, lunch, dinner (use null if not scheduled). 3) Recipe ID format {day}-{meal}-{number} (e.g., "mon-breakfast-001"). 4) Ingredient categories: proteins, vegetables, fruits, grains, dairy, seasonings, pantry_staples, others. 5) Seasonings use quantity 0 and empty unit. 6) <=5 ingredients per meal and instructions <=200 characters. RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

**Gemini Raw Response**

```
{"monday":{"breakfast":null,"lunch":null,"dinner":{"id":"mon-dinner-001","name":"Lemon Ginger Chicken Stir-fry","ingredients":[{"name":"Chicken breast","quantity":200,"unit":"g","category":"proteins"},{"name":"Brown rice","quantity":100,"unit":"g","category":"grains"},{"name":"Broccoli","quantity":100,"unit":"g","category":"vegetables"},{"name":"Ginger","quantity":0,"unit":"","category":"seasonings"},{"name":"Soy sauce","quantity":0,"unit":"","category":"seasonings"}],"instructions":"Cook rice. Stir-fry chicken and broccoli. Add ginger and soy sauce. Serve over rice.","estimatedTime":25,"servings":2,"difficulty":"medium","totalCalories":450}},"tuesday":{"breakfast":null,"lunch":{"id":"tue-lunch-001","name":"Mediterranean Chicken Rice Salad","ingredients":[{"name":"Cooked chicken","quantity":150,"unit":"g","category":"proteins"},{"name":"Rice","quantity":100,"unit":"g","category":"grains"},{"name":"Cucumber","quantity":50,"unit":"g","category":"vegetables"},{"name":"Cherry tomatoes","quantity":50,"unit":"g","category":"vegetables"},{"name":"Feta cheese","quantity":30,"unit":"g","category":"dairy"}],"instructions":"Combine cooked chicken, rice, diced cucumber, and tomatoes. Sprinkle with feta cheese.","estimatedTime":15,"servings":1,"difficulty":"easy","totalCalories":400},"dinner":null},"wednesday":{"breakfast":null,"lunch":{"id":"wed-lunch-001","name":"Healthy Chicken Rice Soup","ingredients":[{"name":"Chicken thighs","quantity":200,"unit":"g","category":"proteins"},{"name":"Rice","quantity":50,"unit":"g","category":"grains"},{"name":"Carrots","quantity":50,"unit":"g","category":"vegetables"},{"name":"Celery","quantity":30,"unit":"g","category":"vegetables"},{"name":"Chicken broth","quantity":400,"unit":"ml","category":"pantry_staples"}],"instructions":"Boil broth. Add chicken, rice, carrots, and celery. Simmer until cooked through.","estimatedTime":30,"servings":2,"difficulty":"easy","totalCalories":350},"dinner":{"id":"wed-dinner-001","name":"Garlic Butter Chicken & Rice","ingredients":[{"name":"Chicken breast","quantity":200,"unit":"g","category":"proteins"},{"name":"Rice","quantity":100,"unit":"g","category":"grains"},{"name":"Garlic","quantity":0,"unit":"","category":"seasonings"},{"name":"Spinach","quantity":50,"unit":"g","category":"vegetables"},{"name":"Butter","quantity":15,"unit":"g","category":"dairy"}],"instructions":"Sear chicken in butter and garlic. Serve with cooked rice and sautéed spinach.","estimatedTime":20,"servings":2,"difficulty":"medium","totalCalories":500}},"thursday":{"breakfast":null,"lunch":null,"dinner":null},"friday":{"breakfast":null,"lunch":null,"dinner":{"id":"fri-dinner-001","name":"Turmeric Roasted Chicken Rice","ingredients":[{"name":"Chicken drumsticks","quantity":2,"unit":"count","category":"proteins"},{"name":"Rice","quantity":100,"unit":"g","category":"grains"},{"name":"Turmeric","quantity":0,"unit":"","category":"seasonings"},{"name":"Onion","quantity":50,"unit":"g","category":"vegetables"},{"name":"Peas","quantity":30,"unit":"g","category":"vegetables"}],"instructions":"Season chicken with turmeric. Roast with onions. Serve with rice and peas.","estimatedTime":45,"servings":2,"difficulty":"medium","totalCalories":550}},"saturday":{"breakfast":{"id":"sat-breakfast-001","name":"Savory Rice & Egg Bowl","ingredients":[{"name":"Rice","quantity":100,"unit":"g","category":"grains"},{"name":"Eggs","quantity":1,"unit":"count","category":"proteins"},{"name":"Green onions","quantity":10,"unit":"g","category":"vegetables"},{"name":"Soy sauce","quantity":0,"unit":"","category":"seasonings"},{"name":"Sesame oil","quantity":0,"unit":"","category":"seasonings"}],"instructions":"Place warm rice in a bowl. Top with a soft-boiled egg, onions, soy sauce, and oil.","estimatedTime":10,"servings":1,"difficulty":"easy","totalCalories":300},"lunch":{"id":"sat-lunch-001","name":"Pesto Chicken Rice Wrap","ingredients":[{"name":"Chicken","quantity":100,"unit":"g","category":"proteins"},{"name":"Rice","quantity":50,"unit":"g","category":"grains"},{"name":"Pesto","quantity":20,"unit":"g","category":"pantry_staples"},{"name":"Tortilla","quantity":1,"unit":"count","category":"grains"},{"name":"Bell pepper","quantity":30,"unit":"g","category":"vegetables"}],"instructions":"Fill tortilla with chicken, rice, bell peppers, and pesto. Wrap tightly and serve.","estimatedTime":10,"servings":1,"difficulty":"easy","totalCalories":450},"dinner":null},"sunday":{"breakfast":null,"lunch":null,"dinner":null}}
```

**Parsed Days (validated)**

```json
{
  "monday": {
    "breakfast": null,
    "lunch": null,
    "dinner": {
      "id": "mon-dinner-001",
      "name": "Lemon Ginger Chicken Stir-fry",
      "ingredients": [
        {
          "name": "Chicken breast",
          "quantity": 200,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Brown rice",
          "quantity": 100,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Broccoli",
          "quantity": 100,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Ginger",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Soy sauce",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "Cook rice. Stir-fry chicken and broccoli. Add ginger and soy sauce. Serve over rice.",
      "estimatedTime": 25,
      "servings": 2,
      "difficulty": "medium",
      "totalCalories": 450
    }
  },
  "tuesday": {
    "breakfast": null,
    "lunch": {
      "id": "tue-lunch-001",
      "name": "Mediterranean Chicken Rice Salad",
      "ingredients": [
        {
          "name": "Cooked chicken",
          "quantity": 150,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Rice",
          "quantity": 100,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Cucumber",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Cherry tomatoes",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Feta cheese",
          "quantity": 30,
          "unit": "g",
          "category": "dairy"
        }
      ],
      "instructions": "Combine cooked chicken, rice, diced cucumber, and tomatoes. Sprinkle with feta cheese.",
      "estimatedTime": 15,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 400
    },
    "dinner": null
  },
  "wednesday": {
    "breakfast": null,
    "lunch": {
      "id": "wed-lunch-001",
      "name": "Healthy Chicken Rice Soup",
      "ingredients": [
        {
          "name": "Chicken thighs",
          "quantity": 200,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Rice",
          "quantity": 50,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Carrots",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Celery",
          "quantity": 30,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Chicken broth",
          "quantity": 400,
          "unit": "ml",
          "category": "pantry_staples"
        }
      ],
      "instructions": "Boil broth. Add chicken, rice, carrots, and celery. Simmer until cooked through.",
      "estimatedTime": 30,
      "servings": 2,
      "difficulty": "easy",
      "totalCalories": 350
    },
    "dinner": {
      "id": "wed-dinner-001",
      "name": "Garlic Butter Chicken & Rice",
      "ingredients": [
        {
          "name": "Chicken breast",
          "quantity": 200,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Rice",
          "quantity": 100,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Garlic",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Spinach",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Butter",
          "quantity": 15,
          "unit": "g",
          "category": "dairy"
        }
      ],
      "instructions": "Sear chicken in butter and garlic. Serve with cooked rice and sautéed spinach.",
      "estimatedTime": 20,
      "servings": 2,
      "difficulty": "medium",
      "totalCalories": 500
    }
  },
  "thursday": {
    "breakfast": null,
    "lunch": null,
    "dinner": null
  },
  "friday": {
    "breakfast": null,
    "lunch": null,
    "dinner": {
      "id": "fri-dinner-001",
      "name": "Turmeric Roasted Chicken Rice",
      "ingredients": [
        {
          "name": "Chicken drumsticks",
          "quantity": 2,
          "unit": "count",
          "category": "proteins"
        },
        {
          "name": "Rice",
          "quantity": 100,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Turmeric",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Onion",
          "quantity": 50,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Peas",
          "quantity": 30,
          "unit": "g",
          "category": "vegetables"
        }
      ],
      "instructions": "Season chicken with turmeric. Roast with onions. Serve with rice and peas.",
      "estimatedTime": 45,
      "servings": 2,
      "difficulty": "medium",
      "totalCalories": 550
    }
  },
  "saturday": {
    "breakfast": {
      "id": "sat-breakfast-001",
      "name": "Savory Rice & Egg Bowl",
      "ingredients": [
        {
          "name": "Rice",
          "quantity": 100,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Eggs",
          "quantity": 1,
          "unit": "count",
          "category": "proteins"
        },
        {
          "name": "Green onions",
          "quantity": 10,
          "unit": "g",
          "category": "vegetables"
        },
        {
          "name": "Soy sauce",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        },
        {
          "name": "Sesame oil",
          "quantity": 0,
          "unit": "",
          "category": "seasonings"
        }
      ],
      "instructions": "Place warm rice in a bowl. Top with a soft-boiled egg, onions, soy sauce, and oil.",
      "estimatedTime": 10,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 300
    },
    "lunch": {
      "id": "sat-lunch-001",
      "name": "Pesto Chicken Rice Wrap",
      "ingredients": [
        {
          "name": "Chicken",
          "quantity": 100,
          "unit": "g",
          "category": "proteins"
        },
        {
          "name": "Rice",
          "quantity": 50,
          "unit": "g",
          "category": "grains"
        },
        {
          "name": "Pesto",
          "quantity": 20,
          "unit": "g",
          "category": "pantry_staples"
        },
        {
          "name": "Tortilla",
          "quantity": 1,
          "unit": "count",
          "category": "grains"
        },
        {
          "name": "Bell pepper",
          "quantity": 30,
          "unit": "g",
          "category": "vegetables"
        }
      ],
      "instructions": "Fill tortilla with chicken, rice, bell peppers, and pesto. Wrap tightly and serve.",
      "estimatedTime": 10,
      "servings": 1,
      "difficulty": "easy",
      "totalCalories": 450
    },
    "dinner": null
  },
  "sunday": {
    "breakfast": null,
    "lunch": null,
    "dinner": null
  }
}
```

Validation Result: ✅

### Step 3 — Shopping List

**Prompt**

```
Task: Convert the Menu Book into a consolidated North American shopping list (JSON).
CRITICAL RULES:
1. **MERGE AGGRESSIVELY**: Combine interchangeable ingredients into broad categories (e.g., "Beef strips" + "Flank steak" -> "Beef (Stir-fry cut)", "Scallions" + "Green onions" -> "Green Onions").
2. **UNITS (North America)**: Meat/Bulk must use 'lbs' or 'oz'; produce must use 'count' or 'bunch'.
3. Categories must be exactly: "proteins", "vegetables", "fruits", "grains", "dairy", "seasonings", "pantry_staples", "others".
4. Seasonings set totalQuantity to 0 and unit to "".
5. Limit the list to at most 12 items and keep field values concise (ingredient names <=4 words).
6. Respond with compact JSON (no comments or prose) to stay within model token limits.
Output Format:{
  "items": [
    {"name": "ingredient_name", "category": "predefined_category", "totalQuantity": 0, "unit": "unit"},
    ...
  ]
}
RETURN ONLY THE RAW JSON STRING. Do not use Markdown formatting (no ```json blocks).
```

**Gemini Raw Response**

```
{"items":[{"name":"Chicken","category":"proteins","totalQuantity":2.5,"unit":"lbs"},{"name":"Eggs","category":"proteins","totalQuantity":1,"unit":"count"},{"name":"Rice","category":"grains","totalQuantity":1.5,"unit":"lbs"},{"name":"Tortilla","category":"grains","totalQuantity":1,"unit":"count"},{"name":"Green Vegetables","category":"vegetables","totalQuantity":2,"unit":"bunch"},{"name":"Soup and Salad Veggies","category":"vegetables","totalQuantity":5,"unit":"count"},{"name":"Onions","category":"vegetables","totalQuantity":1,"unit":"bunch"},{"name":"Dairy","category":"dairy","totalQuantity":2,"unit":"oz"},{"name":"Chicken Broth","category":"pantry_staples","totalQuantity":14,"unit":"oz"},{"name":"Pesto","category":"pantry_staples","totalQuantity":1,"unit":"oz"},{"name":"Seasonings","category":"seasonings","totalQuantity":0,"unit":""}]}
```

**Parsed Items (validated)**

```json
{
  "items": [
    {
      "name": "Chicken",
      "category": "proteins",
      "totalQuantity": 2.5,
      "unit": "lbs"
    },
    {
      "name": "Eggs",
      "category": "proteins",
      "totalQuantity": 1,
      "unit": "count"
    },
    {
      "name": "Rice",
      "category": "grains",
      "totalQuantity": 1.5,
      "unit": "lbs"
    },
    {
      "name": "Tortilla",
      "category": "grains",
      "totalQuantity": 1,
      "unit": "count"
    },
    {
      "name": "Green Vegetables",
      "category": "vegetables",
      "totalQuantity": 2,
      "unit": "bunch"
    },
    {
      "name": "Soup and Salad Veggies",
      "category": "vegetables",
      "totalQuantity": 5,
      "unit": "count"
    },
    {
      "name": "Onions",
      "category": "vegetables",
      "totalQuantity": 1,
      "unit": "bunch"
    },
    {
      "name": "Dairy",
      "category": "dairy",
      "totalQuantity": 2,
      "unit": "oz"
    },
    {
      "name": "Chicken Broth",
      "category": "pantry_staples",
      "totalQuantity": 14,
      "unit": "oz"
    },
    {
      "name": "Pesto",
      "category": "pantry_staples",
      "totalQuantity": 1,
      "unit": "oz"
    },
    {
      "name": "Seasonings",
      "category": "seasonings",
      "totalQuantity": 0,
      "unit": ""
    }
  ]
}
```

Validation Result: ✅
