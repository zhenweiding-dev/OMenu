# Documentation Changelog

> 备注：本文术语已统一为 Menu Book（原 Meal Plan）。

## 2026-02-05 — v2.3 (Week-Aware Create Flow)
### Core Changes
- Create 流程支持目标周（`targetWeekStart`），生成结果对齐到目标周周一
- 当前周为空时提供“Plan this week / View next week”分支逻辑
- MenuBook 弹窗保证当前周与下周出现，未来空缺用占位卡补齐
- 当前周排期禁用过去日期，并在提交前自动清理

### Docs Updates
- 更新数据流与字段结构文档，补充目标周与欢迎页逻辑

---

## 2026-02-05 — v2.2 (Menu Book + UI System Cleanup)
### Core Changes
- 统一术语：Menu Book / Menu / Meal / Dish
- Dish 增加 `source`（ai/manual）
- 手动 Dish 不触发 AI 与 Shopping List
- Shopping List 仅在 Create / Modify 生成
- Review 与 Menu 页组件一致化
- Loading 页面交互与按钮规范统一
- 修复 createdAt 微秒导致日期解析问题

### Docs Updates
- 整合 Root Docs，更新数据流、字段结构、设计系统与技术栈
- UI 设计规范文档合并并补充迭代计划

---

## 2025-01-31 — v2.0 (Frontend-Backend Separation)
### Overview
- 从单体 React 拆分为前后端结构
- 后端承接 Gemini 调用
- 前端只处理 UI 与状态
