/**
 * 键盘导航Hook测试
 */

import { renderHook, act } from '@testing-library/preact-hooks';
import { 
  useKeyboardNavigation, 
  useFocusTrap, 
  useKeyboardShortcutNavigation,
  useKeyboardNavigationMenu,
  useKeyboardNavigationDialog,
  useKeyboardNavigationTabs,
  useKeyboardNavigationTree
} from '../useKeyboardNavigation';

// 模拟DOM元素
const mockElement = (attrs = {}) => ({
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  },
  setAttribute: jest.fn(),
  focus: jest.fn(),
  ...attrs
});

// 模拟document.querySelector
const mockQuerySelector = jest.fn();
const mockQuerySelectorAll = jest.fn();

// 模拟document.addEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    // 模拟DOM API
    document.querySelector = mockQuerySelector;
    document.querySelectorAll = mockQuerySelectorAll;
    document.addEventListener = mockAddEventListener;
    document.removeEventListener = mockRemoveEventListener;
    
    // 清除所有模拟调用信息
    jest.clearAllMocks();
  });
  
  describe('useKeyboardNavigation', () => {
    test('应初始化键盘导航', () => {
      // 模拟容器和项目
      const mockContainer = {
        querySelectorAll: jest.fn().mockReturnValue([
          mockElement(),
          mockElement(),
          mockElement()
        ])
      };
      
      mockQuerySelector.mockReturnValue(mockContainer);
      
      const { result } = renderHook(() => useKeyboardNavigation({
        containerSelector: '#container',
        itemSelector: '.item',
        enabled: true
      }));
      
      // 验证初始化
      expect(mockQuerySelector).toHaveBeenCalledWith('#container');
      expect(mockContainer.querySelectorAll).toHaveBeenCalledWith('.item');
      
      // 验证返回的方法
      expect(result.current.moveNext).toBeInstanceOf(Function);
      expect(result.current.movePrev).toBeInstanceOf(Function);
      expect(result.current.moveFirst).toBeInstanceOf(Function);
      expect(result.current.moveLast).toBeInstanceOf(Function);
      expect(result.current.selectCurrent).toBeInstanceOf(Function);
      expect(result.current.setActiveItem).toBeInstanceOf(Function);
      expect(result.current.initialize).toBeInstanceOf(Function);
    });
    
    test('应设置激活项', () => {
      // 模拟项目
      const mockItems = [
        mockElement(),
        mockElement(),
        mockElement()
      ];
      
      // 模拟容器
      const mockContainer = {
        querySelectorAll: jest.fn().mockReturnValue(mockItems)
      };
      
      mockQuerySelector.mockReturnValue(mockContainer);
      
      const { result } = renderHook(() => useKeyboardNavigation({
        containerSelector: '#container',
        itemSelector: '.item',
        enabled: true
      }));
      
      // 设置激活项
      act(() => {
        result.current.setActiveItem(1);
      });
      
      // 验证激活项
      expect(mockItems[0].classList.remove).toHaveBeenCalledWith('keyboard-active');
      expect(mockItems[1].classList.add).toHaveBeenCalledWith('keyboard-active');
      expect(mockItems[1].setAttribute).toHaveBeenCalledWith('tabIndex', '0');
      expect(mockItems[1].focus).toHaveBeenCalled();
    });
  });
  
  describe('useFocusTrap', () => {
    test('应初始化焦点陷阱', () => {
      // 模拟可聚焦元素
      const mockFocusableElements = [
        mockElement(),
        mockElement(),
        mockElement()
      ];
      
      // 模拟容器
      const mockContainer = {
        querySelectorAll: jest.fn().mockReturnValue(mockFocusableElements)
      };
      
      mockQuerySelector.mockReturnValue(mockContainer);
      
      // 模拟document.activeElement
      document.activeElement = mockFocusableElements[0];
      
      const onEscape = jest.fn();
      
      const { result } = renderHook(() => useFocusTrap({
        containerSelector: '#container',
        active: true,
        onEscape
      }));
      
      // 验证初始化
      expect(mockQuerySelector).toHaveBeenCalledWith('#container');
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      // 验证返回的方法
      expect(result.current.focusFirstElement).toBeInstanceOf(Function);
      expect(result.current.focusLastElement).toBeInstanceOf(Function);
      
      // 验证聚焦第一个元素
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });
  });
  
  describe('useKeyboardShortcutNavigation', () => {
    test('应初始化键盘快捷键导航', () => {
      const shortcuts = {
        'ctrl+s': jest.fn(),
        'alt+f': jest.fn()
      };
      
      const { result } = renderHook(() => useKeyboardShortcutNavigation(shortcuts, true));
      
      // 验证初始化
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      // 验证返回的状态
      expect(result.current.isEnabled).toBe(true);
    });
  });
});