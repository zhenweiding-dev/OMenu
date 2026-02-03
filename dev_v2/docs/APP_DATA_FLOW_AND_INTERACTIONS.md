# OMenu 数据流与交互总览（v2）

> 基于 `dev_v2/frontend` 当前实现整理（包含 mock/后端两种模式）。

## 1. 关键数据实体

- **UserPreferences**：关键词、必备项、讨厌项、人数、预算、难度、每周做饭排期。
- **MealPlan**：一周菜单（按周生成），包含 `preferences` 与 `days`（七天三餐）。
- **ShoppingList**：购物清单，关联 `mealPlanId`。
- **MenuBook**：每周一本菜单簿（`mealPlan + shoppingList`）。

类型定义参考：`dev_v2/frontend/src/types/index.ts`

## 2. 状态与存储层

### 2.1 App 全局状态（`useAppStore`）
- 保存：`menuBooks`、`currentWeekId`、`currentDayIndex`、`isMenuOpen`、`error`、`isGenerating`、`activeMeal`。
- 持久化：`omenu_app_state`（localStorage）。
- 主要职责：
  - MenuBook 的增删改（`addMenuBook / updateMenuBook / deleteMenuBook`）。
  - 当前周、当前日管理。
  - 菜谱详情（notes 更新、删除主菜）。
  - 购物清单增删改。

文件：`dev_v2/frontend/src/stores/useAppStore.ts`

### 2.2 Create 流程草稿（`useDraftStore`）
- 保存：创建过程选项、`currentStep`、`pendingResult`。
- 持久化：`omenu-draft`（localStorage）。
- 主要职责：
  - 创建流程（keywords/must-have/disliked/people/budget/difficulty/schedule）。
  - 断点续走（`currentStep`）。
  - 生成后结果临时存储（`pendingResult`），避免刷新卡死。

文件：`dev_v2/frontend/src/stores/useDraftStore.ts`

### 2.3 额外加菜（`useMenuExtrasStore`）
- 仅前端内存，不持久化。
- 逻辑：
  - 如果某餐已经有主菜，新增会作为 **extra**（不覆盖）。
  - 支持 notes 编辑与删除 extra。
- 注意：**extra 不会写入 MenuBook/后端**，刷新会消失。

文件：`dev_v2/frontend/src/stores/useMenuExtrasStore.ts`

### 2.4 购物页 UI 状态（`useShoppingStore`）
- 过滤、折叠、搜索、编辑态等。

文件：`dev_v2/frontend/src/stores/useShoppingStore.ts`

## 3. 后端与 Mock

- **Mock 模式**：`VITE_USE_MOCK=true`。生成菜单/清单用本地样本。
- **后端模式**：调用 `VITE_API_BASE_URL`。

接口：
- `POST /api/meal-plans/generate`
- `POST /api/meal-plans/:id/modify`
- `POST /api/shopping-lists/generate`
- `GET /api/user-state`
- `PUT /api/user-state`

文件：`dev_v2/frontend/src/services/api.ts`

## 4. 启动与远端同步流程（App.tsx）

1. **启动读取**：
   - 如果 `VITE_USE_MOCK=true`：不读后端，只标记 `remoteStateReady`。
   - 否则 `fetchUserState()`：
     - 同步 menuBooks / currentWeekId / currentDayIndex / isMenuOpen / preferences。

2. **Mock 补充**：
   - 如果 mock 模式且 menuBooks 为空，则加载 `mockMenuBooks`。

3. **保存回写**：
   - 后端模式下，600ms debounce 保存 `userState`：
     - `preferences`（来自 draft）
     - `menuBooks`
     - `currentWeekId / currentDayIndex / isMenuOpen`

文件：`dev_v2/frontend/src/App.tsx`

## 5. 页面流程与交互

### 5.1 Menu 页（Home）
**路径**：`/`

- **无当前周菜单**：显示 `StepWelcome`（WELCOME + 日期 + 引导）。
- **有菜单**：显示 `WeekDateBar + DailyMenuCard`，支持左右滑动切天。
- **菜单簿（Menu Book）**：点击右上角打开，列表含已有菜单 + 缺口周的占位“Add Menu”。
- **长按删除**：Menu Book 长按触发删除确认。

**菜谱操作**：
- 点菜进入详情（`RecipeDetailSheet`，可编辑 notes / 删除）。
- “+” 添加菜（`AddMealModal`）：
  - 若该餐已有主菜，则作为 extra；否则替换主菜。

文件：`dev_v2/frontend/src/pages/HomePage.tsx`

### 5.2 Create 流程（生成菜单）
**路径**：`/create`

**Step 流程**：
1. Welcome
2. Keywords
3. Must-Have
4. Disliked
5. People & Budget
6. Schedule
7. Loading
8. Review（Plan Overview）
9. Shopping Loading

**生成逻辑**：
- `handleGenerate` → `useMealPlan.createPlan(preferences)`
- 得到 `plan + placeholderList`：
  - 保存到 `result` + `pendingResult`
  - 进入 Review

**Review 逻辑**：
- UI 与 Menu 页一致（WeekDateBar + DailyMenuCard + AddMeal + RecipeDetail）。
- “Modify” → 调 `modifyMealPlan`，并立即生成 list（但 **不写入 MenuBook**）。
- “Generate Shopping List” → **此时才写 MenuBook**。

**保存时机**（关键约束）：
- 生成结果默认不写入 menuBooks。
- 只有用户点击 “Generate Shopping List” 才真正保存到 menuBooks。

**刷新恢复**：
- 如果处于 loading/review 并有 `pendingResult`，会直接恢复 review。
- 若无 `pendingResult`，回到 schedule，避免卡死。

文件：`dev_v2/frontend/src/pages/CreatePlanPage.tsx`

### 5.3 Shopping List 页
**路径**：`/shopping`

- 依赖 `currentMenuBook.shoppingList`。
- 行点击：直接标记完成。
- 右侧 `EDIT`：打开编辑弹窗。
- 添加/编辑弹窗：与添加菜一致（底部 sheet）。

文件：`dev_v2/frontend/src/pages/ShoppingPage.tsx`

### 5.4 Profile 页
**路径**：`/me`

- 展示当前偏好（来自最近 menuBook 或 draft）。
- 编辑弹窗与创建步骤一致：
  - 选中项置顶
  - 底部 Add + Save

文件：`dev_v2/frontend/src/pages/MyPage.tsx`

## 6. 错误与加载状态

- 全局生成状态：`useAppStore.isGenerating`。
- 错误消息：`useAppStore.error`（页面底部显示）。
- API 超时：`ApiTimeoutError`（120s）。

## 7. 已知关键限制

1. **Extra dishes 不持久化**（useMenuExtrasStore 仅内存）。
2. **MenuBook 只在 Generate Shopping List 时保存**。
3. **pendingResult 恢复仅用于 create 流程**，不是通用“未保存菜单”。

---

如需调整：
- 是否让 review 阶段也写 MenuBook（标记未确认）？
- 是否把 extra dishes 写入 MenuBook 并同步后端？
- 是否把 pendingResult 改为后端临时保存？
