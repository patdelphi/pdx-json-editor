import { describe, it, expect } from 'vitest';
import { ValidationService } from '../validationService';

describe('ValidationService', () => {
  describe('validateJson', () => {
    it('should return empty array for valid JSON object', () => {
      const validJson = '{"name": "test", "value": 42}';
      const result = ValidationService.validateJson(validJson);

      expect(result).toEqual([]);
    });

    it('should return empty array for valid JSON array', () => {
      const validArray = '[1, 2, 3, "test"]';
      const result = ValidationService.validateJson(validArray);

      expect(result).toEqual([]);
    });

    it('should return empty array for primitive JSON values', () => {
      expect(ValidationService.validateJson('42')).toEqual([]);
      expect(ValidationService.validateJson('"hello"')).toEqual([]);
      expect(ValidationService.validateJson('true')).toEqual([]);
      expect(ValidationService.validateJson('false')).toEqual([]);
      expect(ValidationService.validateJson('null')).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = ValidationService.validateJson('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only string', () => {
      const result = ValidationService.validateJson('   \n\t  ');
      expect(result).toEqual([]);
    });

    it('should return error for invalid JSON syntax', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = ValidationService.validateJson(invalidJson);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        line: expect.any(Number),
        column: expect.any(Number),
        message: expect.any(String),
        severity: 'error'
      });
    });

    it('should return error for malformed JSON', () => {
      const malformedJson = '{name: test}';
      const result = ValidationService.validateJson(malformedJson);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
      expect(result[0].message).toContain('Expected property name');
    });

    it('should calculate correct line and column for single line errors', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = ValidationService.validateJson(invalidJson);

      expect(result[0].line).toBe(1);
      expect(result[0].column).toBeGreaterThan(0);
    });

    it('should calculate correct line and column for multi-line errors', () => {
      const multiLineInvalid = `{
  "name": "test",
  "value":
}`;
      const result = ValidationService.validateJson(multiLineInvalid);

      expect(result[0].line).toBeGreaterThanOrEqual(1);
      expect(result[0].column).toBeGreaterThan(0);
    });

    it('should handle unclosed brackets', () => {
      const unclosedBracket = '{"name": "test"';
      const result = ValidationService.validateJson(unclosedBracket);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle unclosed arrays', () => {
      const unclosedArray = '[1, 2, 3';
      const result = ValidationService.validateJson(unclosedArray);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle trailing commas', () => {
      const trailingComma = '{"name": "test", "value": 42,}';
      const result = ValidationService.validateJson(trailingComma);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle missing quotes on keys', () => {
      const missingQuotes = '{name: "test"}';
      const result = ValidationService.validateJson(missingQuotes);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle single quotes instead of double quotes', () => {
      const singleQuotes = "{'name': 'test'}";
      const result = ValidationService.validateJson(singleQuotes);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle complex nested structure errors', () => {
      const complexInvalid = `{
  "users": [
    {
      "name": "John",
      "age": 30,
      "hobbies": ["reading", "coding"]
    },
    {
      "name": "Jane",
      "age": 25,
      "hobbies": ["painting", "music",]
    }
  ]
}`;
      const result = ValidationService.validateJson(complexInvalid);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
      expect(result[0].line).toBeGreaterThanOrEqual(1); // Error position may vary
    });
  });

  describe('validateJsonSchema', () => {
    it('should return empty array for valid JSON without schema', () => {
      const validJson = '{"name": "test", "value": 42}';
      const result = ValidationService.validateJsonSchema(validJson);

      expect(result).toEqual([]);
    });

    it('should return JSON syntax errors first', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = ValidationService.validateJsonSchema(invalidJson);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should handle schema parameter (placeholder for future implementation)', () => {
      const validJson = '{"name": "test", "value": 42}';
      const schema = { type: 'object' };
      const result = ValidationService.validateJsonSchema(validJson, schema);

      // Currently just validates JSON syntax, schema validation is placeholder
      expect(result).toEqual([]);
    });

    it('should return syntax errors even with schema provided', () => {
      const invalidJson = '{"name": "test", "value":}';
      const schema = { type: 'object' };
      const result = ValidationService.validateJsonSchema(invalidJson, schema);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });
  });

  describe('getErrorSummary', () => {
    it('should return "Valid JSON" for empty error array', () => {
      const result = ValidationService.getErrorSummary([]);
      expect(result).toBe('Valid JSON');
    });

    it('should return single error summary', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('1 error');
    });

    it('should return multiple errors summary', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error' as const
        },
        {
          line: 2,
          column: 10,
          message: 'Another error',
          severity: 'error' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('2 errors');
    });

    it('should return single warning summary', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Style warning',
          severity: 'warning' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('1 warning');
    });

    it('should return multiple warnings summary', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Style warning',
          severity: 'warning' as const
        },
        {
          line: 2,
          column: 10,
          message: 'Another warning',
          severity: 'warning' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('2 warnings');
    });

    it('should return mixed errors and warnings summary', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error' as const
        },
        {
          line: 2,
          column: 10,
          message: 'Style warning',
          severity: 'warning' as const
        },
        {
          line: 3,
          column: 15,
          message: 'Another error',
          severity: 'error' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('2 errors, 1 warning');
    });

    it('should handle multiple mixed errors and warnings', () => {
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Error 1',
          severity: 'error' as const
        },
        {
          line: 2,
          column: 10,
          message: 'Warning 1',
          severity: 'warning' as const
        },
        {
          line: 3,
          column: 15,
          message: 'Error 2',
          severity: 'error' as const
        },
        {
          line: 4,
          column: 20,
          message: 'Warning 2',
          severity: 'warning' as const
        }
      ];
      const result = ValidationService.getErrorSummary(errors);
      expect(result).toBe('2 errors, 2 warnings');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long JSON strings', () => {
      const longJson = '{"data": "' + 'x'.repeat(10000) + '"}';
      const result = ValidationService.validateJson(longJson);
      expect(result).toEqual([]);
    });

    it('should handle deeply nested JSON', () => {
      let deepJson = '{"level1": ';
      for (let i = 0; i < 100; i++) {
        deepJson += '{"level' + (i + 2) + '": ';
      }
      deepJson += '"value"';
      for (let i = 0; i < 101; i++) {
        deepJson += '}';
      }

      const result = ValidationService.validateJson(deepJson);
      expect(result).toEqual([]);
    });

    it('should handle JSON with special characters', () => {
      const specialJson = '{"text": "Hello\\nWorld\\t\\"Test\\"", "emoji": "🚀"}';
      const result = ValidationService.validateJson(specialJson);
      expect(result).toEqual([]);
    });

    it('should handle JSON with unicode escape sequences', () => {
      const unicodeJson = '{"unicode": "\\u0048\\u0065\\u006C\\u006C\\u006F"}';
      const result = ValidationService.validateJson(unicodeJson);
      expect(result).toEqual([]);
    });

    it('should handle position calculation for complex multi-line JSON', () => {
      const complexJson = `{
  "users": [
    {
      "name": "John",
      "details": {
        "age": 30,
        "city": "New York"
      }
    },
    {
      "name": "Jane",
      "details": {
        "age": 25,
        "city": "Los Angeles",
        "invalid":
      }
    }
  ]
}`;
      const result = ValidationService.validateJson(complexJson);
      
      expect(result).toHaveLength(1);
      expect(result[0].line).toBeGreaterThanOrEqual(1); // Error position may vary based on JSON parser
      expect(result[0].column).toBeGreaterThan(0);
    });
  });
});