/**
 * 键盘导航Hook
 * 提供键盘导航相关功能
 */

import { useRef, useEffect, useCallback } from 'preact/hooks';
import { createKeyboardHandler } from '../utils/accessibilityUtils';

/**
 * 使用键盘导航的Hook
 * @param {Object} options - 选项
 * @param {string} options.containerSelector - 容器选择器
 * @param {string} options.itemSelector - 项目选择器
 * @param {string} options.activeClass - 激活类名
 * @param {Function} options.onSelect - 选择回调
 * @param {Function} options.onEscape - ESC键回调
 * @param {boolean} options.loop - 是否循环
 * @param {boolean} options.enabled - 是否启用
 * @returns {Object} - 键盘导航相关状态和方法
 */
export const useKeyboardNavigation = ({
  containerSelector,
  itemSelector,
  activeClass = 'keyboard-active',
  onSelect,
  onEscape,
  loop = true,
  enabled = true
}) => {
  const activeIndexRef = useRef(-1);
  const itemsRef = useRef([]);
  
  // 获取可导航项
  const getItems = useCallback(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return [];
    
    return Array.from(container.querySelectorAll(itemSelector));
  }, [containerSelector, itemSelector]);
  
  // 设置激活项
  const setActiveItem = useCallback((index) => {
    // 获取项目
    const items = getItems();
    if (items.length === 0) return;
    
    // 清除所有激活状态
    items.forEach(item => {
      item.classList.remove(activeClass);
      item.setAttribute('tabIndex', '-1');
    });
    
    // 设置新的激活项
    if (index >= 0 && index < items.length) {
      items[index].classList.add(activeClass);
      items[index].setAttribute('tabIndex', '0');
      items[index].focus();
      activeIndexRef.current = index;
    }
  }, [getItems, activeClass]);
  
  // 移动到下一项
  const moveNext = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;
    
    let nextIndex = activeIndexRef.current + 1;
    if (nextIndex >= items.length) {
      nextIndex = loop ? 0 : items.length - 1;
    }
    
    setActiveItem(nextIndex);
  }, [getItems, setActiveItem, loop]);
  
  // 移动到上一项
  const movePrev = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;
    
    let prevIndex = activeIndexRef.current - 1;
    if (prevIndex < 0) {
      prevIndex = loop ? items.length - 1 : 0;
    }
    
    setActiveItem(prevIndex);
  }, [getItems, setActiveItem, loop]);
  
  // 移动到第一项
  const moveFirst = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;
    
    setActiveItem(0);
  }, [getItems, setActiveItem]);
  
  // 移动到最后一项
  const moveLast = useCallback(() => {
    const items = getItems();
    if (items.length === 0) return;
    
    setActiveItem(items.length - 1);
  }, [getItems, setActiveItem]);
  
  // 选择当前项
  const selectCurrent = useCallback(() => {
    const items = getItems();
    if (items.length === 0 || activeIndexRef.current < 0) return;
    
    const currentItem = items[activeIndexRef.current];
    if (currentItem && onSelect) {
      onSelect(currentItem, activeIndexRef.current);
    }
  }, [getItems, onSelect]);
  
  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    const handler = createKeyboardHandler({
      onArrowDown: moveNext,
      onArrowUp: movePrev,
      onArrowRight: moveNext,
      onArrowLeft: movePrev,
      onHome: moveFirst,
      onEnd: moveLast,
      onEnter: selectCurrent,
      onSpace: selectCurrent,
      onEscape: onEscape
    });
    
    handler(event);
  }, [enabled, moveNext, movePrev, moveFirst, moveLast, selectCurrent, onEscape]);
  
  // 初始化
  const initialize = useCallback(() => {
    const items = getItems();
    itemsRef.current = items;
    
    // 设置初始tabIndex
    items.forEach((item, index) => {
      item.setAttribute('tabIndex', index === 0 ? '0' : '-1');
    });
    
    // 重置激活索引
    activeIndexRef.current = -1;
  }, [getItems]);
  
  // 监听键盘事件
  useEffect(() => {
    if (!enabled) return;
    
    // 初始化
    initialize();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, initialize, handleKeyDown]);
  
  return {
    moveNext,
    movePrev,
    moveFirst,
    moveLast,
    selectCurrent,
    setActiveItem,
    initialize
  };
};

/**
 * 使用焦点陷阱的Hook
 * @param {Object} options - 选项
 * @param {string} options.containerSelector - 容器选择器
 * @param {boolean} options.active - 是否激活
 * @param {Function} options.onEscape - ESC键回调
 * @returns {Object} - 焦点陷阱相关状态和方法
 */
export const useFocusTrap = ({
  containerSelector,
  active = true,
  onEscape
}) => {
  const previousFocusRef = useRef(null);
  
  // 获取可聚焦元素
  const getFocusableElements = useCallback(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return [];
    
    // 可聚焦元素选择器
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex="0"]'
    ];
    
    return Array.from(container.querySelectorAll(focusableSelectors.join(',')));
  }, [containerSelector]);
  
  // 聚焦第一个元素
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);
  
  // 聚焦最后一个元素
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);
  
  // 处理Tab键
  const handleTab = useCallback((event) => {
    if (!active) return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // 如果按下Shift+Tab且当前焦点在第一个元素上，则聚焦最后一个元素
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // 如果按下Tab且当前焦点在最后一个元素上，则聚焦第一个元素
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, [active, getFocusableElements]);
  
  // 处理ESC键
  const handleEscape = useCallback((event) => {
    if (!active || !onEscape) return;
    
    if (event.key === 'Escape') {
      onEscape();
    }
  }, [active, onEscape]);
  
  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Tab') {
      handleTab(event);
    } else if (event.key === 'Escape') {
      handleEscape(event);
    }
  }, [handleTab, handleEscape]);
  
  // 激活焦点陷阱
  useEffect(() => {
    if (!active) return;
    
    // 保存当前焦点
    previousFocusRef.current = document.activeElement;
    
    // 聚焦第一个元素
    focusFirstElement();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // 恢复之前的焦点
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
      
      // 移除键盘事件监听
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, focusFirstElement, handleKeyDown]);
  
  return {
    focusFirstElement,
    focusLastElement
  };
};

/**
 * 使用键盘快捷键导航的Hook
 * @param {Object} shortcuts - 快捷键映射
 * @param {boolean} enabled - 是否启用
 * @returns {Object} - 键盘快捷键导航相关状态和方法
 */
export const useKeyboardShortcutNavigation = (shortcuts = {}, enabled = true) => {
  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    // 检查是否按下了修饰键
    const modifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey
    };
    
    // 遍历快捷键映射
    for (const [shortcut, callback] of Object.entries(shortcuts)) {
      // 解析快捷键
      const keys = shortcut.toLowerCase().split('+');
      const key = keys.pop();
      
      // 检查修饰键
      const requiredModifiers = {
        ctrl: keys.includes('ctrl'),
        alt: keys.includes('alt'),
        shift: keys.includes('shift'),
        meta: keys.includes('meta')
      };
      
      // 检查是否匹配
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        modifiers.ctrl === requiredModifiers.ctrl &&
        modifiers.alt === requiredModifiers.alt &&
        modifiers.shift === requiredModifiers.shift &&
        modifiers.meta === requiredModifiers.meta
      ) {
        event.preventDefault();
        callback(event);
        break;
      }
    }
  }, [enabled, shortcuts]);
  
  // 监听键盘事件
  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
  
  return {
    isEnabled: enabled
  };
};

/**
 * 使用键盘导航菜单的Hook
 * @param {Object} options - 选项
 * @param {string} options.menuSelector - 菜单选择器
 * @param {string} options.itemSelector - 菜单项选择器
 * @param {Function} options.onSelect - 选择回调
 * @param {Function} options.onClose - 关闭回调
 * @param {boolean} options.isOpen - 是否打开
 * @returns {Object} - 键盘导航菜单相关状态和方法
 */
export const useKeyboardNavigationMenu = ({
  menuSelector,
  itemSelector,
  onSelect,
  onClose,
  isOpen = false
}) => {
  // 使用键盘导航
  const { 
    moveNext, 
    movePrev, 
    moveFirst, 
    moveLast, 
    selectCurrent, 
    initialize 
  } = useKeyboardNavigation({
    containerSelector: menuSelector,
    itemSelector,
    onSelect,
    onEscape: onClose,
    enabled: isOpen
  });
  
  // 使用焦点陷阱
  const { focusFirstElement } = useFocusTrap({
    containerSelector: menuSelector,
    active: isOpen,
    onEscape: onClose
  });
  
  // 当菜单打开时初始化
  useEffect(() => {
    if (isOpen) {
      initialize();
      focusFirstElement();
    }
  }, [isOpen, initialize, focusFirstElement]);
  
  return {
    moveNext,
    movePrev,
    moveFirst,
    moveLast,
    selectCurrent
  };
};

/**
 * 使用键盘导航对话框的Hook
 * @param {Object} options - 选项
 * @param {string} options.dialogSelector - 对话框选择器
 * @param {Function} options.onClose - 关闭回调
 * @param {boolean} options.isOpen - 是否打开
 * @returns {Object} - 键盘导航对话框相关状态和方法
 */
export const useKeyboardNavigationDialog = ({
  dialogSelector,
  onClose,
  isOpen = false
}) => {
  // 使用焦点陷阱
  const { focusFirstElement } = useFocusTrap({
    containerSelector: dialogSelector,
    active: isOpen,
    onEscape: onClose
  });
  
  // 当对话框打开时聚焦第一个元素
  useEffect(() => {
    if (isOpen) {
      focusFirstElement();
    }
  }, [isOpen, focusFirstElement]);
  
  return {
    focusFirstElement
  };
};

/**
 * 使用键盘导航选项卡的Hook
 * @param {Object} options - 选项
 * @param {string} options.tablistSelector - 选项卡列表选择器
 * @param {string} options.tabSelector - 选项卡选择器
 * @param {string} options.panelSelector - 面板选择器
 * @param {Function} options.onSelect - 选择回调
 * @param {boolean} options.vertical - 是否垂直
 * @returns {Object} - 键盘导航选项卡相关状态和方法
 */
export const useKeyboardNavigationTabs = ({
  tablistSelector,
  tabSelector,
  panelSelector,
  onSelect,
  vertical = false
}) => {
  // 使用键盘导航
  const { 
    moveNext, 
    movePrev, 
    moveFirst, 
    moveLast, 
    selectCurrent, 
    setActiveItem, 
    initialize 
  } = useKeyboardNavigation({
    containerSelector: tablistSelector,
    itemSelector: tabSelector,
    onSelect,
    enabled: true
  });
  
  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    const handler = createKeyboardHandler({
      onArrowDown: vertical ? moveNext : null,
      onArrowUp: vertical ? movePrev : null,
      onArrowRight: !vertical ? moveNext : null,
      onArrowLeft: !vertical ? movePrev : null,
      onHome: moveFirst,
      onEnd: moveLast,
      onEnter: selectCurrent,
      onSpace: selectCurrent
    });
    
    handler(event);
  }, [vertical, moveNext, movePrev, moveFirst, moveLast, selectCurrent]);
  
  return {
    handleKeyDown,
    setActiveItem,
    initialize
  };
};

/**
 * 使用键盘导航树的Hook
 * @param {Object} options - 选项
 * @param {string} options.treeSelector - 树选择器
 * @param {string} options.itemSelector - 项目选择器
 * @param {Function} options.onSelect - 选择回调
 * @param {Function} options.onExpand - 展开回调
 * @param {Function} options.onCollapse - 折叠回调
 * @returns {Object} - 键盘导航树相关状态和方法
 */
export const useKeyboardNavigationTree = ({
  treeSelector,
  itemSelector,
  onSelect,
  onExpand,
  onCollapse
}) => {
  // 使用键盘导航
  const { 
    moveNext, 
    movePrev, 
    moveFirst, 
    moveLast, 
    selectCurrent, 
    setActiveItem, 
    initialize 
  } = useKeyboardNavigation({
    containerSelector: treeSelector,
    itemSelector,
    onSelect,
    enabled: true
  });
  
  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    const handler = createKeyboardHandler({
      onArrowDown: moveNext,
      onArrowUp: movePrev,
      onHome: moveFirst,
      onEnd: moveLast,
      onEnter: selectCurrent,
      onSpace: selectCurrent,
      onArrowRight: onExpand,
      onArrowLeft: onCollapse
    });
    
    handler(event);
  }, [moveNext, movePrev, moveFirst, moveLast, selectCurrent, onExpand, onCollapse]);
  
  return {
    handleKeyDown,
    setActiveItem,
    initialize
  };
};