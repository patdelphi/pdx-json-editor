# PDX JSON Editor v2.0.0

一个轻量级、高性能的JSON编辑器，基于Monaco Editor构建，提供类似VS Code的编辑体验。全新2.0版本带来了显著的性能提升和功能增强。

## 在线演示

访问 [https://patdelphi.github.io/pdx-json-editor/](https://patdelphi.github.io/pdx-json-editor/) 体验最新版本。

## 特性

### 2.0版本新增和改进
- 🚀 **性能大幅提升**：优化的大文件处理能力，更流畅的编辑体验
- 🌙 **全新深色主题**：改进的深色主题设计，减少眼睛疲劳
- 📊 **增强的差异对比**：更清晰的文件变更可视化差异对比
- 🔄 **高级JSON Schema**：增强的JSON Schema验证和自动完成功能
- 💾 **自动保存恢复**：防止意外丢失编辑内容
- ⚡ **技术栈升级**：使用Preact和Vite提供更快的性能和构建速度

### 核心功能
- 🎨 **语法高亮**：JSON语法高亮和格式化
- ✅ **实时验证**：即时JSON语法错误检测和提示
- 🔍 **搜索替换**：强大的搜索和替换功能
- 📱 **响应式设计**：适配桌面和移动设备
- ⌨️ **键盘快捷键**：丰富的键盘快捷键支持
- 📂 **文件操作**：打开、保存、新建文件
- 📋 **拖放支持**：拖放文件到编辑器中打开
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

- **前端框架**: Preact 10 (v2.0.0升级)
- **编辑器核心**: Monaco Editor (最新版本)
- **构建工具**: Vite (v2.0.0升级，替代Webpack)
- **UI组件**: Material-UI
- **测试工具**: Jest, Playwright
- **性能测试**: 自定义性能测试套件 (v2.0.0新增)
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

PDX JSON Editor 2.0版本采用了多种性能优化策略，确保在处理大型JSON文件时保持流畅的编辑体验：

1. **大文件处理引擎**：全新的大文件处理引擎，支持更大文件的流畅编辑
2. **增强的虚拟化渲染**：优化大文件的渲染性能，减少DOM操作
3. **智能延迟加载**：按需加载功能模块，减少初始加载时间
4. **优化的代码分割**：更精细的代码分割策略，减少不必要的加载
5. **改进的内存管理**：优化内存使用，主动释放不需要的资源
6. **高效的防抖和节流**：对输入验证和搜索应用更智能的防抖和节流
7. **多线程处理**：使用Web Workers将大型JSON解析和格式化操作移至后台线程
8. **预编译模板**：减少运行时编译开销
9. **静态资源优化**：优化静态资源加载和缓存策略

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 许可证

MIT
