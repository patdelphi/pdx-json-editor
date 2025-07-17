# 贡献指南

感谢您考虑为 PDX JSON Editor 项目做出贡献！以下是一些指导原则，帮助您参与项目开发。

## 开发流程

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 代码风格

本项目使用 ESLint 和 Prettier 来保持代码风格的一致性。在提交代码前，请确保运行以下命令：

```bash
# 检查代码风格
npm run format:check

# 自动修复代码风格问题
npm run format

# 运行 ESLint 检查
npm run lint

# 修复 ESLint 问题
npm run lint:fix

# 运行类型检查
npm run type-check
```

## 测试

为您的代码添加适当的测试是非常重要的。本项目使用以下测试工具：

- **Vitest** - 单元测试和集成测试
- **Playwright** - 端到端测试

在提交代码前，请确保运行以下命令：

```bash
# 运行单元测试
npm run test:run

# 运行端到端测试
npm run test:e2e
```

## 提交消息规范

我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)规范来格式化提交消息：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码风格变更（不影响代码运行的变动）
- **refactor**: 代码重构（既不是新增功能，也不是修复 bug）
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

示例：

```
feat(editor): 添加代码折叠功能

- 实现了 JSON 对象和数组的折叠功能
- 添加了折叠指示器的样式

Closes #123
```

## 分支策略

- `main` - 稳定版本分支
- `develop` - 开发分支
- `feature/*` - 特性分支
- `bugfix/*` - 修复分支
- `release/*` - 发布准备分支

## 问题和功能请求

如果您发现了 bug 或有新功能建议，请先查看现有的 Issues，避免创建重复的问题。创建新 Issue 时，请尽可能提供详细信息，包括：

- 对于 bug：复现步骤、预期行为和实际行为、环境信息（浏览器、操作系统等）
- 对于功能请求：详细描述功能、使用场景、预期行为

## 文档

如果您的更改涉及用户可见的功能或 API 变更，请确保更新相关文档：

- README.md
- 代码注释
- 其他相关文档

## 许可证

通过贡献代码，您同意您的贡献将在项目的 MIT 许可证下发布。