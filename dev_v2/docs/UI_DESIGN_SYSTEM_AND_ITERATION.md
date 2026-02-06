# OMenu UI 设计系统规范与迭代计划（v2）

**Last Updated**: 2026-02-06

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

> 本文整合了「设计现状」「规范化方案」「组件样例」与「迭代计划」。HTML 视觉样例请查看 `UI_DESIGN_SYSTEM_PLAN.html`。

---

## 1. 视觉基调（现状与目标）
- **整体风格**：温和、克制、纸感；圆角 + 轻边框 + 柔和阴影。
- **主强调色**：低饱和绿色（`accent.base #8B9469`）。
- **交互目标**：同类元素完全一致、减少分裂样式、提升层级清晰度与可读性。

## 2. Design Tokens（当前基线）
文件：`dev_v2/frontend/tailwind.config.ts`

### 2.1 颜色
- **Background**：`paper.base #FAF9F7`, `paper.muted #F5F4F1`, `paper.dark #F0EDE8`
- **Card**：`card.base #FFFFFF`, `card.header #F8F6F2`
- **Text**：`text.primary #2C2C2C`, `text.secondary #7A7A7A`, `text.tertiary #999999`, `text.disabled #B5B5B5`
- **Accent**：`accent.base #8B9469`, `accent.light #A8AD8B`
- **Status**：`success #6B9B76`, `error #C67B7B`
- **Border**：`border.subtle #EEEBE6`, `border.tag #D4D0C8`
- **Meal**：`meal.breakfast #FEF3E2`, `meal.lunch #E8F5E9`, `meal.dinner #EDE7F6`

### 2.2 圆角 & 阴影
- **圆角**：`xl 16px`、`2xl 20px`、`3xl 24px`
- **阴影**：`shadow-card`, `shadow-soft`, `shadow-btn`

### 2.3 排版基线
- **标题**：`24 / 22 / 20`
- **内容**：`14 / 13`
- **标签**：`12 / 11 / 10` + uppercase + tracking

**当前建议层级**
- 主标题：`text-[22px] font-semibold`
- 表单主字段：`text-[18px] font-semibold`
- 分区标题：`text-[14px] font-semibold`
- 标签/辅助说明：`text-[11~12px] text-text-secondary`

## 3. 组件规范（统一标准）

### 3.1 Button
- **Primary**：绿色底白字（主操作）
- **Secondary/Outline**：浅底或边框（次操作）
- **Ghost**：无底色（轻量动作）
- **Danger**：红色背景

尺寸：`sm / default / lg`（统一使用 Button 组件）

### 3.2 Tag / Chip / Pill
- Tag：展示型，`border + muted text`
- Selected Tag：`accent` 文本 + `accent-soft` 背景
- Chip：可点击，hover 高亮

### 3.3 Card / Row
- **Card**：圆角 + 轻边框 + 轻阴影
- **Row**：无卡片，仅分割线 + hover

### 3.4 Modal / Bottom Sheet
- **Bottom Sheet**：编辑类，顶部 sticky header，左关闭右操作
- **Center Modal**：确认类，CTA 强对比
- **点击空白关闭**：统一支持

### 3.5 Input / Textarea
- 统一边框与圆角
- Placeholder 使用 `text-text-disabled`
- 重要字段（菜名/物品名）使用表单主字段层级

## 4. 页面级一致性规则

### Menu / Review
- WeekDateBar + DailyMenuCard 结构一致
- 三餐行统一布局，无规划时在菜品区域显示 `No planned`
- Dish 行可点击，右侧箭头提示

### Create Flow
- Back 在左上
- 底部操作区 sticky
- 选中项置顶展示

### Shopping
- 列表更紧凑，层级更明确
- 编辑/新增弹窗标题使用 `text-[18px]`

### Profile
- 与 Create 选项风格一致
- 选中 tag 样式保持一致

## 5. 交互规范
- **点击空白关闭**：所有弹窗
- **手动编辑**：点击字段进入编辑态
- **加载页面**：Go to Home 按钮使用统一按钮样式

## 6. Icon 系统与放置清单
> 统一使用 `lucide-react`，避免混用 emoji。

- **全局背景图标**：`dev_v2/frontend/src/components/layout/BackgroundFoodIcons.tsx`（在 `dev_v2/frontend/src/App.tsx` 的 `#phone-screen` 内全局启用）。
- **欢迎页圆形图案**：`dev_v2/frontend/src/pages/HomePage.tsx`、`dev_v2/frontend/src/components/create/StepWelcome.tsx`（ChefHat / Salad / Soup）。
- **生成 Loading**：
  - `dev_v2/frontend/src/components/create/StepLoading.tsx`（ChefHat + Pizza / Soup / CookingPot / Salad / Apple）。
  - `dev_v2/frontend/src/components/create/StepShoppingLoading.tsx`（ShoppingCart + Apple / LeafyGreen / Milk / Carrot）。
- **MenuBook 封面**：`dev_v2/frontend/src/components/home/MenuClosedCard.tsx`（按食材分类映射图标，fallback 在 `dev_v2/frontend/src/utils/constants.ts`）。
- **偏好/不喜欢标签**：`dev_v2/frontend/src/utils/constants.ts`（`PREFERENCE_TAGS` / `DISLIKE_TAGS`）。
- **Daily Menu**：`dev_v2/frontend/src/components/home/DailyMenuCard.tsx`（Sunrise / Sun / Moon + UtensilsCrossed / Flame）。
- **空态**：`dev_v2/frontend/src/components/home/EmptyState.tsx`（BookOpen），`dev_v2/frontend/src/pages/ShoppingPage.tsx`（ShoppingCart）。
- **Shopping 分类**：`dev_v2/frontend/src/pages/ShoppingPage.tsx` 使用 `INGREDIENT_CATEGORY_DETAILS`。

## 7. 迭代计划（当前阶段）
1. **统一样式基线**（按钮/标签/弹窗/标题层级）
2. **统一页面组件**（Menu/Review/Shopping/Profile）
3. **统一空态与加载**（Loading + Empty State）
4. **微调间距**（减少底部异常留白）

---

## 8. HTML 视觉样例
- 预览文件：`dev_v2/docs/UI_DESIGN_SYSTEM_PLAN.html`
- 用途：快速对照按钮、标签、卡片、列表、弹窗
