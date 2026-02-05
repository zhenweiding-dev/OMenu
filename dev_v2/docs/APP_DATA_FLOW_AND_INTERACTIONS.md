# OMenu 数据流与交互总览（v2）

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

> 基于 `dev_v2/frontend` 当前实现整理，按“前端交互 ↔ 数据流动”对照梳理。

## 1. 核心数据实体（前端类型）
- **UserPreferences**：关键词、偏好项、讨厌项、人数、预算、难度、排期。
- **MenuBook**：一周菜单簿（`menus + shoppingList + preferences`）。
- **Menu**：一天菜单（Breakfast/Lunch/Dinner）。
- **Dish**：一道菜，带 `source: "ai" | "manual"`。
- **ShoppingList**：购物清单，关联 `menuBookId`。

类型定义：`dev_v2/frontend/src/types/index.ts`

## 2. 状态层与持久化

### 2.1 useAppStore（业务状态）
- **持久化**：localStorage `omenu_app_state`。
- **关键字段**：`menuBooks`、`currentWeekId`、`currentDayIndex`、`isMenuOpen`、`error`、`isGenerating`。
- **职责**：MenuBook 的增删改、Dish 的增删改、ShoppingList 条目增删改。

文件：`dev_v2/frontend/src/stores/useAppStore.ts`

### 2.2 useDraftStore（创建流程草稿）
- **持久化**：localStorage `omenu-draft`。
- **关键字段**：`currentStep`、create 相关表单、`pendingResult`（MenuBook）。
- **职责**：create 流程断点续走、生成结果临时保存（刷新不丢）。

文件：`dev_v2/frontend/src/stores/useDraftStore.ts`

### 2.3 useShoppingStore（购物页 UI 状态）
- **不持久化**：筛选、折叠、搜索、编辑态。

文件：`dev_v2/frontend/src/stores/useShoppingStore.ts`

## 3. 后端与 Mock

- **Mock 模式**：`VITE_USE_MOCK=true`（本地样本生成菜单/清单）。
- **后端模式**：`VITE_API_BASE_URL`。

API：
- `POST /api/menu-books/generate`
- `POST /api/menu-books/:id/modify`
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
  - `menuBooks`
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
- 行为：写入 `menuBooks[bookId].menus[day][meal]`，新增 `Dish`（`source="manual"`）。
- **不触发** shopping list 更新、不触发 AI。

**交互：编辑 notes / 删除菜**
- 行为：更新/删除 `menus[day][meal]` 中的对应 `Dish`。
- **不触发** shopping list 更新、不触发 AI。

文件：`dev_v2/frontend/src/pages/HomePage.tsx`

### 5.2 Create 流程（/create）

**步骤 1–6（关键词/偏好/排期）**
- 行为：写入 `useDraftStore`。
- 数据：仅本地草稿，未写 MenuBook。

**交互：Generate Menu**
- 调用：`useMenuBook.createMenu(preferences)` → `POST /menu-books/generate`。
- 结果：写入 `pendingResult`（MenuBook + 空 shoppingList），进入 Review。

**交互：Review 页面查看/修改**
- UI 与 Menu 页一致（WeekDateBar + DailyMenuCard）。
- 额外加菜：写入 `pendingResult.menus`（`source="manual"`，不触发 AI、不触发 list）。

**交互：Modify（SEND TO AI）**
- 调用：`updateMenu(menuBook, modification)` → `POST /menu-books/:id/modify`。
- 返回：新 `menus`（AI 菜）。
- 行为：
  1. 合并 manual dish（保留用户手动菜）。
  2. 触发 shopping list 生成（仅使用 `source="ai"` dishes）。
  3. 更新 `pendingResult`。

**交互：Generate Shopping List（确认保存）**
- 行为：
  1. 将 `pendingResult` 写入 `menuBooks`。
  2. 进入 ShoppingList Loading（无论是否已有 list，都走 loading）。
  3. Loading 调用 `generateShoppingList`（仅 AI dishes）。
  4. 成功后跳转 `/shopping`。

文件：`dev_v2/frontend/src/pages/CreatePlanPage.tsx`

### 5.3 Shopping 页（/shopping）
**交互：清单为空时**
- 行为：不自动生成清单，引导回 Create 生成。

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
- 行为：更新 `useDraftStore`（Profile 偏好是独立版本）。
- **不回写** `menuBooks`，历史 MenuBook 保持原样。
- 新生成菜单时读取该 Profile 偏好作为默认值。

文件：`dev_v2/frontend/src/pages/MyPage.tsx`

## 6. 错误与加载
- 全局生成状态：`useAppStore.isGenerating`。
- 错误提示：`useAppStore.error`。
- API 超时：`ApiTimeoutError`（默认 120s）。

## 7. 当前约束与约定（重点）
1. **MenuBook** 仅在用户确认（Generate Shopping List）时保存。
2. **手动 Dish 不触发 AI**，也不自动影响 Shopping List。
3. **Shopping List 仅在 Create / Modify 时生成**，且仅基于 `source === "ai"` dishes。
4. **pendingResult** 仅用于 create 流程恢复，不是通用草稿系统。
