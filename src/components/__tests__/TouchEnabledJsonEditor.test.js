/**
 * TouchEnabledJsonEditor组件测试
 */

import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { TouchEnabledJsonEditor } from '../TouchEnabledJsonEditor';
import { useBreakpoint, useTouchDevice } from '../../hooks/useResponsive';
import { useSwipe, usePinch, useDoubleTap } from '../../hooks/useGestures';

// 模拟hooks
jest.mock('../../hooks/useResponsive', () => ({
  useBreakpoint: jest.fn(),
  useTouchDevice: jest.fn()
}));

jest.mock('../../hooks/useGestures', () => ({
  useSwipe: jest.fn().mockReturnValue({
    handleTouchStart: jest.fn(),
    handleTouchEnd: jest.fn(),
    isEnabled: true
  }),
  usePinch: jest.fn().mockReturnValue({
    handleTouchStart: jest.fn(),
    handleTouchMove: jest.fn(),
    handleTouchEnd: jest.fn(),
    isEnabled: true
  }),
  useDoubleTap: jest.fn().mockReturnValue({
    handleTouchEnd: jest.fn(),
    isEnabled: true
  })
}));

// 模拟Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ onMount }) => {
      // 模拟编辑器实例
      const editor = {
        getAction: jest.fn().mockReturnValue({
          run: jest.fn()
        }),
        updateOptions: jest.fn(),
        getModel: jest.fn().mockReturnValue({}),
        getValue: jest.fn().mockReturnValue('{}'),
        getVisibleRanges: jest.fn().mockReturnValue([{
          startLineNumber: 1,
          endLineNumber: 10
        }]),
        getScrollTop: jest.fn().mockReturnValue(0),
        setScrollPosition: jest.fn(),
        getOption: jest.fn().mockReturnValue(20),
        onDidChangeCursorPosition: jest.fn()
      };
      
      // 模拟Monaco实例
      const monaco = {
        editor: {
          EditorOption: {
            lineHeight: 'lineHeight'
          }
        },
        languages: {
          json: {
            jsonDefaults: {
              setDiagnosticsOptions: jest.fn()
            }
          },
          registerDocumentFormattingEditProvider: jest.fn(),
          registerCompletionItemProvider: jest.fn(),
          registerHoverProvider: jest.fn(),
          registerFoldingRangeProvider: jest.fn()
        }
      };
      
      // 调用onMount回调
      if (onMount) {
        setTimeout(() => {
          onMount(editor, monaco);
        }, 0);
      }
      
      return <div data-testid="monaco-editor">Monaco Editor</div>;
    }
  };
});

// 模拟主题上下文
jest.mock('../../theme/ThemeContext', () => ({
  useTheme: () => ({
    themeId: 'light',
    monacoTheme: 'vs-light'
  })
}));

describe('TouchEnabledJsonEditor', () => {
  beforeEach(() => {
    // 默认设置为非触摸设备
    useTouchDevice.mockReturnValue(false);
    useBreakpoint.mockReturnValue({
      isMobile: false,
      isTablet: false
    });
    
    // 清除localStorage模拟
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn()
      },
      writable: true
    });
    
    // 清除全局对象
    window.pdxJsonEditor = undefined;
  });
  
  test('应渲染编辑器', () => {
    render(<TouchEnabledJsonEditor />);
    
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
  
  test('在触摸设备上应显示缩放按钮', () => {
    // 模拟触摸设备
    useTouchDevice.mockReturnValue(true);
    
    render(<TouchEnabledJsonEditor />);
    
    // 等待异步操作完成
    setTimeout(() => {
      expect(screen.getByLabelText('放大字体')).toBeInTheDocument();
      expect(screen.getByLabelText('缩小字体')).toBeInTheDocument();
    }, 0);
  });
  
  test('应注册手势处理函数', () => {
    // 模拟触摸设备
    useTouchDevice.mockReturnValue(true);
    
    render(<TouchEnabledJsonEditor />);
    
    // 验证手势hooks被调用
    expect(useSwipe).toHaveBeenCalled();
    expect(usePinch).toHaveBeenCalled();
    expect(useDoubleTap).toHaveBeenCalled();
  });
  
  test('应暴露全局方法', () => {
    render(<TouchEnabledJsonEditor />);
    
    // 等待异步操作完成
    setTimeout(() => {
      expect(window.pdxJsonEditor).toBeDefined();
      expect(window.pdxJsonEditor.formatJson).toBeInstanceOf(Function);
      expect(window.pdxJsonEditor.compressJson).toBeInstanceOf(Function);
      expect(window.pdxJsonEditor.tryFixJson).toBeInstanceOf(Function);
    }, 0);
  });
});