```
# 安装依赖
> 备注：本文术语已统一为 Menu Book（原 Meal Plan），字段细节以 `dev_v2/docs/FIELD_SCHEMA_OVERVIEW.md` 与现有代码为准。

pnpm add -D vitest @testing-library/react @testing-library/jest-dom msw playwright

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm exec playwright test

# 生成覆盖率报告
pnpm test:coverage
```