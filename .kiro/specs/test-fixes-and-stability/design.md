# Design Document

## Overview

本设计文档详细说明了如何修复 PDX JSON Editor 项目中的测试失败、类型安全和组件稳定性问题。我们将采用系统性的方法，优先修复最关键的问题，然后逐步改善整体代码质量。

## Architecture

### 修复策略架构

```
修复流程:
1. 问题分析 → 2. 类型修复 → 3. 组件修复 → 4. 测试修复 → 5. 验证测试
```

### 组件层次结构

```
UI Components
├── SearchPanel (需要修复文本和测试)
├── Toast (需要修复属性处理)
├── Modal (需要类型检查)
└── Other UI Components (需要类型验证)
```

## Components and Interfaces

### 1. SearchPanel 组件修复

**问题分析:**
- 测试用例期望英文文本 "Search..." 但组件实际使用中文 "搜索..."
- 按钮标题和提示文本不匹配
- 测试无法找到预期的UI元素

**设计方案:**
```typescript
interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (searchQuery: string, replaceText: string, options: SearchOptions) => void;
  onReplaceAll: (searchQuery: string, replaceText: string, options: SearchOptions) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
  theme: 'light' | 'dark';
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}
```

**修复内容:**
- 统一所有文本为中文
- 更新测试用例以匹配实际文本
- 确保所有按钮都有正确的 title 属性
- 添加缺失的关闭按钮

### 2. Toast 组件修复

**问题分析:**
- `toast.duration` 属性访问时可能为 undefined
- 组件没有处理缺失属性的情况
- 类型定义不完整

**设计方案:**
```typescript
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // 可选属性
  autoClose?: boolean;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
  theme?: 'light' | 'dark';
}
```

**修复内容:**
- 为 duration 属性提供默认值
- 添加属性存在性检查
- 改进类型定义
- 更新相关测试用例

### 3. TypeScript 类型修复

**问题分析:**
- 某些组件属性缺少类型定义
- 导入语句存在类型错误
- 接口定义不完整

**设计方案:**
- 创建完整的类型定义文件
- 修复所有导入语句
- 确保所有组件都有正确的 Props 接口

## Data Models

### 搜索相关数据模型

```typescript
interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

interface SearchState {
  query: string;
  replaceText: string;
  options: SearchOptions;
  results: SearchResult[];
  currentIndex: number;
  isReplaceMode: boolean;
}
```

### Toast 数据模型

```typescript
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface ToastState {
  toasts: ToastData[];
  maxToasts: number;
}
```

## Error Handling

### 1. 组件错误处理

```typescript
// Toast 组件安全属性访问
const duration = toast.duration ?? 3000;
const autoClose = toast.autoClose ?? true;

// SearchPanel 安全渲染
const placeholder = props.placeholder || '搜索...';
```

### 2. 测试错误处理

```typescript
// 测试中的安全查询
const searchInput = screen.queryByPlaceholderText('搜索...');
expect(searchInput).toBeInTheDocument();

// 提供备选查询方法
const searchInput = screen.getByDisplayValue('') || 
                   screen.getByRole('textbox', { name: /搜索/i });
```

### 3. 类型错误处理

```typescript
// 严格的类型检查
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
}

// 默认属性处理
const defaultProps: Partial<ComponentProps> = {
  optionalProp: 0
};
```

## Testing Strategy

### 1. 测试修复策略

**阶段1: 文本统一**
- 更新所有测试用例使用中文文本
- 确保测试查询与组件实际渲染一致

**阶段2: 组件测试**
- 修复 Toast 组件测试
- 修复 SearchPanel 组件测试
- 添加缺失的测试用例

**阶段3: 集成测试**
- 验证组件间交互
- 测试错误边界情况

### 2. 测试用例设计

```typescript
// SearchPanel 测试示例
describe('SearchPanel', () => {
  it('应该渲染搜索输入框', () => {
    render(<SearchPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('应该显示正确的按钮标题', () => {
    render(<SearchPanel {...defaultProps} />);
    expect(screen.getByTitle('区分大小写')).toBeInTheDocument();
    expect(screen.getByTitle('全字匹配')).toBeInTheDocument();
  });
});

// Toast 测试示例
describe('Toast', () => {
  it('应该处理缺失的 duration 属性', () => {
    const toast = { id: '1', type: 'info', title: '测试' };
    expect(() => render(<Toast toast={toast} onClose={jest.fn()} />)).not.toThrow();
  });
});
```

### 3. 类型检查测试

```bash
# 运行类型检查
npm run type-check

# 运行测试
npm run test

# 运行构建验证
npm run build
```

## Implementation Plan

### Phase 1: 类型修复 (优先级: 高)
1. 修复 Toast 组件类型定义
2. 更新 SearchPanel 接口
3. 修复导入语句类型错误
4. 运行类型检查验证

### Phase 2: 组件稳定性修复 (优先级: 高)
1. 修复 Toast 组件属性访问
2. 添加默认属性处理
3. 改进错误边界
4. 测试组件稳定性

### Phase 3: 测试用例修复 (优先级: 中)
1. 统一测试文本为中文
2. 修复 SearchPanel 测试
3. 修复 Toast 测试
4. 更新其他相关测试

### Phase 4: 验证和优化 (优先级: 中)
1. 运行完整测试套件
2. 验证类型检查通过
3. 检查构建成功
4. 性能和稳定性测试

## Performance Considerations

### 1. 组件性能
- 使用 React.memo 优化重渲染
- 避免不必要的状态更新
- 优化事件处理函数

### 2. 测试性能
- 使用 screen.queryBy* 替代 screen.getBy* 避免抛出异常
- 合理使用 waitFor 处理异步操作
- 优化测试数据准备

### 3. 类型检查性能
- 使用增量类型检查
- 优化类型定义复杂度
- 避免过度嵌套的类型

## Security Considerations

### 1. 输入验证
- 验证搜索查询输入
- 防止正则表达式注入
- 限制输入长度

### 2. 错误信息安全
- 避免暴露敏感信息
- 提供用户友好的错误消息
- 记录详细的调试信息

## Monitoring and Logging

### 1. 错误监控
- 添加组件错误边界
- 记录类型错误
- 监控测试失败率

### 2. 性能监控
- 监控组件渲染时间
- 跟踪测试执行时间
- 监控内存使用情况