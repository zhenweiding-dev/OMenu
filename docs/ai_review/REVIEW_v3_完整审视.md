# OMenu v3 完整审视报告

## 📋 执行摘要

v3文档基本完整并系统化地定义了OMenu的产品流程和数据结构。包含**4个主要Journey**、**2.5个阶段**、**完整的AI集成**和**详细的数据生命周期管理**。

---

## ✅ 优点与完整性

### 1. 用户流程清晰完整
- **Journey 1**: 偏好收集 → 初始meal plan生成 ✓
- **Journey 2**: Shopping list AI生成 ✓
- **Journey 2.5**: 用户自定义菜谱（AI解析） ✓
- **Journey 3**: 日常timeline + 三种交互模式 ✓
- **Journey 4**: 完整plan重生成 ✓

**优点**: 覆盖了用户从初始设置到日常使用的完整生命周期

### 2. AI集成深度
- ✓ 偏好解析（preferenceParsingRequest）
- ✓ Meal plan生成（AI保证多样性、营养、预算平衡）
- ✓ Shopping list分类（固定9类）
- ✓ 自定义菜谱食材提取（ingredientParsingRequest）
- ✓ 对话框反馈（chatRefinementRequest）
- ✓ 单菜重生成（singleRecipeRegenerationRequest）

**优点**: AI参与度高，自动化程度好

### 3. 数据结构规范
- ✓ 所有JSON包含详细注释（// notes, // options等）
- ✓ 清晰的字段说明和单位标注
- ✓ 完整的数据生命周期分类
- ✓ 关键数据关系表

**优点**: 便于开发和维护

### 4. 卡路里追踪
- ✓ mealPlan中每菜谱包含totalCalories
- ✓ recipeDatabase中包含nutritionPer100g和totalCalories
- ✓ 便于用户营养监控

### 5. 灵活的Meal Modification
- ✓ 对话框反馈（整周重生成）
- ✓ 单菜重生成（保持上下文）
- ✓ 删除菜谱
- ✓ 移到其他日期
- ✓ Timeline直接编辑

---

## ⚠️ 问题与不一致

### 问题1: 菜谱ID生成策略未定义
**位置**: mealPlan.json中的recipeId
```json
"recipeId": "recipe_001"  // 如何生成？
```
**问题**: 
- 用户自定义菜谱的recipeId如何生成？
- 与recipeDatabase中的recipes关系？
- 是否支持用户菜谱复用？

**建议**: 
```
自定义菜谱: "custom_recipe_<hash>"
数据库菜谱: "recipe_<dbid>"
```

---

### 问题2: Shopping List的增量更新逻辑不清

**场景**: 用户：
1. 生成初始plan → 生成shopping list（假设包含鸡蛋x5）
2. 添加自定义菜谱（包含鸡蛋x3）
3. 删除一道菜（包含鸡蛋x2）

**不清楚的地方**:
- 鸡蛋最终数量应是多少？(5+3-2 = 6?)
- Ingredient ID是否应该用hash去重？
- 如何处理同名不同类型的食材（例如"油"vs"橄榄油"）？

**建议**: 补充shopping list更新算法
```json
{
    "// ingredient_matching": "Use ingredient name normalization + category to match. E.g., 'oil', 'olive oil', '油' might be treated as same or different based on category",
    "// aggregation_logic": "Sum quantities of matching ingredients. If user manually adjusted quantity, preserve manual edit over calculated quantity"
}
```

---

### 问题3: dailyMealPlan与mealPlan的同步机制不明确

**问题**:
- 用户在daily timeline编辑（第3.4步），如何同步回mealPlan？
- 是否覆盖mealPlan中的原菜谱？还是创建新版本？
- 版本控制策略是什么？

**场景**:
```
Monday的Lunch原本是"清炒西兰花" (recipe_002)
用户在timeline上改为"番茄鸡蛋" (recipe_001)
↓
mealPlan.monday.lunch也改为recipe_001？
还是保持原值，只在dailyMealPlan中更改？
```

**建议**: 明确说明
- dailyMealPlan是mealPlan的视图还是独立副本？
- 编辑时是否生成meal edit history？

---

### 问题4: 对话框反馈(Chat Refinement)的冲突处理

**问题**:
- 用户提供contradictory feedback怎么办？
  例如："我想要素食" 但 "保留周一的红烧肉"
- 优先级如何确定？

**当前说法**:
```
"If userfeeback contradicts existing preferences, prioritize user feedback but still respect other constraints"
```

这太模糊了。需要明确的priority rules。

**建议**:
```json
{
    "priorityOrder": [
        "userFeedback (highest)",
        "preferredRecipes (must include)",
        "dietaryRestrictions (hard constraint)",
        "budget, cookTimePerMeal, moodTags (soft constraints)"
    ]
}
```

---

### 问题5: 单菜重生成(2a)的"Meal Context"定义不够清晰

**问题**:
```json
"mealContext": {
    "breakfast": "番茄鸡蛋",
    "lunch": "清炒西兰花",      // 要被替换
    "dinner": "番茄意大利面"
}
```

- 这个context仅用于同一天？
- 是否应考虑前后两天的菜谱避免重复？(例如周一、二都是番茄相关)
- 是否应考虑周内营养平衡？

**建议**: 扩展context范围
```
Include meals from adjacent days (prev day dinner, next day breakfast)
to avoid repetition across days
```

---

### 问题6: 用户自定义菜谱(Journey 2.5)的生命周期

**问题**:
- 自定义菜谱保存到哪里？
- 是临时的还是持久化的？
- 用户能否在future meal plans中复用自己的菜谱？
- 是否应该有"我的菜谱库"功能？

**当前缺失**: 
- userRecipeLibrary.json的定义
- 自定义菜谱的版本化

---

### 问题7: Cooking Schedule的灵活性

**当前**:
```json
"cookSchedule": {
    "monday": ["breakfast", "lunch", "dinner"],
    "tuesday": ["breakfast", "lunch", "dinner"],
    ...
}
```

**问题**:
- 如果用户只想周末做饭怎么办？(周一-五只breakfast+dinner)
- 如果用户想要snack呢？
- 是否应支持自定义meal types？

**建议**: 使用更灵活的方案
```json
{
    "cookSchedule": {
        "monday": ["breakfast", "dinner"],
        "friday": ["breakfast", "lunch", "dinner", "snack"],
        "saturday": ["breakfast", "lunch", "dinner"]
    }
}
```

---

### 问题8: 预算跟踪的实现细节

**问题**:
- budget是per-person per-week，但不同meal plan可能有不同成本
- 当meal plan改变，成本超预算怎么处理？
  - 是否应用户确认？
  - 是否自动调整？
  - 是否显示warning？

**缺失信息**:
- shoppingList.summary中的budgetRemaining如何计算？
- 是否考虑wastage rate？

---

### 问题9: 实时Timeline的跨日期处理

**问题**: 
```json
"// status_logic": "Determined by comparing scheduledTime with current time. 'current' if within estimatedTime window."
```

- 如果breakfast的estimatedTime是15分钟，但用户花了25分钟怎么办？
- Status何时从"current"变为"past"？以scheduledTime还是actualStartTime+estimatedTime？
- 跨越午夜的情况？

**缺失**: 状态转换的精确逻辑

---

### 问题10: AI Prompt的一致性与可控性

**问题**: 多个地方有AI请求但prompt格式和质量可能不一致
- mealPlanGenerationRequest中的generationPrompt
- chatRefinementRequest中的refinementPrompt  
- singleRecipeRegenerationRequest中的regenerationPrompt
- ingredientParsingRequest中的parsingPrompt

**建议**: 
- 建立prompt template system
- 定义output validation rules
- 配置temperature/model parameters

---

## 🔄 数据流完整性检查

### ✓ 已覆盖的转移
```
userPreferenceInput → preferenceProfile ✓
preferenceProfile → mealPlan ✓
mealPlan → shoppingList ✓
mealPlan → dailyMealPlan ✓
mealPlan ← chatRefinement (回写) ✓
mealPlan ← singleRecipeRegeneration (部分回写) ✓
mealPlan ← userCustomRecipe (追加) ✓
```

### ⚠️ 可能缺失的
```
preferenceProfile ← chatRefinement (是否应更新preferenceProfile?)
preferenceProfile ← userFeedback (应该持久化吗?)
shoppingList ← userModification (manual edit history?)
dailyMealPlan → mealPlan (back-sync逻辑不清)
```

---

## 📊 关键数据关系矩阵

```
                  mealPlan  shoppingList  dailyMealPlan  preferenceProfile
userInput              ✓        
chatFeedback          ✓ (update)  (calc)     (refresh)     ? (should update?)
customRecipe       ✓ (append)    ✓ (merge)
singleRecipeReGen     ✓ (replace) ✓ (recalc)
timeline edit         ✓ (back-sync unclear)
```

---

## 🎯 改进建议优先级

### 高优先级 (必须解决)
1. **Shopping List增量更新算法** - 直接影响购物功能正确性
2. **dailyMealPlan ↔ mealPlan同步机制** - 影响用户编辑持久化
3. **自定义菜谱生命周期** - 影响功能完整性
4. **AI Prompt一致性** - 影响AI输出质量

### 中优先级 (应该优化)
5. **版本控制与Edit History** - 便于undo/debug
6. **Cooking Schedule灵活性** - 提升用户体验
7. **预算超支处理流程** - 完整的成本控制
8. **单菜重生成的context范围** - 改善菜谱多样性

### 低优先级 (nice to have)
9. **AI参数配置** - 可后续优化
10. **用户菜谱库** - 可作为v4功能

---

## 📝 数据一致性检查

### ✓ 命名一致性
- userPreferenceInput, preferenceProfile, preferenceParsingRequest ✓
- mealPlan, mealPlanGenerationRequest ✓
- shoppingList, shoppingListGenerationRequest ✓

### ✓ 字段类型一致性
- "totalCalories": number ✓
- "unit": string ✓
- "category": from predefinedCategories ✓

### ⚠️ 潜在不一致
- recipeId在mealPlan和preferredRecipes中的用法不同
- ingredientName可能需要normalization

---

## 🏗️ 架构健康度评分

| 维度 | 分数 | 说明 |
|------|------|------|
| **完整性** | 8/10 | 覆盖主要流程，但边界情况处理不全 |
| **清晰度** | 7/10 | 主流程清晰，但复杂交互逻辑还需补充 |
| **一致性** | 8/10 | 整体一致，细节有歧义 |
| **可扩展性** | 7/10 | 数据结构灵活，但配置机制不足 |
| **AI集成** | 8/10 | 集成深度好，但prompt管理需优化 |
| **用户体验** | 7/10 | 功能完整，但冲突处理规则不明确 |
| **总体** | **7.5/10** | **良好基础，需补充边界情况和异常处理** |

---

## 📌 建议行动项

### 立即需要补充的文档
1. **Ingredient Matching & Aggregation Algorithm**
   - 如何处理同名食材的去重与合并
   - 例子：oil, 油, 橄榄油

2. **DailyMealPlan Sync Protocol**
   - Timeline编辑如何回写mealPlan
   - 版本管理策略

3. **Custom Recipe Lifecycle**
   - 保存位置、生命周期、复用规则

4. **Conflict Resolution Rules**
   - ChatRefinement中的优先级定义
   - Edge case处理

5. **AI Output Validation**
   - 每个AI请求的输出schema validation
   - 如何处理AI生成的无效数据

---

## 🎓 总体结论

**v3是一份结构合理、内容充实的产品文档**，适合进行开发。但在以下方面需要进一步明确：

1. **边界情况处理** - 多个地方的逻辑在edge cases不清
2. **双向数据同步** - 编辑后的持久化机制不明确
3. **AI质量保证** - Prompt管理和输出验证需加强
4. **用户数据管理** - 版本控制、恢复、历史记录

**建议**: 在开发前，针对上述10个问题补充详细的实现说明，特别是"问题1-5"必须解决。

---

## 📂 后续版本规划建议

### v3.1 (本周期补充)
- 解决10个identified issues
- 补充边界情况处理
- AI输出validation schema

### v4 (未来)
- 用户菜谱库与分享
- 家庭共享meal planning
- 营养达成度分析
- 食材替代建议
- 库存管理集成

