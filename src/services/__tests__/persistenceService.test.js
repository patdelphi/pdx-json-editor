/**
 * 持久化服务测试
 */

import PersistenceService from '../persistenceService';
import errorService from '../errorService';

// 模拟errorService
jest.mock('../errorService', () => ({
  handleError: jest.fn(),
  FileOperationError: jest.requireActual('../errorService').FileOperationError
}));

describe('PersistenceService', () => {
  // 模拟localStorage
  beforeEach(() => {
    // 清除所有模拟调用信息
    jest.clearAllMocks();
    
    // 模拟localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });
  
  test('saveEditorContent应保存内容和文件信息', () => {
    const content = '{"name": "test"}';
    const fileInfo = {
      name: 'test.json',
      lastModified: Date.now(),
      size: 100,
      type: 'application/json',
      path: '/test.json'
    };
    
    const result = PersistenceService.saveEditorContent(content, fileInfo);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-content', content);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-file', expect.any(String));
    
    // 验证保存的文件信息
    const savedFileInfo = JSON.parse(localStorage.setItem.mock.calls[1][1]);
    expect(savedFileInfo.name).toBe(fileInfo.name);
    expect(savedFileInfo.size).toBe(fileInfo.size);
  });
  
  test('saveEditorContent应处理错误', () => {
    // 模拟localStorage.setItem抛出错误
    localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const result = PersistenceService.saveEditorContent('test');
    
    expect(result).toBe(false);
    expect(errorService.handleError).toHaveBeenCalled();
    expect(errorService.handleError.mock.calls[0][0].message).toBe('保存编辑器内容到本地存储失败');
  });
  
  test('loadEditorContent应加载内容和文件信息', () => {
    const content = '{"name": "test"}';
    const fileInfo = {
      name: 'test.json',
      lastModified: Date.now(),
      size: 100
    };
    
    // 设置模拟数据
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'pdx-json-editor-content') {
        return content;
      } else if (key === 'pdx-json-editor-file') {
        return JSON.stringify(fileInfo);
      }
      return null;
    });
    
    const result = PersistenceService.loadEditorContent();
    
    expect(result).not.toBeNull();
    expect(result.content).toBe(content);
    expect(result.fileInfo).toEqual(fileInfo);
  });
  
  test('loadEditorContent应处理错误', () => {
    // 模拟localStorage.getItem抛出错误
    localStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const result = PersistenceService.loadEditorContent();
    
    expect(result).toBeNull();
    expect(errorService.handleError).toHaveBeenCalled();
    expect(errorService.handleError.mock.calls[0][0].message).toBe('从本地存储加载编辑器内容失败');
  });
  
  test('clearEditorContent应清除内容和文件信息', () => {
    const result = PersistenceService.clearEditorContent();
    
    expect(result).toBe(true);
    expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
    expect(localStorage.removeItem).toHaveBeenCalledWith('pdx-json-editor-content');
    expect(localStorage.removeItem).toHaveBeenCalledWith('pdx-json-editor-file');
  });
  
  test('saveEditorSettings应保存设置', () => {
    const settings = {
      theme: 'dark',
      fontSize: 14,
      tabSize: 2
    };
    
    const result = PersistenceService.saveEditorSettings(settings);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-settings', JSON.stringify(settings));
  });
  
  test('loadEditorSettings应加载设置', () => {
    const settings = {
      theme: 'dark',
      fontSize: 14,
      tabSize: 2
    };
    
    // 设置模拟数据
    localStorage.getItem.mockReturnValue(JSON.stringify(settings));
    
    const result = PersistenceService.loadEditorSettings();
    
    expect(result).toEqual(settings);
  });
  
  test('saveTheme应保存主题', () => {
    const result = PersistenceService.saveTheme('dark');
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-theme', 'dark');
  });
  
  test('loadTheme应加载主题', () => {
    // 设置模拟数据
    localStorage.getItem.mockReturnValue('dark');
    
    const result = PersistenceService.loadTheme();
    
    expect(result).toBe('dark');
  });
  
  test('addFileToHistory应添加文件到历史记录', () => {
    const fileInfo = {
      name: 'test.json',
      path: '/test.json',
      lastModified: Date.now(),
      size: 100
    };
    
    // 设置模拟数据
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    
    const result = PersistenceService.addFileToHistory(fileInfo);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-history', expect.any(String));
    
    // 验证保存的历史记录
    const savedHistory = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0].name).toBe(fileInfo.name);
    expect(savedHistory[0].path).toBe(fileInfo.path);
  });
  
  test('addFileToHistory应更新现有记录', () => {
    const fileInfo = {
      name: 'test.json',
      path: '/test.json',
      lastModified: Date.now(),
      size: 100
    };
    
    // 设置模拟数据
    const existingHistory = [
      {
        name: 'test.json',
        path: '/test.json',
        lastModified: Date.now() - 1000,
        size: 50,
        timestamp: Date.now() - 1000
      }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(existingHistory));
    
    const result = PersistenceService.addFileToHistory(fileInfo);
    
    expect(result).toBe(true);
    
    // 验证保存的历史记录
    const savedHistory = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0].size).toBe(fileInfo.size);
  });
  
  test('addFileToHistory应限制历史记录大小', () => {
    // 创建超过最大历史记录大小的历史记录
    const existingHistory = Array.from({ length: 10 }, (_, i) => ({
      name: `test${i}.json`,
      path: `/test${i}.json`,
      lastModified: Date.now() - i * 1000,
      size: 100,
      timestamp: Date.now() - i * 1000
    }));
    
    localStorage.getItem.mockReturnValue(JSON.stringify(existingHistory));
    
    const newFile = {
      name: 'new.json',
      path: '/new.json',
      lastModified: Date.now(),
      size: 100
    };
    
    const result = PersistenceService.addFileToHistory(newFile);
    
    expect(result).toBe(true);
    
    // 验证保存的历史记录
    const savedHistory = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedHistory).toHaveLength(10);
    expect(savedHistory[0].name).toBe(newFile.name);
    expect(savedHistory[9].name).toBe('test8.json');
  });
  
  test('getFileHistory应获取文件历史记录', () => {
    const history = [
      {
        name: 'test.json',
        path: '/test.json',
        lastModified: Date.now(),
        size: 100,
        timestamp: Date.now()
      }
    ];
    
    // 设置模拟数据
    localStorage.getItem.mockReturnValue(JSON.stringify(history));
    
    const result = PersistenceService.getFileHistory();
    
    expect(result).toEqual(history);
  });
  
  test('clearFileHistory应清除文件历史记录', () => {
    const result = PersistenceService.clearFileHistory();
    
    expect(result).toBe(true);
    expect(localStorage.removeItem).toHaveBeenCalledWith('pdx-json-editor-history');
  });
  
  test('saveSchemas应保存JSON Schema', () => {
    const schemas = [
      {
        id: 'schema1',
        name: 'Schema 1',
        schema: { type: 'object' }
      }
    ];
    
    const result = PersistenceService.saveSchemas(schemas);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('pdx-json-editor-schemas', JSON.stringify(schemas));
  });
  
  test('loadSchemas应加载JSON Schema', () => {
    const schemas = [
      {
        id: 'schema1',
        name: 'Schema 1',
        schema: { type: 'object' }
      }
    ];
    
    // 设置模拟数据
    localStorage.getItem.mockReturnValue(JSON.stringify(schemas));
    
    const result = PersistenceService.loadSchemas();
    
    expect(result).toEqual(schemas);
  });
  
  test('isStorageAvailable应检查本地存储是否可用', () => {
    const result = PersistenceService.isStorageAvailable();
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
  
  test('isStorageAvailable应处理错误', () => {
    // 模拟localStorage.setItem抛出错误
    localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const result = PersistenceService.isStorageAvailable();
    
    expect(result).toBe(false);
  });
});