# OMenu 数据流与交互总览（v2）

> 基于 `dev_v2/frontend` 当前实现整理，按“前端交互 ↔ 数据流动”对照梳理。

## 1. 核心数据实体（前端类型）

- **UserPreferences**：关键词、必备项、讨厌项、人数、预算、难度、排期。
- **MealPlan**：一周菜单（7 天 × 3 餐），包含 `preferences` 与 `days`。
- **ShoppingList**：购物清单，关联 `mealPlanId`。
- **MenuBook**：每周一本菜单簿（`mealPlan + shoppingList + extraMeals`）。
- **extraMeals**：额外加菜（每周、每天、每餐的数组）。

类型定义：`dev_v2/frontend/src/types/index.ts`

## 2. 状态层与持久化

### 2.1 useAppStore（全局业务状态）
- **持久化**：localStorage `omenu_app_state`。
- **关键字段**：`menuBooks`、`currentWeekId`、`currentDayIndex`、`isMenuOpen`、`error`、`isGenerating`。
- **职责**：
  - MenuBook 的增删改。
  - 当前周/当前日。
  - 购物清单条目增删改。
  - 额外加菜（extraMeals）的增删改与 notes 编辑。

文件：`dev_v2/frontend/src/stores/useAppStore.ts`

### 2.2 useDraftStore（创建流程草稿）
- **持久化**：localStorage `omenu-draft`。
- **关键字段**：`currentStep`、create 相关表单、`pendingResult`（plan/list/extraMeals）。
- **职责**：
  - create 流程断点续走。
  - 生成结果临时保存（刷新不丢）。

文件：`dev_v2/frontend/src/stores/useDraftStore.ts`

### 2.3 useShoppingStore（购物页 UI 状态）
- **不持久化**：过滤、折叠、搜索、编辑态。

文件：`dev_v2/frontend/src/stores/useShoppingStore.ts`

## 3. 后端与 Mock

- **Mock 模式**：`VITE_USE_MOCK=true`，本地样本生成计划/清单。
- **后端模式**：`VITE_API_BASE_URL`。

API：
- `POST /api/meal-plans/generate`
- `POST /api/meal-plans/:id/modify`
- `POST /api/shopping-lists/generate`
- `GET /api/user-state`
- `PUT /api/user-state`

文件：`dev_v2/frontend/src/services/api.ts`

## 4. 全局同步（App 级）

**启动加载 → 状态同步**
1. App 初始化：读取后端 user-state（或 mock）。
2. 写入 `useAppStore`：menuBooks / currentWeekId / currentDayIndex / isMenuOpen。
3. 写入 `useDraftStore`：preferences。

**定时保存 → 后端**
- 后端模式下，600ms debounce 保存：
  - `preferences`（来自 draft）
  - `menuBooks`（含 extraMeals）
  - `currentWeekId / currentDayIndex / isMenuOpen`

文件：`dev_v2/frontend/src/App.tsx`

## 5. 页面交互 ↔ 数据流映射

### 5.1 Menu 页（/）

**交互：选择周菜单（MenuBook Picker）**
- 行为：点击 MenuBook → `setCurrentWeekId` + `setCurrentDayIndex(0)`。
- 数据：仅更新 `useAppStore`，不触发 API。

**交互：切换天（WeekDateBar / 滑动）**
- 行为：更新 `currentDayIndex`。
- 数据：仅本地状态。

**交互：点击菜谱查看详情**
- 行为：打开 `RecipeDetailSheet`。
- 数据：只读，不触发 API。

**交互：在菜单中添加菜**
- 入口：`AddMealModal`。
- 分支：
  - 该餐已有主菜 → 写入 `menuBooks[bookId].extraMeals`。
  - 该餐无主菜 → 写入 `menuBooks[bookId].mealPlan.days`。
- **不触发** shopping list 更新、不触发 AI。

**交互：编辑 notes / 删除菜**
- 若是主菜：更新 `mealPlan.days`。
- 若是 extra：更新 `extraMeals`。
- **不触发** shopping list 更新、不触发 AI。

文件：`dev_v2/frontend/src/pages/HomePage.tsx`

### 5.2 Create 流程（/create）

**步骤 1–6（关键词/偏好/排期）**
- 行为：写入 `useDraftStore`。
- 数据：仅本地草稿，未写 MenuBook。

**交互：Generate Plan**
- 调用：`useMealPlan.createPlan(preferences)` → `POST /meal-plans/generate`。
- 结果：
  - 写入 `pendingResult`（plan + 空 list + empty extraMeals）。
  - 进入 Review。

**交互：Review 页面查看/修改**
- UI 与 Menu 页一致（WeekDateBar + DailyMenuCard）。
- 额外加菜：写入 `pendingResult.extraMeals`（不触发 AI、不触发 list）。
- 修改主菜：写入 `pendingResult.plan`。

**交互：Modify（SEND TO AI）**
- 调用：`modifyMealPlan(planId, modification, currentPlan)`。
- 返回：新 `plan`（**不生成 shopping list**）。
- 写入：仅更新 `pendingResult.plan`，`pendingResult.list` 保持不变（通常为空占位）。
- **注意**：仍不写 MenuBook（未确认）。

**交互：Generate Shopping List（确认保存）**
- 行为：
  1. 将 `pendingResult` 写入 `menuBooks`（含 extraMeals）。
  2. 调用 `generateShoppingList` 生成清单（shopping list **在此时才生成**）。
  3. 成功后跳转 `/shopping`。

**交互：Shopping Loading**
- 调用：`generateShoppingList`。
- 成功：更新 list，清空 draft，跳转购物页。
- 失败：停留本页，可 retry 或返回。

文件：`dev_v2/frontend/src/pages/CreatePlanPage.tsx`

### 5.3 Shopping 页（/shopping）

**交互：购物清单为空时生成**
- 行为：`generateList(mealPlan)` → 更新 `menuBooks[bookId].shoppingList`。
- **不受 extraMeals 影响**。

**交互：点击条目完成/取消**
- 行为：`updateShoppingItem` 切换 `purchased`。

**交互：添加条目**
- 行为：`addShoppingItem`，标记 `isManuallyAdded=true`。

**交互：编辑条目**
- 行为：`updateShoppingItem`。

**交互：删除条目**
- 行为：`removeShoppingItem`。

文件：`dev_v2/frontend/src/pages/ShoppingPage.tsx`

### 5.4 Profile 页（/me）

**交互：编辑关键词/偏好**
- 行为：仅更新 `useDraftStore`（Profile 偏好是独立版本）。  
- **不回写** `menuBooks`，历史 MealPlan 保持原样。  
- 新生成计划时读取该 Profile 偏好作为默认值。  

文件：`dev_v2/frontend/src/pages/MyPage.tsx`

## 6. 错误与加载

- 全局生成状态：`useAppStore.isGenerating`。
- 错误提示：`useAppStore.error`。
- API 超时：`ApiTimeoutError`（120s）。

## 7. 当前约束与约定

1. **MenuBook 只在用户确认（Generate Shopping List）时保存**。
2. **extraMeals 不会触发购物清单更新，也不触发 AI**。
3. **pendingResult 仅用于 create 流程恢复，不是通用草稿系统**。
