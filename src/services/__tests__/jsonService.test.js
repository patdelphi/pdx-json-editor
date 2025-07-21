// 这是一个简单的测试文件，用于验证JSON服务的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { formatJson, compressJson, tryFixJson, getJsonSummary } from '../jsonService';

describe('jsonService', () => {
  describe('formatJson', () => {
    it('should format valid JSON with default indent', () => {
      const unformatted = '{"name":"test","value":123}';
      const expected = '{\n  "name": "test",\n  "value": 123\n}';
      expect(formatJson(unformatted)).toBe(expected);
    });
    
    it('should format valid JSON with custom indent', () => {
      const unformatted = '{"name":"test","value":123}';
      const expected = '{\n    "name": "test",\n    "value": 123\n}';
      expect(formatJson(unformatted, 4)).toBe(expected);
    });
    
    it('should throw error for invalid JSON', () => {
      const invalid = '{"name":"test",value:123}';
      expect(() => formatJson(invalid)).toThrow();
    });
    
    it('should return empty string for empty input', () => {
      expect(formatJson('')).toBe('');
    });
  });
  
  describe('compressJson', () => {
    it('should compress valid JSON', () => {
      const formatted = '{\n  "name": "test",\n  "value": 123\n}';
      const expected = '{"name":"test","value":123}';
      expect(compressJson(formatted)).toBe(expected);
    });
    
    it('should throw error for invalid JSON', () => {
      const invalid = '{"name":"test",value:123}';
      expect(() => compressJson(invalid)).toThrow();
    });
    
    it('should return empty string for empty input', () => {
      expect(compressJson('')).toBe('');
    });
  });
  
  describe('tryFixJson', () => {
    it('should fix missing quotes around keys', () => {
      const invalid = '{name:"test"}';
      const expected = '{"name":"test"}';
      expect(tryFixJson(invalid)).toBe(expected);
    });
    
    it('should fix single quotes', () => {
      const invalid = '{"name":\'test\'}';
      const expected = '{"name":"test"}';
      expect(tryFixJson(invalid)).toBe(expected);
    });
    
    it('should fix trailing commas', () => {
      const invalid = '{"name":"test",}';
      const expected = '{"name":"test"}';
      expect(tryFixJson(invalid)).toBe(expected);
    });
    
    it('should return original string if fix fails', () => {
      const invalid = '{name:test]}'; // 复杂错误，无法简单修复
      expect(tryFixJson(invalid)).toBe(invalid);
    });
  });
  
  describe('getJsonSummary', () => {
    it('should return summary for valid JSON', () => {
      const json = '{"name":"test","items":[1,2,3],"nested":{"key":"value"}}';
      const summary = getJsonSummary(json);
      
      expect(summary.valid).toBe(true);
      expect(summary.keyCount).toBeGreaterThan(0);
      expect(summary.depth).toBeGreaterThan(0);
      expect(summary.arrayCount).toBeGreaterThan(0);
      expect(summary.objectCount).toBeGreaterThan(0);
    });
    
    it('should return invalid summary for invalid JSON', () => {
      const invalid = '{name:test}';
      const summary = getJsonSummary(invalid);
      
      expect(summary.valid).toBe(false);
      expect(summary.keyCount).toBe(0);
    });
  });
});