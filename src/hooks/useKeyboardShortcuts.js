/**
 * 键盘快捷键Hook
 * 提供键盘快捷键处理功能
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { useTouchDevice } from './useResponsive';

/**
 * 快捷键定义
 */
export const SHORTCUTS = {
  FORMAT: {
    key: 'F',
    modifier: 'Ctrl+Shift',
    description: '格式化JSON',
    action: 'format'
  },
  COMPRESS: {
    key: 'M',
    modifier: 'Ctrl+Shift',
    description: '压缩JSON',
    action: 'compress'
  },
  SEARCH: {
    key: 'F',
    modifier: 'Ctrl',
    description: '搜索',
    action: 'search'
  },
  SAVE: {
    key: 'S',
    modifier: 'Ctrl',
    description: '保存',
    action: 'save'
  },
  NEW: {
    key: 'N',
    modifier: 'Ctrl',
    description: '新建',
    action: 'new'
  },
  OPEN: {
    key: 'O',
    modifier: 'Ctrl',
    description: '打开',
    action: 'open'
  },
  DIFF: {
    key: 'D',
    modifier: 'Ctrl+Alt',
    description: '差异对比',
    action: 'diff'
  },
  HELP: {
    key: '?',
    modifier: '',
    description: '显示快捷键帮助',
    action: 'help'
  },
  FOLD_ALL: {
    key: '[',
    modifier: 'Ctrl',
    description: '折叠所有',
    action: 'foldAll'
  },
  UNFOLD_ALL: {
    key: ']',
    modifier: 'Ctrl',
    description: '展开所有',
    action: 'unfoldAll'
  },
  UNDO: {
    key: 'Z',
    modifier: 'Ctrl',
    description: '撤销',
    action: 'undo'
  },
  REDO: {
    key: 'Y',
    modifier: 'Ctrl',
    description: '重做',
    action: 'redo'
  }
};

/**
 * 使用键盘快捷键的Hook
 * @param {Object} handlers - 快捷键处理函数映射
 * @param {Function} handlers.format - 格式化处理函数
 * @param {Function} handlers.compress - 压缩处理函数
 * @param {Function} handlers.search - 搜索处理函数
 * @param {Function} handlers.save - 保存处理函数
 * @param {Function} handlers.new - 新建处理函数
 * @param {Function} handlers.open - 打开处理函数
 * @param {Function} handlers.diff - 差异对比处理函数
 * @param {Function} handlers.help - 帮助处理函数
 * @param {Function} handlers.foldAll - 折叠所有处理函数
 * @param {Function} handlers.unfoldAll - 展开所有处理函数
 * @param {Function} handlers.undo - 撤销处理函数
 * @param {Function} handlers.redo - 重做处理函数
 * @param {boolean} enabled - 是否启用快捷键
 * @returns {{
 *   showHelp: boolean,
 *   setShowHelp: (show: boolean) => void,
 *   toggleHelp: () => void
 * }} - 快捷键相关状态和方法
 */
export const useKeyboardShortcuts = (handlers = {}, enabled = true) => {
  const [showHelp, setShowHelp] = useState(false);
  const isTouch = useTouchDevice();
  
  // 切换帮助对话框
  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);
  
  // 在触摸设备上禁用键盘快捷键
  const isEnabled = enabled && !isTouch;
  
  useEffect(() => {
    if (!isEnabled) return;
    
    const handleKeyDown = (event) => {
      // 检查是否在输入元素中
      const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) ||
                        event.target.isContentEditable ||
                        event.target.getAttribute('role') === 'textbox';
      
      // 如果在输入元素中，只处理特定的快捷键（如Esc和?）
      if (isInInput && event.key !== 'Escape' && event.key !== '?') {
        return;
      }
      
      // 格式化: Ctrl+Shift+F
      if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'F') {
        event.preventDefault();
        if (handlers.format) handlers.format();
      }
      
      // 压缩: Ctrl+Shift+M
      if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'M') {
        event.preventDefault();
        if (handlers.compress) handlers.compress();
      }
      
      // 搜索: Ctrl+F (由Monaco Editor处理)
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'f') {
        if (handlers.search) {
          event.preventDefault();
          handlers.search();
        }
      }
      
      // 保存: Ctrl+S
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (handlers.save) handlers.save();
      }
      
      // 新建: Ctrl+N
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        if (handlers.new) handlers.new();
      }
      
      // 打开: Ctrl+O
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        if (handlers.open) handlers.open();
      }
      
      // 帮助: ?
      if (!event.ctrlKey && !event.shiftKey && event.key === '?') {
        event.preventDefault();
        if (handlers.help) {
          handlers.help();
        } else {
          toggleHelp();
        }
      }
      
      // 折叠所有: Ctrl+[
      if (event.ctrlKey && !event.shiftKey && event.key === '[') {
        event.preventDefault();
        if (handlers.foldAll) handlers.foldAll();
      }
      
      // 展开所有: Ctrl+]
      if (event.ctrlKey && !event.shiftKey && event.key === ']') {
        event.preventDefault();
        if (handlers.unfoldAll) handlers.unfoldAll();
      }
      
      // 差异对比: Ctrl+Alt+D
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        if (handlers.diff) handlers.diff();
      }
      
      // 撤销: Ctrl+Z (通常由Monaco Editor处理，但我们也可以添加自定义处理)
      if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'z') {
        // 注意：我们不阻止默认行为，因为Monaco Editor已经处理了这个快捷键
        if (handlers.undo) handlers.undo();
      }
      
      // 重做: Ctrl+Y (通常由Monaco Editor处理，但我们也可以添加自定义处理)
      if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'y') {
        // 注意：我们不阻止默认行为，因为Monaco Editor已经处理了这个快捷键
        if (handlers.redo) handlers.redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, isEnabled, toggleHelp]);
  
  return {
    showHelp,
    setShowHelp,
    toggleHelp
  };
};