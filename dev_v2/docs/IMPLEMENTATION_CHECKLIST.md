# OMenu 实施清单（当前阶段）

**Version**: 4.0 (Menu Book 统一版)
**Last Updated**: 2026-02-06

> 目标：记录当前完成度与下一步任务，避免旧 checklist 误导。

## 已完成（核心）
- [x] 前后端字段统一（MenuBook / Menu / Meal / Dish）
- [x] Dish 增加 `source` 字段（ai/manual）
- [x] Create → Review → Shopping List 流程打通
- [x] Shopping List 仅在 Create / Modify 生成
- [x] 手动 Dish 不触发 AI
- [x] Review 与 Menu 页组件一致化
- [x] Loading 页面与按钮样式统一
- [x] CORS 配置统一本地端口
- [x] Root Docs 更新（数据流/字段/设计系统/技术栈）
- [x] 2.5 步 AI 生成流程落地（Outline → Structured Menu → Shopping List）
- [x] pantry_staples / seasonings 分类纠偏（后端映射表）
- [x] 生成流程健壮性修复（JSON 解析兜底 + 字段纠偏）
- [x] 后端测试 + 前端 lint/build 通过

## 待完成（短期）
- [ ] 全量 UI 走查（Create / Menu / Shopping / Profile）
- [ ] MenuBook 删除与补位逻辑边界检查
- [ ] Shopping List 空态与错误态文案统一
- [ ] Profile 偏好修改后的回填一致性检查
- [ ] 上线前人工走查（端到端路径 + 文案/空态）

## 待完成（中期）
- [ ] 组件化抽离（Button/Tag/BottomSheet/Row）
- [ ] 统一 icon stroke 与尺寸基线
- [ ] 增加 E2E 测试覆盖主流程
