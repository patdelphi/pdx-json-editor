/**
 * 错误处理服务
 * 提供全局错误捕获和处理功能
 */

// 错误类型枚举
export const ErrorType = {
  JSON_PARSE: 'JSON_PARSE',
  JSON_VALIDATION: 'JSON_VALIDATION',
  FILE_OPERATION: 'FILE_OPERATION',
  NETWORK: 'NETWORK',
  EDITOR: 'EDITOR',
  SCHEMA: 'SCHEMA',
  UNKNOWN: 'UNKNOWN'
};

// 错误严重程度枚举
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal'
};

/**
 * 应用错误类
 */
export class AppError extends Error {
  /**
   * 构造函数
   * @param {string} message - 错误消息
   * @param {string} type - 错误类型
   * @param {string} severity - 错误严重程度
   * @param {Error} originalError - 原始错误
   */
  constructor(message, type = ErrorType.UNKNOWN, severity = ErrorSeverity.ERROR, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.handled = false;
  }
}

/**
 * JSON解析错误
 */
export class JsonParseError extends AppError {
  /**
   * 构造函数
   * @param {string} message - 错误消息
   * @param {Error} originalError - 原始错误
   * @param {number} line - 行号
   * @param {number} column - 列号
   */
  constructor(message, originalError = null, line = null, column = null) {
    super(message, ErrorType.JSON_PARSE, ErrorSeverity.ERROR, originalError);
    this.name = 'JsonParseError';
    this.line = line;
    this.column = column;
  }
}

/**
 * 文件操作错误
 */
export class FileOperationError extends AppError {
  /**
   * 构造函数
   * @param {string} message - 错误消息
   * @param {string} operation - 操作类型（read, write, delete等）
   * @param {string} fileName - 文件名
   * @param {Error} originalError - 原始错误
   */
  constructor(message, operation, fileName = null, originalError = null) {
    super(message, ErrorType.FILE_OPERATION, ErrorSeverity.ERROR, originalError);
    this.name = 'FileOperationError';
    this.operation = operation;
    this.fileName = fileName;
  }
}

/**
 * Schema错误
 */
export class SchemaError extends AppError {
  /**
   * 构造函数
   * @param {string} message - 错误消息
   * @param {string} schemaId - Schema ID
   * @param {Error} originalError - 原始错误
   */
  constructor(message, schemaId = null, originalError = null) {
    super(message, ErrorType.SCHEMA, ErrorSeverity.WARNING, originalError);
    this.name = 'SchemaError';
    this.schemaId = schemaId;
  }
}

/**
 * 错误处理服务
 */
export class ErrorService {
  constructor() {
    this.listeners = [];
    this.errorHistory = [];
    this.maxHistorySize = 50;
    
    // 绑定方法
    this.handleError = this.handleError.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.getErrorHistory = this.getErrorHistory.bind(this);
    this.clearErrorHistory = this.clearErrorHistory.bind(this);
    
    // 设置全局错误处理
    this.setupGlobalHandlers();
  }
  
  /**
   * 设置全局错误处理器
   */
  setupGlobalHandlers() {
    // 处理未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.handleError(
        new AppError(
          `未处理的Promise错误: ${error.message || '未知错误'}`,
          ErrorType.UNKNOWN,
          ErrorSeverity.ERROR,
          error
        )
      );
    });
    
    // 处理全局错误
    window.addEventListener('error', (event) => {
      // 忽略资源加载错误
      if (event.error) {
        this.handleError(
          new AppError(
            `全局错误: ${event.error.message || '未知错误'}`,
            ErrorType.UNKNOWN,
            ErrorSeverity.ERROR,
            event.error
          )
        );
      }
    });
  }
  
  /**
   * 处理错误
   * @param {Error|AppError} error - 错误对象
   * @returns {AppError} - 处理后的错误对象
   */
  handleError(error) {
    // 如果不是AppError，转换为AppError
    if (!(error instanceof AppError)) {
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        error = new JsonParseError(error.message, error);
      } else {
        error = new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.ERROR, error);
      }
    }
    
    // 标记为已处理
    error.handled = true;
    
    // 添加到历史记录
    this.addToHistory(error);
    
    // 通知监听器
    this.notifyListeners(error);
    
    // 记录到控制台
    this.logError(error);
    
    return error;
  }
  
  /**
   * 添加错误到历史记录
   * @param {AppError} error - 错误对象
   */
  addToHistory(error) {
    this.errorHistory.unshift(error);
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }
    
    // 尝试保存到本地存储
    try {
      const serializedErrors = this.errorHistory.map(err => ({
        message: err.message,
        type: err.type,
        severity: err.severity,
        timestamp: err.timestamp.toISOString(),
        name: err.name
      }));
      
      localStorage.setItem('pdx-json-editor-errors', JSON.stringify(serializedErrors));
    } catch (e) {
      console.error('保存错误历史失败:', e);
    }
  }
  
  /**
   * 获取错误历史记录
   * @returns {AppError[]} - 错误历史记录
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }
  
  /**
   * 清除错误历史记录
   */
  clearErrorHistory() {
    this.errorHistory = [];
    
    try {
      localStorage.removeItem('pdx-json-editor-errors');
    } catch (e) {
      console.error('清除错误历史失败:', e);
    }
  }
  
  /**
   * 添加错误监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  
  /**
   * 移除错误监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * 通知所有监听器
   * @param {AppError} error - 错误对象
   */
  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('错误监听器执行失败:', e);
      }
    });
  }
  
  /**
   * 记录错误到控制台
   * @param {AppError} error - 错误对象
   */
  logError(error) {
    const logMethod = error.severity === ErrorSeverity.FATAL || error.severity === ErrorSeverity.ERROR
      ? console.error
      : error.severity === ErrorSeverity.WARNING
        ? console.warn
        : console.info;
    
    logMethod(
      `[${error.timestamp.toLocaleTimeString()}] ${error.name}: ${error.message}`,
      error.originalError || ''
    );
  }
  
  /**
   * 从JSON解析错误中提取行号和列号
   * @param {Error} error - 原始错误
   * @returns {{line: number, column: number}|null} - 行号和列号
   */
  static extractPositionFromJsonError(error) {
    if (!error || !error.message) return null;
    
    // 尝试从错误消息中提取位置信息
    const positionMatch = error.message.match(/at position (\d+)/i);
    if (positionMatch && positionMatch[1]) {
      const position = parseInt(positionMatch[1], 10);
      
      // 计算行号和列号
      // 这需要原始JSON文本，但我们可能没有
      // 返回一个近似值
      return {
        position,
        line: null,
        column: null
      };
    }
    
    // 尝试从错误消息中提取行号和列号
    const lineColMatch = error.message.match(/at line (\d+) column (\d+)/i);
    if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
      return {
        line: parseInt(lineColMatch[1], 10),
        column: parseInt(lineColMatch[2], 10)
      };
    }
    
    return null;
  }
  
  /**
   * 计算JSON文本中位置对应的行号和列号
   * @param {string} jsonText - JSON文本
   * @param {number} position - 位置
   * @returns {{line: number, column: number}} - 行号和列号
   */
  static calculateLineAndColumn(jsonText, position) {
    if (!jsonText || position === undefined || position === null) {
      return { line: null, column: null };
    }
    
    const lines = jsonText.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    return { line, column };
  }
  
  /**
   * 从错误中提取用户友好的消息
   * @param {Error|AppError} error - 错误对象
   * @returns {string} - 用户友好的错误消息
   */
  static getFriendlyMessage(error) {
    if (!error) return '发生未知错误';
    
    // 如果是AppError，直接返回消息
    if (error instanceof AppError) {
      return error.message;
    }
    
    // 处理常见错误类型
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return `JSON语法错误: ${error.message}`;
    }
    
    if (error instanceof TypeError) {
      return `类型错误: ${error.message}`;
    }
    
    if (error instanceof ReferenceError) {
      return `引用错误: ${error.message}`;
    }
    
    // 默认消息
    return error.message || '发生未知错误';
  }
}

// 创建单例实例
const errorService = new ErrorService();

export default errorService;