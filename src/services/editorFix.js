/**
 * 编辑器功能修复
 * 确保格式化、压缩和修复功能正常工作
 */

import { formatJson, compressJson, tryFixJson } from './jsonService';

/**
 * 初始化编辑器功能
 * @param {Object} editor - Monaco编辑器实例
 */
export const initializeEditorFunctions = (editor) => {
  if (!editor) return;
  
  // 格式化JSON
  const formatJsonAction = () => {
    try {
      const value = editor.getValue();
      const formatted = formatJson(value, 2);
      editor.setValue(formatted);
      return true;
    } catch (error) {
      console.error('格式化JSON失败:', error);
      return false;
    }
  };
  
  // 压缩JSON
  const compressJsonAction = () => {
    try {
      const value = editor.getValue();
      const compressed = compressJson(value);
      editor.setValue(compressed);
      return true;
    } catch (error) {
      console.error('压缩JSON失败:', error);
      return false;
    }
  };
  
  // 尝试修复JSON
  const tryFixJsonAction = () => {
    try {
      const value = editor.getValue();
      const fixed = tryFixJson(value);
      editor.setValue(fixed);
      return true;
    } catch (error) {
      console.error('修复JSON失败:', error);
      return false;
    }
  };
  
  // 添加到全局对象
  if (window.pdxJsonEditor) {
    window.pdxJsonEditor.formatJson = formatJsonAction;
    window.pdxJsonEditor.compressJson = compressJsonAction;
    window.pdxJsonEditor.tryFixJson = tryFixJsonAction;
  } else {
    window.pdxJsonEditor = {
      formatJson: formatJsonAction,
      compressJson: compressJsonAction,
      tryFixJson: tryFixJsonAction
    };
  }
  
  // 添加编辑器命令
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
    formatJsonAction
  );
  
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM,
    compressJsonAction
  );
  
  return {
    formatJson: formatJsonAction,
    compressJson: compressJsonAction,
    tryFixJson: tryFixJsonAction
  };
};