# PDX JSON 编辑器

一个轻量级、高性能的 JSON 编辑工具，使用 Preact 和 Material-UI 构建，提供类似 VS Code 的编辑体验。

## 功能特点

- 基于 Monaco Editor 的专业编辑体验
- JSON 语法高亮和错误验证
- 格式化和压缩 JSON
- 搜索和替换功能
- 文件操作（新建、打开、保存）
- 支持大型 JSON 文件
- 浅色/深色主题切换
- 响应式设计，适应不同设备

## 技术栈

- **前端框架**: Preact 10
- **UI 组件**: Material-UI (MUI)
- **编辑器核心**: Monaco Editor
- **构建工具**: Vite

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # UI 组件
├── layouts/          # 布局组件
├── theme/            # 主题配置
├── App.jsx           # 主应用组件
└── main.jsx          # 入口文件
```

## 主要组件

- **JsonEditor**: Monaco Editor 的包装组件
- **EditorToolbar**: 编辑器工具栏
- **Header**: 应用程序头部
- **SidePanel**: 侧边面板
- **StatusBar**: 状态栏
- **SearchPanel**: 搜索和替换面板
- **SettingsDialog**: 设置对话框
- **FileDropZone**: 文件拖放区域
- **ErrorDisplay**: 错误显示
- **DiffViewer**: 差异对比视图
- **LargeFileWarning**: 大文件警告对话框

## 许可证

MIT