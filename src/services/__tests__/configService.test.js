/**
 * 配置服务测试
 */

import configService from '../configService';
import errorService from '../errorService';

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

// 模拟errorService
jest.mock('../errorService', () => ({
  handleError: jest.fn()
}));

describe('配置服务', () => {
  beforeEach(() => {
    // 重置配置
    configService.reset();
    
    // 清理localStorage
    localStorage.clear();
    
    // 清理所有mock
    jest.clearAllMocks();
  });
  
  test('应能获取配置', () => {
    // 获取整个配置
    const config = configService.get();
    expect(config).toBeDefined();
    expect(config.editor).toBeDefined();
    expect(config.app).toBeDefined();
    expect(config.shortcuts).toBeDefined();
    
    // 获取特定路径的配置
    const fontSize = configService.get('editor.fontSize');
    expect(fontSize).toBe(14);
    
    const theme = configService.get('app.theme');
    expect(theme).toBe('system');
  });
  
  test('应能设置配置', () => {
    // 设置配置
    configService.set('editor.fontSize', 16);
    configService.set('app.theme', 'dark');
    
    // 验证配置是否更新
    expect(configService.get('editor.fontSize')).toBe(16);
    expect(configService.get('app.theme')).toBe('dark');
    
    // 验证localStorage是否被调用
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-config', expect.any(String));
  });
  
  test('应能重置配置', () => {
    // 设置配置
    configService.set('editor.fontSize', 16);
    configService.set('app.theme', 'dark');
    
    // 重置特定配置
    configService.reset('editor');
    
    // 验证配置是否重置
    expect(configService.get('editor.fontSize')).toBe(14);
    expect(configService.get('app.theme')).toBe('dark');
    
    // 重置所有配置
    configService.reset();
    
    // 验证配置是否重置
    expect(configService.get('editor.fontSize')).toBe(14);
    expect(configService.get('app.theme')).toBe('system');
  });
  
  test('应能订阅配置变化', () => {
    // 创建监听器
    const listener = jest.fn();
    
    // 订阅配置变化
    const unsubscribe = configService.subscribe('editor.fontSize', listener);
    
    // 设置配置
    configService.set('editor.fontSize', 16);
    
    // 验证监听器是否被调用
    expect(listener).toHaveBeenCalledWith(16);
    
    // 取消订阅
    unsubscribe();
    
    // 再次设置配置
    configService.set('editor.fontSize', 18);
    
    // 验证监听器是否不再被调用
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  test('应能从本地存储加载配置', () => {
    // 设置localStorage
    localStorage.setItem('pdx-json-editor-config', JSON.stringify({
      editor: {
        fontSize: 16
      },
      app: {
        theme: 'dark'
      }
    }));
    
    // 加载配置
    configService.loadFromStorage();
    
    // 验证配置是否正确加载
    expect(configService.get('editor.fontSize')).toBe(16);
    expect(configService.get('app.theme')).toBe('dark');
  });
  
  test('应能导出和导入配置', () => {
    // 设置配置
    configService.set('editor.fontSize', 16);
    configService.set('app.theme', 'dark');
    
    // 导出配置
    const exportedConfig = configService.exportConfig();
    
    // 重置配置
    configService.reset();
    
    // 导入配置
    configService.importConfig(exportedConfig);
    
    // 验证配置是否正确导入
    expect(configService.get('editor.fontSize')).toBe(16);
    expect(configService.get('app.theme')).toBe('dark');
  });
  
  test('应能处理导入配置错误', () => {
    // 导入无效的配置
    const result = configService.importConfig('invalid json');
    
    // 验证结果
    expect(result).toBe(false);
    
    // 验证错误处理
    expect(errorService.handleError).toHaveBeenCalled();
  });
  
  test('应能合并配置', () => {
    // 默认配置
    const defaultConfig = {
      a: 1,
      b: {
        c: 2,
        d: 3
      },
      e: [1, 2, 3]
    };
    
    // 用户配置
    const userConfig = {
      a: 10,
      b: {
        c: 20
      },
      e: [4, 5, 6]
    };
    
    // 合并配置
    const mergedConfig = configService.mergeConfigs(defaultConfig, userConfig);
    
    // 验证结果
    expect(mergedConfig).toEqual({
      a: 10,
      b: {
        c: 20,
        d: 3
      },
      e: [4, 5, 6]
    });
  });
});