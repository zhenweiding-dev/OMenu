# OMenu 统一设计系统计划与组件样例（v2）

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

## 目标
- 在不改动现有色彩体系的前提下，统一全局视觉语言与交互规则。
- 建立可复用的组件规范，减少“同类元素不同样式”的割裂。
- 形成可执行的规范文档与组件样例，便于后续持续迭代。

## 已锁定前提
- 使用现有色彩体系（`dev_v2/frontend/tailwind.config.ts`）。
- 保留当前整体风格：克制、柔和、低饱和绿色为主强调。

## 优先级与理由（详细）
1. **Design Tokens 与排版基线**
理由：所有组件依赖颜色、字号、间距、圆角和阴影。先统一基线可避免后续反复改动。

2. **按钮系统（Primary/Secondary/Ghost/Danger）**
理由：按钮是交互密度最高的元素，必须在所有页面一致，且影响可读性与操作信心。

3. **标签/Chip/Pill 系统**
理由：关键词、偏好、筛选、状态标签分布最广，当前存在多种风格并行。

4. **卡片系统（Card/Row）**
理由：菜单卡、菜单簿、列表行是页面内容结构核心，决定层级与可读性。

5. **Modal / Bottom Sheet 系统**
理由：编辑类操作多且频繁，统一弹窗结构可显著提升一致性。

6. **表单系统（Input/Textarea/Select）**
理由：字段多且跨页面复用，统一后能降低维护成本并提高视觉稳定性。

7. **空状态 / 加载 / 提示系统**
理由：非主流程但影响完成感，统一风格可提升整体品质感。

8. **图标规则（尺寸/笔画/间距）**
理由：icon 视觉噪音高，需统一 stroke 与尺寸以保证一致性。

## 规范文档结构（将输出）
1. **Design Tokens**
- 颜色、字体、字号、行高、字间距、圆角、阴影、间距体系。

2. **组件规范**
- Button / Chip / Card / List / Modal / Bottom Sheet / Input / Empty / Loading。

3. **交互规范**
- Hover / Active / Disabled / Focus / Error。
- 点击/长按/滑动规则。

4. **页面应用规则**
- Menu / Create / Review / Shopping / Profile。

## 组件样例（草案）

### Button
| 组件 | 变体 | 尺寸 | 交互状态 | 使用场景 | 视觉要点 |
| --- | --- | --- | --- | --- | --- |
| Primary | `primary` | `sm / md` | hover/disabled | 主操作 | 绿色底，白字 |
| Secondary | `secondary` | `sm / md` | hover/disabled | 次操作 | 线框/浅底 |
| Ghost | `ghost` | `sm` | hover/disabled | 次级操作 | 无底色 |
| Danger | `danger` | `sm / md` | hover/disabled | 删除/破坏 | 红色/警示 |

### Tag / Chip / Pill
| 组件 | 状态 | 尺寸 | 使用场景 | 视觉要点 |
| --- | --- | --- | --- | --- |
| Tag | default | `xs / sm` | 展示型 | 浅底+细边 |
| Tag | selected | `xs / sm` | 选中态 | 绿色文本+浅底 |
| Chip | actionable | `sm` | 可点击 | hover 高亮 |

### Card / Row
| 组件 | 类型 | 使用场景 | 视觉要点 |
| --- | --- | --- | --- |
| Card | content | 菜单/菜单簿 | 轻阴影 + 细边 |
| Row | list item | 购物清单 | 轻分隔线 + hover |

### Modal / Bottom Sheet
| 组件 | 类型 | 使用场景 | 视觉要点 |
| --- | --- | --- | --- |
| Bottom Sheet | 编辑类 | Add/Edit | 顶部 sticky header + 底部 actions |
| Center Modal | 确认类 | 删除/危险 | 强对比 CTA |

### Input / Textarea
| 组件 | 类型 | 使用场景 | 视觉要点 |
| --- | --- | --- | --- |
| Input | default | 表单输入 | 统一圆角 + 边框 |
| Textarea | default | 长文本 | line-height 稳定 |

## 组件样例（HTML 参考）
> 说明：以下是纯 HTML + Tailwind 类名样例，用于视觉对齐与规范确认。

### 1) Primary / Secondary / Ghost / Danger Buttons
```html
<div class="flex flex-wrap items-center gap-2">
  <button class="rounded-xl bg-accent-base px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90">
    Primary
  </button>
  <button class="rounded-xl border border-border-subtle bg-card-base px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:bg-paper-muted">
    Secondary
  </button>
  <button class="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary">
    Ghost
  </button>
  <button class="rounded-xl bg-error px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-error/90">
    Danger
  </button>
</div>
```

### 2) Tag / Chip / Selected Pill
```html
<div class="flex flex-wrap items-center gap-2">
  <span class="rounded-full border border-border-tag bg-transparent px-3 py-1.5 text-[12px] font-medium text-text-secondary">
    Tag
  </span>
  <span class="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent-base">
    Selected
  </span>
  <button class="rounded-full border border-border-tag px-3 py-1.5 text-[12px] text-text-secondary hover:border-accent-light hover:text-text-primary">
    Chip
  </button>
</div>
```

### 3) Card（菜单卡片基础）
```html
<div class="rounded-2xl border border-border-subtle bg-card-base shadow-card p-4">
  <div class="text-[12px] font-semibold uppercase tracking-[0.18em] text-text-secondary">CARD TITLE</div>
  <div class="mt-2 text-[15px] font-semibold text-text-primary">Card Content</div>
  <div class="mt-1 text-[12px] text-text-tertiary">Secondary text</div>
</div>
```

### 4) List Row（购物清单行）
```html
<div class="flex items-center gap-2 border-b border-border-subtle px-4 py-2.5 hover:bg-paper-muted/50">
  <div class="h-5 w-5 rounded border border-text-disabled bg-white"></div>
  <div class="flex-1">
    <div class="text-[14px] font-medium text-text-primary">Tomatoes</div>
    <div class="text-[11px] text-text-tertiary">2 pcs</div>
  </div>
  <button class="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">EDIT</button>
</div>
```

### 5) Bottom Sheet（编辑类）
```html
<div class="absolute inset-0 flex items-end justify-center bg-black/40">
  <div class="w-full max-h-[85%] rounded-t-3xl bg-card-base overflow-hidden">
    <div class="flex items-center justify-between border-b border-border-subtle px-5 py-4">
      <button class="h-9 w-9 rounded-full bg-paper-muted">✕</button>
      <button class="text-[13px] font-semibold text-accent-base">Save</button>
    </div>
    <div class="px-5 py-5">
      <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-base">TITLE</div>
      <div class="mt-2 text-[22px] font-semibold text-text-primary">Editable Field</div>
    </div>
  </div>
</div>
```

### 6) Center Modal（确认类）
```html
<div class="absolute inset-0 flex items-center justify-center bg-black/40 px-4 py-6">
  <div class="w-full max-w-sm rounded-3xl border border-border-subtle bg-card-base p-6 shadow-soft">
    <div class="text-[16px] font-semibold text-text-primary">Delete item?</div>
    <div class="mt-1 text-[13px] text-text-secondary">This action cannot be undone.</div>
    <div class="mt-4 flex justify-end gap-2">
      <button class="rounded-xl px-4 py-2 text-[13px] font-semibold text-text-secondary">Cancel</button>
      <button class="rounded-xl bg-error px-4 py-2 text-[13px] font-semibold text-white">Delete</button>
    </div>
  </div>
</div>
```

## 执行顺序（拟）
1. 输出 Design Tokens 规范与组件规范文档。
2. 产出组件样例（静态样式 + 交互规则）。
3. 页面级替换：Menu/Review/Create → Shopping → Profile。
4. 交互与动效统一。

## 验收标准
- 同类元素在不同页面的样式一致。
- 按钮/标签/输入/弹窗有清晰规格。
- 组件可复用，不再出现“逐页补丁式样式”。

---

请确认以上计划方向。如果确认，我下一步输出完整的设计规范文档与组件样例（含更细的 token 表与 CSS 规范）。