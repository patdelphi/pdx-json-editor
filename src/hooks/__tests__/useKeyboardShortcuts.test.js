/**
 * useKeyboardShortcuts Hook测试
 */

import { renderHook, act } from '@testing-library/preact-hooks';
import { useKeyboardShortcuts, SHORTCUTS } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  // 模拟处理函数
  const mockHandlers = {
    format: jest.fn(),
    compress: jest.fn(),
    search: jest.fn(),
    save: jest.fn(),
    new: jest.fn(),
    open: jest.fn(),
    help: jest.fn(),
    foldAll: jest.fn(),
    unfoldAll: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应返回帮助对话框状态', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(mockHandlers));
    
    expect(result.current.showHelp).toBe(false);
    
    act(() => {
      result.current.toggleHelp();
    });
    
    expect(result.current.showHelp).toBe(true);
    
    act(() => {
      result.current.setShowHelp(false);
    });
    
    expect(result.current.showHelp).toBe(false);
  });
  
  test('应处理格式化快捷键', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));
    
    // 模拟键盘事件
    const event = new KeyboardEvent('keydown', {
      key: 'F',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    
    // 触发事件
    document.dispatchEvent(event);
    
    // 检查是否调用了处理函数
    expect(mockHandlers.format).toHaveBeenCalled();
  });
  
  test('应处理压缩快捷键', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));
    
    // 模拟键盘事件
    const event = new KeyboardEvent('keydown', {
      key: 'M',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    
    // 触发事件
    document.dispatchEvent(event);
    
    // 检查是否调用了处理函数
    expect(mockHandlers.compress).toHaveBeenCalled();
  });
  
  test('应处理帮助快捷键', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(mockHandlers));
    
    // 模拟键盘事件
    const event = new KeyboardEvent('keydown', {
      key: '?',
      bubbles: true
    });
    
    // 触发事件
    document.dispatchEvent(event);
    
    // 检查是否调用了处理函数
    expect(mockHandlers.help).toHaveBeenCalled();
    expect(result.current.showHelp).toBe(false); // 因为有自定义处理函数，所以不会切换showHelp
    
    // 测试没有自定义处理函数的情况
    const { result: result2 } = renderHook(() => useKeyboardShortcuts({
      format: mockHandlers.format
    }));
    
    // 触发事件
    document.dispatchEvent(event);
    
    // 检查是否切换了showHelp
    expect(result2.current.showHelp).toBe(true);
  });
  
  test('应忽略输入框中的快捷键', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));
    
    // 创建输入框
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    // 模拟键盘事件
    const event = new KeyboardEvent('keydown', {
      key: 'F',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    
    // 触发事件
    input.dispatchEvent(event);
    
    // 检查是否没有调用处理函数
    expect(mockHandlers.format).not.toHaveBeenCalled();
    
    // 清理
    document.body.removeChild(input);
  });
  
  test('SHORTCUTS常量应包含所有快捷键', () => {
    expect(SHORTCUTS.FORMAT).toBeDefined();
    expect(SHORTCUTS.COMPRESS).toBeDefined();
    expect(SHORTCUTS.SEARCH).toBeDefined();
    expect(SHORTCUTS.SAVE).toBeDefined();
    expect(SHORTCUTS.NEW).toBeDefined();
    expect(SHORTCUTS.OPEN).toBeDefined();
    expect(SHORTCUTS.HELP).toBeDefined();
    expect(SHORTCUTS.FOLD_ALL).toBeDefined();
    expect(SHORTCUTS.UNFOLD_ALL).toBeDefined();
  });
});