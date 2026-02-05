# OMenu UI 设计现状与规范化方案（v2）

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

> 基于 `dev_v2/frontend` 当前实现整理，包含现状设计系统与下一步规范化方案。

## 1. 视觉基调（现状）

- **整体风格**：温和、克制、偏“纸感”的奶白与浅卡其；大量圆角与柔和阴影。
- **主强调色**：低饱和绿色（`accent.base #8B9469`）。
- **视觉层级**：
  - 页面底色 `paper.base`，内容卡片 `card.base`。
  - 轻边框与柔和阴影建立层次。
- **动效**：轻微浮动与呼吸（Loading 页面为主）。

## 2. 设计 Tokens（来自 Tailwind 扩展）

文件：`dev_v2/frontend/tailwind.config.ts`

### 2.1 颜色
- **Background**
  - `paper.base #FAF9F7`
  - `paper.muted #F5F4F1`
  - `paper.dark #F0EDE8`
- **Card**
  - `card.base #FFFFFF`
  - `card.header #F8F6F2`
- **Text**
  - `text.primary #2C2C2C`
  - `text.secondary #7A7A7A`
  - `text.tertiary #999999`
  - `text.disabled #B5B5B5`
- **Accent**
  - `accent.base #8B9469`
  - `accent.light #A8AD8B`
  - `accent.orange #D97706`
  - `accent.orangeLight #FEF3E2`
- **Status**
  - `success #6B9B76`
  - `error #C67B7B`
- **Border**
  - `border.subtle #EEEBE6`
  - `border.tag #D4D0C8`
  - `border.tagSelected #A68A64`
- **Tags**
  - `tag.selectedBg #F0EBE3`
- **Meal Colors**
  - `meal.breakfast #FEF3E2`
  - `meal.lunch #E8F5E9`
  - `meal.dinner #EDE7F6`

### 2.2 字体与排版
- 默认字体：系统栈（`fontFamily.sans`）
- 常用字号：`24 / 22 / 16 / 14 / 13 / 12 / 11 / 10`
- 标签类文本：常用全大写 + tracking（`0.15em~0.22em`）

### 2.3 圆角与阴影
- 圆角：`lg 12px / xl 16px / 2xl 20px / 3xl 24px`
- 阴影：
  - `shadow-card`（主卡片）
  - `shadow-soft`（中度）
  - `shadow-btn`（按钮）

## 3. 主要布局结构

- **整体**：手机框中渲染（`#phone-screen`）
- **Header**：顶部固定，`pt-14 pb-4`
- **Body**：`overflow-y-auto` 滚动
- **BottomNav**：固定底栏，图标 `22px`，文案 `10px`

文件：`Header.tsx / BottomNav.tsx / PageContainer.tsx`

## 4. 组件与元素规范（现状）

### 4.1 Header
- 首页：左侧 `THIS WEEK / WELCOME` + 日期范围；右侧 Menubook 按钮
- Shopping：右侧加号按钮（新增 item）

### 4.2 WeekDateBar
- 周一到周日，英文缩写 + “MMM d”
- 选中态：圆角胶囊 + 底部绿条

### 4.3 DailyMenuCard
- Header：`Day` 大字 + 日期
- 元信息：dish 数量 + calorie
- 每餐一行，卡片内展示菜名、时间、份数、热量
- + 按钮：虚线圆角方框

### 4.4 Menu Book 卡片（关闭态）
- 绿色边框 + 纸感渐变
- 左侧 emoji 拼图封面
- 右侧 “This Week” 标签

### 4.5 AddMeal / Shopping Item Sheet（底部弹窗）
- Sticky header + 左侧关闭按钮 + 右侧操作按钮
- 点击字段进入编辑态
- 标题字段大字号

### 4.6 Recipe Detail Sheet
- 顶部：星期 + 餐次标签
- 主操作：Edit Notes / Delete Dish
- Ingredients 分组大写标签

### 4.7 Create 流程页面
- Back 位于左上
- 选中项置顶显示
- 底部操作区：Add + Next/Save

### 4.8 BottomNav
- MENU / LIST / PROFILE
- 图标为 Lucide 样式（22px，当前页面高亮）

## 5. 交互规范（现状）

- **手势**：
  - 日卡左右滑动切天
  - MenuBook 长按删除
- **点击规则**：
  - 列表项点击切换选中
  - Edit 打开底部弹窗
- **弹窗**：
  - 主要编辑 = Bottom Sheet
  - 确认/提示 = Center Modal

## 6. 规范化方案（建议）

### 6.1 统一组件基线
建议抽出统一组件，并替换页面直写样式：
- `PrimaryButton / SecondaryButton / GhostButton`
- `Tag / Chip / Pill`
- `BottomSheet`（统一 header + body）
- `SectionHeader`（统一标签样式）
- `Card`（统一 border + shadow）

### 6.2 统一排版尺度
- 标题：`22px/24px` 二级主标题
- 标签：`11-12px + uppercase + tracking`
- 内容：`13-14px`
- 控制小字：`10px`

### 6.3 统一交互逻辑
- “点击编辑/点击保存”统一为：
  - 明确主操作按钮（绿色）
  - 次操作（outline 或 ghost）
- Add / Edit 表单统一为底部弹窗

### 6.4 统一 icon 体系
- 保持 Lucide 风格，统一 stroke
- 强制图标尺寸 22px，stroke 1.8/2.0

## 7. 迭代路线建议（阶段性）

**阶段 1：清理一致性（1~2 次迭代）**
- 统一所有按钮/Chip/Tag 样式
- 强制 BottomSheet header 样式一致
- 统一列表项高度、间距

**阶段 2：组件化与复用**
- 将当前页面中直写组件提炼成 `ui/` 组件
- 将重复样式封装为 Tailwind 组件 class

**阶段 3：视觉打磨**
- 优化 spacing 细节（页面间距、按钮大小）
- 优化 icon stroke、图标对齐
- 微调卡片阴影与边框密度

---

如需进一步迭代，我可以先统一 “按钮/标签/底部弹窗” 三大系统，再逐页替换。EOF