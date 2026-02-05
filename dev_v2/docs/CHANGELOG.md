# Documentation Changelog

> 备注：本文术语已统一为 Menu Book（原 Meal Plan）。

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

