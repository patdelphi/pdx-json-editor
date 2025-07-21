/**
 * 状态服务测试
 */

import stateService from '../stateService';

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

describe('状态服务', () => {
  beforeEach(() => {
    // 重置状态
    stateService.resetState();
    // 清理localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('应能获取状态', () => {
    // 获取整个状态
    const state = stateService.getState();
    expect(state).toBeDefined();
    expect(state.editor).toBeDefined();
    expect(state.file).toBeDefined();
    expect(state.settings).toBeDefined();
    
    // 获取特定路径的状态
    const content = stateService.getState('editor.content');
    expect(content).toBe('');
    
    const theme = stateService.getState('settings.theme');
    expect(theme).toBe('light');
  });
  
  test('应能更新状态', () => {
    // 更新状态
    stateService.setState('editor.content', '{"test":"value"}');
    stateService.setState('settings.theme', 'dark');
    
    // 验证状态是否更新
    expect(stateService.getState('editor.content')).toBe('{"test":"value"}');
    expect(stateService.getState('settings.theme')).toBe('dark');
  });
  
  test('应能订阅状态变化', () => {
    // 创建监听器
    const listener = jest.fn();
    
    // 订阅状态变化
    const unsubscribe = stateService.subscribe('editor.content', listener);
    
    // 更新状态
    stateService.setState('editor.content', '{"test":"value"}');
    
    // 验证监听器是否被调用
    expect(listener).toHaveBeenCalledWith('{"test":"value"}');
    
    // 取消订阅
    unsubscribe();
    
    // 再次更新状态
    stateService.setState('editor.content', '{"test":"new value"}');
    
    // 验证监听器是否不再被调用
    expect(listener).toHaveBeenCalledTimes(1);
  });
  
  test('应能保存状态到本地存储', () => {
    // 更新状态
    stateService.setState('settings.theme', 'dark');
    stateService.setState('settings.indentSize', 4);
    
    // 保存到本地存储
    stateService.saveToStorage();
    
    // 验证localStorage是否被调用
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-settings', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-theme', 'dark');
    
    // 验证保存的内容
    const settingsStr = localStorage.getItem('pdx-json-editor-settings');
    const settings = JSON.parse(settingsStr);
    expect(settings.theme).toBe('dark');
    expect(settings.indentSize).toBe(4);
  });
  
  test('应能从本地存储加载状态', () => {
    // 设置localStorage
    localStorage.setItem('pdx-json-editor-theme', 'dark');
    localStorage.setItem('pdx-json-editor-settings', JSON.stringify({
      indentSize: 4,
      wordWrap: true
    }));
    
    // 加载状态
    stateService.loadFromStorage();
    
    // 验证状态是否正确加载
    expect(stateService.getState('settings.theme')).toBe('dark');
    expect(stateService.getState('settings.indentSize')).toBe(4);
    expect(stateService.getState('settings.wordWrap')).toBe(true);
  });
  
  test('应能重置状态', () => {
    // 更新状态
    stateService.setState('editor.content', '{"test":"value"}');
    stateService.setState('settings.theme', 'dark');
    
    // 重置状态
    stateService.resetState();
    
    // 验证状态是否重置
    expect(stateService.getState('editor.content')).toBe('');
    expect(stateService.getState('settings.theme')).toBe('light');
  });
});