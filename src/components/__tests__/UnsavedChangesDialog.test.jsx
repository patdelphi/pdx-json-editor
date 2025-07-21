/**
 * UnsavedChangesDialog组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { UnsavedChangesDialog } from '../UnsavedChangesDialog';

describe('UnsavedChangesDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnDiscard = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应显示文件名和未保存更改提示', () => {
    render(
      <UnsavedChangesDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        fileName="test.json"
      />
    );
    
    // 检查对话框标题
    expect(screen.getByText('未保存的更改')).toBeInTheDocument();
    
    // 检查文件名和提示信息
    expect(screen.getByText(/文件 "test.json" 有未保存的更改/)).toBeInTheDocument();
    expect(screen.getByText(/您想保存这些更改吗？/)).toBeInTheDocument();
  });
  
  test('应在没有文件名时显示通用提示', () => {
    render(
      <UnsavedChangesDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
      />
    );
    
    // 检查通用提示信息
    expect(screen.getByText(/当前文件有未保存的更改/)).toBeInTheDocument();
  });
  
  test('点击按钮应调用相应函数', () => {
    render(
      <UnsavedChangesDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        fileName="test.json"
      />
    );
    
    // 点击保存按钮
    fireEvent.click(screen.getByText('保存'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    
    // 点击放弃更改按钮
    fireEvent.click(screen.getByText('放弃更改'));
    expect(mockOnDiscard).toHaveBeenCalledTimes(1);
    
    // 点击取消按钮
    fireEvent.click(screen.getByText('取消'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});