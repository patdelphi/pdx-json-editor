/**
 * 文件操作测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { Header } from '../Header';

// 模拟文件操作函数
const mockOnNewFile = jest.fn();
const mockOnOpenFile = jest.fn();
const mockOnSaveFile = jest.fn();
const mockOnSaveAsFile = jest.fn();

describe('文件操作', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('Header组件应显示文件操作按钮', () => {
    render(
      <Header
        darkMode={false}
        toggleDarkMode={() => {}}
        onMenuClick={() => {}}
        onNewFile={mockOnNewFile}
        onOpenFile={mockOnOpenFile}
        onSaveFile={mockOnSaveFile}
        onSaveAsFile={mockOnSaveAsFile}
        currentFileName="test.json"
        isDirty={false}
      />
    );
    
    // 检查按钮是否存在
    expect(screen.getByText('新建')).toBeInTheDocument();
    expect(screen.getByText('打开')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    
    // 检查文件名是否显示
    expect(screen.getByText('test.json')).toBeInTheDocument();
  });
  
  test('未保存状态应正确显示', () => {
    render(
      <Header
        darkMode={false}
        toggleDarkMode={() => {}}
        onMenuClick={() => {}}
        onNewFile={mockOnNewFile}
        onOpenFile={mockOnOpenFile}
        onSaveFile={mockOnSaveFile}
        onSaveAsFile={mockOnSaveAsFile}
        currentFileName="test.json"
        isDirty={true}
      />
    );
    
    // 检查未保存状态
    expect(screen.getByText('保存 *')).toBeInTheDocument();
    expect(screen.getByText('test.json (未保存)')).toBeInTheDocument();
  });
  
  test('点击按钮应调用相应函数', () => {
    render(
      <Header
        darkMode={false}
        toggleDarkMode={() => {}}
        onMenuClick={() => {}}
        onNewFile={mockOnNewFile}
        onOpenFile={mockOnOpenFile}
        onSaveFile={mockOnSaveFile}
        onSaveAsFile={mockOnSaveAsFile}
        currentFileName="test.json"
        isDirty={true}
      />
    );
    
    // 点击按钮
    fireEvent.click(screen.getByText('新建'));
    fireEvent.click(screen.getByText('打开'));
    fireEvent.click(screen.getByText('保存 *'));
    
    // 检查函数调用
    expect(mockOnNewFile).toHaveBeenCalledTimes(1);
    expect(mockOnOpenFile).toHaveBeenCalledTimes(1);
    expect(mockOnSaveFile).toHaveBeenCalledTimes(1);
  });
  
  test('保存按钮在未修改时应禁用', () => {
    render(
      <Header
        darkMode={false}
        toggleDarkMode={() => {}}
        onMenuClick={() => {}}
        onNewFile={mockOnNewFile}
        onOpenFile={mockOnOpenFile}
        onSaveFile={mockOnSaveFile}
        onSaveAsFile={mockOnSaveAsFile}
        currentFileName="test.json"
        isDirty={false}
      />
    );
    
    // 检查保存按钮是否禁用
    const saveButton = screen.getByText('保存').closest('button');
    expect(saveButton).toBeDisabled();
  });
});