/**
 * JSON编辑器Hook
 * 提供JSON编辑、格式化和压缩功能
 */

import { useState, useCallback } from 'preact/hooks';
import { formatJson, compressJson, tryFixJson } from '../services/jsonService';

/**
 * 使用JSON编辑器的Hook
 * @param {string} initialValue - 初始JSON字符串
 * @returns {{
 *   value: string,
 *   setValue: (value: string) => void,
 *   formatJson: () => void,
 *   compressJson: () => void,
 *   tryFixJson: () => void,
 *   indentSize: number,
 *   setIndentSize: (size: number) => void,
 *   error: Error | null
 * }} - JSON编辑器相关状态和方法
 */
export const useJsonEditor = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState(null);
  
  /**
   * 格式化当前JSON内容
   * @returns {string} 格式化后的JSON
   */
  const format = useCallback(() => {
    try {
      const formatted = formatJson(value, indentSize);
      setValue(formatted);
      setError(null);
      return formatted;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [value, indentSize]);
  
  /**
   * 压缩当前JSON内容
   * @returns {string} 压缩后的JSON
   */
  const compress = useCallback(() => {
    try {
      const compressed = compressJson(value);
      setValue(compressed);
      setError(null);
      return compressed;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [value]);
  
  /**
   * 尝试修复当前JSON内容
   * @returns {string} 尝试修复后的JSON
   */
  const fix = useCallback(() => {
    const fixed = tryFixJson(value);
    setValue(fixed);
    
    // 检查修复是否成功
    try {
      JSON.parse(fixed);
      setError(null);
    } catch (err) {
      setError(new Error('无法自动修复JSON，请手动修复语法错误'));
    }
    
    return fixed;
  }, [value]);
  
  return {
    value,
    setValue,
    formatJson: format,
    compressJson: compress,
    tryFixJson: fix,
    indentSize,
    setIndentSize,
    error
  };
};