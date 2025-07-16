import { describe, it, expect } from 'vitest';
import { SearchService } from '../searchService';

describe('SearchService', () => {
  const sampleContent = `{
  "name": "test",
  "value": 123,
  "items": ["test", "example", "test"]
}`;

  describe('search', () => {
    it('should find simple text matches', () => {
      const results = SearchService.search(sampleContent, 'test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        line: 2,
        column: 12,
        length: 4,
        text: 'test'
      });
    });

    it('should respect case sensitivity', () => {
      const results = SearchService.search(sampleContent, 'TEST', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(0);

      const caseInsensitiveResults = SearchService.search(sampleContent, 'TEST', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(caseInsensitiveResults).toHaveLength(3);
    });

    it('should match whole words only', () => {
      const content = 'test testing tested';
      
      const results = SearchService.search(content, 'test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: true
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        line: 1,
        column: 1,
        length: 4,
        text: 'test'
      });
    });

    it('should support regex patterns', () => {
      const results = SearchService.search(sampleContent, '\\d+', {
        caseSensitive: false,
        useRegex: true,
        wholeWord: false
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        line: 3,
        column: 12,
        length: 3,
        text: '123'
      });
    });

    it('should handle invalid regex gracefully', () => {
      const results = SearchService.search(sampleContent, '[invalid', {
        caseSensitive: false,
        useRegex: true,
        wholeWord: false
      });

      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty query', () => {
      const results = SearchService.search(sampleContent, '', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty content', () => {
      const results = SearchService.search('', 'test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(0);
    });

    it('should handle multiline content correctly', () => {
      const multilineContent = 'line1\ntest\nline3\ntest';
      const results = SearchService.search(multilineContent, 'test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(2);
      expect(results[0].line).toBe(2);
      expect(results[1].line).toBe(4);
    });
  });

  describe('replace', () => {
    it('should replace single occurrence', () => {
      const result = SearchService.replace(sampleContent, 'test', 'replacement', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      }, false);

      expect(result.replacements).toBe(1);
      expect(result.content).toContain('replacement');
      expect(result.content.split('replacement')).toHaveLength(2); // Only one replacement
    });

    it('should replace all occurrences', () => {
      const result = SearchService.replace(sampleContent, 'test', 'replacement', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      }, true);

      expect(result.replacements).toBe(3);
      expect(result.content.split('replacement')).toHaveLength(4); // Three replacements
    });

    it('should respect case sensitivity in replacement', () => {
      const result = SearchService.replace(sampleContent, 'TEST', 'replacement', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: false
      }, true);

      expect(result.replacements).toBe(0);
      expect(result.content).toBe(sampleContent);
    });

    it('should support regex replacement', () => {
      const result = SearchService.replace(sampleContent, '\\d+', 'NUMBER', {
        caseSensitive: false,
        useRegex: true,
        wholeWord: false
      }, true);

      expect(result.replacements).toBe(1);
      expect(result.content).toContain('NUMBER');
    });

    it('should handle empty query', () => {
      const result = SearchService.replace(sampleContent, '', 'replacement', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      }, true);

      expect(result.replacements).toBe(0);
      expect(result.content).toBe(sampleContent);
    });

    it('should handle invalid regex in replacement', () => {
      const result = SearchService.replace(sampleContent, '[invalid', 'replacement', {
        caseSensitive: false,
        useRegex: true,
        wholeWord: false
      }, true);

      expect(result.replacements).toBe(0);
      expect(result.content).toBe(sampleContent);
    });
  });

  describe('replaceAt', () => {
    it('should replace text at specific position', () => {
      const content = 'Hello world';
      const result = SearchService.replaceAt(content, 1, 7, 5, 'universe');

      expect(result).toBe('Hello universe');
    });

    it('should handle invalid line numbers', () => {
      const content = 'Hello world';
      const result = SearchService.replaceAt(content, 5, 1, 5, 'replacement');

      expect(result).toBe(content);
    });

    it('should handle invalid column numbers', () => {
      const content = 'Hello world';
      const result = SearchService.replaceAt(content, 1, 50, 5, 'replacement');

      expect(result).toBe(content);
    });

    it('should handle multiline content', () => {
      const content = 'line1\nline2\nline3';
      const result = SearchService.replaceAt(content, 2, 1, 5, 'replaced');

      expect(result).toBe('line1\nreplaced\nline3');
    });
  });

  describe('utility methods', () => {
    it('should validate regex patterns', () => {
      expect(SearchService.isValidRegex('\\d+')).toBe(true);
      expect(SearchService.isValidRegex('[a-z]')).toBe(true);
      expect(SearchService.isValidRegex('[invalid')).toBe(false);
      expect(SearchService.isValidRegex('*')).toBe(false);
    });

    it('should escape regex characters', () => {
      const escaped = SearchService.escapeRegex('test.+*?[]{}()^$|\\');
      expect(escaped).toBe('test\\.\\+\\*\\?\\[\\]\\{\\}\\(\\)\\^\\$\\|\\\\');
    });

    it('should convert index to line/column', () => {
      const content = 'line1\nline2\nline3';
      const result = SearchService.getLineColumnFromIndex(content, 8);

      expect(result).toEqual({ line: 2, column: 3 });
    });

    it('should convert line/column to index', () => {
      const content = 'line1\nline2\nline3';
      const result = SearchService.getIndexFromLineColumn(content, 2, 2);

      expect(result).toBe(7);
    });

    it('should handle invalid line/column in conversion', () => {
      const content = 'line1\nline2\nline3';
      const result = SearchService.getIndexFromLineColumn(content, 10, 1);

      expect(result).toBe(-1);
    });
  });

  describe('edge cases', () => {
    it('should handle zero-length matches in regex', () => {
      const content = 'abc';
      const results = SearchService.search(content, '(?=a)', {
        caseSensitive: false,
        useRegex: true,
        wholeWord: false
      });

      // Should not cause infinite loop
      expect(results).toBeDefined();
    });

    it('should handle special characters in non-regex mode', () => {
      const content = 'test.+*?[]{}()^$|\\';
      const results = SearchService.search(content, '.+*', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(1);
    });

    it('should handle empty lines', () => {
      const content = 'line1\n\nline3';
      const results = SearchService.search(content, 'line', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
      });

      expect(results).toHaveLength(2);
      expect(results[0].line).toBe(1);
      expect(results[1].line).toBe(3);
    });
  });
});