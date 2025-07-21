/**
 * 配置服务
 * 提供应用全局配置管理功能
 */

import errorService from './errorService';

// 默认配置
const DEFAULT_CONFIG = {
  // 编辑器配置
  editor: {
    // 基本设置
    fontSize: 14,
    fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
    lineHeight: 1.5,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: false,
    lineNumbers: true,
    
    // 高级设置
    minimap: {
      enabled: true,
      showSlider: 'always',
      renderCharacters: true,
      side: 'right'
    },
    folding: true,
    foldingStrategy: 'indentation',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: false,
    
    // 性能设置
    largeFileThreshold: 1000000, // 1MB
    largeFileOptimizations: true,
    
    // 多光标设置
    multiCursorModifier: 'alt',
    columnSelection: false
  },
  
  // 应用配置
  app: {
    // 主题设置
    theme: 'system', // 'light', 'dark', 'system'
    highContrast: false,
    
    // 文件设置
    maxRecentFiles: 10,
    autoSave: false,
    autoSaveInterval: 30000, // 30秒
    
    // 性能设置
    enablePerformanceMode: true,
    
    // 无障碍设置
    accessibilitySupport: 'auto',
    
    // 语言设置
    language: 'zh-CN'
  },
  
  // 快捷键配置
  shortcuts: {
    format: 'Ctrl+Shift+F',
    compress: 'Ctrl+Shift+M',
    search: 'Ctrl+F',
    replace: 'Ctrl+H',
    save: 'Ctrl+S',
    saveAs: 'Ctrl+Shift+S',
    new: 'Ctrl+N',
    open: 'Ctrl+O',
    diff: 'Ctrl+Alt+D',
    foldAll: 'Ctrl+[',
    unfoldAll: 'Ctrl+]',
    help: '?'
  }
};

/**
 * 配置服务类
 */
class ConfigService {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.listeners = {};
    
    // 尝试从本地存储加载配置
    this.loadFromStorage();
  }
  
  /**
   * 获取配置
   * @param {string} path - 配置路径，如 'editor.fontSize'
   * @returns {any} - 配置值
   */
  get(path) {
    if (!path) return { ...this.config };
    
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    // 返回深拷贝，防止直接修改
    return current !== null && typeof current === 'object' ? { ...current } : current;
  }
  
  /**
   * 设置配置
   * @param {string} path - 配置路径，如 'editor.fontSize'
   * @param {any} value - 配置值
   */
  set(path, value) {
    if (!path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.config;
    
    // 找到要更新的对象
    for (const key of keys) {
      if (current[key] === undefined || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // 更新值
    current[lastKey] = value;
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 通知监听器
    this.notify(path, value);
  }
  
  /**
   * 重置配置
   * @param {string} path - 配置路径，如 'editor'，不传则重置所有配置
   */
  reset(path) {
    if (!path) {
      this.config = { ...DEFAULT_CONFIG };
      this.saveToStorage();
      this.notify('', this.config);
      return;
    }
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (keys.length === 0) {
      // 重置顶级配置
      this.config[lastKey] = { ...DEFAULT_CONFIG[lastKey] };
    } else {
      // 重置嵌套配置
      let current = this.config;
      let defaultCurrent = DEFAULT_CONFIG;
      
      // 找到要重置的对象
      for (const key of keys) {
        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
        defaultCurrent = defaultCurrent[key];
      }
      
      // 重置值
      current[lastKey] = defaultCurrent ? { ...defaultCurrent[lastKey] } : undefined;
    }
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 通知监听器
    this.notify(path, this.get(path));
  }
  
  /**
   * 添加配置监听器
   * @param {string} path - 配置路径，如 'editor.fontSize'
   * @param {Function} listener - 监听器函数
   * @returns {Function} - 移除监听器的函数
   */
  subscribe(path, listener) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    
    this.listeners[path].push(listener);
    
    // 返回取消订阅的函数
    return () => {
      this.listeners[path] = this.listeners[path].filter(l => l !== listener);
    };
  }
  
  /**
   * 通知监听器
   * @param {string} path - 配置路径，如 'editor.fontSize'
   * @param {any} value - 配置值
   */
  notify(path, value) {
    // 通知精确路径的监听器
    if (this.listeners[path]) {
      this.listeners[path].forEach(listener => listener(value));
    }
    
    // 通知父路径的监听器
    const keys = path.split('.');
    while (keys.length > 1) {
      keys.pop();
      const parentPath = keys.join('.');
      
      if (this.listeners[parentPath]) {
        const parentValue = this.get(parentPath);
        this.listeners[parentPath].forEach(listener => listener(parentValue));
      }
    }
    
    // 通知根路径的监听器
    if (this.listeners['']) {
      this.listeners[''].forEach(listener => listener(this.config));
    }
  }
  
  /**
   * 从本地存储加载配置
   */
  loadFromStorage() {
    try {
      const storedConfig = localStorage.getItem('pdx-json-editor-config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        
        // 合并配置
        this.config = this.mergeConfigs(DEFAULT_CONFIG, parsedConfig);
      }
    } catch (error) {
      errorService.handleError(error);
    }
  }
  
  /**
   * 保存配置到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem('pdx-json-editor-config', JSON.stringify(this.config));
    } catch (error) {
      errorService.handleError(error);
    }
  }
  
  /**
   * 合并配置
   * @param {Object} defaultConfig - 默认配置
   * @param {Object} userConfig - 用户配置
   * @returns {Object} - 合并后的配置
   */
  mergeConfigs(defaultConfig, userConfig) {
    const result = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
        if (
          userConfig[key] !== null &&
          typeof userConfig[key] === 'object' &&
          !Array.isArray(userConfig[key]) &&
          Object.prototype.hasOwnProperty.call(defaultConfig, key) &&
          defaultConfig[key] !== null &&
          typeof defaultConfig[key] === 'object' &&
          !Array.isArray(defaultConfig[key])
        ) {
          // 递归合并对象
          result[key] = this.mergeConfigs(defaultConfig[key], userConfig[key]);
        } else {
          // 直接替换值
          result[key] = userConfig[key];
        }
      }
    }
    
    return result;
  }
  
  /**
   * 导出配置
   * @returns {string} - JSON格式的配置
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * 导入配置
   * @param {string} configJson - JSON格式的配置
   */
  importConfig(configJson) {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // 合并配置
      this.config = this.mergeConfigs(DEFAULT_CONFIG, importedConfig);
      
      // 保存到本地存储
      this.saveToStorage();
      
      // 通知监听器
      this.notify('', this.config);
      
      return true;
    } catch (error) {
      errorService.handleError(error);
      return false;
    }
  }
}

// 创建单例实例
const configService = new ConfigService();

// 导出单例实例
export default configService;