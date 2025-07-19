# Monaco Editor 功能集成指南

## 概述

Monaco Editor 是一个功能强大的代码编辑器，为 VS Code 提供支持的同一编辑器核心。本文档详细说明如何充分利用 Monaco Editor 的内置功能，为 JSON 编辑器提供专业的编辑体验。

## 核心功能

### 1. 代码折叠

Monaco Editor 提供了强大的代码折叠功能，特别适合 JSON 数据的层次结构：

```typescript
// 代码折叠配置
const foldingOptions = {
  folding: true,
  foldingStrategy: 'indentation', // 或 'auto'
  foldingHighlight: true,
  showFoldingControls: 'always', // 或 'mouseover'
};

// 添加折叠控制按钮
const addFoldingControls = (editor) => {
  const container = document.createElement('div');
  container.className = 'folding-controls';

  const foldAllButton = document.createElement('button');
  foldAllButton.textContent = '折叠全部';
  foldAllButton.onclick = () => editor.getAction('editor.foldAll').run();

  const unfoldAllButton = document.createElement('button');
  unfoldAllButton.textContent = '展开全部';
  unfoldAllButton.onclick = () => editor.getAction('editor.unfoldAll').run();

  container.appendChild(foldAllButton);
  container.appendChild(unfoldAllButton);

  // 添加到编辑器容器
  editor.getDomNode().parentElement.appendChild(container);
};
```

### 2. 智能括号匹配和自动闭合

配置 Monaco Editor 以提供智能括号匹配和自动闭合功能：

```typescript
// 括号匹配和自动闭合配置
const bracketOptions = {
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  matchBrackets: 'always',
  bracketPairColorization: { enabled: true },
};

// 配置 JSON 语言的括号匹配
monaco.languages.setLanguageConfiguration('json', {
  brackets: [
    ['{', '}'],
    ['[', ']'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"', notIn: ['string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
  ],
});
```

### 3. 悬停信息和上下文提示

为 JSON 键和值提供悬停信息和上下文提示：

```typescript
// 注册悬停提供程序
monaco.languages.registerHoverProvider('json', {
  provideHover: (model, position) => {
    const word = model.getWordAtPosition(position);
    if (!word) return null;

    // 获取当前行的内容
    const lineContent = model.getLineContent(position.lineNumber);

    // 检查是否是 JSON 键
    const isKey = /"\s*:\s*/.test(lineContent.substring(word.startColumn));

    if (isKey) {
      // 为 JSON 键提供文档
      return {
        contents: [
          { value: `**${word.word}**` },
          { value: '这是一个 JSON 键。' },
          // 可以根据 JSON Schema 提供更详细的信息
        ]
      };
    } else {
      // 为 JSON 值提供文档
      return {
        contents: [
          { value: `值: ${word.word}` },
          { value: `类型: ${typeof JSON.parse(word.word)}` },
        ]
      };
    }
  }
});
```

### 4. 缩略图导航

配置 Monaco Editor 的缩略图功能，特别是对于大型 JSON 文件：

```typescript
// 缩略图配置
const minimapOptions = {
  minimap: {
    enabled: true,
    showSlider: 'always',
    renderCharacters: true,
    maxColumn: 120,
    scale: 1,
  },
};
```

### 5. 内置搜索和替换

利用 Monaco Editor 的内置搜索和替换功能：

```typescript
// 搜索配置
const searchOptions = {
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'always',
    loop: true,
  },
};

// 触发搜索和替换
const triggerSearch = (editor) => {
  editor.getAction('actions.find').run();
};

const triggerReplace = (editor) => {
  editor.getAction('editor.action.startFindReplaceAction').run();
};
```

### 6. 自动缩进和格式化

配置自动缩进和格式化功能：

```typescript
// 自动缩进和格式化配置
const formattingOptions = {
  autoIndent: 'full',
  formatOnPaste: true,
  formatOnType: false,
};

// 注册格式化提供程序
monaco.languages.registerDocumentFormattingEditProvider('json', {
  provideDocumentFormattingEdits: (model) => {
    try {
      const text = model.getValue();
      const formatted = JSON.stringify(JSON.parse(text), null, 2);

      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    } catch (e) {
      // 处理无效 JSON
      return [];
    }
  },
});
```

### 7. 多光标编辑和列选择

启用多光标编辑和列选择模式：

```typescript
// 多光标和列选择配置
const multiCursorOptions = {
  multiCursorModifier: 'ctrlCmd', // 'alt' 或 'ctrlCmd'
  multiCursorMergeOverlapping: true,
  columnSelection: false, // 设置为 true 启用列选择
};

// 添加多光标快捷键
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
  // 添加下一个匹配项的光标
  editor.getAction('editor.action.addSelectionToNextFindMatch').run();
});
```

### 8. JSON Schema 集成

集成 JSON Schema 以提供自动完成和验证功能：

```typescript
// 注册 JSON Schema
const registerJsonSchema = (schema) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: schema.uri,
        fileMatch: schema.fileMatch,
        schema: schema.schema,
      },
    ],
  });
};

// 示例 Schema
const exampleSchema = {
  uri: 'http://myserver/schemas/example.json',
  fileMatch: ['*'],
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '名称字段',
      },
      age: {
        type: 'number',
        description: '年龄字段',
      },
    },
  },
};

registerJsonSchema(exampleSchema);
```

### 9. 差异对比功能

使用 Monaco Editor 的差异编辑器功能：

```typescript
// 创建差异编辑器
const createDiffEditor = (originalContent, modifiedContent) => {
  const diffEditor = monaco.editor.createDiffEditor(container, {
    originalEditable: false,
    readOnly: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
  });

  // 设置原始和修改后的模型
  const originalModel = monaco.editor.createModel(originalContent, 'json');
  const modifiedModel = monaco.editor.createModel(modifiedContent, 'json');

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  return diffEditor;
};
```

## 性能优化

### 大文件处理

对于大型 JSON 文件，Monaco Editor 提供了性能优化选项：

```typescript
// 大文件优化配置
const largeFileOptions = {
  largeFileOptimizations: true,
  wordWrap: 'off', // 大文件禁用自动换行
  folding: false, // 大文件可能需要禁用折叠
  minimap: {
    enabled: false, // 大文件可能需要禁用缩略图
  },
};

// 根据文件大小应用不同配置
const applyEditorOptions = (editor, content) => {
  const isLargeFile = content.length > 500000; // 500KB

  if (isLargeFile) {
    editor.updateOptions(largeFileOptions);
    // 显示大文件警告
    showLargeFileWarning();
  } else {
    editor.updateOptions(defaultOptions);
  }
};
```

### 编辑器实例管理

正确管理 Monaco Editor 实例以避免内存泄漏：

```typescript
// 编辑器实例管理
let editorInstance = null;

const createEditor = () => {
  if (editorInstance) {
    disposeEditor();
  }

  editorInstance = monaco.editor.create(container, options);
  return editorInstance;
};

const disposeEditor = () => {
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }
};

// 组件卸载时清理
useEffect(() => {
  return () => {
    disposeEditor();
  };
}, []);
```

## 可访问性支持

配置 Monaco Editor 以提供良好的可访问性支持：

```typescript
// 可访问性配置
const accessibilityOptions = {
  accessibilitySupport: 'auto', // 'on', 'off', 或 'auto'
  ariaLabel: 'JSON 编辑器',
  tabIndex: 0,
};

// 添加屏幕阅读器友好的标签
const addAccessibilityLabels = (container) => {
  const editorElement = container.querySelector('.monaco-editor');
  if (editorElement) {
    editorElement.setAttribute('role', 'application');
    editorElement.setAttribute('aria-label', 'JSON 编辑器');
  }
};
```

## 主题集成

将 Monaco Editor 主题与应用主题集成：

```typescript
// 注册自定义主题
monaco.editor.defineTheme('customLightTheme', {
  base: 'vs',
  inherit: true,
  rules: [
    // 自定义语法高亮规则
  ],
  colors: {
    // 自定义颜色
    'editor.background': '#FFFFFF',
    'editor.foreground': '#111827',
    'editorCursor.foreground': '#3B82F6',
    'editor.lineHighlightBackground': '#F9FAFB',
    'editorLineNumber.foreground': '#6B7280',
  },
});

monaco.editor.defineTheme('customDarkTheme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // 自定义语法高亮规则
  ],
  colors: {
    // 自定义颜色
    'editor.background': '#1F2937',
    'editor.foreground': '#F9FAFB',
    'editorCursor.foreground': '#60A5FA',
    'editor.lineHighlightBackground': '#111827',
    'editorLineNumber.foreground': '#9CA3AF',
  },
});

// 应用主题
const applyTheme = (isDark) => {
  const theme = isDark ? 'customDarkTheme' : 'customLightTheme';
  monaco.editor.setTheme(theme);
};
```

## 键盘快捷键

配置 Monaco Editor 的键盘快捷键：

```typescript
// 添加自定义键盘快捷键
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
  // 触发搜索
  editor.getAction('actions.find').run();
});

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
  // 触发替换
  editor.getAction('editor.action.startFindReplaceAction').run();
});

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
  // 触发格式化
  editor.getAction('editor.action.formatDocument').run();
});

// 添加自定义操作
editor.addAction({
  id: 'json-minify',
  label: '压缩 JSON',
  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyM],
  run: (editor) => {
    try {
      const text = editor.getValue();
      const minified = JSON.stringify(JSON.parse(text));
      editor.setValue(minified);
    } catch (e) {
      // 处理错误
    }
  }
});
```

## 最佳实践

1. **按需加载 Monaco Editor**：使用动态导入减少初始加载时间
2. **正确处理编辑器生命周期**：创建和销毁编辑器实例
3. **优化大文件处理**：为大型 JSON 文件应用特殊配置
4. **集成 JSON Schema**：提供智能提示和验证
5. **自定义主题**：与应用主题保持一致
6. **添加可访问性支持**：确保编辑器可以被辅助技术使用
7. **提供键盘快捷键**：增强用户体验
8. **使用内置功能**：尽可能使用 Monaco 内置功能而不是自定义实现