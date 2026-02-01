```
# 安装依赖
pnpm add -D vitest @testing-library/react @testing-library/jest-dom msw playwright

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm exec playwright test

# 生成覆盖率报告
pnpm test:coverage
```