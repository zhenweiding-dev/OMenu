# OMenu 测试检查清单

用于验证 vibe coding 生成的代码是否符合设计规范的快速检查清单。

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

---

## 🏠 Menu Book 页面

### Menu Open (默认首页)

**布局**
- [ ] Header 显示 "THIS WEEK"（绿色大写，letter-spacing: 1.5px）
- [ ] Header 显示日期范围（灰色小字，如 "Jan 27 – Feb 2"）
- [ ] 右上角有网格按钮
- [ ] 显示 7 个滑动指示点
- [ ] 当前日期的点是绿色拉长的
- [ ] 底部导航显示 Plan / List / Me

**Daily Card**
- [ ] 周几显示大字（24px, font-weight 700）
- [ ] 日期显示小字（13px, 灰色）
- [ ] 显示餐数统计（🍽️ X meals）
- [ ] 显示卡路里统计（🔥 X cal）
- [ ] 右上角有虚线 + 按钮
- [ ] 卡片圆角为 20px

**Meal Item**
- [ ] 早餐图标背景色 #FEF3E2（暖橙）
- [ ] 午餐图标背景色 #E8F5E9（浅绿）
- [ ] 晚餐图标背景色 #EDE7F6（浅紫）
- [ ] 显示餐类型（BREAKFAST/LUNCH/DINNER 大写）
- [ ] 显示菜名（15px 粗体）
- [ ] 显示时间和份数
- [ ] 卡路里数字为绿色

**交互**
- [ ] 左右滑动可切换日期
- [ ] 滑动时指示点跟随变化
- [ ] 点击餐食打开详情 Modal
- [ ] 点击网格按钮进入 Menu Closed

### Menu Closed (菜单本网格)

**布局**
- [ ] 左上角有返回按钮
- [ ] Header 显示 "MY MENUS"
- [ ] 两列网格布局
- [ ] 当前周卡片顶部有绿色 "THIS WEEK" 标签

**Menu Book Card**
- [ ] 显示食物 emoji 封面
- [ ] 显示日期范围
- [ ] 显示统计（X meals · $X）
- [ ] 圆角 16px

**Add New Card**
- [ ] 虚线边框
- [ ] 显示 + 图标和 "New Menu" 文字

**交互**
- [ ] 点击返回回到 Menu Open
- [ ] 点击菜单本打开该周
- [ ] 点击 New Menu 进入创建流程

### Empty State

- [ ] 显示 📖 图标
- [ ] 显示 "No menu yet" 标题
- [ ] 显示说明文字
- [ ] 显示 "Create Menu" 按钮

---

## ✨ Create Flow 流程

### Step 1: Welcome

- [ ] 显示食物动画/图标
- [ ] 显示欢迎文字 "Let's plan meals for next week!"
- [ ] 显示 "Begin" 按钮
- [ ] 点击 Begin 进入 Step 2

### Step 2: Preferences

- [ ] 显示进度点（6个，第2个高亮）
- [ ] 显示标题和副标题
- [ ] 分组显示标签（Cooking Style / Diet & Health / Cuisine / Other）
- [ ] 未选中标签：透明背景，灰色边框
- [ ] 选中标签：#F0EBE3 背景，#A68A64 边框，绿色文字
- [ ] 显示 "Add" 按钮（虚线边框）
- [ ] 底部固定 "Next" 按钮

**交互**
- [ ] 点击标签切换选中状态
- [ ] 可选择多个标签
- [ ] 点击 Add 可添加自定义标签（≤20字符）
- [ ] 点击 Next 进入下一步

### Step 3: Preferred Items

- [ ] 类似 Step 2 的标签选择
- [ ] 显示食材分类

### Step 4: Disliked Items

- [ ] 类似 Step 2 的标签选择

### Step 5: Sentence Style

- [ ] 显示句子 "The menu is for **2** people with **$100** budget and **medium** difficulty to cook."
- [ ] 可编辑值为橙色（#D97706）
- [ ] 可编辑值有虚线下划线

**交互**
- [ ] 点击人数可编辑（+/- 或选择器）
- [ ] 人数范围 1-10
- [ ] 点击预算打开选择器
- [ ] 预算范围 $50-$500，步进 $10
- [ ] 点击难度打开选择器
- [ ] 难度选项：Easy / Medium / Hard

### Step 6: Schedule Grid

- [ ] 显示 Select All / Deselect All 按钮
- [ ] 显示 7 行（周一到周日）
- [ ] 每行显示 3 个圆形按钮（B/L/D）
- [ ] 未选中：空心圆，灰色边框
- [ ] 选中：实心圆，绿色填充
- [ ] 显示 "Generate Plan" 按钮

**交互**
- [ ] 点击圆形切换选中状态
- [ ] Select All 全选 21 个
- [ ] Deselect All 全不选
- [ ] 至少选择 1 餐才能继续

### Step 7: Loading

- [ ] 显示加载动画（👨‍🍳）
- [ ] 显示 "Generating your menu book..."
- [ ] 显示计时器
- [ ] 1 分钟后显示 "Go to Home" 按钮
- [ ] 2 分钟超时显示错误

### Step 8: Plan Generated

- [ ] Header 显示 "YOUR NEW MENU"
- [ ] 复用 Daily Card 设计
- [ ] 可左右滑动
- [ ] 底部两个并排按钮
- [ ] 💬 Modify（白底）
- [ ] 🛒 Shopping List（绿色）

**交互**
- [ ] 点击 Modify 打开输入框（≤200字符）
- [ ] 点击 Shopping List 进入 Step 10
- [ ] 点击返回放弃新计划

---

## 🛒 Shopping List 页面

**布局**
- [ ] Header 显示 "SHOPPING LIST"
- [ ] 右上角有添加按钮
- [ ] 按分类显示（Proteins / Vegetables / Dairy 等）

**Item**
- [ ] 左侧勾选框
- [ ] 显示项目名称
- [ ] 显示数量（Seasonings 无数量）
- [ ] 已勾选项：打勾 + 删除线 + 灰色

**交互**
- [ ] 点击勾选框切换状态
- [ ] 点击分类标题展开/折叠
- [ ] 可添加手动项目

---

## 📋 Recipe Detail Modal

**布局**
- [ ] 左上角关闭按钮
- [ ] 右上角编辑和删除按钮
- [ ] 显示菜名（大标题）
- [ ] 显示 meta 信息（时间/份数/难度/卡路里）
- [ ] 显示食材列表
- [ ] 显示步骤（带序号）

**交互**
- [ ] 点击关闭按钮关闭 Modal
- [ ] 点击删除确认后移除餐食

---

## 👤 Me 页面

- [ ] 显示 Preferences 卡片
- [ ] 显示 Preferred Items 卡片
- [ ] 显示 Disliked Items 卡片
- [ ] 显示 Default Settings 卡片（人数/预算/难度）
- [ ] 每个卡片有 Edit 按钮

---

## 🧭 导航

### Bottom Navigation

- [ ] 三个 Tab：Plan / List / Me
- [ ] Plan 使用 Book 图标
- [ ] List 使用 Checklist 图标
- [ ] Me 使用 Person 图标
- [ ] 激活状态：绿色（#8B9469）
- [ ] 非激活状态：灰色（#B5B5B5）

### Header 返回

- [ ] 圆角白色按钮
- [ ] 左箭头图标
- [ ] 点击返回上一页

---

## 🎨 设计规范验证

### 颜色

- [ ] 背景色 #FAF9F7
- [ ] 卡片背景 #FFFFFF
- [ ] 卡片头部 #F8F6F2
- [ ] 主要文字 #2C2C2C
- [ ] 次要文字 #7A7A7A
- [ ] 禁用文字 #B5B5B5
- [ ] 强调色 #8B9469
- [ ] 橙色强调 #D97706
- [ ] 分割线 #EEEBE6

### 圆角

- [ ] 卡片 20px
- [ ] 按钮 8-12px
- [ ] 标签 6px
- [ ] Modal 24px

### 图标

- [ ] Stroke width 1.8px
- [ ] 大小 22px（导航）/ 20px（按钮）

---

## 💾 状态管理

### Draft Store

- [ ] 每步骤自动保存到 localStorage
- [ ] 刷新页面后恢复进度
- [ ] 完成后清除草稿

### Menu Book Store

- [ ] 正确存储当前计划
- [ ] 支持多个菜单本

### Shopping List Store

- [ ] 勾选状态实时同步
- [ ] 手动添加项目正确保存

---

## 🌐 API 交互

### 生成计划

- [ ] 显示 loading 状态
- [ ] 2 分钟超时处理
- [ ] 错误时显示重试按钮

### 修改计划

- [ ] 限制 200 字符
- [ ] 显示 loading 状态
- [ ] 错误处理

### 生成购物清单

- [ ] 基于计划 ID 生成
- [ ] 显示 loading 状态
- [ ] 错误处理

---

## ⚠️ 边界情况

- [ ] 空计划正确显示空状态
- [ ] 某餐为空显示 "No breakfast" 等
- [ ] 很长的菜名正确截断
- [ ] 网络断开显示错误
- [ ] 快速多次点击不重复提交
- [ ] 输入验证正确（字符长度等）

---

## ♿ 可访问性

- [ ] 所有按钮有 aria-label
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 可聚焦元素有 focus 状态
- [ ] 触摸目标 ≥ 44px

---

## 📱 响应式

- [ ] 375px 宽度正常显示
- [ ] 428px 宽度正常显示
- [ ] 滑动手势正常工作
- [ ] 底部导航在 safe area 内

---

## ✅ 测试通过标准

| 类别 | 要求 |
|------|------|
| 单元测试覆盖率 | ≥ 80% |
| E2E 测试 | 所有核心流程通过 |
| 可访问性 | 无 WCAG AA 违规 |
| 无 TypeScript 错误 | 0 errors |
| 无 ESLint 错误 | 0 errors |
