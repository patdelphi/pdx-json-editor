# PDX JSON Editor

一个功能强大的在线JSON编辑器，基于React + TypeScript + Vite构建，使用Monaco Editor提供专业的代码编辑体验。支持PWA，可安装为本地应用并离线使用。

## 功能特性

- 🎨 **语法高亮** - 基于Monaco Editor的专业JSON语法高亮
- ✅ **实时验证** - 实时JSON语法验证和错误提示
- 🔍 **搜索替换** - 强大的搜索和替换功能
- 📁 **文件操作** - 支持打开、保存、新建JSON文件
- 🎯 **拖拽支持** - 支持拖拽文件到编辑器
- 🌓 **主题切换** - 支持明暗主题切换
- ⚙️ **自定义设置** - 可配置缩进、换行等编辑器选项
- ⌨️ **快捷键** - 丰富的键盘快捷键支持
- 📊 **状态栏** - 显示光标位置、字符数、验证状态等信息
- 📱 **响应式设计** - 适配桌面端、平板端和移动端
- 🚀 **性能优化** - 大文件处理优化，虚拟滚动支持
- 📦 **PWA支持** - 可安装为本地应用并离线使用
- 🔄 **代码分割** - 优化加载性能，按需加载组件
- 📑 **代码折叠** - 支持JSON结构的折叠和展开
- 📋 **JSON Schema** - 支持JSON Schema验证和自动完成
- 🔗 **链接检测** - 自动检测并高亮URL和文件路径
- ℹ️ **悬停提示** - 提供JSON键值的上下文信息
- 🔄 **差异比较** - 支持比较和查看JSON内容的差异

## 快捷键

- `Ctrl+N` - 新建文件
- `Ctrl+O` - 打开文件
- `Ctrl+S` - 保存文件
- `Ctrl+F` - 搜索
- `Ctrl+H` - 替换
- `Ctrl+,` - 打开设置
- `Ctrl+Shift+Enter` - 格式化JSON
- `Ctrl+Alt+Enter` - 压缩JSON
- `Ctrl+Enter` - 验证JSON
- `Ctrl+D` - 切换主题
- `Ctrl+[` - 折叠当前代码块
- `Ctrl+]` - 展开当前代码块
- `Ctrl+Shift+[` - 折叠所有代码块
- `Ctrl+Shift+]` - 展开所有代码块

## 技术栈

- **React 19** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **Monaco Editor** - 专业的代码编辑器
- **Tailwind CSS** - 实用优先的CSS框架

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
# 运行单元测试
npm run test

# 运行单元测试（UI模式）
npm run test:ui

# 运行端到端测试
npm run test:e2e

# 运行端到端测试（UI模式）
npm run test:e2e:ui
```

### 代码格式化和检查

```bash
# 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 运行 ESLint
npm run lint

# 修复 ESLint 问题
npm run lint:fix

# 类型检查
npm run type-check
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── Editor/         # 编辑器相关组件
│   ├── FileManager/    # 文件管理组件
│   ├── SearchReplace/  # 搜索替换组件
│   ├── Settings/       # 设置面板组件
│   └── UI/            # 通用UI组件
├── hooks/              # 自定义React Hooks
├── services/           # 业务逻辑服务
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── context/            # React Context
└── styles/             # 样式文件
```

## 示例文件

项目包含两个示例JSON文件，可用于测试编辑器功能：

- `demo.json` - 包含各种JSON数据类型的示例文件
- `large.json` - 大型JSON文件，用于测试编辑器处理大文件的性能

## 部署

详细的部署指南请参阅 [DEPLOYMENT.md](./DEPLOYMENT.md) 文件，其中包含：

- 静态网站托管（Netlify、Vercel、GitHub Pages）
- Docker部署
- 传统Web服务器（Nginx、Apache）
- 环境变量配置
- PWA支持
- 性能优化
- 故障排除

### GitHub Pages 部署

项目已部署到 GitHub Pages，可通过以下链接访问：

[https://patdelphi.github.io/pdx-json-editor/](https://patdelphi.github.io/pdx-json-editor/)

项目使用 `docs` 目录作为 GitHub Pages 的源目录。要更新 GitHub Pages 部署，只需运行：

```bash
npm run deploy
```

这将构建项目并将输出文件放置在 `docs` 目录中。然后，将更改提交并推送到 GitHub 仓库即可。

## 浏览器兼容性

JSON Editor支持所有现代浏览器：

- Chrome / Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- 移动浏览器（iOS Safari、Android Chrome）

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请确保：

1. 遵循现有的代码风格和命名约定
2. 为新功能添加适当的测试
3. 更新相关文档
4. 提交前运行测试和代码检查

## 许可证

MIT
