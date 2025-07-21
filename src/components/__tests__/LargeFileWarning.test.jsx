/**
 * LargeFileWarning组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen, act } from '@testing-library/preact';
import { LargeFileWarning } from '../LargeFileWarning';

describe('LargeFileWarning', () => {
  const mockOnContinue = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn()
      }
    });
    
    // 模拟setInterval和clearInterval
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('应显示文件大小和名称', () => {
    render(
      <LargeFileWarning
        open={true}
        fileSize={10485760} // 10MB
        fileName="large-file.json"
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
      />
    );
    
    // 检查对话框标题
    expect(screen.getByText('大文件警告')).toBeInTheDocument();
    
    // 检查文件名和大小
    expect(screen.getByText(/large-file\.json/)).toBeInTheDocument();
    expect(screen.getByText(/10\.0 MB/)).toBeInTheDocument();
  });
  
  test('应显示优化进度', () => {
    render(
      <LargeFileWarning
        open={true}
        fileSize={10485760}
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
      />
    );
    
    // 检查进度条
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // 前进时间，检查进度更新
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // 检查进度文本
    expect(screen.getByText(/优化编辑器设置/)).toBeInTheDocument();
  });
  
  test('优化完成后应启用按钮', () => {
    render(
      <LargeFileWarning
        open={true}
        fileSize={10485760}
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
      />
    );
    
    // 初始状态下按钮应该被禁用
    const continueButton = screen.getByText('继续打开').closest('button');
    const cancelButton = screen.getByText('取消').closest('button');
    
    expect(continueButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    
    // 前进时间，完成优化
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    
    // 按钮应该被启用
    expect(continueButton).not.toBeDisabled();
    expect(cancelButton).not.toBeDisabled();
  });
  
  test('点击继续按钮应调用onContinue', () => {
    render(
      <LargeFileWarning
        open={true}
        fileSize={10485760}
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
      />
    );
    
    // 前进时间，完成优化
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    
    // 点击继续按钮
    fireEvent.click(screen.getByText('继续打开'));
    
    // 检查是否调用了onContinue
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });
  
  test('记住选择应保存到localStorage', () => {
    render(
      <LargeFileWarning
        open={true}
        fileSize={10485760}
        onContinue={mockOnContinue}
        onCancel={mockOnCancel}
      />
    );
    
    // 前进时间，完成优化
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    
    // 选中记住选择
    fireEvent.click(screen.getByLabelText('记住我的选择'));
    
    // 点击继续按钮
    fireEvent.click(screen.getByText('继续打开'));
    
    // 检查是否保存到localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-large-file-choice', 'continue');
  });
});