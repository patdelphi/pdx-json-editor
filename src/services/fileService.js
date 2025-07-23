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
        let content = event.target.result;
        
        // 确保内容不为空
        if (!content || content.trim() === '') {
          content = '{}'; // 提供一个默认的空JSON对象
        }
        
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
 * 读取文件（使用文件系统访问API）
 * @returns {Promise<Object>} - 包含文件内容和名称的Promise
 */
export const readFileWithPicker = async () => {
  // 检查是否支持文件系统访问API
  if ('showOpenFilePicker' in window) {
    try {
      // 配置文件选择器选项
      const options = {
        types: [
          {
            description: 'JSON文件',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
        multiple: false,
      };
      // 显示文件选择器
      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      let content = await file.text();
      
      // 确保内容不为空
      if (!content || content.trim() === '') {
        content = '{}'; // 提供一个默认的空JSON对象
      }
      
      // 尝试获取父目录句柄
      let directoryHandle = null;
      try {
        directoryHandle = await fileHandle.getParentDirectory();
      } catch (error) {
        console.warn('无法获取父目录句柄:', error);
      }
      return {
        content,
        name: file.name,
        path: file.name, // Web API不提供完整路径
        handle: fileHandle,
        directoryHandle
      };
    } catch (error) {
      // 如果用户取消了操作，不抛出错误
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  } else {
    // 回退到传统的文件输入
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          let content = reader.result;
          
          // 确保内容不为空
          if (!content || content.trim() === '') {
            content = '{}'; // 提供一个默认的空JSON对象
          }
          
          resolve({
            content,
            name: file.name,
            path: file.name,
            handle: null,
            directoryHandle: null
          });
        };
        reader.onerror = () => {
          reject(new Error('读取文件失败'));
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
};

/**
 * 检查是否支持文件系统访问API
 * @returns {boolean} - 是否支持
 */
export const isFileSystemAccessSupported = () => {
  return 'showSaveFilePicker' in window;
};

/**
 * 保存内容到文件
 * @param {string} content - 要保存的内容
 * @param {string} filename - 文件名
 * @param {Object} [options] - 额外选项
 * @param {FileSystemDirectoryHandle} [options.directoryHandle] - 当前文件所在目录的句柄
 * @param {FileSystemFileHandle} [options.fileHandle] - 当前文件的句柄
 * @returns {Promise<Object>} - 保存操作的结果，包含文件名、路径和句柄
 */
export const saveFile = async (content, filename, options = {}) => {
  // 检查是否支持文件系统访问API
  if (isFileSystemAccessSupported()) {
    try {
      // 配置文件选择器选项
      const pickerOptions = {
        suggestedName: filename,
        types: [
          {
            description: 'JSON文件',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
      };
      
      // 如果有文件句柄，尝试使用当前文件的父目录作为起始目录
      if (options.fileHandle) {
        try {
          const parentDirectory = await options.fileHandle.getParentDirectory();
          if (parentDirectory) {
            pickerOptions.startIn = parentDirectory;
          }
        } catch (error) {
          console.warn('无法获取文件的父目录:', error);
        }
      } 
      // 如果有目录句柄，尝试使用它作为起始点
      else if (options.directoryHandle) {
        pickerOptions.startIn = options.directoryHandle;
      }

      // 显示保存文件选择器
      const fileHandle = await window.showSaveFilePicker(pickerOptions);
      
      // 创建可写流
      const writable = await fileHandle.createWritable();
      
      // 写入内容
      await writable.write(content);
      
      // 关闭流
      await writable.close();
      
      // 尝试获取父目录句柄
      let directoryHandle = null;
      try {
        directoryHandle = await fileHandle.getParentDirectory();
      } catch (error) {
        console.warn('无法获取父目录句柄:', error);
      }
      
      return {
        name: fileHandle.name,
        path: await fileHandle.getFile().then(file => file.name),
        handle: fileHandle, // 保存文件句柄以便后续操作
        directoryHandle // 保存目录句柄以便后续操作
      };
    } catch (error) {
      // 如果用户取消了操作，不抛出错误
      if (error.name === 'AbortError') {
        throw new Error('用户取消了保存操作');
      }
      
      // 其他错误，尝试回退到传统方法
      console.warn('文件系统访问API失败，回退到传统下载方式:', error);
      return fallbackSaveFile(content, filename);
    }
  } else {
    // 回退到传统的下载方式
    return fallbackSaveFile(content, filename);
  }
};

/**
 * 传统的文件保存方法（下载）
 * @param {string} content - 要保存的内容
 * @param {string} filename - 文件名
 * @returns {Promise<void>} - 保存操作的Promise
 */
const fallbackSaveFile = (content, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      saveAs(blob, filename);
      resolve({
        name: filename,
        path: filename,
        handle: null, // 传统方式没有文件句柄
        directoryHandle: null // 传统方式没有目录句柄
      });
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