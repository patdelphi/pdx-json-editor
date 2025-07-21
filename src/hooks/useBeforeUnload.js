/**
 * 页面关闭前提示Hook
 * 当用户尝试关闭页面时，如果有未保存的更改，会显示确认提示
 */

import { useEffect } from 'preact/hooks';

/**
 * 使用页面关闭前提示的Hook
 * @param {boolean} isDirty - 是否有未保存的更改
 * @param {string} [message='您有未保存的更改，确定要离开吗？'] - 提示消息
 */
export const useBeforeUnload = (isDirty, message = '您有未保存的更改，确定要离开吗？') => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      
      // 现代浏览器
      event.preventDefault();
      
      // 兼容旧版浏览器
      event.returnValue = message;
      
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);
};