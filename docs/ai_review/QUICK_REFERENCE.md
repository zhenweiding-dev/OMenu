# OMenu v3 快速参考 (Quick Reference)

## 核心产品流程 (5分钟版本)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: 用户设置偏好 (Preference Collection)                 │
└─────────────────────────────────────────────────────────────┘

1.1 主界面输入 (Unified UI)
    输入框: "What do you want to eat this week?"
    + 可滚动tag (mood + 推荐菜谱)
    → userPreferenceInput.json

1.2 基础设置
    人数 (default 1) + 难度 (easy/medium/hard)
    → basicPreferences.json

1.3 高级设置 (右上角)
    mood tags (default: budget friendly)
    + 饮食限制 + 预算 + 做饭时间 + 偏好菜系
    → extendedPreferences.json

1.4 AI解析
    [All inputs] → AI parsing → preferenceProfile.json ✓

1.5 AI生成Plan
    preferenceProfile → AI generation → mealPlan.json ✓

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Shopping List (AI自动生成)                          │
└─────────────────────────────────────────────────────────────┘

2.1 AI分类食材
    mealPlan (所有食材)
    → AI extraction + categorization (9类)
    → shoppingList.json ✓

2.2 显示购物清单
    按类别展示 (proteins, vegetables, grains等)
    用户可勾选/添加/删除/调整数量

┌─────────────────────────────────────────────────────────────┐
│ STEP 2.5: 添加自定义菜谱 (Optional)                         │
└─────────────────────────────────────────────────────────────┘

2.5.1 用户输入
    菜谱名 + 烹饪步骤 (自由文本)
    → userCustomRecipeInput.json

2.5.2 AI解析食材
    AI提取: 食材 + 数量 + 时间 + 卡路里
    → ingredientParsingResult.json ✓

2.5.3 添加到计划
    选择日期/餐次
    → 更新 mealPlan + shoppingList ✓

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: 日常执行 (Daily Timeline)                           │
└─────────────────────────────────────────────────────────────┘

3.1 显示今日菜单 (Timeline)
    breakfast (upcoming/current/past)
    lunch (upcoming/current/past)
    dinner (upcoming/current/past)
    
    状态自动更新 (每分钟)
    显示卡路里

3.2 用户交互 - 3种模式

    [模式1] 对话框反馈 (Chat Refinement)
    ─────────────────────────────────
    "Refine Plan" → 输入反馈
    "Add more vegetarian, less pasta"
    → AI重生整周 → 更新mealPlan + shoppingList ✓
    
    [模式2a] 单菜重生成 (Single Recipe Regen)
    ─────────────────────────────────
    点击菜谱 → "Regenerate"
    → AI生成替代菜谱
    → 更新mealPlan + shoppingList ✓
    
    [模式2b] 删除菜谱 (Delete)
    ─────────────────────────────────
    点击菜谱 → "Delete"
    → 移除菜谱，相关食材从shopping list删除
    
    [模式2c] 移到其他日期 (Move)
    ─────────────────────────────────
    点击菜谱 → "Move to another date"
    → 选择目标日期/餐次
    → 食材保持不变
    
    [模式3] Timeline编辑 (Direct Edit)
    ─────────────────────────────────
    直接在timeline上编辑
    (add/delete/replace meals)
    → 保存时自动更新mealPlan + shoppingList
```

---

## 数据模型速查

### 关键JSON文件 (9个)

| 文件 | 用途 | 来源 | 去向 |
|------|------|------|------|
| **userPreferenceInput** | 用户输入 (mood + 菜谱) | 用户UI | AI解析 |
| **basicPreferences** | 人数 + 难度 | 用户UI | AI解析 |
| **extendedPreferences** | 预算 + 饮食 + 时间等 | 用户UI | AI解析 |
| **preferenceProfile** | 标准化后的偏好 | AI解析 | AI生成 |
| **mealPlan** | 周菜单 (含卡路里) | AI生成 | 显示+生成shopping list |
| **shoppingList** | 分类食材清单 | AI生成 | 显示+用户编辑 |
| **dailyMealPlan** | 今日timeline | 派生自mealPlan | 显示+用户编辑 |
| **userCustomRecipeInput** | 自定义菜谱 (free text) | 用户输入 | AI解析 |
| **ingredientParsingResult** | 解析后的菜谱 | AI解析 | 添加到mealPlan |

### 字段快速参考

```
每个菜谱包含:
  - recipeName: "番茄鸡蛋"
  - totalCalories: 180 (必须有!)
  - estimatedTime: 15 分钟
  - servings: 2 人份
  - ingredients: [{name, quantity, unit}]
  - difficulty: "easy"

每个食材包含:
  - name: "tomato"
  - quantity: 300
  - unit: "g"
  - category: "vegetables" (9类中选1)
```

---

## 关键流程与API (AI请求)

### 1️⃣ 解析偏好
```
INPUT: userPreferenceInput + basicPreferences + extendedPreferences
AI_REQUEST: preferenceParsingRequest
OUTPUT: preferenceProfile.json

Prompt: "解析并标准化用户输入为完整的偏好配置文件"
```

### 2️⃣ 生成菜单
```
INPUT: preferenceProfile
AI_REQUEST: mealPlanGenerationRequest
OUTPUT: mealPlan.json

Prompt: "基于偏好生成周菜单, 必须包含所有preferred recipes, 
        尊重所有饮食限制, 保证营养平衡, 必须包含totalCalories"
```

### 3️⃣ 生成购物清单
```
INPUT: mealPlan
AI_REQUEST: shoppingListGenerationRequest
OUTPUT: shoppingList.json

Prompt: "从菜单提取所有食材, 按9类分类, 求和相同食材数量"
```

### 4️⃣ 解析自定义菜谱
```
INPUT: userCustomRecipeInput (free text)
AI_REQUEST: ingredientParsingRequest
OUTPUT: ingredientParsingResult.json

Prompt: "从菜谱文本提取: 食材名+数量+单位+做饭时间+卡路里+难度"
```

### 5️⃣ 对话框反馈 (重生整周)
```
INPUT: currentMealPlan + userFeedback + preferenceProfile
AI_REQUEST: chatRefinementRequest
OUTPUT: mealPlan.json (新的)

Prompt: "基于用户反馈重新生成周菜单, 
        反馈优先级最高, 但保持其他约束"
```

### 6️⃣ 单菜重生成
```
INPUT: currentRecipe + mealContext (周围菜谱)
AI_REQUEST: singleRecipeRegenerationRequest
OUTPUT: 单个新菜谱

Prompt: "替换该菜, 避免重复, 考虑周围菜的营养平衡"
```

---

## 用户交互速查

### 用户看到的UI

```
┌─ APP 首页 ──────────────────────────┐
│                                      │
│  "What do you want to eat?"          │
│  ┌──────────────────────────────┐   │
│  │ [输入框] 想吃什么...         │   │
│  └──────────────────────────────┘   │
│                                      │
│  ☑ healthy  ☑ budget friendly       │
│  ☐ quick meals  ☐ vegetarian        │
│  ☐ (可滚动更多tag)                  │
│                                      │
│  ┌─ 人数: 1 ┐  难度: [easy ▼]      │
│  └──────────┘                       │
│                                      │
│  [⚙️ 高级设置] [生成菜单]          │
│                                      │
└──────────────────────────────────────┘

⏳ 生成中...

┌─ 周菜单 ─────────────────────────────┐
│                                       │
│ 周一                                  │
│  🍳 早餐: 番茄鸡蛋 (180 cal)         │
│     [🔄 更新] [删除] [移动]          │
│  🍛 午饭: 清炒西兰花 (220 cal)       │
│     [🔄 更新] [删除] [移动]          │
│  🍝 晚饭: 番茄意大利面 (450 cal)     │
│     [🔄 更新] [删除] [移动]          │
│                                       │
│ (可向下滚动查看周二-周日)             │
│                                       │
│ [查看购物清单]  [优化菜单反馈]       │
│                                       │
└───────────────────────────────────────┘

┌─ 今日菜单 (Timeline) ──────────────┐
│                                     │
│ ⏰ 12:32 (当前时间)                 │
│                                     │
│ ✓ 早饭 (08:00) 番茄鸡蛋 15分钟     │
│   ✓ 已完成                          │
│                                     │
│ 🍽️ 午饭 (12:30) 清炒西兰花 20分钟  │
│    正在进行中... ⏱️ 02:00           │
│    [⏹️ 标记完成]                    │
│                                     │
│ ⏰ 晚饭 (19:00) 番茄意大利面 25分钟 │
│    9小时后                          │
│                                     │
│ [+ 添加菜谱] [💬 优化菜单]          │
│                                     │
└─────────────────────────────────────┘

┌─ 购物清单 ────────────────────────┐
│                                    │
│ Proteins (蛋白质)                 │
│  ☐ 鸡蛋 12个 $8.99               │
│                                    │
│ Vegetables (蔬菜)                 │
│  ☑ 西兰花 800g $5.50             │
│  ☐ 番茄 300g $3.20               │
│                                    │
│ Grains (谷物)                     │
│  ☐ 意大利面 200g $2.50           │
│                                    │
│ 总计: $65.50 / 预算 $70 ✓        │
│                                    │
│ [+ 添加项目]                      │
│                                    │
└────────────────────────────────────┘
```

---

## 状态转换图

### Timeline Meal Status
```
upcoming → current → past
                      (或 current_overtime)

显示规则:
  ⏰ = upcoming (灰色)
  🍽️  = current (高亮)
  ✓ = past (置灰)
```

### MealPlan Lifecycle
```
生成
  mealPlan v1
    ↓ (用户在timeline编辑)
  dailyMealPlanChanges (pending)
    ↓ (用户点保存)
  mealPlan v1 (updated) ✓
    ↓ (用户点"优化菜单")
  chatRefinementRequest
    ↓ (AI重生)
  mealPlan v2 (replaced) ✓
```

---

## 常见场景处理

### 场景1: 用户想吃新菜谱

```
用户: "我想添加自己的菜"
→ Click "+自定义菜谱"
→ 输入: 名字 + 步骤 (自由文本)
→ AI解析食材
→ 选择哪天吃
→ 更新 mealPlan + shoppingList ✓
```

### 场景2: 午饭不想吃这个

```
用户: 点击"清炒西兰花"
→ Click "🔄 更新"
→ AI生成替代菜 (考虑今天其他菜)
→ 更新 mealPlan + shoppingList ✓
```

### 场景3: 想重新调整整周菜单

```
用户: Click "💬 优化菜单"
→ 输入: "周三周四多素食, 不要意大利面"
→ [系统显示"保存前请确认冲突"]
  (如果与素食限制冲突)
→ AI重生整周
→ 完全替换 mealPlan + shoppingList ✓
```

### 场景4: 预算超了

```
AI生成菜单 cost = $165 (超过 $140 预算)
→ 系统提示用户
→ 用户选择:
   a) 接受 ($165)
   b) 让AI优化成本
   c) 修改偏好重新生成
   d) 手动调整菜谱
```

---

## 开发建议

### Backend需要实现的API

```
1. POST /preferences/parse
   Input: userPreferenceInput + basicPreferences + extendedPreferences
   Output: preferenceProfile
   
2. POST /mealplan/generate
   Input: preferenceProfile
   Output: mealPlan (with totalCalories per recipe)
   
3. POST /shoppinglist/generate
   Input: mealPlan
   Output: shoppingList (9类)
   
4. POST /recipe/parse
   Input: userCustomRecipeInput (free text)
   Output: ingredientParsingResult
   
5. POST /mealplan/chat-refine
   Input: currentMealPlan + userFeedback + preferenceProfile
   Output: mealPlan (new)
   
6. POST /recipe/regenerate-single
   Input: currentRecipe + mealContext + preferenceProfile
   Output: newRecipe
   
7. PUT /mealplan/timeline-sync
   Input: dailyMealPlanChanges
   Output: updated mealPlan + shoppingList
```

### Frontend需要实现的界面

```
- Preference collection (Step 1.1-1.3)
- Meal plan display (list view + calendar view)
- Daily timeline (real-time update every minute)
- Shopping list (by category, with checkboxes)
- Chat refinement dialog
- Recipe action menu (regenerate/delete/move)
- Custom recipe input modal
- Budget warning + options
```

### Database需要存储

```
✓ preferenceProfile (per user)
✓ mealPlan (versioned: mealPlan_v1, v2, v3...)
✓ shoppingList (current)
✓ userRecipeLibrary (custom recipes)
✓ mealPlanChangeLog (audit trail)
? ingredientNormalizationMap (for food item merging)
```

---

## 测试检查清单

- [ ] Prefer Recipe必须出现在生成的mealPlan中
- [ ] 所有菜谱必须包含totalCalories
- [ ] Shopping list求和正确 (相同食材合并)
- [ ] Timeline状态每分钟自动更新
- [ ] ChatRefinement反馈正确应用 (优先级)
- [ ] 预算超标时显示warning
- [ ] 自定义菜谱食材正确解析
- [ ] 删除菜谱时shoppingList同步删除
- [ ] 移动菜谱时食材数量不变
- [ ] 并发编辑时没有数据冲突

---

## 常见问题 (FAQ)

**Q: 菜谱重复了怎么办?**
A: 单菜重生成时考虑前后两天, 避免>60%相似度的菜谱

**Q: 用户手动改shopping list的数量, 后来菜单改了怎么办?**
A: 保存用户手动编辑的数量, 不被计算覆盖

**Q: 自定义菜谱可以复用吗?**
A: 是的, 保存到userRecipeLibrary, 下次生成菜单时可选

**Q: 没有网络的时候可以用吗?**
A: 离线模式可显示当前mealPlan + shoppingList (不能重生成)

**Q: 一个食材多个单位 (油15ml vs 半杯油) 怎么处理?**
A: AI解析时标准化为metric units (ml), shopping list展示时可选转换

