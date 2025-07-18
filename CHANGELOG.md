# 更新日志

所有项目的显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.2] - 2025-07-18

### 修复

- 修复了 51 个测试失败问题，测试通过率从 86% 提升到 93%
- 统一了组件中的中英文文本，解决测试用例文本不匹配问题
- 修复了 Toast 组件的属性访问错误，添加了默认值处理
- 修复了 SearchPanel 组件的测试用例
- 完善了 TypeScript 类型定义，添加了 ToastData 和 SearchPanelProps 接口
- 修复了 FileOperations 组件测试中的按钮标题匹配问题

### 改进

- 提高了组件稳定性，添加了更好的错误处理
- 优化了代码格式和 ESLint 规范
- 改进了测试用例的可靠性和准确性

## [1.0.1] - 2025-07-17

### 修复

- 修复了多个 TypeScript 类型错误，确保项目能够成功构建
- 修复了 Monaco Editor 的 getActions 方法类型错误
- 修复了 findController 相关的类型错误
- 修复了 modalTest.js 的导入类型错误
- 修复了编辑器 find 和 replace 方法的空引用错误
- 更新了 EditorMethods 接口和相关类型定义

### 新增

- 添加了 GitHub Pages 部署支持
- 添加了 gh-pages 依赖和部署脚本

## [1.0.0] - 2025-07-17

### 新增

- 基于 Monaco Editor 的 PDX JSON 编辑器核心功能
- 语法高亮和实时验证
- 格式化和压缩功能
- 搜索和替换功能
- 文件操作（打开、保存、新建）
- 拖拽文件上传支持
- 明暗主题切换
- 编辑器设置面板
- 状态栏显示（验证状态、光标位置、字符数）
- 键盘快捷键支持
- 响应式布局设计
- PWA 支持，可安装为本地应用
- 大文件处理优化
- 代码分割和懒加载
- 完整的测试套件（单元测试、集成测试、端到端测试）

### 技术栈

- React 19
- TypeScript
- Vite
- Monaco Editor
- Tailwind CSS
- Playwright (E2E 测试)
- Vitest (单元测试)

## [0.1.0] - 2025-06-15

### 新增

- 项目初始化
- 基础架构搭建
- 核心类型定义和接口设计