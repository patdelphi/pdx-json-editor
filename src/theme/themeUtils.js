/**
 * 主题工具函数
 * 提供主题相关的工具函数
 */

/**
 * 获取系统首选主题
 * @returns {string} - 主题ID
 */
export const getSystemPreferredTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

/**
 * 监听系统主题变化
 * @param {Function} callback - 主题变化回调函数
 * @returns {Function} - 取消监听函数
 */
export const watchSystemThemeChanges = (callback) => {
  if (!window.matchMedia) return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    callback(newTheme);
  };
  
  // 添加监听器
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else if (mediaQuery.addListener) {
    // 兼容旧版浏览器
    mediaQuery.addListener(handleChange);
  }
  
  // 返回取消监听函数
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(handleChange);
    }
  };
};

/**
 * 应用CSS变量主题
 * @param {string} themeId - 主题ID
 */
export const applyCssVariables = (themeId) => {
  // 添加过渡效果，避免主题切换时的闪烁
  document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  
  // 设置文档根元素的数据属性
  document.documentElement.setAttribute('data-theme', themeId);
  
  // 根据主题ID应用不同的CSS变量
  switch (themeId) {
    case 'dark':
      document.documentElement.style.setProperty('--background-color', '#1F2937');
      document.documentElement.style.setProperty('--text-color', '#F9FAFB');
      document.documentElement.style.setProperty('--primary-color', '#60A5FA');
      document.documentElement.style.setProperty('--secondary-color', '#10B981');
      document.documentElement.style.setProperty('--border-color', '#374151');
      break;
    case 'highContrast':
      document.documentElement.style.setProperty('--background-color', '#000000');
      document.documentElement.style.setProperty('--text-color', '#FFFFFF');
      document.documentElement.style.setProperty('--primary-color', '#FFFFFF');
      document.documentElement.style.setProperty('--secondary-color', '#FFFF00');
      document.documentElement.style.setProperty('--border-color', '#FFFFFF');
      break;
    case 'soft':
      document.documentElement.style.setProperty('--background-color', '#F5F3FF');
      document.documentElement.style.setProperty('--text-color', '#1F2937');
      document.documentElement.style.setProperty('--primary-color', '#7C3AED');
      document.documentElement.style.setProperty('--secondary-color', '#EC4899');
      document.documentElement.style.setProperty('--border-color', '#E5E7EB');
      break;
    default: // light
      document.documentElement.style.setProperty('--background-color', '#FFFFFF');
      document.documentElement.style.setProperty('--text-color', '#111827');
      document.documentElement.style.setProperty('--primary-color', '#3B82F6');
      document.documentElement.style.setProperty('--secondary-color', '#10B981');
      document.documentElement.style.setProperty('--border-color', '#E5E7EB');
      break;
  }
  
  // 300ms后移除过渡效果，避免影响其他操作
  setTimeout(() => {
    document.documentElement.style.transition = '';
    document.body.style.transition = '';
  }, 300);
};