# OMenu API Test Results

**Generated**: 2026-02-01 14:23:50

This document contains generated meal plans and shopping lists for evaluation.

---

## Scenario: 健康减脂用户

**Description**: 注重健康、低卡路里、高蛋白饮食的用户

### User Preferences
| Setting | Value |
|---------|-------|
| Keywords | Healthy, Low-calorie, High-protein |
| Must Have | Chicken breast, Eggs, Salmon |
| Disliked | Fried food, Cheese, Butter |
| People | 1 |
| Budget | $80 |
| Difficulty | easy |

### Generated Meal Plan

#### Monday
  - **Breakfast**: Scrambled Eggs with Spinach and Chicken
    - ⏱️ 10 min | 👥 1 servings | 🔥 250 cal
    - 📝 Ingredients: Eggs (2.0 count), Spinach (0.5 cup), Cooked Chicken Breast (0.25 cup), Salt (0.0 ), Pepper (0.0 ), Olive Oil (1.0 tsp)
    - 📖 Sauté spinach in olive oil, then add beaten eggs and cooked chicken. Season with salt and pepper....
  - **Lunch**: Grilled Chicken Salad with Lemon Vinaigrette
    - ⏱️ 15 min | 👥 1 servings | 🔥 350 cal
    - 📝 Ingredients: Grilled Chicken Breast (4.0 oz), Mixed Greens (2.0 cups), Cherry Tomatoes (0.5 cup), Cucumber (0.25 cup), Lemon Juice (1.0 tbsp), Olive Oil (1.0 tsp), Salt (0.0 ), Pepper (0.0 )
    - 📖 Toss mixed greens with tomatoes, cucumber, and lemon vinaigrette. Top with sliced chicken breast....
  - **Dinner**: Baked Salmon with Asparagus
    - ⏱️ 25 min | 👥 1 servings | 🔥 300 cal
    - 📝 Ingredients: Salmon Fillet (4.0 oz), Asparagus Spears (1.0 cup), Lemon Juice (1.0 tbsp), Olive Oil (1.0 tsp), Garlic Powder (0.0 ), Salt (0.0 ), Pepper (0.0 )
    - 📖 Drizzle salmon and asparagus with olive oil and lemon juice. Season with garlic powder, salt, and pe...

#### Tuesday
  - **Lunch**: Chicken and Vegetable Skewers
    - ⏱️ 30 min | 👥 1 servings | 🔥 320 cal
    - 📝 Ingredients: Chicken Breast (4.0 oz), Bell Peppers (0.5 cup), Zucchini (0.5 cup), Red Onion (0.25 cup), Olive Oil (1.0 tbsp), Lemon Juice (1.0 tbsp), Salt (0.0 ), Pepper (0.0 )
    - 📖 Marinate chicken and vegetables in olive oil, lemon juice, salt, and pepper. Thread onto skewers and...
  - **Dinner**: Salmon with Quinoa and Broccoli
    - ⏱️ 20 min | 👥 1 servings | 🔥 400 cal
    - 📝 Ingredients: Salmon Fillet (4.0 oz), Cooked Quinoa (0.5 cup), Steamed Broccoli Florets (1.0 cup), Lemon Juice (1.0 tbsp), Salt (0.0 ), Pepper (0.0 )
    - 📖 Season salmon with lemon juice, salt, and pepper. Serve with cooked quinoa and steamed broccoli....

#### Wednesday
  - **Lunch**: Egg Salad Lettuce Wraps
    - ⏱️ 10 min | 👥 1 servings | 🔥 200 cal
    - 📝 Ingredients: Hard-boiled Eggs (2.0 count), Plain Greek Yogurt (1.0 tbsp), Celery (0.25 cup), Red Onion (1.0 tbsp), Salt (0.0 ), Pepper (0.0 ), Lettuce Leaves (4.0 count)
    - 📖 Mix mashed eggs with Greek yogurt, celery, and red onion. Season with salt and pepper. Serve in lett...
  - **Dinner**: Chicken Stir-Fry with Brown Rice
    - ⏱️ 20 min | 👥 1 servings | 🔥 380 cal
    - 📝 Ingredients: Chicken Breast (4.0 oz), Mixed Vegetables (1.0 cup), Soy Sauce (1.0 tbsp), Sesame Oil (1.0 tsp), Cooked Brown Rice (0.5 cup)
    - 📖 Stir-fry chicken and vegetables in soy sauce and sesame oil. Serve over brown rice....

#### Thursday
*(No meals scheduled)*

#### Friday
*(No meals scheduled)*

#### Saturday
*(No meals scheduled)*

#### Sunday
*(No meals scheduled)*

### Shopping List

| Category | Item | Quantity | Unit |
|----------|------|----------|------|
| proteins | Chicken Breast | 12.0 oz |  |
| proteins | Salmon Fillet | 8.0 oz |  |
| proteins | Eggs | 4.0 count |  |
| vegetables | Spinach | 0.5 cup |  |
| vegetables | Mixed Greens | 2.0 cups |  |
| vegetables | Cherry Tomatoes | 0.5 cup |  |
| vegetables | Cucumber | 0.25 cup |  |
| vegetables | Asparagus Spears | 1.0 cup |  |
| vegetables | Bell Peppers | 0.5 cup |  |
| vegetables | Zucchini | 0.5 cup |  |
| vegetables | Red Onion | 0.3125 cup |  |
| vegetables | Celery | 0.25 cup |  |
| vegetables | Lettuce Leaves | 4.0 count |  |
| vegetables | Mixed Vegetables | 1.0 cup |  |
| vegetables | Steamed Broccoli Florets | 1.0 cup |  |
| grains | Cooked Quinoa | 0.5 cup |  |
| grains | Cooked Brown Rice | 0.5 cup |  |
| dairy | Plain Greek Yogurt | 1.0 tbsp |  |
| seasonings | Salt | As needed |  |
| seasonings | Pepper | As needed |  |
| seasonings | Olive Oil | As needed |  |
| seasonings | Lemon Juice | As needed |  |
| seasonings | Garlic Powder | As needed |  |
| seasonings | Soy Sauce | As needed |  |
| seasonings | Sesame Oil | As needed |  |

---

## Scenario: 中式家庭餐

**Description**: 4口之家，偏好中式家常菜，周末做饭

### User Preferences
| Setting | Value |
|---------|-------|
| Keywords | Chinese, Family-style, Homemade |
| Must Have | Rice, Pork, Tofu |
| Disliked | Spicy, Seafood |
| People | 4 |
| Budget | $150 |
| Difficulty | medium |

### Result: ❌ Failed

**Error**: 422 Unprocessable Content - Gemini returned null values for required fields

**Root Cause Analysis**:
Gemini 返回的 JSON 中某些食谱的字段为 null（如 instructions, estimatedTime, servings, difficulty, totalCalories）

**Fix Applied**:
已在 prompts.py 中添加更强的约束条件，要求所有 recipe 字段必须填写有效值

**Recommendation**:
1. 增加 JSON 格式验证和自动修复逻辑
2. 或者在 Schema 中将这些字段设为 Optional 并提供默认值

---

## Scenario: 素食主义者

**Description**: 纯素食用户，不吃任何肉类和海鲜

### User Preferences
| Setting | Value |
|---------|-------|
| Keywords | Vegetarian, Plant-based, Fresh |
| Must Have | Tofu, Beans, Vegetables |
| Disliked | Meat, Fish, Chicken, Pork, Beef, Seafood |
| People | 2 |
| Budget | $100 |
| Difficulty | easy |

### Generated Meal Plan

#### Monday
  - **Breakfast**: Tofu Scramble with Spinach and Tomatoes
    - ⏱️ 20 min | 👥 2 servings | 🔥 350 cal
    - 📝 Ingredients: firm tofu (14.0 oz), olive oil (1.0 tbsp), onion (0.5 count), spinach (1.0 cup), tomato (1.0 count), turmeric (0.25 tsp), salt (0.0 ), pepper (0.0 )
    - 📖 1. Crumble the tofu. 2. Chop the onion, spinach, and tomato. 3. Saute the onion in olive oil. 4. Add...
  - **Lunch**: Black Bean and Corn Salad with Avocado
    - ⏱️ 15 min | 👥 2 servings | 🔥 400 cal
    - 📝 Ingredients: black beans (15.0 oz), corn kernels (1.0 cup), red bell pepper (0.5 count), red onion (0.25 count), avocado (1.0 count), lime juice (2.0 tbsp), olive oil (1.0 tbsp), salt (0.0 ), pepper (0.0 )
    - 📖 1. Rinse and drain the black beans. 2. Dice the red bell pepper, red onion, and avocado. 3. Combine ...
  - **Dinner**: Vegetarian Chili with Kidney Beans and Vegetables
    - ⏱️ 40 min | 👥 4 servings | 🔥 500 cal
    - 📝 Ingredients: olive oil (1.0 tbsp), onion (1.0 count), garlic (2.0 cloves), red bell pepper (1.0 count), green bell pepper (1.0 count), kidney beans (15.0 oz), diced tomatoes (15.0 oz), tomato sauce (15.0 oz), vegetable broth (1.0 cup), chili powder (1.0 tbsp), cumin (1.0 tsp), salt (0.0 ), pepper (0.0 )
    - 📖 1. Saute onion and garlic in olive oil. 2. Add bell peppers and cook until softened. 3. Add kidney b...

#### Tuesday
  - **Lunch**: Tofu and Vegetable Stir-Fry with Peanut Sauce
    - ⏱️ 25 min | 👥 2 servings | 🔥 450 cal
    - 📝 Ingredients: extra-firm tofu (14.0 oz), olive oil (1.0 tbsp), broccoli florets (1.0 cup), sliced carrots (0.5 cup), snow peas (0.5 cup), soy sauce (2.0 tbsp), peanut butter (1.0 tbsp), maple syrup (1.0 tbsp), rice vinegar (1.0 tbsp), sesame oil (1.0 tsp)
    - 📖 1. Press and cube the tofu. 2. Heat olive oil in a pan. 3. Stir-fry tofu until golden brown. 4. Add ...
  - **Dinner**: Lentil Soup with Root Vegetables
    - ⏱️ 45 min | 👥 4 servings | 🔥 350 cal
    - 📝 Ingredients: olive oil (1.0 tbsp), onion (1.0 count), carrots (2.0 count), celery stalks (2.0 count), brown or green lentils (1.0 cup), vegetable broth (6.0 cups), dried thyme (1.0 tsp), bay leaf (1.0 count), salt (0.0 ), pepper (0.0 )
    - 📖 1. Saute onion, carrots, and celery in olive oil. 2. Add lentils, vegetable broth, thyme, bay leaf, ...

#### Wednesday
  - **Lunch**: White Bean and Avocado Toast
    - ⏱️ 10 min | 👥 1 servings | 🔥 300 cal
    - 📝 Ingredients: whole wheat bread (2.0 slices), cannellini beans (15.0 oz), avocado (0.5 count), lemon juice (1.0 tbsp), salt (0.0 ), pepper (0.0 ), red pepper flakes (0.0 )
    - 📖 1. Toast the bread. 2. Rinse and drain the cannellini beans. 3. Mash the avocado with lemon juice, s...
  - **Dinner**: Tofu and Vegetable Curry with Coconut Milk
    - ⏱️ 35 min | 👥 4 servings | 🔥 400 cal
    - 📝 Ingredients: coconut oil (1.0 tbsp), onion (1.0 count), garlic (2.0 cloves), ginger (1.0 inch), firm tofu (14.0 oz), cauliflower florets (1.0 cup), broccoli florets (1.0 cup), coconut milk (13.5 oz), curry powder (2.0 tbsp), turmeric (0.5 tsp), salt (0.0 ), pepper (0.0 )
    - 📖 1. Heat coconut oil in a pan. 2. Saute onion, garlic, and ginger. 3. Add tofu, cauliflower, and broc...

#### Thursday
*(No meals scheduled)*

#### Friday
*(No meals scheduled)*

#### Saturday
*(No meals scheduled)*

#### Sunday
*(No meals scheduled)*

### Shopping List

| Category | Item | Quantity | Unit |
|----------|------|----------|------|
| proteins | Tofu | 42.0 oz |  |
| proteins | Black Beans | 15.0 oz |  |
| proteins | Kidney Beans | 15.0 oz |  |
| proteins | Lentils | 1.0 cup |  |
| proteins | Cannellini Beans | 15.0 oz |  |
| vegetables | Onions | 3.75 count |  |
| vegetables | Spinach | 1.0 cup |  |
| vegetables | Tomatoes | 1.0 count |  |
| vegetables | Corn Kernels | 1.0 cup |  |
| vegetables | Red Bell Pepper | 1.5 count |  |
| vegetables | Green Bell Pepper | 1.0 count |  |
| vegetables | Broccoli Florets | 2.0 cup |  |
| vegetables | Carrots | 2.5 count |  |
| vegetables | Snow Peas | 0.5 cup |  |
| vegetables | Celery | 2.0 count |  |
| vegetables | Cauliflower Florets | 1.0 cup |  |
| fruits | Avocado | 1.5 count |  |
| grains | Whole Wheat Bread | 2.0 slices |  |
| pantry_staples | Diced Tomatoes | 15.0 oz |  |
| pantry_staples | Tomato Sauce | 15.0 oz |  |
| pantry_staples | Vegetable Broth | 7.0 cups |  |
| pantry_staples | Peanut Butter | 1.0 tbsp |  |
| pantry_staples | Coconut Milk | 13.5 oz |  |
| seasonings | Olive Oil | As needed |  |
| seasonings | Turmeric | As needed |  |
| seasonings | Salt | As needed |  |
| seasonings | Pepper | As needed |  |
| seasonings | Lime Juice | As needed |  |
| seasonings | Garlic | As needed |  |
| seasonings | Chili Powder | As needed |  |
| seasonings | Cumin | As needed |  |
| seasonings | Soy Sauce | As needed |  |
| seasonings | Maple Syrup | As needed |  |
| seasonings | Rice Vinegar | As needed |  |
| seasonings | Sesame Oil | As needed |  |
| seasonings | Lemon Juice | As needed |  |
| seasonings | Red Pepper Flakes | As needed |  |
| seasonings | Coconut Oil | As needed |  |
| seasonings | Ginger | As needed |  |
| seasonings | Curry Powder | As needed |  |
| seasonings | Dried Thyme | As needed |  |
| seasonings | Bay Leaf | As needed |  |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Scenarios | 3 |
| Successful | 2 |
| Failed | 1 |

### Evaluation Checklist

For each scenario, please verify:

- [ ] Meal names match the requested cuisine/style keywords
- [ ] Must-have ingredients appear in multiple recipes
- [ ] Disliked items do NOT appear in any recipe
- [ ] Portion sizes match the number of people
- [ ] Difficulty level is appropriate
- [ ] Shopping list correctly merges ingredients
- [ ] Categories are correctly assigned

---

## Initial Assessment

### Scenario 1: 健康减脂用户 ✅

| Check | Result | Notes |
|-------|--------|-------|
| Keywords Match | ✅ | Meals are healthy, low-calorie (200-400 cal) |
| Must-Have Items | ✅ | Chicken, Eggs, Salmon appear in multiple meals |
| Disliked Items | ✅ | No fried food, cheese, or butter |
| Servings Match | ✅ | All meals are 1 serving |
| Difficulty | ✅ | All recipes are "easy" |
| Shopping List | ✅ | Ingredients merged correctly |

### Scenario 2: 中式家庭餐 ❌

| Check | Result | Notes |
|-------|--------|-------|
| Generation | ❌ | Failed due to null values from Gemini |
| Issue | - | Gemini sometimes returns incomplete JSON |

**Action Item**: Add validation/retry logic or make Recipe fields Optional with defaults

### Scenario 3: 素食主义者 ✅

| Check | Result | Notes |
|-------|--------|-------|
| Keywords Match | ✅ | All vegetarian, plant-based recipes |
| Must-Have Items | ✅ | Tofu (42 oz total), Beans, Vegetables in all meals |
| Disliked Items | ✅ | No meat, fish, chicken, pork, beef, or seafood |
| Servings Match | ✅ | Recipes are 2-4 servings |
| Difficulty | ✅ | Most recipes are "easy" |
| Shopping List | ✅ | Ingredients merged correctly |

---

## Known Issues & Recommendations

1. **Gemini Output Inconsistency**: Sometimes returns null for required fields
   - Solution: Add fallback values or make fields Optional in Schema

2. **Category Mismatch**: Gemini occasionally uses categories like "condiments" instead of allowed values
   - Solution: Add category mapping/normalization layer

3. **Token Efficiency**: Consider caching common prompts or using structured output mode

4. **Package Deprecation**: `google.generativeai` package is deprecated
   - Action: Migrate to `google.genai` package
