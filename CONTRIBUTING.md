# 贡献指南

感谢你考虑为PDX JSON Editor做出贡献！以下是一些指导方针，以帮助你开始。

## 行为准则

参与此项目即表示你同意遵守我们的行为准则。请确保尊重所有参与者。

## 如何贡献

### 报告Bug

1. 确保该Bug尚未在[Issues](https://github.com/yourusername/pdx-json-editor/issues)中报告
2. 使用Bug报告模板创建一个新Issue
3. 提供尽可能多的信息，包括复现步骤、预期行为和实际行为

### 提出功能请求

1. 检查该功能是否已在[Issues](https://github.com/yourusername/pdx-json-editor/issues)中提出
2. 使用功能请求模板创建一个新Issue
3. 清晰地描述该功能及其用例

### 提交代码

1. Fork仓库
2. 创建你的特性分支：`git checkout -b feature/amazing-feature`
3. 提交你的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 开发设置

### 先决条件

- Node.js 16+
- npm 8+

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/pdx-json-editor.git
cd pdx-json-editor

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 代码风格

我们使用ESLint和Prettier来保持代码风格一致。在提交代码之前，请确保运行：

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run format
```

## 测试

请确保你的代码包含适当的测试，并且所有测试都通过：

```bash
# 运行单元测试
npm test

# 运行端到端测试
npm run test:e2e

# 运行性能测试
npm run test:performance
```

## Pull Request流程

1. 确保所有测试都通过
2. 更新文档以反映任何更改
3. 更新CHANGELOG.md（如果适用）
4. Pull Request将在审核后合并

## 发布流程

1. 更新版本号（遵循[语义化版本](https://semver.org/lang/zh-CN/)）
2. 更新CHANGELOG.md
3. 创建一个新的GitHub Release
4. 发布到npm（如果适用）

感谢你的贡献！