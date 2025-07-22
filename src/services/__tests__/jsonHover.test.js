// 这是一个简单的测试文件，用于验证JSON键值悬停信息功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { configureJsonLanguage } from '../monacoService';

// 模拟monaco-editor
jest.mock('monaco-editor');

describe('jsonHover', () => {
  it('should register hover provider for JSON', () => {
    // 创建模拟Monaco对象
    const mockMonaco = {
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: jest.fn()
          }
        },
        registerDocumentFormattingEditProvider: jest.fn(),
        registerHoverProvider: jest.fn()
      }
    };
    
    // 调用配置函数
    configureJsonLanguage(mockMonaco);
    
    // 验证是否注册了悬停提供程序
    expect(mockMonaco.languages.registerHoverProvider).toHaveBeenCalledWith(
      'json',
      expect.any(Object)
    );
  });
  
  it('should provide hover information for JSON keys and values', () => {
    // 创建模拟Monaco对象
    const mockMonaco = {
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: jest.fn()
          }
        },
        registerDocumentFormattingEditProvider: jest.fn(),
        registerHoverProvider: jest.fn()
      }
    };
    
    // 调用配置函数
    configureJsonLanguage(mockMonaco);
    
    // 获取注册的提供程序
    const provider = mockMonaco.languages.registerHoverProvider.mock.calls[0][1];
    
    // 创建模拟模型
    const mockModel = {
      getWordAtPosition: jest.fn().mockImplementation((position) => {
        if (position.lineNumber === 1 && position.column === 5) {
          return { word: 'name', startColumn: 2, endColumn: 6 };
        } else if (position.lineNumber === 1 && position.column === 15) {
          return { word: 'test', startColumn: 12, endColumn: 16 };
        }
        return null;
      }),
      getLineContent: jest.fn().mockImplementation((lineNumber) => {
        if (lineNumber === 1) {
          return '{"name": "test"}';
        }
        return '';
      }),
      getValue: jest.fn().mockReturnValue('{"name": "test"}')
    };
    
    // 测试键的悬停信息
    const keyHover = provider.provideHover(mockModel, { lineNumber: 1, column: 5 });
    expect(keyHover).toBeDefined();
    expect(keyHover.contents).toBeDefined();
    expect(keyHover.contents.length).toBeGreaterThan(0);
    
    // 测试值的悬停信息
    const valueHover = provider.provideHover(mockModel, { lineNumber: 1, column: 15 });
    expect(valueHover).toBeDefined();
    expect(valueHover.contents).toBeDefined();
    expect(valueHover.contents.length).toBeGreaterThan(0);
  });
});