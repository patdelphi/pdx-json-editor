/**
 * 文件服务
 * 提供文件读取、保存和管理功能
 */

import { saveAs } from 'file-saver';

/**
 * 文件信息接口
 * @typedef {Object} FileInfo
 * @property {string} name - 文件名
 * @property {number} size - 文件大小（字节）
 * @property {Date} lastModified - 最后修改时间
 * @property {string} content - 文件内容
 */

/**
 * 从文件对象读取文本内容
 * @param {File} file - 文件对象
 * @returns {Promise<FileInfo>} - 文件信息
 */
export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('未提供文件'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        resolve({
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
          content
        });
      } catch (error) {
        reject(new Error(`读取文件失败: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件时发生错误'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * 保存内容到文件
 * @param {string} content - 要保存的内容
 * @param {string} filename - 文件名
 * @returns {Promise<void>} - 保存操作的Promise
 */
export const saveFile = (content, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      saveAs(blob, filename);
      resolve();
    } catch (error) {
      reject(new Error(`保存文件失败: ${error.message}`));
    }
  });
};

/**
 * 创建新文件
 * @param {string} name - 文件名
 * @param {string} [content=''] - 初始内容
 * @returns {FileInfo} - 文件信息
 */
export const createNewFile = (name, content = '') => {
  return {
    name,
    size: new Blob([content]).size,
    lastModified: new Date(),
    content
  };
};

/**
 * 检查文件是否为JSON文件
 * @param {File} file - 文件对象
 * @returns {boolean} - 是否为JSON文件
 */
export const isJsonFile = (file) => {
  if (!file) return false;
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.json');
};

/**
 * 检查文件大小是否超过限制
 * @param {File|number} file - 文件对象或文件大小（字节）
 * @param {number} [sizeLimit=5242880] - 大小限制（字节），默认5MB
 * @returns {boolean} - 是否超过限制
 */
export const isLargeFile = (file, sizeLimit = 5242880) => {
  if (!file) return false;
  
  const fileSize = typeof file === 'number' ? file : file.size;
  return fileSize > sizeLimit;
};

/**
 * 格式化文件大小显示
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} - 格式化后的大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

/**
 * 从文件名中提取基本名称（不含扩展名）
 * @param {string} filename - 文件名
 * @returns {string} - 基本名称
 */
export const getBaseName = (filename) => {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex);
};

/**
 * 从文件名中提取扩展名
 * @param {string} filename - 文件名
 * @returns {string} - 扩展名（包含点）
 */
export const getExtension = (filename) => {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
};

/**
 * 确保文件名有.json扩展名
 * @param {string} filename - 文件名
 * @returns {string} - 确保有.json扩展名的文件名
 */
export const ensureJsonExtension = (filename) => {
  if (!filename) return 'untitled.json';
  
  if (!filename.toLowerCase().endsWith('.json')) {
    return `${filename}.json`;
  }
  
  return filename;
};