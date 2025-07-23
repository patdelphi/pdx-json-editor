/**
 * 集成测试
 * 测试所有组件和服务的协同工作
 */


import { render, fireEvent, screen, waitFor } from '@testing-library/preact';
import { App } from './App';

// 模拟Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, onMount }) => {
      // 模拟编辑器挂载
      if (onMount) {
        setTimeout(() => {
          onMount({
            getValue: () => value || '',
            setValue: (newValue) => onChange && onChange(newValue),
            getModel: () => ({
              getVersionId: () => 1,
              getValue: () => value || '',
              getLanguageId: () => 'json'
            }),
            updateOptions: jest.fn(),
            onDidChangeCursorPosition: jest.fn(() => ({ dispose: jest.fn() })),
            onDidChangeModelContent: jest.fn(() => ({ dispose: jest.fn() })),
            getAction: () => ({ run: jest.fn() }),
            getVisibleRanges: () => [{ startLineNumber: 1, endLineNumber: 10 }],
            getScrollTop: () => 0,
            setScrollPosition: jest.fn(),
            getOption: () => 18,
            focus: jest.fn(),
            layout: jest.fn()
          }, {
            editor: { 
              EditorOption: { lineHeight: 18 }, // Use a numerical value for lineHeight
              create: jest.fn()
            },
            languages: {
              json: { 
                jsonDefaults: { 
                  setDiagnosticsOptions: jest.fn(),
                  setModeConfiguration: jest.fn()
                } 
              },
              registerDocumentFormattingEditProvider: jest.fn(),
              registerFoldingRangeProvider: jest.fn()
            }
          });
        }, 0);
      }
      
      return <div data-testid="mock-editor">{value}</div>;
    },
    DiffEditor: ({ original, modified, onMount }) => {
      if (onMount) {
        setTimeout(() => {
          onMount({
            getOriginalEditor: () => ({
              getValue: () => original,
              getModel: () => ({
                getValue: () => original,
                getLanguageId: () => 'json'
              })
            }),
            getModifiedEditor: () => ({
              getValue: () => modified,
              getModel: () => ({
                getValue: () => modified,
                getLanguageId: () => 'json'
              })
            }),
            updateOptions: jest.fn(),
            layout: jest.fn()
          });
        }, 0);
      }
      
      return (
        <div data-testid="mock-diff-editor">
          <div>Original: {original}</div>
          <div>Modified: {modified}</div>
        </div>
      );
    }
  };
});

// 模拟文件API


// 模拟localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模拟剪贴板API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

describe('集成测试', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
    
    // 设置全局对象
    window.pdxJsonEditor = {
      getCurrentContent: jest.fn().mockReturnValue('{"test":"value"}'),
      setContent: jest.fn(),
      saveOriginalContent: jest.fn(),
      openDiffViewer: jest.fn(),
      formatJson: jest.fn(),
      compressJson: jest.fn(),
      tryFixJson: jest.fn(),
      saveFile: jest.fn(),
      saveAsFile: jest.fn(),
      newFile: jest.fn(),
      openFile: jest.fn(),
      handleLargeFile: jest.fn()
    };
  });
  
  afterEach(() => {
    // 清理全局对象
    delete window.pdxJsonEditor;
    jest.clearAllMocks();
  });
  
  test('应能正确渲染应用', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
  
  test('应能打开差异对比视图并保存修改', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // 模拟点击差异对比按钮
    const diffButton = screen.getByText('差异对比');
    fireEvent.click(diffButton);
    
    // 验证差异对比视图是否打开
    expect(screen.getByText('差异对比')).toBeInTheDocument();
    
    // 模拟点击保存按钮
    const saveButton = screen.getByLabelText('保存修改');
    fireEvent.click(saveButton);
    
    // 验证是否调用了setContent方法
    expect(window.pdxJsonEditor.setContent).toHaveBeenCalled();
  });
  
  test('应能正确处理大文件警告', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // 模拟大文件拖放
    const largeFile = new File(['{"test":"value"}'], 'large.json', { 
      type: 'application/json'
    });
    Object.defineProperty(largeFile, 'size', { value: 2000000 }); // 2MB
    
    // 手动触发大文件警告
    window.pdxJsonEditor.openFile = jest.fn();
    const app = screen.getByTestId('mock-editor').closest('div');
    
    // 模拟文件拖放事件
    const dropEvent = new Event('drop');
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [largeFile],
        types: ['Files'],
        clearData: jest.fn()
      }
    });
    
    // 触发拖放事件
    fireEvent(app, dropEvent);
    
    // 验证是否调用了openFile方法
    expect(window.pdxJsonEditor.openFile).toHaveBeenCalled();
  });
  
  test('应能正确集成所有组件和服务', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // 验证全局对象是否正确设置
    expect(window.pdxJsonEditor.saveOriginalContent).toBeDefined();
    expect(window.pdxJsonEditor.openDiffViewer).toBeDefined();
    
    // 验证差异对比功能
    window.pdxJsonEditor.openDiffViewer('{"original":"content"}', '{"modified":"content"}');
    
    await waitFor(() => {
      expect(screen.getByText('差异对比')).toBeInTheDocument();
    });
    
    // 关闭差异对比视图
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);
    
    // 验证差异对比视图是否关闭
    await waitFor(() => {
      expect(screen.queryByText('差异对比')).not.toBeInTheDocument();
    });
  });
  
  test('应能处理JSON格式化和压缩', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // 模拟格式化JSON
    window.pdxJsonEditor.formatJson.mockImplementation(() => {
      window.pdxJsonEditor.getCurrentContent.mockReturnValue('{\n  "test": "value"\n}');
    });
    
    // 点击格式化按钮
    const formatButton = screen.getByText('格式化');
    fireEvent.click(formatButton);
    
    // 验证是否调用了formatJson方法
    expect(window.pdxJsonEditor.formatJson).toHaveBeenCalled();
    
    // 模拟压缩JSON
    window.pdxJsonEditor.compressJson.mockImplementation(() => {
      window.pdxJsonEditor.getCurrentContent.mockReturnValue('{"test":"value"}');
    });
    
    // 点击压缩按钮
    const compressButton = screen.getByText('压缩');
    fireEvent.click(compressButton);
    
    // 验证是否调用了compressJson方法
    expect(window.pdxJsonEditor.compressJson).toHaveBeenCalled();
  });
});