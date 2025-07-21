/**
 * 全局状态管理服务
 * 提供应用全局状态管理功能
 */

// 使用发布-订阅模式实现状态管理
class StateService {
  constructor() {
    // 初始状态
    this.state = {
      // 编辑器状态
      editor: {
        content: '',
        isValid: true,
        errors: [],
        isDirty: false,
        cursorPosition: { line: 1, column: 1 }
      },
      
      // 文件状态
      file: {
        currentFile: null,
        isLoading: false,
        isLargeFile: false
      },
      
      // 设置状态
      settings: {
        theme: 'light',
        indentSize: 2,
        indentType: 'spaces',
        wordWrap: false,
        lineNumbers: true,
        minimap: true,
        fontSize: 14
      },
      
      // Schema状态
      schema: {
        schemas: [],
        selectedSchemaId: null
      }
    };
    
    // 监听器
    this.listeners = {};
  }
  
  /**
   * 获取状态
   * @param {string} path - 状态路径，如 'editor.content'
   * @returns {any} - 状态值
   */
  getState(path) {
    if (!path) return this.state;
    
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * 更新状态
   * @param {string} path - 状态路径，如 'editor.content'
   * @param {any} value - 新的状态值
   */
  setState(path, value) {
    if (!path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.state;
    
    // 找到要更新的对象
    for (const key of keys) {
      if (current[key] === undefined || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // 更新值
    current[lastKey] = value;
    
    // 通知监听器
    this.notify(path, value);
  }
  
  /**
   * 添加状态监听器
   * @param {string} path - 状态路径，如 'editor.content'
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
   * @param {string} path - 状态路径，如 'editor.content'
   * @param {any} value - 新的状态值
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
        const parentValue = this.getState(parentPath);
        this.listeners[parentPath].forEach(listener => listener(parentValue));
      }
    }
    
    // 通知根路径的监听器
    if (this.listeners['']) {
      this.listeners[''].forEach(listener => listener(this.state));
    }
  }
  
  /**
   * 重置状态
   */
  resetState() {
    this.state = {
      editor: {
        content: '',
        isValid: true,
        errors: [],
        isDirty: false,
        cursorPosition: { line: 1, column: 1 }
      },
      file: {
        currentFile: null,
        isLoading: false,
        isLargeFile: false
      },
      settings: {
        theme: 'light',
        indentSize: 2,
        indentType: 'spaces',
        wordWrap: false,
        lineNumbers: true,
        minimap: true,
        fontSize: 14
      },
      schema: {
        schemas: [],
        selectedSchemaId: null
      }
    };
    
    // 通知所有监听器
    this.notify('', this.state);
  }
  
  /**
   * 从本地存储加载状态
   */
  loadFromStorage() {
    try {
      // 加载设置
      const settingsStr = localStorage.getItem('pdx-json-editor-settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        this.setState('settings', { ...this.state.settings, ...settings });
      }
      
      // 最近文件功能已移除
      
      // 加载主题
      const theme = localStorage.getItem('pdx-json-editor-theme');
      if (theme) {
        this.setState('settings.theme', theme);
      }
      
      // 加载Schema
      const schemasStr = localStorage.getItem('pdx-json-editor-schemas');
      if (schemasStr) {
        const schemas = JSON.parse(schemasStr);
        this.setState('schema.schemas', schemas);
      }
    } catch (error) {
      console.error('从本地存储加载状态失败:', error);
    }
  }
  
  /**
   * 保存状态到本地存储
   */
  saveToStorage() {
    try {
      // 保存设置
      localStorage.setItem('pdx-json-editor-settings', JSON.stringify(this.state.settings));
      
      // 最近文件功能已移除
      
      // 保存主题
      localStorage.setItem('pdx-json-editor-theme', this.state.settings.theme);
      
      // 保存Schema
      localStorage.setItem('pdx-json-editor-schemas', JSON.stringify(this.state.schema.schemas));
    } catch (error) {
      console.error('保存状态到本地存储失败:', error);
    }
  }
}

// 创建单例实例
const stateService = new StateService();

// 导出单例实例
export default stateService;