/**
 * 错误服务测试
 */

import errorService, { 
  AppError, 
  JsonParseError, 
  SchemaError,
  ErrorType,
  ErrorSeverity
} from '../errorService';

// 模拟console方法
const originalConsole = { ...console };
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// 模拟localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('错误服务', () => {
  beforeEach(() => {
    // 清理错误历史
    errorService.clearErrorHistory();
    
    // 清理监听器
    errorService.listeners = [];
    
    // 模拟console方法
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.info = mockConsole.info;
    
    // 清理localStorage
    localStorage.clear();
    
    // 清理所有mock
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // 恢复console方法
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  });
  
  test('应能处理普通错误', () => {
    // 创建错误
    const error = new Error('测试错误');
    
    // 处理错误
    const appError = errorService.handleError(error);
    
    // 验证结果
    expect(appError).toBeInstanceOf(AppError);
    expect(appError.message).toBe('测试错误');
    expect(appError.type).toBe(ErrorType.UNKNOWN);
    expect(appError.severity).toBe(ErrorSeverity.ERROR);
    expect(appError.originalError).toBe(error);
    expect(appError.handled).toBe(true);
    
    // 验证错误历史
    expect(errorService.getErrorHistory()).toHaveLength(1);
    expect(errorService.getErrorHistory()[0]).toBe(appError);
    
    // 验证console调用
    expect(console.error).toHaveBeenCalled();
  });
  
  test('应能处理JSON解析错误', () => {
    // 创建JSON解析错误
    const error = new SyntaxError('Unexpected token } in JSON at position 10');
    
    // 处理错误
    const appError = errorService.handleError(error);
    
    // 验证结果
    expect(appError).toBeInstanceOf(JsonParseError);
    expect(appError.message).toBe('Unexpected token } in JSON at position 10');
    expect(appError.type).toBe(ErrorType.JSON_PARSE);
    
    // 验证console调用
    expect(console.error).toHaveBeenCalled();
  });
  
  test('应能处理自定义应用错误', () => {
    // 创建自定义错误
    const error = new SchemaError('Schema验证失败', 'test-schema');
    
    // 处理错误
    const appError = errorService.handleError(error);
    
    // 验证结果
    expect(appError).toBe(error);
    expect(appError.message).toBe('Schema验证失败');
    expect(appError.type).toBe(ErrorType.SCHEMA);
    expect(appError.severity).toBe(ErrorSeverity.WARNING);
    expect(appError.schemaId).toBe('test-schema');
    
    // 验证console调用
    expect(console.warn).toHaveBeenCalled();
  });
  
  test('应能通知错误监听器', () => {
    // 创建监听器
    const listener = jest.fn();
    
    // 添加监听器
    errorService.addListener(listener);
    
    // 处理错误
    const error = new Error('测试错误');
    errorService.handleError(error);
    
    // 验证监听器是否被调用
    expect(listener).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith(expect.any(AppError));
    
    // 移除监听器
    errorService.removeListener(listener);
    
    // 再次处理错误
    errorService.handleError(error);
    
    // 验证监听器是否不再被调用
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  test('应能保存和清除错误历史', () => {
    // 处理多个错误
    errorService.handleError(new Error('错误1'));
    errorService.handleError(new Error('错误2'));
    errorService.handleError(new Error('错误3'));
    
    // 验证错误历史
    expect(errorService.getErrorHistory()).toHaveLength(3);
    expect(errorService.getErrorHistory()[0].message).toBe('错误3');
    expect(errorService.getErrorHistory()[1].message).toBe('错误2');
    expect(errorService.getErrorHistory()[2].message).toBe('错误1');
    
    // 验证localStorage调用
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-errors', expect.any(String));
    
    // 清除错误历史
    errorService.clearErrorHistory();
    
    // 验证错误历史是否被清除
    expect(errorService.getErrorHistory()).toHaveLength(0);
    
    // 验证localStorage调用
    expect(localStorage.removeItem).toHaveBeenCalledWith('pdx-json-editor-errors');
  });
  
  test('应能提取JSON错误的位置信息', () => {
    // 测试位置提取
    const error1 = new SyntaxError('Unexpected token } in JSON at position 10');
    const position1 = errorService.constructor.extractPositionFromJsonError(error1);
    expect(position1).toEqual({ position: 10, line: null, column: null });
    
    const error2 = new SyntaxError('Unexpected token } in JSON at line 5 column 10');
    const position2 = errorService.constructor.extractPositionFromJsonError(error2);
    expect(position2).toEqual({ line: 5, column: 10 });
  });
  
  test('应能计算行号和列号', () => {
    // 测试行列计算
    const jsonText = '{\n  "test": "value",\n  "foo": "bar"\n}';
    const position = 15; // 在第二行的 "value" 中间
    
    const lineCol = errorService.constructor.calculateLineAndColumn(jsonText, position);
    expect(lineCol).toEqual({ line: 2, column: 14 });
  });
  
  test('应能生成用户友好的错误消息', () => {
    // 测试友好消息
    const error1 = new Error('测试错误');
    const message1 = errorService.constructor.getFriendlyMessage(error1);
    expect(message1).toBe('测试错误');
    
    const error2 = new SyntaxError('Unexpected token } in JSON');
    const message2 = errorService.constructor.getFriendlyMessage(error2);
    expect(message2).toBe('JSON语法错误: Unexpected token } in JSON');
    
    const error3 = new AppError('自定义错误', ErrorType.UNKNOWN, ErrorSeverity.WARNING);
    const message3 = errorService.constructor.getFriendlyMessage(error3);
    expect(message3).toBe('自定义错误');
  });
});