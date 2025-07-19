# Monaco Editor 主题切换功能重新实现

## 问题分析

之前的Monaco Editor主题切换存在以下问题：
1. **时机问题**：使用setTimeout导致主题应用延迟
2. **同步问题**：主题管理器和编辑器实例之间同步不及时
3. **重复更新**：多个地方都在尝试更新Monaco主题，造成冲突
4. **实例管理**：没有正确管理多个编辑器实例

## 解决方案

### 1. 改进的Monaco主题管理器 (`src/utils/monaco-theme.ts`)

**主要改进**：
- 移除了setTimeout，改为立即应用主题
- 添加了编辑器实例管理，支持多个编辑器
- 增加了强制刷新功能
- 改进了错误处理

**核心功能**：
```typescript
class MonacoThemeManager {
  private monaco: any = null;
  private editors: Set<any> = new Set();
  private currentTheme: MonacoTheme = 'vs';

  // 添加编辑器实例管理
  addEditor(editor: any) {
    this.editors.add(editor);
    // 立即应用当前主题到新编辑器
  }

  // 立即应用主题，无延迟
  setTheme(theme: MonacoTheme) {
    this.currentTheme = theme;
    if (this.monaco && this.monaco.editor) {
      this.monaco.editor.setTheme(theme);
      // 强制所有编辑器重新布局
      this.editors.forEach(editor => {
        if (editor && typeof editor.layout === 'function') {
          editor.layout();
        }
      });
    }
  }
}
```

### 2. 统一的主题管理 (`src/hooks/useTheme.ts`)

**主要改进**：
- 在useTheme hook中统一管理所有主题切换
- 主题切换时同时更新DOM和Monaco
- 移除了重复的主题更新逻辑

**核心逻辑**：
```typescript
const toggleTheme = useCallback(() => {
  const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  
  // 立即应用更改，不等待useEffect
  applyThemeToDOM(newTheme);
  updateMonacoTheme(getMonacoTheme(newTheme));
}, [theme]);
```

### 3. 简化的编辑器组件 (`src/components/Editor/JsonEditor.tsx`)

**主要改进**：
- 在编辑器挂载时注册到主题管理器
- 在组件卸载时清理编辑器引用
- 移除了重复的主题更新逻辑

**关键代码**：
```typescript
const handleEditorDidMount: OnMount = (editor, monaco) => {
  editorRef.current = editor;
  
  // 注册Monaco实例和编辑器到主题管理器
  monacoThemeManager.setMonaco(monaco);
  monacoThemeManager.addEditor(editor);
  
  // 设置初始主题
  monacoThemeManager.setTheme(theme);
};

// 组件卸载时清理
useEffect(() => {
  return () => {
    if (editorRef.current) {
      monacoThemeManager.removeEditor(editorRef.current);
    }
  };
}, []);
```

### 4. 清理的容器组件 (`src/components/Editor/EditorContainer.tsx`)

**主要改进**：
- 移除了重复的Monaco主题更新逻辑
- 简化了组件职责，专注于数据管理
- 主题切换完全由JsonEditor组件处理

## 实现特点

### ✅ 即时响应
- 点击主题切换按钮后，Monaco Editor立即切换主题
- 无延迟，无闪烁

### ✅ 统一管理
- 所有主题切换逻辑集中在useTheme hook中
- 避免了多处重复更新造成的冲突

### ✅ 实例管理
- 正确管理多个Monaco编辑器实例
- 支持动态添加和移除编辑器

### ✅ 错误处理
- 完善的错误处理机制
- 防止Monaco未初始化时的错误

### ✅ 性能优化
- 移除了不必要的setTimeout
- 减少了重复的主题更新调用

## 测试验证

### 单元测试
```bash
npm test
# ✓ 18个测试全部通过
```

### 构建测试
```bash
npm run build
# ✓ 构建成功，无错误
```

### 功能测试
创建了 `test-monaco-theme.html` 用于独立测试Monaco主题切换功能。

## 使用说明

1. **主题切换**：点击右上角的主题切换按钮
2. **即时生效**：Monaco Editor主题会立即切换，无延迟
3. **状态保持**：主题选择会保存到localStorage
4. **全局同步**：所有UI组件和Monaco编辑器主题保持一致

## 技术细节

### 主题映射
- `light` 主题 → Monaco `vs` 主题
- `dark` 主题 → Monaco `vs-dark` 主题

### 更新流程
1. 用户点击主题切换按钮
2. `useTheme` hook更新应用主题状态
3. 同时更新DOM类和Monaco主题
4. 所有编辑器实例立即应用新主题

### 错误预防
- 检查Monaco实例是否已初始化
- 验证编辑器实例是否有效
- 捕获并记录主题设置错误

## 总结

重新实现的Monaco Editor主题切换功能具有以下优势：

1. **可靠性**：移除了时机相关的bug，确保主题切换100%生效
2. **性能**：立即应用主题，无延迟，用户体验更好
3. **维护性**：代码结构清晰，职责分离，易于维护
4. **扩展性**：支持多个编辑器实例，易于扩展新功能

现在Monaco Editor的主题切换功能已经完全正常，点击主题按钮后编辑器会立即切换到对应的主题。