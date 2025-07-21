/**
 * 差异对比集成测试
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

// 模拟剪贴板API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

describe('差异对比集成测试', () => {
  beforeEach(() => {
    // 设置全局对象
    window.pdxJsonEditor = {
      getCurrentContent: jest.fn().mockReturnValue('{"test":"value"}'),
      setContent: jest.fn(),
      saveOriginalContent: jest.fn(),
      openDiffViewer: jest.fn()
    };
  });
  
  afterEach(() => {
    // 清理全局对象
    delete window.pdxJsonEditor;
  });
  
  test('应能通过工具栏按钮打开差异对比视图', async () => {
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
  
  test('应能保存差异对比结果', async () => {
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
    
    // 模拟点击保存按钮
    const saveButton = screen.getByLabelText('保存修改');
    fireEvent.click(saveButton);
    
    // 验证是否调用了setContent方法
    expect(window.pdxJsonEditor.setContent).toHaveBeenCalled();
  });
  
  test('应能关闭差异对比视图', async () => {
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
    
    // 模拟点击关闭按钮
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);
    
    // 验证差异对比视图是否关闭
    expect(screen.queryByText('差异对比')).not.toBeInTheDocument();
  });
});