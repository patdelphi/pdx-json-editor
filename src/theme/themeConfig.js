/**
 * 主题配置
 * 定义应用程序的主题配置和Monaco编辑器主题
 */

import { 
  typography, 
  spacing, 
  shape, 
  shadows, 
  transitions, 
  breakpoints, 
  zIndex, 
  components,
  colors
} from './designSystem';

// 基础主题配置
const baseTheme = {
  typography,
  shape,
  spacing,
  shadows,
  transitions,
  breakpoints: breakpoints.values,
  zIndex,
  components
};



// 浅色主题
export const lightTheme = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    background: colors.light.background,
    text: colors.light.text,
    divider: colors.light.divider,
    action: {
      active: colors.light.text.secondary,
      hover: 'rgba(107, 114, 128, 0.08)',
      selected: 'rgba(107, 114, 128, 0.16)',
      disabled: 'rgba(107, 114, 128, 0.38)',
      disabledBackground: 'rgba(107, 114, 128, 0.12)',
    },
  },
};

// 深色主题
export const darkTheme = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      ...colors.primary,
      main: '#60A5FA', // 深色模式下主色稍微亮一点
    },
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: {
      ...colors.info,
      main: '#60A5FA', // 深色模式下信息色稍微亮一点
    },
    success: colors.success,
    background: colors.dark.background,
    text: colors.dark.text,
    divider: colors.dark.divider,
    action: {
      active: colors.dark.text.secondary,
      hover: 'rgba(156, 163, 175, 0.08)',
      selected: 'rgba(156, 163, 175, 0.16)',
      disabled: 'rgba(156, 163, 175, 0.38)',
      disabledBackground: 'rgba(156, 163, 175, 0.12)',
    },
  },
};

// 高对比度主题
export const highContrastTheme = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#FFFFFF',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFFF00',
      contrastText: '#000000',
    },
    error: {
      main: '#FF0000',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFFF00',
      contrastText: '#000000',
    },
    info: {
      main: '#00FFFF',
      contrastText: '#000000',
    },
    success: {
      main: '#00FF00',
      contrastText: '#000000',
    },
    background: colors.highContrast.background,
    text: colors.highContrast.text,
    divider: colors.highContrast.divider,
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.2)',
      selected: 'rgba(255, 255, 255, 0.4)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
};

// 柔和主题
export const softTheme = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899',
      light: '#F9A8D4',
      dark: '#BE185D',
      contrastText: '#FFFFFF',
    },
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    background: {
      default: '#F5F3FF',
      paper: '#FFFFFF',
      secondary: '#F3F4F6',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
    action: {
      active: '#6B7280',
      hover: 'rgba(107, 114, 128, 0.08)',
      selected: 'rgba(107, 114, 128, 0.16)',
      disabled: 'rgba(107, 114, 128, 0.38)',
      disabledBackground: 'rgba(107, 114, 128, 0.12)',
    },
  },
};

// 主题列表
export const themes = {
  light: {
    id: 'light',
    name: '浅色',
    theme: lightTheme,
    monacoTheme: 'vs-light',
  },
  dark: {
    id: 'dark',
    name: '深色',
    theme: darkTheme,
    monacoTheme: 'vs-dark',
  },
  highContrast: {
    id: 'highContrast',
    name: '高对比度',
    theme: highContrastTheme,
    monacoTheme: 'hc-black',
  },
  soft: {
    id: 'soft',
    name: '柔和',
    theme: softTheme,
    monacoTheme: 'vs-light',
  },
};

// 获取系统首选主题
export const getPreferredTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// 获取Monaco编辑器主题
export const getMonacoTheme = (themeId) => {
  return themes[themeId]?.monacoTheme || 'vs-light';
};