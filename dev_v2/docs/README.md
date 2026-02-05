# OMenu Docs (v2)

> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

## 当前版本概览
- **产品核心**：用户填写偏好 → 生成一周 Menu Book → 复核/微调 → 生成 Shopping List。
- **关键约束**：
  - Menu Book 只有在用户确认（Generate Shopping List）后写入。
  - 手动添加/编辑/删除 Dish **不触发** AI，也不联动 Shopping List。
  - Shopping List 仅在 **Create / Modify** 触发生成，且仅使用 `source="ai"` dishes。

## Root Docs（已更新）
| 文件 | 说明 |
| --- | --- |
| `APP_DATA_FLOW_AND_INTERACTIONS.md` | 前端交互 ↔ 数据流动全链路梳理 |
| `FIELD_SCHEMA_OVERVIEW.md` | 前后端字段结构与语义对照 |
| `UI_DESIGN_SYSTEM_AND_ITERATION.md` | 统一设计系统规范（含组件规则与迭代计划） |
| `UI_DESIGN_SYSTEM_PLAN.html` | 设计系统视觉样例（HTML 预览） |
| `TECH_STACK.md` | 前后端技术栈与版本 |
| `IMPLEMENTATION_CHECKLIST.md` | 当前阶段完成度与下一步清单 |
| `CHANGELOG.md` | 文档与实现变更记录 |

## 子文件夹说明（本轮未更新）
`docs/design/`、`docs/dev/`、`docs/testing/`、`docs/demo/` 为历史或专题文档，本轮未同步更新。如需统一，我可以在下一轮整理。

---
如需快速理解系统建议顺序：
1. `FIELD_SCHEMA_OVERVIEW.md`
2. `APP_DATA_FLOW_AND_INTERACTIONS.md`
3. `UI_DESIGN_SYSTEM_AND_ITERATION.md`
4. `TECH_STACK.md`
