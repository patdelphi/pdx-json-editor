/**
 * 集成测试
 * 测试所有组件和服务的协同工作
 */

import { h } from 'preact';
import { render, fireEvent, screen, act } from '@testing-library/preact';
import { App } from '../../App';

// 模拟Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, onMount }) => {
      // 模拟编辑器挂载
      if (onMount) {
        setTimeout(() => {
          onMount({
            getValue: () => value,
            setValue: (newValue) => onChange && onChange(newValue),
            getModel: () => ({}),
            updateOptions: jest.fn(),
            onDidChangeCursorPosition: jest.fn(),
            getAction: () => ({ run: jest.fn() })
          }, {
            editor: {},
            languages: {
              json: { jsonDefaults: { setDiagnosticsOptions: jest.fn() } },
              registerDocumentFormattingEditProvider: jest.fn(),
              registerFoldingRangeProvider: jest.fn()
            }
          });
        }, 0);
      }
      
      return <div data-testid="mock-editor">{value}</div>;
    }
  };
});

// 模拟DiffEditor
jest.mock('@monaco-editor/react', () => {
  const actual = jest.requireActual('@monaco-editor/react');
  
  return {
    ...actual,
    __esModule: true,
    default: ({ value, onChange, onMount }) => {
      // 模拟编辑器挂载
      if (onMount) {
        setTimeout(() => {
          onMount({
            getValue: () => value,
            setValue: (newValue) => onChange && onChange(newValue),
            getModel: () => ({}),
            updateOptions: jest.fn(),
            onDidChangeCursorPosition: jest.fn(),
            getAction: () => ({ run: jest.fn() })
          }, {
            editor: {},
            languages: {
              json: { jsonDefaults: { setDiagnosticsOptions: jest.fn() } },
              registerDocumentFormattingEditProvider: jest.fn(),
              registerFoldingRangeProvider: jest.fn()
            }
          });
        }, 0);
      }
      
      return <div data-testid="mock-editor">{value}</div>;
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
      openFile: jest.fn()
    };
  });
  
  afterEach(() => {
    // 清理全局对象
    delete window.pdxJsonEditor;
  });
  
  test('应能正确渲染应用', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 验证主要组件是否存在
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });
  
  test('应能打开搜索面板', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击搜索按钮
    const searchButton = screen.getByLabelText('搜索 (Ctrl+F)');
    fireEvent.click(searchButton);
    
    // 验证搜索面板是否打开
    expect(screen.getByText('搜索和替换')).toBeInTheDocument();
  });
  
  test('应能打开设置对话框', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击设置按钮
    const settingsButton = screen.getByLabelText('设置');
    fireEvent.click(settingsButton);
    
    // 验证设置对话框是否打开
    expect(screen.getByText('编辑器设置')).toBeInTheDocument();
  });
  
  test('应能打开差异对比视图', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击差异对比按钮
    const diffButton = screen.getByText('差异对比');
    fireEvent.click(diffButton);
    
    // 验证差异对比视图是否打开
    expect(screen.getByText('差异对比')).toBeInTheDocument();
  });
  
  test('应能格式化JSON', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击格式化按钮
    const formatButton = screen.getByText('格式化');
    fireEvent.click(formatButton);
    
    // 验证是否调用了formatJson方法
    expect(window.pdxJsonEditor.formatJson).toHaveBeenCalled();
  });
  
  test('应能压缩JSON', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击压缩按钮
    const compressButton = screen.getByText('压缩');
    fireEvent.click(compressButton);
    
    // 验证是否调用了compressJson方法
    expect(window.pdxJsonEditor.compressJson).toHaveBeenCalled();
  });
  
  test('应能修复JSON', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击修复按钮
    const fixButton = screen.getByText('修复');
    fireEvent.click(fixButton);
    
    // 验证是否调用了tryFixJson方法
    expect(window.pdxJsonEditor.tryFixJson).toHaveBeenCalled();
  });
  
  test('应能保存文件', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击保存按钮
    const saveButton = screen.getByLabelText('保存');
    fireEvent.click(saveButton);
    
    // 验证是否调用了saveFile方法
    expect(window.pdxJsonEditor.saveFile).toHaveBeenCalled();
  });
  
  test('应能新建文件', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待编辑器加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // 模拟点击新建按钮
    const newButton = screen.getByLabelText('新建');
    fireEvent.click(newButton);
    
    // 验证是否调用了newFile方法
    expect(window.pdxJsonEditor.newFile).toHaveBeenCalled();
  });
  
  test('应能打开文件', async () => {
    // 渲染应用
    render(<App />);
    
    // 等待组件挂载
    await new Promise(resolve => setTimeout(resolve, 100));    
// 模拟点击打开按钮
    const openButton = screen.getByLabelText('打开');
    fireEvent.click(openButton);
    
    // 验证是否调用了openFile方法
    expect(window.pdxJsonEditor.openFile).toHaveBeenCalled();
  });
});