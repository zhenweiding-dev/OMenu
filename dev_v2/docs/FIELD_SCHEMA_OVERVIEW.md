# OMenu 全字段结构表（前后端对照）

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

> 目标：用一张清晰的“字段地图”统一前后端语义，便于后续重构与命名清理。

## 1. 前端类型（TypeScript）

### 1.1 `UserState`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `preferences` | `UserPreferences \| null` | 用户偏好（关键字/人数/预算等） |
| `menuBooks` | `MenuBook[]` | 每周菜单簿集合 |
| `currentWeekId` | `string \| null` | 当前选中菜单簿 |
| `currentDayIndex` | `number` | 当前选中天（0-6） |
| `isMenuOpen` | `boolean` | Menu 页是否展开视图 |

来源：`dev_v2/frontend/src/types/index.ts`

### 1.2 `MenuBook`（一周）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 菜单簿 ID |
| `createdAt` | `string` | 生成时间（ISO，可能带微秒） |
| `status` | `"generating" \| "ready" \| "error"` | 生成状态 |
| `preferences` | `UserPreferences` | 生成时使用的偏好 |
| `menus` | `WeekMenus` | 一周 7 天菜单（按天） |
| `shoppingList` | `ShoppingList` | 购物清单（生成时先占位空列表） |

### 1.3 `Menu`（一天）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `breakfast` | `Dish[]` | 早餐菜谱集合 |
| `lunch` | `Dish[]` | 午餐菜谱集合 |
| `dinner` | `Dish[]` | 晚餐菜谱集合 |

### 1.4 `Dish`（一道菜）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 菜谱 ID |
| `name` | `string` | 名称 |
| `ingredients` | `Ingredient[]` | 食材 |
| `instructions` | `string` | 做法 |
| `estimatedTime` | `number` | 时间（分钟） |
| `servings` | `number` | 份数 |
| `difficulty` | `Difficulty` | 难度 |
| `totalCalories` | `number` | 热量 |
| `source` | `"ai" \| "manual"` | 来源（AI 或手动） |
| `notes` | `string \| null \| undefined` | 备注（可能为空） |

### 1.5 `ShoppingList`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 清单 ID |
| `menuBookId` | `string` | 关联菜单簿 ID |
| `createdAt` | `string` | 生成时间 |
| `items` | `ShoppingItem[]` | 条目集合 |

### 1.6 `ShoppingItem`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 条目 ID |
| `name` | `string` | 名称 |
| `category` | `IngredientCategory` | 分类 |
| `totalQuantity` | `number` | 数量 |
| `unit` | `string` | 单位 |
| `purchased` | `boolean` | 是否已购买 |
| `isManuallyAdded` | `boolean \| undefined` | 是否为手动新增 |

### 1.7 `UserPreferences`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `keywords` | `string[]` | 关键词 |
| `preferredItems` | `string[]` | 偏好项（希望本周出现即可） |
| `dislikedItems` | `string[]` | 讨厌项 |
| `numPeople` | `number` | 人数 |
| `budget` | `number` | 预算 |
| `difficulty` | `Difficulty` | 难度 |
| `cookSchedule` | `CookSchedule` | 排期 |

来源：`dev_v2/frontend/src/types/index.ts`

## 2. 后端模型（Pydantic）

> 后端字段与前端一致（无历史兼容字段）。

### 2.1 `UserState`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `preferences` | `UserPreferences \| None` | 用户偏好 |
| `menuBooks` | `list[MenuBook]` | 菜单簿 |
| `currentWeekId` | `str \| None` | 当前周 |
| `currentDayIndex` | `int` | 当前天 |
| `isMenuOpen` | `bool` | Menu 展开态 |

### 2.2 `MenuBook`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `str` | 菜单簿 ID |
| `createdAt` | `datetime` | 生成时间（序列化为 ISO 字符串） |
| `status` | `MenuBookStatus` | 状态 |
| `preferences` | `UserPreferences` | 生成偏好 |
| `menus` | `WeekMenus` | 一周菜单 |
| `shoppingList` | `ShoppingList` | 清单 |

### 2.3 `Menu` / `Dish`
与前端一致：
- `Menu` 按早餐/午餐/晚餐分组
- `Dish` 包含 `source: "ai" | "manual"`

来源：`dev_v2/backend/app/models/schemas.py`

## 3. 前后端字段映射（关键字段）

| 领域 | 前端 | 后端 | 备注 |
| --- | --- | --- | --- |
| 菜单簿 | `menuBooks` | `menuBooks` | 一周一本菜单簿 |
| 一周菜单 | `MenuBook.menus` | `MenuBook.menus` | 7 天菜单 |
| 一道菜 | `Dish` | `Dish` | `source` 标注来源 |
| 清单 | `shoppingList` | `shoppingList` | 一周对应一份清单 |
| 偏好 | `preferences` | `preferences` | 语义一致 |

## 4. 规则与约束（重要）
1. **命名统一**：
   - 一周：`MenuBook`
   - 一天：`Menu`
   - 一餐：`meal`（字段 `breakfast/lunch/dinner`）
   - 一道菜：`Dish`
2. **来源字段**：每道菜必须携带 `source`，用于区分 `ai` / `manual`。
3. **购物清单生成**：
   - **仅在创建和修改（AI 交互）时触发**。
   - 手动增删改菜不触发清单重算。
   - 生成清单时仅使用 `source === "ai"` 的菜。

## 5. 当前字段一览（精简版）

```
UserState
  preferences
  menuBooks[]
    id
    createdAt
    status
    preferences
    menus
      monday..sunday
        breakfast[], lunch[], dinner[]
          Dish(id, name, ingredients, instructions, estimatedTime, servings, difficulty, totalCalories, source, notes)
    shoppingList
      id, menuBookId, createdAt, items[]
  currentWeekId
  currentDayIndex
  isMenuOpen
```
