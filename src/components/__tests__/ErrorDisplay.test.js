/**
 * ErrorDisplay组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { ErrorDisplay } from '../ErrorDisplay';
import errorService, { AppError, ErrorSeverity, ErrorType } from '../../services/errorService';

// 模拟errorService
jest.mock('../../services/errorService', () => {
  const originalModule = jest.requireActual('../../services/errorService');
  
  return {
    __esModule: true,
    ...originalModule,
    default: {
      getErrorHistory: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      clearErrorHistory: jest.fn()
    }
  };
});

describe('ErrorDisplay', () => {
  // 在每个测试前重置模拟函数
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应显示空状态（无错误）', () => {
    // 模拟空错误历史
    errorService.getErrorHistory.mockReturnValue([]);
    
    render(<ErrorDisplay />);
    
    expect(screen.getByText('没有错误记录')).toBeInTheDocument();
  });
  
  test('应显示错误列表', () => {
    // 创建模拟错误
    const mockErrors = [
      new AppError('错误1', ErrorType.JSON_PARSE, ErrorSeverity.ERROR),
      new AppError('错误2', ErrorType.FILE_OPERATION, ErrorSeverity.WARNING),
      new AppError('错误3', ErrorType.UNKNOWN, ErrorSeverity.INFO)
    ];
    
    // 设置时间戳
    mockErrors.forEach(error => {
      error.timestamp = new Date();
    });
    
    // 模拟错误历史
    errorService.getErrorHistory.mockReturnValue(mockErrors);
    
    render(<ErrorDisplay />);
    
    // 验证错误数量显示
    expect(screen.getByText('错误历史 (3)')).toBeInTheDocument();
    
    // 验证错误消息显示
    expect(screen.getByText('错误1')).toBeInTheDocument();
    expect(screen.getByText('错误2')).toBeInTheDocument();
    expect(screen.getByText('错误3')).toBeInTheDocument();
    
    // 验证错误类型显示
    expect(screen.getByText(/JSON_PARSE/)).toBeInTheDocument();
    expect(screen.getByText(/FILE_OPERATION/)).toBeInTheDocument();
    expect(screen.getByText(/UNKNOWN/)).toBeInTheDocument();
  });
  
  test('应限制显示的错误数量', () => {
    // 创建多个模拟错误
    const mockErrors = Array.from({ length: 15 }, (_, i) => 
      new AppError(`错误${i + 1}`, ErrorType.UNKNOWN, ErrorSeverity.ERROR)
    );
    
    // 设置时间戳
    mockErrors.forEach(error => {
      error.timestamp = new Date();
    });
    
    // 模拟错误历史
    errorService.getErrorHistory.mockReturnValue(mockErrors);
    
    // 设置最大显示数量为5
    render(<ErrorDisplay maxErrors={5} />);
    
    // 验证错误数量显示
    expect(screen.getByText('错误历史 (5)')).toBeInTheDocument();
    
    // 验证只显示了5个错误
    expect(screen.getByText('错误1')).toBeInTheDocument();
    expect(screen.getByText('错误5')).toBeInTheDocument();
    expect(screen.queryByText('错误6')).not.toBeInTheDocument();
  });
  
  test('应展开和折叠错误详情', () => {
    // 创建带有原始错误的模拟错误
    const originalError = new Error('原始错误');
    originalError.stack = 'Error: 原始错误\n    at Test';
    
    const mockErrors = [
      new AppError('错误1', ErrorType.UNKNOWN, ErrorSeverity.ERROR, originalError)
    ];
    
    // 设置时间戳
    mockErrors[0].timestamp = new Date();
    
    // 模拟错误历史
    errorService.getErrorHistory.mockReturnValue(mockErrors);
    
    render(<ErrorDisplay />);
    
    // 初始状态下，详情应该是折叠的
    expect(screen.queryByText('Error: 原始错误')).not.toBeInTheDocument();
    
    // 点击展开按钮
    const expandButtons = screen.getAllByRole('button');
    fireEvent.click(expandButtons[1]); // 第二个按钮是展开按钮
    
    // 验证详情被展开
    expect(screen.getByText(/Error: 原始错误/)).toBeInTheDocument();
    
    // 再次点击折叠按钮
    fireEvent.click(expandButtons[1]);
    
    // 验证详情被折叠
    expect(screen.queryByText(/Error: 原始错误/)).not.toBeInTheDocument();
  });
  
  test('应清除错误历史', () => {
    // 创建模拟错误
    const mockErrors = [
      new AppError('错误1', ErrorType.UNKNOWN, ErrorSeverity.ERROR)
    ];
    
    // 设置时间戳
    mockErrors[0].timestamp = new Date();
    
    // 模拟错误历史
    errorService.getErrorHistory.mockReturnValue(mockErrors);
    
    render(<ErrorDisplay />);
    
    // 点击清除按钮
    fireEvent.click(screen.getByText('清除'));
    
    // 验证确认对话框显示
    expect(screen.getByText('清除错误历史')).toBeInTheDocument();
    expect(screen.getByText('确定要清除所有错误历史记录吗？此操作无法撤销。')).toBeInTheDocument();
    
    // 点击确认按钮
    fireEvent.click(screen.getByText('清除').closest('button'));
    
    // 验证clearErrorHistory被调用
    expect(errorService.clearErrorHistory).toHaveBeenCalled();
  });
  
  test('应注册和注销错误监听器', () => {
    const { unmount } = render(<ErrorDisplay />);
    
    // 验证添加监听器被调用
    expect(errorService.addListener).toHaveBeenCalled();
    
    // 卸载组件
    unmount();
    
    // 验证移除监听器被调用
    expect(errorService.removeListener).toHaveBeenCalled();
  });
});