/**
 * KeyboardShortcutsDialog组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';
import { SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

describe('KeyboardShortcutsDialog', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应显示所有快捷键', () => {
    render(
      <KeyboardShortcutsDialog
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // 检查对话框标题
    expect(screen.getByText('键盘快捷键')).toBeInTheDocument();
    
    // 检查是否显示了所有快捷键
    Object.values(SHORTCUTS).forEach(shortcut => {
      expect(screen.getByText(shortcut.description)).toBeInTheDocument();
    });
  });
  
  test('点击关闭按钮应调用onClose', () => {
    render(
      <KeyboardShortcutsDialog
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // 点击关闭按钮
    fireEvent.click(screen.getByText('关闭'));
    
    // 检查是否调用了onClose
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  test('应格式化修饰键和按键', () => {
    render(
      <KeyboardShortcutsDialog
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // 检查是否正确格式化了修饰键和按键
    // 例如，检查Ctrl+Shift+F的格式化
    const formatShortcut = SHORTCUTS.FORMAT;
    expect(screen.getByText(formatShortcut.key)).toBeInTheDocument();
    
    // 检查修饰键是否被分割并显示
    formatShortcut.modifier.split('+').forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });
});