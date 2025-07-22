// 这是一个简单的测试文件，用于验证Monaco服务的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { configureJsonLanguage, getEditorOptions } from '../monacoService';

// 模拟monaco-editor
jest.mock('monaco-editor');

describe('monacoService', () => {
  describe('configureJsonLanguage', () => {
    it('should configure JSON language support', () => {
      // 创建模拟Monaco对象
      const mockMonaco = {
        languages: {
          json: {
            jsonDefaults: {
              setDiagnosticsOptions: jest.fn()
            }
          },
          registerDocumentFormattingEditProvider: jest.fn()
        }
      };
      
      // 调用配置函数
      configureJsonLanguage(mockMonaco);
      
      // 验证是否调用了setDiagnosticsOptions
      expect(mockMonaco.languages.json.jsonDefaults.setDiagnosticsOptions).toHaveBeenCalledWith({
        validate: true,
        allowComments: false,
        schemas: [],
        enableSchemaRequest: true,
        schemaRequest: 'warning'
      });
      
      // 验证是否注册了格式化提供程序
      expect(mockMonaco.languages.registerDocumentFormattingEditProvider).toHaveBeenCalledWith(
        'json',
        expect.any(Object)
      );
    });
  });
  
  describe('getEditorOptions', () => {
    it('should return light theme options when darkMode is false', () => {
      const options = getEditorOptions(false);
      expect(options.theme).toBe('vs-light');
    });
    
    it('should return dark theme options when darkMode is true', () => {
      const options = getEditorOptions(true);
      expect(options.theme).toBe('vs-dark');
    });
    
    it('should include all required editor options', () => {
      const options = getEditorOptions();
      expect(options).toHaveProperty('folding');
      expect(options).toHaveProperty('minimap');
      expect(options).toHaveProperty('automaticLayout');
      expect(options).toHaveProperty('tabSize', 2);
    });
  });
});