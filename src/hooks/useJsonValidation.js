/**
 * JSON验证Hook
 * 提供JSON验证功能和错误状态管理
 */

import { useState, useCallback } from 'preact/hooks';
import { validateJson, jsonErrorToMarker } from '../services/validationService';

/**
 * 使用JSON验证的Hook
 * @returns {{
 *   errors: import('../services/validationService').JsonError[],
 *   validate: (jsonString: string) => import('../services/validationService').JsonError[],
 *   isValid: boolean,
 *   setModelMarkers: (monaco: any, model: any) => void
 * }} - JSON验证相关状态和方法
 */
export const useJsonValidation = () => {
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  
  /**
   * 验证JSON字符串
   * @param {string} jsonString - 要验证的JSON字符串
   * @returns {import('../services/validationService').JsonError[]} - 错误列表
   */
  const validate = useCallback((jsonString) => {
    const validationErrors = validateJson(jsonString);
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
    return validationErrors;
  }, []);
  
  /**
   * 设置Monaco编辑器的标记
   * @param {any} monaco - Monaco实例
   * @param {any} model - 编辑器模型
   */
  const setModelMarkers = useCallback((monaco, model) => {
    if (!monaco || !model) return;
    
    const markers = errors.map(error => jsonErrorToMarker(error, model.uri));
    monaco.editor.setModelMarkers(model, 'pdx-json-editor', markers);
  }, [errors]);
  
  return {
    errors,
    validate,
    isValid,
    setModelMarkers
  };
};