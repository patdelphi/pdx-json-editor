/**
 * ErrorBoundary组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { ErrorBoundary } from '../ErrorBoundary';
import errorService from '../../services/errorService';

// 模拟errorService
jest.mock('../../services/errorService', () => ({
  handleError: jest.fn(),
  ErrorSeverity: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    FATAL: 'fatal'
  }
}));

// 创建一个会抛出错误的组件
const ErrorComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('测试错误');
  }
  return <div>正常组件</div>;
};

describe('ErrorBoundary', () => {
  // 在每个测试前重置模拟函数
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 禁用控制台错误，以避免测试输出中的噪音
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // 在所有测试后恢复控制台错误
  afterAll(() => {
    console.error.mockRestore();
  });
  
  test('应正常渲染子组件（无错误）', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">子组件内容</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('子组件内容')).toBeInTheDocument();
  });
  
  test('应捕获错误并显示错误UI', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证错误UI
    expect(screen.getByText('出现了一个错误')).toBeInTheDocument();
    expect(screen.getByText('测试错误')).toBeInTheDocument();
    
    // 验证重试按钮
    expect(screen.getByText('重试')).toBeInTheDocument();
    
    // 验证错误服务被调用
    expect(errorService.handleError).toHaveBeenCalled();
  });
  
  test('点击重试按钮应重置错误状态', () => {
    const handleReset = jest.fn();
    
    const { rerender } = render(
      <ErrorBoundary onReset={handleReset}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 点击重试按钮
    fireEvent.click(screen.getByText('重试'));
    
    // 验证onReset回调被调用
    expect(handleReset).toHaveBeenCalled();
    
    // 重新渲染，这次不抛出错误
    rerender(
      <ErrorBoundary onReset={handleReset}>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // 验证正常内容被渲染
    expect(screen.getByText('正常组件')).toBeInTheDocument();
  });
  
  test('应显示和隐藏详细信息', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 初始状态下，详细信息应该是隐藏的
    expect(screen.getByText('显示详细信息')).toBeInTheDocument();
    
    // 点击显示详细信息按钮
    fireEvent.click(screen.getByText('显示详细信息'));
    
    // 验证按钮文本变化
    expect(screen.getByText('隐藏详细信息')).toBeInTheDocument();
    
    // 再次点击隐藏详细信息
    fireEvent.click(screen.getByText('隐藏详细信息'));
    
    // 验证按钮文本变回原样
    expect(screen.getByText('显示详细信息')).toBeInTheDocument();
  });
  
  test('应使用自定义fallback', () => {
    const customFallback = <div data-testid="custom-fallback">自定义错误UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证自定义fallback被渲染
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('自定义错误UI')).toBeInTheDocument();
  });
  
  test('应使用函数形式的自定义fallback', () => {
    const customFallback = (error, errorInfo, reset) => (
      <div data-testid="custom-fallback">
        <div>自定义错误: {error.message}</div>
        <button onClick={reset}>自定义重置</button>
      </div>
    );
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 验证自定义fallback被渲染
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('自定义错误: 测试错误')).toBeInTheDocument();
    
    // 验证自定义重置按钮
    expect(screen.getByText('自定义重置')).toBeInTheDocument();
  });
});