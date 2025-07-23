/**
 * 主题上下文测试
 */

import { h } from 'preact';
import { render, act } from '@testing-library/preact';
import { ThemeContextProvider, useTheme } from '../ThemeContext';

// 测试组件
const TestComponent = ({ onThemeChange }) => {
  const { themeId, setThemeId, toggleTheme } = useTheme();
  
  // 通知父组件主题变化
  if (onThemeChange) {
    onThemeChange(themeId);
  }
  
  return (
    <div>
      <div data-testid="theme-id">{themeId}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="set-dark" onClick={() => setThemeId('dark')}>Set Dark</button>
      <button data-testid="set-light" onClick={() => setThemeId('light')}>Set Light</button>
      <button data-testid="set-high-contrast" onClick={() => setThemeId('highContrast')}>Set High Contrast</button>
    </div>
  );
};

describe('ThemeContext', () => {
  // 模拟localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();
  
  // 模拟document.documentElement
  const documentElementMock = {
    setAttribute: jest.fn()
  };
  
  beforeEach(() => {
    // 设置模拟
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock
    });
    
    // 清除模拟状态
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  test('应提供默认主题', () => {
    const { getByTestId } = render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );
    
    expect(getByTestId('theme-id').textContent).toBe('light');
  });
  
  test('应从localStorage加载主题', () => {
    // 设置localStorage中的主题
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    const { getByTestId } = render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );
    
    expect(getByTestId('theme-id').textContent).toBe('dark');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('pdx-json-editor-theme');
  });
  
  test('应切换主题', () => {
    const handleThemeChange = jest.fn();
    
    const { getByTestId } = render(
      <ThemeContextProvider>
        <TestComponent onThemeChange={handleThemeChange} />
      </ThemeContextProvider>
    );
    
    // 初始主题
    expect(getByTestId('theme-id').textContent).toBe('light');
    
    // 切换主题
    act(() => {
      getByTestId('toggle-theme').click();
    });
    
    // 切换后的主题
    expect(getByTestId('theme-id').textContent).toBe('dark');
    expect(handleThemeChange).toHaveBeenCalledWith('dark');
    
    // 再次切换
    act(() => {
      getByTestId('toggle-theme').click();
    });
    
    // 切换回初始主题
    expect(getByTestId('theme-id').textContent).toBe('light');
    expect(handleThemeChange).toHaveBeenCalledWith('light');
  });
  
  test('应设置特定主题', () => {
    const { getByTestId } = render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );
    
    // 设置高对比度主题
    act(() => {
      getByTestId('set-high-contrast').click();
    });
    
    expect(getByTestId('theme-id').textContent).toBe('highContrast');
    
    // 设置浅色主题
    act(() => {
      getByTestId('set-light').click();
    });
    
    expect(getByTestId('theme-id').textContent).toBe('light');
  });
  
  test('应保存主题到localStorage', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );
    
    // 检查初始保存
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pdx-json-editor-theme', 'light');
    
    // 清除调用记录
    localStorageMock.setItem.mockClear();
    
    // 设置新主题
    act(() => {
      document.querySelector('[data-testid="set-dark"]').click();
    });
    
    // 检查保存新主题
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pdx-json-editor-theme', 'dark');
  });
  
  test('应更新文档根元素的数据属性', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );
    
    // 检查初始设置
    expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    
    // 清除调用记录
    documentElementMock.setAttribute.mockClear();
    
    // 设置新主题
    act(() => {
      document.querySelector('[data-testid="set-dark"]').click();
    });
    
    // 检查更新数据属性
    expect(documentElementMock.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});