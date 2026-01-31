# OMenu v3 实现指南 (Implementation Guide)

根据审视发现的10个关键问题，本指南提供可直接用于开发的实现规范。

---

## 1. 菜谱ID生成与管理系统

### 问题
用户自定义菜谱与数据库菜谱的ID如何区分？

### 解决方案

**ID命名规范**:
```
数据库菜谱:      "recipe_<number>"       (e.g., "recipe_001", "recipe_042")
用户自定菜谱:    "custom_<hash>"         (e.g., "custom_a7f3e2")
AI生成临时菜谱:  "temp_<timestamp>"      (e.g., "temp_1704067200")
```

**Implementation**:
```json
{
    "recipeId": "custom_a7f3e2",
    "isCustom": true,
    "customCreatedBy": "user_123",
    "customCreatedAt": "2024-06-01T10:30:00Z",
    "customUpdatedAt": null,
    "recipeSource": "user_custom",
    "// recipeSource_options": ["user_custom", "user_generated_by_ai", "system_database"],
    "linkedRecipes": [],
    "// linkedRecipes_notes": "If this custom recipe later matches a DB recipe, link it"
}
```

**Recipe ID Lookup Table** (系统维护):
```json
{
    "recipeIdMap": {
        "custom_a7f3e2": {
            "name": "My favorite pasta",
            "owner": "user_123",
            "type": "custom",
            "firstUsedIn": "plan_20240601_user123"
        }
    }
}
```

---

## 2. Shopping List增量更新算法

### 问题
当meal plan改变（添加/删除/替换菜谱）时，shopping list如何正确更新？

### 解决方案

**食材匹配与标准化**:
```json
{
    "ingredientNormalization": {
        "// strategy": "Use combination of (name_normalized, category) as unique key",
        "rules": [
            {
                "variants": ["oil", "橄榄油", "vegetable oil"],
                "canonical": "oil",
                "category": "oils_condiments",
                "note": "Different types of oil should be summed if same category"
            },
            {
                "variants": ["tomato", "番茄", "cherry tomato"],
                "canonical": "tomato",
                "category": "vegetables",
                "note": "Different tomato types: combine quantities with unit conversion note"
            }
        ]
    }
}
```

**增量更新流程**:

```
Step 1: Extract ingredients from new/deleted/modified recipes
Step 2: Normalize ingredient names (canonical + category)
Step 3: Build ingredient diff (added, removed, modified)
Step 4: Apply diff to existing shoppingList

Example:
─────────────────────────────────────────

Operation: Add custom recipe "My pasta" with ingredients:
  - pasta: 200g
  - olive oil: 30ml
  - tomato: 300g
  
Current shopping list already has:
  - pasta: 200g (grains)
  - olive oil: 20ml (oils_condiments)
  - broccoli: 800g (vegetables)

Result:
  - pasta: 400g (200+200)
  - olive oil: 50ml (20+30)
  - tomato: 300g (NEW)
  - broccoli: 800g (unchanged)
```

**Data Structure: shoppingListUpdateLog.json**:
```json
{
    "planId": "plan_20240601_user123",
    "updateLog": [
        {
            "timestamp": "2024-06-01T10:30:00Z",
            "operation": "add_recipe",
            "recipeId": "custom_a7f3e2",
            "recipeName": "My pasta",
            "changes": [
                {
                    "ingredientKey": "pasta:grains",
                    "oldQuantity": 200,
                    "newQuantity": 400,
                    "unit": "g",
                    "operation": "merge"
                },
                {
                    "ingredientKey": "olive_oil:oils_condiments",
                    "oldQuantity": 20,
                    "newQuantity": 50,
                    "unit": "ml",
                    "operation": "merge"
                },
                {
                    "ingredientKey": "tomato:vegetables",
                    "oldQuantity": null,
                    "newQuantity": 300,
                    "unit": "g",
                    "operation": "add"
                }
            ]
        }
    ]
}
```

**Shopping List中的user manual edit tracking**:
```json
{
    "id": "ingredient_003",
    "name": "tomato",
    "category": "vegetables",
    "systemCalculatedQuantity": 300,
    "userAdjustedQuantity": 400,
    "// userAdjustedQuantity_notes": "If user manually changed from 300 to 400, preserve this edit",
    "unit": "g",
    "lastUserAdjustment": "2024-06-01T11:00:00Z",
    "estimatedPrice": 3.20,
    "isPurchased": false
}
```

---

## 3. DailyMealPlan ↔ MealPlan同步协议

### 问题
用户在daily timeline上编辑菜谱，如何回写到mealPlan？

### 解决方案

**状态机**: DailyMealPlan是否为MealPlan的"view"还是"copy"?

**推荐**: **Derived View + Changelog模式**

```
mealPlan (source of truth)
    ↓
dailyMealPlan (derived view, real-time)
    ↓ (user edits)
dailyMealPlanChanges (changelog)
    ↓ (on "Save" or daily sync)
mealPlan (update source)
```

**Implementation**:

```json
{
    "// sync_strategy": "dailyMealPlan is a derived view. User edits are tracked in dailyMealPlanChanges, only committed to mealPlan on explicit save",
    
    "dailyMealPlanChanges": {
        "date": "2024-06-01",
        "sourceDate": "2024-06-01",
        "changes": [
            {
                "mealType": "lunch",
                "operation": "replace",
                "oldRecipeId": "recipe_002",
                "oldRecipeName": "清炒西兰花",
                "newRecipeId": "recipe_003",
                "newRecipeName": "番茄意大利面",
                "timestamp": "2024-06-01T12:00:00Z",
                "status": "pending"
                "// status": ["pending", "committed", "undone"]
            },
            {
                "mealType": "dinner",
                "operation": "delete",
                "oldRecipeId": "recipe_001",
                "timestamp": "2024-06-01T12:05:00Z",
                "status": "pending"
            }
        ]
    }
}
```

**保存流程**:

```
1. User edits dailyMealPlan in UI
2. Changes saved to dailyMealPlanChanges (pending state)
3. User clicks "Save Changes" or "Sync to Plan"
4. System:
   a. Validate all changes (e.g., no nutrition conflicts)
   b. Update mealPlan.json with all committed changes
   c. Recalculate shoppingList
   d. Mark dailyMealPlanChanges as committed
5. Return success + show affected recipes in shoppingList
```

**Undo support**:
```json
{
    "undoStack": [
        {
            "timestamp": "2024-06-01T12:00:00Z",
            "operation": "replace_lunch",
            "before": {"mealType": "lunch", "recipeId": "recipe_002"},
            "after": {"mealType": "lunch", "recipeId": "recipe_003"}
        }
    ]
}
```

**Edge case: Multiple days edited**:
- If user edits lunch on both Monday and Tuesday, shoppingList should aggregate correctly

---

## 4. 用户自定义菜谱生命周期

### 问题
自定义菜谱是临时的还是可复用的？

### 解决方案

**推荐**: **持久化 + 用户菜谱库**

```json
{
    "userRecipeLibrary": {
        "userId": "user_123",
        "customRecipes": [
            {
                "recipeId": "custom_a7f3e2",
                "recipeName": "My favorite pasta",
                "createdAt": "2024-06-01T10:30:00Z",
                "lastModified": "2024-06-01T11:00:00Z",
                "ingredients": [...],
                "recipeDetails": "...",
                "estimatedTime": 20,
                "servings": 2,
                "difficulty": "easy",
                "totalCalories": 580,
                "tags": ["pasta", "italian", "quick"],
                "// tags_notes": "User-defined tags for filtering own recipes",
                "usageCount": 3,
                "// usageCount_notes": "How many times used in meal plans",
                "lastUsedDate": "2024-06-15",
                "isPublic": false,
                "// isPublic_notes": "Future: community recipe sharing"
            }
        ]
    }
}
```

**在new meal plan中复用**:
```
User creates new meal plan
→ System suggests own custom recipes based on moodTags/cuisine
→ User can add own recipes to pool of candidates
→ AI includes in generated meal plan
```

**生命周期状态**:
```
Created → Used in meal plan → Modified → Reused → Archived/Deleted

State transitions:
- Created: 初始状态
- Used: 至少在一个meal plan中使用过
- Published: 如果支持community sharing
- Archived: 用户标记为已过时但保留历史
- Deleted: 用户删除（支持recycle bin)
```

---

## 5. ChatRefinement中的冲突解决规则

### 问题
用户提供contradictory feedback时的优先级？

### 解决方案

**Priority Hierarchy** (从高到低):

```json
{
    "conflictResolution": {
        "priorityLevels": [
            {
                "level": 1,
                "category": "User Chat Feedback",
                "rules": [
                    "Explicit constraints in current feedback",
                    "E.g., 'I don't want any pasta this week'"
                ],
                "weight": 100
            },
            {
                "level": 2,
                "category": "Hard Constraints",
                "rules": [
                    "Dietary restrictions (must respect)",
                    "E.g., vegetarian, gluten-free, allergies"
                ],
                "weight": 90
            },
            {
                "level": 3,
                "category": "User Preferences",
                "rules": [
                    "Preferred recipes",
                    "Preferred cuisines"
                ],
                "weight": 70
            },
            {
                "level": 4,
                "category": "Soft Constraints",
                "rules": [
                    "Budget, cooking time, mood tags",
                    "Nutritional balance, variety"
                ],
                "weight": 50
            }
        ]
    }
}
```

**Example conflict resolution**:

```
Scenario:
─────────────────────────────────────────
User profile: vegetarian, prefers Chinese food
ChatFeedback: "I want more vegetarian meals on Wed-Thu, but include red meat on Friday"

Conflict: vegetarian ≠ red meat

Resolution:
1. Check priority: 
   - Level 1 (chat feedback): include red meat on Friday
   - Level 2 (dietary restriction): vegetarian always
   
2. Apply strict rules first:
   - vegetarian is HARD constraint
   - Chat feedback for red meat on Friday = CONTRADICTION
   
3. System response:
   - Generate meal plan with vegetarian all week
   - Show warning: "Your profile is vegetarian but you asked for red meat on Friday"
   - Offer two options:
     a) Generate all vegetarian (respecting profile)
     b) Temporarily remove vegetarian restriction and regenerate
     
4. User chooses → proceed with selection
```

**Implementation in chatRefinementRequest**:

```json
{
    "userFeedback": "I want red meat on Friday",
    "preferenceProfile": {
        "dietaryRestrictions": ["vegetarian"]
    },
    "conflictDetection": {
        "conflicts": [
            {
                "type": "dietary_restriction_conflict",
                "feedback": "red meat",
                "existingConstraint": "vegetarian",
                "severity": "high",
                "suggestedResolution": "ask_user"
            }
        ]
    },
    "refinementPrompt": "User feedback conflicts with dietary restriction. Detected: 'red meat' requested but profile has 'vegetarian'. System should ask user to clarify before proceeding."
}
```

---

## 6. 单菜重生成(Single Recipe Regen)的Context范围

### 问题
重生成时是否应考虑跨日期的菜谱以避免重复？

### 解决方案

**Extended Context范围**:

```json
{
    "singleRecipeRegenerationRequest": {
        "targetRecipe": {
            "day": "monday",
            "mealType": "lunch",
            "recipeId": "recipe_002",
            "recipeName": "清炒西兰花"
        },
        "contextWindow": {
            "// notes": "Include meals from surrounding days to ensure no repetition",
            "includeDays": ["sunday", "monday", "tuesday"],
            "// includeDays_rationale": "Avoid same recipe or similar ingredients on adjacent days"
        },
        "contextMeals": {
            "sunday": {
                "breakfast": "番茄鸡蛋",
                "lunch": "豆腐汤",
                "dinner": "米饭+红烧肉"
            },
            "monday": {
                "breakfast": "粥",
                "lunch": null,  // To be replaced
                "dinner": "番茄意大利面"
            },
            "tuesday": {
                "breakfast": "包子",
                "lunch": "馄饨汤",
                "dinner": null
            }
        },
        "similarityThreshold": 0.6,
        "// similarityThreshold_notes": "Avoid recipes with >60% overlapping ingredients",
        "regenerationPrompt": "Generate ONE alternative recipe to replace Monday lunch. Constraints: 1. Do NOT repeat any recipes from context days (Sunday-Tuesday) 2. Minimize ingredient overlap (>60% match = reject) 3. Complement breakfast (粥) and dinner (番茄意大利面) 4. Respect all dietary restrictions 5. Include totalCalories. Consider meal distribution: breakfast is light, lunch should be balanced, dinner is pasta-based."
    }
}
```

**Similarity Check Algorithm**:

```
Monday Lunch (要替换): 清炒西兰花
  ingredients: [broccoli 200g, garlic 20g, oil 15ml]

Context Window Meals:
  - Sunday lunch "豆腐汤": [tofu, green onion, stock] → 0% overlap
  - Sunday dinner "红烧肉": [pork, soy sauce, spices] → 0% overlap  
  - Monday dinner "番茄意大利面": [pasta, tomato, oil] → 20% overlap (共享oil)
  - Tuesday lunch "馄饨汤": [wonton, pork, stock] → 0% overlap

AI generated candidates:
  1. "清蒸鱼" [fish, ginger, soy sauce] → 0% overlap ✓ ACCEPT
  2. "番茄蛋汤" [tomato, egg, stock] → 20% overlap with Monday dinner
     (共享tomato但晚餐是tomato意大利面) → CONSIDER ACCEPTABLE (different dish type)
  3. "西兰花炒菜" [broccoli, ...]  → 100% overlap with target ✗ REJECT
```

---

## 7. Cooking Schedule的灵活性

### 问题
固定的breakfast/lunch/dinner能否支持更多meal types?

### 解决方案

**灵活的Meal Type系统**:

```json
{
    "supportedMealTypes": {
        "predefined": [
            "breakfast",
            "mid_morning_snack",
            "brunch",
            "lunch",
            "afternoon_snack",
            "dinner",
            "late_dinner",
            "supper"
        ],
        "custom": true,
        "// custom_notes": "Users can define custom meal types if needed"
    },
    
    "cookSchedule": {
        "// notes": "Flexible schedule: can specify any combo of meal types per day",
        "monday": ["breakfast", "lunch", "dinner"],
        "tuesday": ["breakfast", "dinner"],
        "wednesday": ["breakfast", "mid_morning_snack", "lunch", "dinner"],
        "thursday": ["breakfast", "afternoon_snack", "dinner"],
        "friday": ["breakfast", "lunch", "dinner"],
        "saturday": ["brunch", "dinner"],
        "sunday": ["breakfast", "lunch", "dinner"]
    },
    
    "scheduledTimes": {
        "// notes": "Suggested times for each meal type, customizable",
        "breakfast": "08:00",
        "brunch": "10:00",
        "lunch": "12:30",
        "afternoon_snack": "15:00",
        "dinner": "19:00"
    }
}
```

**Example: Intermittent Fasting User**:
```json
{
    "cookSchedule": {
        "monday": ["lunch", "dinner"],
        "tuesday": ["lunch", "dinner"],
        "wednesday": ["lunch", "dinner"],
        "thursday": ["lunch", "dinner"],
        "friday": ["lunch", "dinner"],
        "saturday": ["brunch", "dinner"],
        "sunday": ["brunch", "dinner"]
    },
    "moodTags": ["intermittent_fasting"],
    "others": "16:8 fasting schedule, lunch at noon, dinner at 8pm"
}
```

**在Meal Plan中的应用**:
```json
{
    "friday": {
        "lunch": {...},
        "dinner": {...}
        // 注意: 没有breakfast字段
    },
    "saturday": {
        "brunch": {
            "recipeId": "recipe_015",
            "recipeName": "Brunch Combo",
            "// notes": "Combines breakfast-like items (eggs) with lunch items (salad)"
        },
        "dinner": {...}
    }
}
```

---

## 8. 预算超支处理流程

### 问题
生成的meal plan成本超预算时如何处理？

### 解决方案

**预算检查 & 用户确认**:

```json
{
    "mealPlanValidation": {
        "budgetCheck": {
            "budgetPerPersonPerWeek": 70,
            "numberOfPeople": 2,
            "totalWeeklyBudget": 140,
            "// calculation": "70 USD/person * 2 people = 140 USD total",
            
            "actualCostCalculated": 165,
            "// actualCost_notes": "Sum of all estimatedPrice in generated shoppingList",
            
            "variance": 25,
            "// variance_notes": "165 - 140 = 25 USD over budget",
            
            "variancePercentage": 17.9,
            "// variancePercentage": "(165-140)/140 * 100 = 17.9%",
            
            "status": "budget_exceeded",
            "// status_options": ["within_budget", "budget_exceeded", "budget_warning"]
        }
    }
}
```

**用户流程**:

```
AI generates meal plan with cost = 165 USD (exceeds 140 USD budget)
    ↓
System detects overage: 25 USD (17.9%)
    ↓
System shows to user:
  ┌─────────────────────────────────────┐
  │ Budget Check                        │
  │ ─────────────────────────────────── │
  │ Your budget:    $140/week          │
  │ Meal plan cost: $165/week          │
  │ Over budget:    $25 (↑17.9%)       │
  │                                     │
  │ Options:                            │
  │ ○ Accept this plan (+25 USD)       │
  │ ○ Ask AI to optimize for budget    │
  │ ○ Adjust preferences (increase budget, remove cuisines, etc.) │
  │ ○ Go back & modify meals manually  │
  └─────────────────────────────────────┘
    ↓
User selects option
    ↓
If "optimize": Send to AI with constraint "total cost ≤ 140 USD"
If "accept": Proceed with plan + show warning in shopping list
If "adjust": Modify preferences → regenerate
```

**Data Structure: budgetOptimization Request**:

```json
{
    "mealPlanToOptimize": {/* current meal plan with cost 165 */},
    "targetBudget": 140,
    "optimizationPrompt": "Regenerate the meal plan to fit within $140 total budget while preserving: 1. All user-preferred recipes if possible 2. All dietary restrictions 3. Nutritional balance. Strategy: Use cheaper substitutes where possible (e.g., chicken instead of salmon), reduce expensive ingredients' quantities, or replace high-cost recipes with budget alternatives. Include totalCalories and recalculate estimated prices.",
    "constraints": {
        "preserveRecipes": ["番茄鸡蛋", "清炒西兰花"],
        "// preserveRecipes_notes": "Try to keep these",
        "maxCost": 140,
        "maintainNutrition": true
    }
}
```

---

## 9. 实时Timeline状态管理

### 问题
breakfast的status何时从"current"变为"past"？

### 解决方案

**精确的状态转换逻辑**:

```json
{
    "timelineStatusMachine": {
        "states": {
            "upcoming": {
                "condition": "currentTime < scheduledTime",
                "display": "⏰ Upcoming",
                "editable": true,
                "markable": false
            },
            "current": {
                "condition": "scheduledTime ≤ currentTime < scheduledTime + estimatedTime",
                "display": "🍽️ Current",
                "editable": true,
                "markable": true,
                "style": "highlight"
            },
            "current_overtime": {
                "condition": "currentTime ≥ scheduledTime + estimatedTime + 30min",
                "// overtime_definition": "If meal took 30+ min longer than estimated",
                "display": "⏰ Still cooking (overtime)",
                "editable": true,
                "markable": true,
                "style": "warning"
            },
            "past": {
                "condition": "currentTime ≥ scheduledTime + estimatedTime",
                "display": "✓ Past",
                "editable": false,
                "// editable_rationale": "User can still view or move to another day if needed",
                "markable": true,
                "style": "greyed_out"
            }
        },
        
        "transitions": [
            {
                "from": "upcoming",
                "to": "current",
                "trigger": "time reaches scheduledTime",
                "action": "highlight recipe, show timer"
            },
            {
                "from": "current",
                "to": "current_overtime",
                "trigger": "time > scheduledTime + estimatedTime + 30min",
                "action": "show warning badge"
            },
            {
                "from": ["current", "current_overtime"],
                "to": "past",
                "trigger": "time ≥ scheduledTime + estimatedTime",
                "action": "grey out, show checkmark",
                "// action_notes": "Optionally: ask user 'Did you finish on time?' for feedback"
            }
        ]
    }
}
```

**Timeline显示示例**:

```
10:00 AM - Current Time
──────────────────────

08:00  ✓ breakfast (番茄鸡蛋)          [PAST - greyed out]
       Finished at ~08:15

12:30  🍽️ lunch (清炒西兰花)           [CURRENT - highlighted]
       In progress... Est. 20 min
       ⏱️ Timer: 12:32 (started 2 min ago)

19:00  ⏰ dinner (番茄意大利面)          [UPCOMING - normal]
       In 9 hours
       Est. 25 min
```

**Real-time update mechanism**:
```
Every minute:
1. Compare currentTime with all meals' scheduledTime
2. Detect state transitions
3. Update UI
4. If user marked meal as "done" early, allow and note in history
```

---

## 10. AI Prompt质量管理系统

### 问题
多个地方的AI请求，如何确保prompt质量一致？

### 解决方案

**Prompt Template System**:

```json
{
    "promptTemplates": {
        "parsePreferences": {
            "id": "tpl_parse_preferences",
            "version": "1.0",
            "description": "Parse user input to extract complete preference profile",
            "template": "Parse and normalize the user input into a complete preference profile. Extract all explicit and implicit preferences. Current userInput: {userInput}. Return normalized preferenceProfile in specified JSON format. CRITICAL: Preserve all information, do not lose any preferences in normalization process.",
            "parameters": ["userInput"],
            "expectedOutput": "preferenceProfile.json schema",
            "constraints": [
                "Do not infer preferences not explicitly stated",
                "Preserve 'others' field exactly",
                "Mark any ambiguous preferences for manual review"
            ],
            "examples": [...]
        },
        
        "generateMealPlan": {
            "id": "tpl_generate_meal_plan",
            "version": "1.2",
            "description": "Generate weekly meal plan based on preferences",
            "template": "Generate a personalized weekly meal plan based on: {preferenceProfile}. REQUIREMENTS: 1. Include all preferredRecipes 2. Respect all dietaryRestrictions (HARD constraint) 3. Stay within budget if specified (can override max ±10%) 4. Cook time ≤ {cookTimePerMeal} minutes per meal 5. Ensure nutritional balance 6. Include recipe variety 7. Consider 'others' preferences. OUTPUT FORMAT: Return mealPlan.json with days/meals/recipes including totalCalories, ingredients, estimated times.",
            "parameters": ["preferenceProfile", "cookTimePerMeal"],
            "expectedOutput": "mealPlan.json schema",
            "constraints": [
                "totalCalories must be realistic",
                "estimatedTime must be ≤ cookTimePerMeal",
                "Each day should have at least 1 preferred recipe if possible",
                "No recipe repetition within same week"
            ],
            "validationRules": [
                "Check all recipes exist",
                "Verify totalCalories > 0",
                "Ensure dietary restrictions respected"
            ]
        },
        
        "parseIngredients": {
            "id": "tpl_parse_ingredients",
            "version": "1.0",
            "description": "Parse free-text recipe to extract structured ingredients",
            "template": "Extract all ingredients from this recipe: {recipeText}. For each ingredient: 1. Ingredient name (normalized) 2. Quantity + unit (be conservative) 3. Estimated serving. Also: cooking time (realistic), difficulty (easy/medium/hard), calories if possible. Return JSON with all fields.",
            "parameters": ["recipeText"],
            "expectedOutput": "ingredientParsingResult.json schema",
            "constraints": [
                "Quantity should be conservative (round up)",
                "Unit normalization: use standard units",
                "Calories estimation must include 'uncertain' flag if < 50% confident"
            ]
        }
    },
    
    "modelConfig": {
        "model": "gpt-4-turbo",
        "temperature": 0.7,
        "// temperature_notes": "0.7 for meal planning (balance creativity+consistency)",
        "max_tokens": 2000,
        "top_p": 0.9,
        "frequency_penalty": 0.1
    },
    
    "outputValidation": {
        "parsePreferences": {
            "requiredFields": ["userMoods", "preferredRecipes", "dietaryRestrictions", "budget", "cookTimePerMeal"],
            "schema": "preferenceProfile.json"
        },
        "generateMealPlan": {
            "requiredFields": ["monday-sunday", "each day has meals", "each meal has recipeId+totalCalories"],
            "schema": "mealPlan.json",
            "validation": [
                "ALL days must be present",
                "Check no null recipes",
                "Verify totalCalories range (100-800 typical)"
            ]
        }
    }
}
```

**Prompt versioning & A/B testing**:
```json
{
    "promptVersion": {
        "generateMealPlan": {
            "v1.0": {/* original prompt */},
            "v1.1": {/* minor improvement */},
            "v1.2": {/* current active */},
            "vExperimental": {/* new variant for A/B testing */}
        },
        "activeVersion": "v1.2",
        "abTest": {
            "enabled": false,
            "variants": ["v1.2", "vExperimental"],
            "splitRatio": [0.9, 0.1],
            "metric": "user_satisfaction_score"
        }
    }
}
```

**Quality monitoring**:
```json
{
    "qualityMetrics": {
        "generateMealPlan": {
            "successRate": 0.95,
            "// successRate_notes": "% of valid outputs / total requests",
            "validationFailures": [
                {
                    "timestamp": "2024-06-01T10:35:00Z",
                    "reason": "missing_totalCalories",
                    "recipeIndex": 3,
                    "recoveryAction": "request_retry"
                }
            ],
            "avgResponseTime": 2.3,
            "// responseTime_unit": "seconds"
        }
    }
}
```

---

## 总结: 实现检查清单

在开发前确保以下已明确定义:

- [ ] **Recipe ID System** - 自定义 vs 数据库菜谱的ID方案
- [ ] **Ingredient Normalization** - 食材名去重规则
- [ ] **Shopping List Update Algorithm** - 增量更新逻辑
- [ ] **DailyMealPlan Sync** - Timeline编辑的回写机制
- [ ] **Custom Recipe Lifecycle** - 自定义菜谱的保存 & 复用
- [ ] **Conflict Resolution** - ChatRefinement的优先级规则
- [ ] **Context Range** - 单菜重生成考虑的日期范围
- [ ] **Meal Type Flexibility** - 支持breakfast/lunch/dinner之外的meal types
- [ ] **Budget Validation** - 超预算检查 & 用户流程
- [ ] **Timeline State Machine** - status转换的精确逻辑
- [ ] **Prompt Management** - AI请求的template & version control

这些规范可直接用于backend和frontend开发。

