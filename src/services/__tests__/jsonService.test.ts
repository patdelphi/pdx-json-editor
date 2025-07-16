import { describe, it, expect } from 'vitest';
import { JsonService } from '../jsonService';

describe('JsonService', () => {
  describe('parse', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"name": "test", "value": 42}';
      const result = JsonService.parse(jsonString);

      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('should parse array JSON', () => {
      const jsonString = '[1, 2, 3, "test"]';
      const result = JsonService.parse(jsonString);

      expect(result).toEqual([1, 2, 3, 'test']);
    });

    it('should parse primitive values', () => {
      expect(JsonService.parse('42')).toBe(42);
      expect(JsonService.parse('"hello"')).toBe('hello');
      expect(JsonService.parse('true')).toBe(true);
      expect(JsonService.parse('null')).toBe(null);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{"name": "test", "value":}';

      expect(() => JsonService.parse(invalidJson)).toThrow('JSON Parse Error:');
    });

    it('should throw error for malformed JSON', () => {
      const malformedJson = '{name: test}';

      expect(() => JsonService.parse(malformedJson)).toThrow('JSON Parse Error:');
    });
  });

  describe('stringify', () => {
    it('should stringify object with default indentation', () => {
      const obj = { name: 'test', value: 42 };
      const result = JsonService.stringify(obj);

      expect(result).toBe('{\n  "name": "test",\n  "value": 42\n}');
    });

    it('should stringify object with custom indentation', () => {
      const obj = { name: 'test', value: 42 };
      const result = JsonService.stringify(obj, 4);

      expect(result).toBe('{\n    "name": "test",\n    "value": 42\n}');
    });

    it('should stringify array', () => {
      const arr = [1, 2, 3, 'test'];
      const result = JsonService.stringify(arr);

      expect(result).toBe('[\n  1,\n  2,\n  3,\n  "test"\n]');
    });

    it('should stringify primitive values', () => {
      expect(JsonService.stringify(42)).toBe('42');
      expect(JsonService.stringify('hello')).toBe('"hello"');
      expect(JsonService.stringify(true)).toBe('true');
      expect(JsonService.stringify(null)).toBe('null');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          age: 30,
          hobbies: ['reading', 'coding']
        }
      };
      const result = JsonService.stringify(obj);

      expect(result).toContain('"user"');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"hobbies"');
    });

    it('should throw error for circular references', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference

      expect(() => JsonService.stringify(obj)).toThrow('JSON Stringify Error:');
    });
  });

  describe('validate', () => {
    it('should return empty array for valid JSON', () => {
      const validJson = '{"name": "test", "value": 42}';
      const result = JsonService.validate(validJson);

      expect(result).toEqual([]);
    });

    it('should return error for invalid JSON', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = JsonService.validate(invalidJson);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        line: 1,
        column: 1,
        severity: 'error'
      });
      expect(result[0].message).toContain('Unexpected token');
    });

    it('should return error for malformed JSON', () => {
      const malformedJson = '{name: test}';
      const result = JsonService.validate(malformedJson);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should validate array JSON', () => {
      const validArray = '[1, 2, 3, "test"]';
      const result = JsonService.validate(validArray);

      expect(result).toEqual([]);
    });

    it('should validate primitive JSON values', () => {
      expect(JsonService.validate('42')).toEqual([]);
      expect(JsonService.validate('"hello"')).toEqual([]);
      expect(JsonService.validate('true')).toEqual([]);
      expect(JsonService.validate('null')).toEqual([]);
    });
  });

  describe('format', () => {
    it('should format valid JSON with default indentation', () => {
      const compactJson = '{"name":"test","value":42}';
      const result = JsonService.format(compactJson);

      expect(result).toBe('{\n  "name": "test",\n  "value": 42\n}');
    });

    it('should format valid JSON with custom indentation', () => {
      const compactJson = '{"name":"test","value":42}';
      const result = JsonService.format(compactJson, 4);

      expect(result).toBe('{\n    "name": "test",\n    "value": 42\n}');
    });

    it('should format array JSON', () => {
      const compactArray = '[1,2,3,"test"]';
      const result = JsonService.format(compactArray);

      expect(result).toBe('[\n  1,\n  2,\n  3,\n  "test"\n]');
    });

    it('should format nested objects', () => {
      const compactNested = '{"user":{"name":"John","age":30}}';
      const result = JsonService.format(compactNested);

      expect(result).toContain('{\n  "user": {\n    "name": "John",\n    "age": 30\n  }\n}');
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{"name": "test", "value":}';

      expect(() => JsonService.format(invalidJson)).toThrow('JSON Parse Error:');
    });

    it('should handle already formatted JSON', () => {
      const formattedJson = '{\n  "name": "test",\n  "value": 42\n}';
      const result = JsonService.format(formattedJson);

      expect(result).toBe('{\n  "name": "test",\n  "value": 42\n}');
    });
  });

  describe('minify', () => {
    it('should minify formatted JSON', () => {
      const formattedJson = '{\n  "name": "test",\n  "value": 42\n}';
      const result = JsonService.minify(formattedJson);

      expect(result).toBe('{"name":"test","value":42}');
    });

    it('should minify array JSON', () => {
      const formattedArray = '[\n  1,\n  2,\n  3,\n  "test"\n]';
      const result = JsonService.minify(formattedArray);

      expect(result).toBe('[1,2,3,"test"]');
    });

    it('should minify nested objects', () => {
      const formattedNested = '{\n  "user": {\n    "name": "John",\n    "age": 30\n  }\n}';
      const result = JsonService.minify(formattedNested);

      expect(result).toBe('{"user":{"name":"John","age":30}}');
    });

    it('should handle already minified JSON', () => {
      const minifiedJson = '{"name":"test","value":42}';
      const result = JsonService.minify(minifiedJson);

      expect(result).toBe('{"name":"test","value":42}');
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{"name": "test", "value":}';

      expect(() => JsonService.minify(invalidJson)).toThrow('JSON Parse Error:');
    });

    it('should minify primitive values', () => {
      expect(JsonService.minify('42')).toBe('42');
      expect(JsonService.minify('"hello"')).toBe('"hello"');
      expect(JsonService.minify('true')).toBe('true');
      expect(JsonService.minify('null')).toBe('null');
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const emptyObj = '{}';
      expect(JsonService.parse(emptyObj)).toEqual({});
      expect(JsonService.format(emptyObj)).toBe('{}');
      expect(JsonService.minify(emptyObj)).toBe('{}');
      expect(JsonService.validate(emptyObj)).toEqual([]);
    });

    it('should handle empty array', () => {
      const emptyArray = '[]';
      expect(JsonService.parse(emptyArray)).toEqual([]);
      expect(JsonService.format(emptyArray)).toBe('[]');
      expect(JsonService.minify(emptyArray)).toBe('[]');
      expect(JsonService.validate(emptyArray)).toEqual([]);
    });

    it('should handle special characters in strings', () => {
      const specialChars = '{"text": "Hello\\nWorld\\t\\"Test\\""}';
      const parsed = JsonService.parse(specialChars);
      expect(parsed.text).toBe('Hello\nWorld\t"Test"');
    });

    it('should handle unicode characters', () => {
      const unicode = '{"emoji": "🚀", "chinese": "测试"}';
      const parsed = JsonService.parse(unicode);
      expect(parsed.emoji).toBe('🚀');
      expect(parsed.chinese).toBe('测试');
    });

    it('should handle large numbers', () => {
      const largeNumber = '{"big": 9007199254740991}';
      const parsed = JsonService.parse(largeNumber);
      expect(parsed.big).toBe(9007199254740991);
    });

    it('should handle floating point numbers', () => {
      const floats = '{"pi": 3.14159, "e": 2.71828}';
      const parsed = JsonService.parse(floats);
      expect(parsed.pi).toBe(3.14159);
      expect(parsed.e).toBe(2.71828);
    });
  });
});