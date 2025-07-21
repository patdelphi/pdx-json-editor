/**
 * ReplaceConfirmDialog组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { ReplaceConfirmDialog } from '../ReplaceConfirmDialog';

describe('ReplaceConfirmDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应显示替换确认信息', () => {
    render(
      <ReplaceConfirmDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        searchText="foo"
        replaceText="bar"
      />
    );
    
    // 检查对话框标题
    expect(screen.getByText('确认替换')).toBeInTheDocument();
    
    // 检查确认信息
    expect(screen.getByText(/确定要将所有/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('"foo"')).toBeInTheDocument();
    expect(screen.getByText('"bar"')).toBeInTheDocument();
  });
  
  test('点击按钮应调用相应函数', () => {
    render(
      <ReplaceConfirmDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        count={5}
        searchText="foo"
        replaceText="bar"
      />
    );
    
    // 点击取消按钮
    fireEvent.click(screen.getByText('取消'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
    
    // 点击替换全部按钮
    fireEvent.click(screen.getByText('替换全部'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});