/**
 * 持久化服务
 * 提供编辑状态持久化功能
 */

import errorService, { FileOperationError } from './errorService';

// 本地存储键
const STORAGE_KEYS = {
  EDITOR_CONTENT: 'pdx-json-editor-content',
  EDITOR_FILE: 'pdx-json-editor-file',
  EDITOR_SETTINGS: 'pdx-json-editor-settings',
  EDITOR_HISTORY: 'pdx-json-editor-recent-files', // Changed to match StateService
  EDITOR_THEME: 'pdx-json-editor-theme',
  EDITOR_SCHEMAS: 'pdx-json-editor-schemas'
};

// 最大历史记录数量
const MAX_HISTORY_SIZE = 10;

/**
 * 持久化服务
 */
export class PersistenceService {
  /**
   * 保存编辑器内容
   * @param {string} content - 编辑器内容
   * @param {Object} fileInfo - 文件信息
   * @returns {boolean} - 是否保存成功
   */
  static saveEditorContent(content, fileInfo = null) {
    try {
      // 检查内容大小
      const contentSize = new Blob([content]).size;
      if (contentSize > 5 * 1024 * 1024) { // 5MB
        throw new Error('内容过大，无法保存到本地存储');
      }
      
      // 保存内容
      localStorage.setItem(STORAGE_KEYS.EDITOR_CONTENT, content);
      
      // 保存文件信息
      if (fileInfo) {
        const fileData = {
          name: fileInfo.name,
          lastModified: fileInfo.lastModified,
          size: fileInfo.size,
          type: fileInfo.type,
          path: fileInfo.path
        };
        
        localStorage.setItem(STORAGE_KEYS.EDITOR_FILE, JSON.stringify(fileData));
      }
      
      return true;
    } catch (error) {
      // 检查是否是配额错误
      const isQuotaError = error.name === 'QuotaExceededError' || 
                           error.message.includes('quota') ||
                           error.message.includes('storage');
      
      errorService.handleError(
        new FileOperationError(
          isQuotaError ? '文件过大，超出本地存储限制' : '保存编辑器内容到本地存储失败',
          'write',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 加载编辑器内容
   * @returns {Object|null} - 编辑器内容和文件信息
   */
  static loadEditorContent() {
    try {
      const content = localStorage.getItem(STORAGE_KEYS.EDITOR_CONTENT);
      const fileInfoStr = localStorage.getItem(STORAGE_KEYS.EDITOR_FILE);
      
      if (!content) {
        return null;
      }
      
      const fileInfo = fileInfoStr ? JSON.parse(fileInfoStr) : null;
      
      return { content, fileInfo };
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '从本地存储加载编辑器内容失败',
          'read',
          null,
          error
        )
      );
      return null;
    }
  }
  
  /**
   * 清除编辑器内容
   * @returns {boolean} - 是否清除成功
   */
  static clearEditorContent() {
    try {
      localStorage.removeItem(STORAGE_KEYS.EDITOR_CONTENT);
      localStorage.removeItem(STORAGE_KEYS.EDITOR_FILE);
      return true;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '清除编辑器内容失败',
          'delete',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 保存编辑器设置
   * @param {Object} settings - 编辑器设置
   * @returns {boolean} - 是否保存成功
   */
  static saveEditorSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '保存编辑器设置失败',
          'write',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 加载编辑器设置
   * @returns {Object|null} - 编辑器设置
   */
  static loadEditorSettings() {
    try {
      const settingsStr = localStorage.getItem(STORAGE_KEYS.EDITOR_SETTINGS);
      return settingsStr ? JSON.parse(settingsStr) : null;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '加载编辑器设置失败',
          'read',
          null,
          error
        )
      );
      return null;
    }
  }
  
  /**
   * 保存主题设置
   * @param {string} theme - 主题ID
   * @returns {boolean} - 是否保存成功
   */
  static saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_THEME, theme);
      return true;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '保存主题设置失败',
          'write',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 加载主题设置
   * @returns {string|null} - 主题ID
   */
  static loadTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.EDITOR_THEME);
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '加载主题设置失败',
          'read',
          null,
          error
        )
      );
      return null;
    }
  }
  
  /**
   * 添加文件到历史记录
   * @param {Object} fileInfo - 文件信息
   * @returns {boolean} - 是否添加成功
   */
  static addFileToHistory(fileInfo) {
    try {
      if (!fileInfo || !fileInfo.name) {
        console.warn('添加文件到历史记录失败: 无效的文件信息');
        return false;
      }
      
      console.log('添加文件到历史记录:', fileInfo.name);
      
      // 加载现有历史记录
      const historyStr = localStorage.getItem(STORAGE_KEYS.EDITOR_HISTORY);
      let history = [];
      
      try {
        if (historyStr) {
          history = JSON.parse(historyStr);
          if (!Array.isArray(history)) {
            console.warn('历史记录格式不正确，重置为空数组');
            history = [];
          }
        }
      } catch (e) {
        console.error('解析历史记录失败:', e);
        history = [];
      }
      
      // 创建文件记录
      const fileRecord = {
        name: fileInfo.name,
        path: fileInfo.path || '',
        lastModified: fileInfo.lastModified || Date.now(),
        size: fileInfo.size || 0,
        timestamp: Date.now()
      };
      
      // 对于小文件（小于500KB），保存内容以便直接打开
      if (fileInfo.content && fileInfo.size && fileInfo.size < 500 * 1024) {
        fileRecord.content = fileInfo.content;
      }
      
      // 检查是否已存在
      const existingIndex = history.findIndex(item => 
        item.name === fileRecord.name && item.path === fileRecord.path
      );
      
      if (existingIndex !== -1) {
        // 更新现有记录
        history[existingIndex] = fileRecord;
        console.log('更新现有记录:', fileRecord.name);
      } else {
        // 添加新记录
        history.unshift(fileRecord);
        console.log('添加新记录:', fileRecord.name);
        
        // 限制历史记录大小
        if (history.length > MAX_HISTORY_SIZE) {
          history.pop();
        }
      }
      
      // 保存历史记录
      const historyJson = JSON.stringify(history);
      localStorage.setItem(STORAGE_KEYS.EDITOR_HISTORY, historyJson);
      console.log('保存历史记录成功, 当前记录数:', history.length);
      
      // 触发存储事件，以便其他组件可以更新
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.EDITOR_HISTORY,
        newValue: historyJson
      }));
      
      return true;
    } catch (error) {
      console.error('添加文件到历史记录失败:', error);
      errorService.handleError(
        new FileOperationError(
          '添加文件到历史记录失败',
          'write',
          fileInfo?.name,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 获取文件历史记录
   * @returns {Array} - 文件历史记录
   */
  static getFileHistory() {
    try {
      console.log('获取文件历史记录');
      const historyStr = localStorage.getItem(STORAGE_KEYS.EDITOR_HISTORY);
      console.log('历史记录原始数据:', historyStr);
      
      if (!historyStr) {
        console.log('没有找到历史记录');
        return [];
      }
      
      try {
        const history = JSON.parse(historyStr);
        if (!Array.isArray(history)) {
          console.warn('历史记录格式不正确，应为数组');
          return [];
        }
        console.log('历史记录解析成功, 记录数:', history.length);
        return history;
      } catch (parseError) {
        console.error('解析历史记录失败:', parseError);
        return [];
      }
    } catch (error) {
      console.error('获取文件历史记录失败:', error);
      errorService.handleError(
        new FileOperationError(
          '获取文件历史记录失败',
          'read',
          null,
          error
        )
      );
      return [];
    }
  }
  
  /**
   * 清除文件历史记录
   * @returns {boolean} - 是否清除成功
   */
  static clearFileHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.EDITOR_HISTORY);
      return true;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '清除文件历史记录失败',
          'delete',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 保存JSON Schema
   * @param {Array} schemas - JSON Schema列表
   * @returns {boolean} - 是否保存成功
   */
  static saveSchemas(schemas) {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_SCHEMAS, JSON.stringify(schemas));
      return true;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '保存JSON Schema失败',
          'write',
          null,
          error
        )
      );
      return false;
    }
  }
  
  /**
   * 加载JSON Schema
   * @returns {Array|null} - JSON Schema列表
   */
  static loadSchemas() {
    try {
      const schemasStr = localStorage.getItem(STORAGE_KEYS.EDITOR_SCHEMAS);
      return schemasStr ? JSON.parse(schemasStr) : null;
    } catch (error) {
      errorService.handleError(
        new FileOperationError(
          '加载JSON Schema失败',
          'read',
          null,
          error
        )
      );
      return null;
    }
  }
  
  /**
   * 检查本地存储是否可用
   * @returns {boolean} - 本地存储是否可用
   */
  static isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// 导出单例实例
export default PersistenceService;