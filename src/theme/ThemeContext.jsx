/**
 * 主题上下文
 * 提供主题状态和切换功能
 */

import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { createTheme } from '@mui/material/styles';
import { themes } from './themeConfig';
import { getSystemPreferredTheme, watchSystemThemeChanges, applyCssVariables } from './themeUtils';
import PersistenceService from '../services/persistenceService';
import errorService from '../services/errorService';

// 创建主题上下文
export const ThemeContext = createContext({
  themeId: 'light',
  theme: createTheme(themes.light.theme),
  monacoTheme: 'vs-light',
  setThemeId: () => {},
  toggleTheme: () => {},
  availableThemes: themes,
});

// 主题提供者组件
export const ThemeContextProvider = ({ children }) => {
  const [themeId, setThemeId] = useState('light');
  
  // 从本地存储加载主题
  useEffect(() => {
    try {
      const savedThemeId = PersistenceService.loadTheme();
      const savedThemeMode = localStorage.getItem('pdx-json-editor-theme-mode');
      
      if (savedThemeMode === 'system') {
        // 如果设置为跟随系统，则使用系统主题
        const systemTheme = getSystemPreferredTheme();
        setThemeId(systemTheme);
      } else if (savedThemeId && themes[savedThemeId]) {
        // 如果有保存的主题，则使用保存的主题
        setThemeId(savedThemeId);
      } else {
        // 默认使用系统主题
        const systemTheme = getSystemPreferredTheme();
        setThemeId(systemTheme);
      }
    } catch (error) {
      errorService.handleError(error);
      
      // 出错时使用系统主题
      const systemTheme = getSystemPreferredTheme();
      setThemeId(systemTheme);
    }
  }, []);
  
  // 保存主题到本地存储
  useEffect(() => {
    try {
      PersistenceService.saveTheme(themeId);
      
      // 应用CSS变量
      applyCssVariables(themeId);
    } catch (error) {
      errorService.handleError(error);
    }
  }, [themeId]);
  
  // 监听系统主题变化
  useEffect(() => {
    const themeMode = localStorage.getItem('pdx-json-editor-theme-mode');
    
    // 只有在设置为跟随系统时才监听系统主题变化
    if (themeMode === 'system') {
      const unwatch = watchSystemThemeChanges((newTheme) => {
        setThemeId(newTheme);
      });
      
      return unwatch;
    }
  }, []);
  
  // 切换主题
  const toggleTheme = () => {
    setThemeId(prevThemeId => {
      if (prevThemeId === 'light') return 'dark';
      if (prevThemeId === 'dark') return 'light';
      return 'light';
    });
    
    // 设置为手动模式
    localStorage.setItem('pdx-json-editor-theme-mode', 'manual');
  };
  
  // 设置主题模式（手动或跟随系统）
  const setThemeMode = (mode) => {
    if (mode === 'system') {
      // 设置为跟随系统
      localStorage.setItem('pdx-json-editor-theme-mode', 'system');
      
      // 立即应用系统主题
      const systemTheme = getSystemPreferredTheme();
      setThemeId(systemTheme);
    } else {
      // 设置为手动模式
      localStorage.setItem('pdx-json-editor-theme-mode', 'manual');
    }
  };
  
  // 创建MUI主题
  const theme = createTheme(themes[themeId]?.theme || themes.light.theme);
  
  // 获取Monaco编辑器主题
  const monacoTheme = themes[themeId]?.monacoTheme || 'vs-light';
  
  // 上下文值
  const contextValue = {
    themeId,
    theme,
    monacoTheme,
    setThemeId,
    toggleTheme,
    setThemeMode,
    availableThemes: themes,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的Hook
export const useTheme = () => useContext(ThemeContext);