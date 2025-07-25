# 更新日志

所有PDX JSON Editor的显著变更都将记录在此文件中。

格式基于[Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2025-07-22

### 新增
- 添加JSON模式验证功能，支持自定义Schema
- 添加键盘快捷键支持，提高编辑效率
- 添加自动保存和恢复功能，防止意外丢失编辑内容
- 添加全新的深色主题支持，改善夜间使用体验
- 添加性能测试套件，确保编辑器性能稳定

### 改进
- 大幅优化大型JSON文件的处理性能
- 改进编辑器渲染速度，提供更流畅的编辑体验
- 优化内存占用，减少资源消耗
- 改进差异对比视图，更清晰地显示变更
- 增强移动设备支持，优化触摸交互
- 优化工具栏布局，提高使用效率
- 升级到最新的Monaco Editor版本
- 使用Preact替换React，提高性能
- 使用Vite替换Webpack，加快构建速度
- 重构为模块化架构，便于扩展

### 修复
- 修复大文件加载时的性能问题
- 修复JSON格式化时的缩进问题
- 修复搜索功能中的正则表达式支持
- 修复主题切换时的闪烁问题
- 修复移动设备上的触摸交互问题

## [1.1.0] - 2025-07-22

### 新增
- 添加字体大小调整功能，支持通过工具栏按钮增大或减小编辑器字体
- 添加GitHub Actions工作流，自动部署到GitHub Pages

### 改进
- 优化JSON Schema选择器宽度，提供更多编辑空间
- 修复保存文件对话框不在当前文件目录打开的问题
- 改进用户界面布局和响应式设计
- 删除不再需要的搜索功能修复日志文件
- 重构分支管理，将dev0719分支合并为main分支

## [1.0.0] - 2023-07-20

### 新增

- 基于Monaco Editor的JSON编辑器
- JSON语法高亮和实时验证
- JSON格式化和压缩功能
- 搜索和替换功能
- 差异对比功能
- 文件操作（新建、打开、保存、另存为）
- 文件拖放支持
- JSON Schema支持和自动完成
- 浅色/深色主题切换
- 响应式设计，适配桌面和移动设备
- 触摸手势支持
- 键盘快捷键支持
- 大文件处理优化
- 错误处理和恢复机制
- 无障碍支持
- 端到端测试和性能测试