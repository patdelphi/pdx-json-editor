# PDX JSON Editor

一个轻量级、高性能的JSON编辑器，基于Monaco Editor构建，提供类似VS Code的编辑体验。

## 在线演示

访问 [https://patdelphi.github.io/pdx-json-editor/](https://patdelphi.github.io/pdx-json-editor/) 体验最新版本。

## 特性

- 🚀 **高性能**：优化的大文件处理能力，流畅编辑体验
- 🎨 **语法高亮**：JSON语法高亮和格式化
- ✅ **实时验证**：即时JSON语法错误检测和提示
- 🔍 **搜索替换**：强大的搜索和替换功能
- 📊 **差异对比**：文件变更的可视化差异对比
- 📱 **响应式设计**：适配桌面和移动设备
- 🌙 **主题切换**：支持浅色/深色主题
- ⌨️ **键盘快捷键**：丰富的键盘快捷键支持
- 📂 **文件操作**：打开、保存、新建文件
- 📋 **拖放支持**：拖放文件到编辑器中打开
- 🔄 **JSON Schema**：支持JSON Schema验证和自动完成
- 🔠 **字体调整**：支持动态调整编辑器字体大小


## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 测试

### 运行单元测试

```bash
npm test
```

### 运行端到端测试

```bash
npm run test:e2e
```

### 运行性能测试

```bash
npm run test:performance
```

## 键盘快捷键

| 功能 | 快捷键 |
|------|--------|
| 格式化JSON | Ctrl+Shift+F |
| 压缩JSON | Ctrl+Shift+M |
| 搜索 | Ctrl+F |
| 替换 | Ctrl+H |
| 保存 | Ctrl+S |
| 另存为 | Ctrl+Shift+S |
| 新建 | Ctrl+N |
| 打开 | Ctrl+O |
| 差异对比 | Ctrl+Alt+D |
| 折叠所有 | Ctrl+[ |
| 展开所有 | Ctrl+] |
| 显示快捷键帮助 | ? |


## 技术栈

- **前端框架**: Preact 10
- **编辑器核心**: Monaco Editor
- **构建工具**: Vite
- **UI组件**: Material-UI
- **测试工具**: Jest, Playwright
- **语言**: JavaScript/JSX

## 项目结构

```
pdx-json-editor/
├── src/                  # 源代码
│   ├── components/       # UI组件
│   ├── hooks/            # 自定义Hooks
│   ├── layouts/          # 布局组件
│   ├── services/         # 服务类
│   ├── theme/            # 主题相关
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 应用入口组件
│   └── main.jsx          # 应用入口点
├── e2e/                  # 端到端测试
├── public/               # 静态资源
├── .kiro/                # Kiro规范文件
│   └── specs/            # 功能规范
├── package.json          # 项目配置
└── vite.config.js        # Vite配置
```

## 性能优化

PDX JSON Editor采用了多种性能优化策略，确保在处理大型JSON文件时保持流畅的编辑体验：

1. **大文件检测**：自动检测大文件并提供性能模式选项
2. **延迟加载**：按需加载功能模块，减少初始加载时间
3. **虚拟化渲染**：优化大文件的渲染性能
4. **代码分割**：将Monaco Editor和其他大型依赖分离打包
5. **内存管理**：优化内存使用，避免内存泄漏
6. **防抖和节流**：对输入验证和搜索应用防抖和节流
7. **Web Workers**：将大型JSON解析和格式化操作移至Web Worker

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 许可证

MIT
