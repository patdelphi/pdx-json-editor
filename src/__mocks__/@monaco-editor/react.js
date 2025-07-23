/**
 * Monaco Editor React 组件的模拟
 */

import { h } from 'preact';

// 模拟 Monaco 编辑器实例
const mockEditor = {
  getValue: jest.fn(() => '{"test": "value"}'),
  setValue: jest.fn(),
  getModel: jest.fn(() => ({
    getValueInRange: jest.fn(),
    getPositionAt: jest.fn(),
    getOffsetAt: jest.fn(),
    getLineCount: jest.fn(() => 10)
  })),
  updateOptions: jest.fn(),
  onDidChangeCursorPosition: jest.fn(() => ({ dispose: jest.fn() })),
  getAction: jest.fn(() => ({ run: jest.fn() })),
  focus: jest.fn(),
  layout: jest.fn(),
  dispose: jest.fn()
};

// 模拟 Monaco 实例
const mockMonaco = {
  editor: {
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
    create: jest.fn(() => mockEditor),
    createModel: jest.fn(),
    setModelLanguage: jest.fn()
  },
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn(),
        setModeConfiguration: jest.fn()
      }
    },
    registerCompletionItemProvider: jest.fn(),
    registerHoverProvider: jest.fn(),
    registerDocumentFormattingEditProvider: jest.fn(),
    registerFoldingRangeProvider: jest.fn()
  },
  Range: jest.fn(),
  Position: jest.fn(),
  Uri: {
    parse: jest.fn()
  }
};

// 模拟编辑器组件
const Editor = ({ value, onMount }) => {
  // 模拟编辑器挂载
  if (onMount) {
    setTimeout(() => {
      onMount(mockEditor, mockMonaco);
    }, 0);
  }
  
  return <div data-testid="monaco-editor" data-value={value}>{value}</div>;
};

// 模拟差异编辑器组件
const DiffEditor = ({ original, modified, onMount }) => {
  // 模拟编辑器挂载
  if (onMount) {
    setTimeout(() => {
      onMount({
        getOriginalEditor: () => mockEditor,
        getModifiedEditor: () => mockEditor
      }, mockMonaco);
    }, 0);
  }
  
  return (
    <div data-testid="monaco-diff-editor">
      <div data-testid="original-editor">{original}</div>
      <div data-testid="modified-editor">{modified}</div>
    </div>
  );
};

// 导出模拟组件和实用函数
export default Editor;
export { DiffEditor, mockEditor, mockMonaco };