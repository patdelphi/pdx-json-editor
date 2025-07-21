/**
 * ThemeSelector组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { ThemeSelector } from '../ThemeSelector';
import { ThemeContextProvider } from '../../theme/ThemeContext';

// 模拟主题上下文
jest.mock('../../theme/ThemeContext', () => {
  const originalModule = jest.requireActual('../../theme/ThemeContext');
  
  return {
    ...originalModule,
    useTheme: () => ({
      themeId: 'light',
      setThemeId: jest.fn(),
      toggleTheme: jest.fn(),
      availableThemes: {
        light: { id: 'light', name: '浅色' },
        dark: { id: 'dark', name: '深色' },
        highContrast: { id: 'highContrast', name: '高对比度' },
        soft: { id: 'soft', name: '柔和' }
      }
    })
  };
});

describe('ThemeSelector', () => {
  test('应渲染主题切换按钮', () => {
    render(
      <ThemeContextProvider>
        <ThemeSelector />
      </ThemeContextProvider>
    );
    
    // 检查主题按钮是否存在
    const themeButton = screen.getByRole('button', { name: /主题设置/i });
    expect(themeButton).toBeInTheDocument();
  });
  
  test('点击按钮应打开菜单', () => {
    render(
      <ThemeContextProvider>
        <ThemeSelector />
      </ThemeContextProvider>
    );
    
    // 点击主题按钮
    fireEvent.click(screen.getByRole('button', { name: /主题设置/i }));
    
    // 检查菜单是否打开
    expect(screen.getByText('切换到深色模式')).toBeInTheDocument();
    expect(screen.getByText('主题设置')).toBeInTheDocument();
  });
  
  test('点击主题设置应打开对话框', () => {
    render(
      <ThemeContextProvider>
        <ThemeSelector />
      </ThemeContextProvider>
    );
    
    // 点击主题按钮
    fireEvent.click(screen.getByRole('button', { name: /主题设置/i }));
    
    // 点击主题设置
    fireEvent.click(screen.getByText('主题设置'));
    
    // 检查对话框是否打开
    expect(screen.getByText('选择主题')).toBeInTheDocument();
    expect(screen.getByLabelText('浅色')).toBeInTheDocument();
    expect(screen.getByLabelText('深色')).toBeInTheDocument();
    expect(screen.getByLabelText('高对比度')).toBeInTheDocument();
    expect(screen.getByLabelText('柔和')).toBeInTheDocument();
  });
});