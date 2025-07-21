// 这是一个简单的测试文件，用于验证验证服务的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { validateJson, parseJsonError, positionToLineColumn } from '../validationService';

describe('validationService', () => {
  describe('validateJson', () => {
    it('should return empty array for valid JSON', () => {
      const validJson = '{"name": "test", "value": 123}';
      const errors = validateJson(validJson);
      expect(errors).toEqual([]);
    });
    
    it('should return error for invalid JSON', () => {
      const invalidJson = '{"name": "test", value: 123}';
      const errors = validateJson(invalidJson);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toHaveProperty('line');
      expect(errors[0]).toHaveProperty('column');
      expect(errors[0]).toHaveProperty('message');
      expect(errors[0]).toHaveProperty('severity', 'error');
    });
    
    it('should return empty array for empty string', () => {
      const errors = validateJson('');
      expect(errors).toEqual([]);
    });
  });
  
  describe('parseJsonError', () => {
    it('should extract position from error message', () => {
      const error = new SyntaxError('Unexpected token o in JSON at position 15');
      const jsonString = '{"name": "test" o}';
      const errors = parseJsonError(error, jsonString);
      
      expect(errors.length).toBe(1);
      expect(errors[0].line).toBeDefined();
      expect(errors[0].column).toBeDefined();
      expect(errors[0].message).toBeDefined();
      expect(errors[0].severity).toBe('error');
    });
  });
  
  describe('positionToLineColumn', () => {
    it('should convert position to line and column', () => {
      const text = 'line1\nline2\nline3';
      const position = 7; // 'i' in 'line2'
      const { line, column } = positionToLineColumn(position, text);
      
      expect(line).toBe(2);
      expect(column).toBe(2);
    });
  });
});