import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useJsonEditor from '../useJsonEditor';

// Mock services
vi.mock('../../services/jsonService', () => ({
  JsonService: {
    format: vi.fn((content: string) => {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    }),
    minify: vi.fn((content: string) => {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed);
    }),
  },
}));

vi.mock('../../services/validationService', () => ({
  ValidationService: {
    validateJson: vi.fn((content: string) => {
      try {
        JSON.parse(content);
        return [];
      } catch (error) {
        return [
          {
            line: 1,
            column: 1,
            message: (error as Error).message,
            severity: 'error',
          },
        ];
      }
    }),
  },
}));

describe('useJsonEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useJsonEditor());

    expect(result.current.content).toBe('');
    expect(result.current.errors).toEqual([]);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should initialize with provided content', () => {
    const initialContent = '{"test": "value"}';
    const { result } = renderHook(() => useJsonEditor(initialContent));

    expect(result.current.content).toBe(initialContent);
  });

  it('should update content and set dirty flag', () => {
    const { result } = renderHook(() => useJsonEditor());

    act(() => {
      result.current.updateContent('{"new": "content"}');
    });

    expect(result.current.content).toBe('{"new": "content"}');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isValid).toBe(true);
  });

  it('should validate content on update', () => {
    const { result } = renderHook(() => useJsonEditor());

    act(() => {
      result.current.updateContent('invalid json');
    });

    expect(result.current.content).toBe('invalid json');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].severity).toBe('error');
  });

  it('should format JSON content', () => {
    const { result } = renderHook(() => useJsonEditor('{"test":"value"}'));

    act(() => {
      result.current.formatJson();
    });

    expect(result.current.content).toBe('{\n  "test": "value"\n}');
    expect(result.current.isDirty).toBe(true);
  });

  it('should handle format errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mocks = await import('../../services/jsonService');
    const JsonService = (mocks as any).JsonService;
    JsonService.format.mockImplementation(() => {
      throw new Error('Format error');
    });

    const { result } = renderHook(() => useJsonEditor('invalid'));

    act(() => {
      result.current.formatJson();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Format error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should minify JSON content', () => {
    const { result } = renderHook(() => useJsonEditor('{\n  "test": "value"\n}'));

    act(() => {
      result.current.minifyJson();
    });

    expect(result.current.content).toBe('{"test":"value"}');
    expect(result.current.isDirty).toBe(true);
  });

  it('should handle minify errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mocks = await import('../../services/jsonService');
    const JsonService = (mocks as any).JsonService;
    JsonService.minify.mockImplementation(() => {
      throw new Error('Minify error');
    });

    const { result } = renderHook(() => useJsonEditor('invalid'));

    act(() => {
      result.current.minifyJson();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Minify error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should validate JSON content', () => {
    const { result } = renderHook(() => useJsonEditor('{"valid": "json"}'));

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateJson();
    });

    expect(isValid!).toBe(true);
    expect(result.current.errors).toEqual([]);
  });

  it('should return false for invalid JSON validation', () => {
    const { result } = renderHook(() => useJsonEditor('invalid json'));

    let isValid: boolean;
    act(() => {
      isValid = result.current.validateJson();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors).toHaveLength(1);
  });

  it('should reset dirty flag', () => {
    const { result } = renderHook(() => useJsonEditor());

    act(() => {
      result.current.updateContent('{"test": "value"}');
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.resetDirty();
    });

    expect(result.current.isDirty).toBe(false);
  });

  it('should maintain content stability across re-renders', () => {
    const { result, rerender } = renderHook(() => useJsonEditor('{"initial": "content"}'));

    const initialUpdateContent = result.current.updateContent;
    const initialFormatJson = result.current.formatJson;

    rerender();

    expect(result.current.updateContent).toBe(initialUpdateContent);
    expect(result.current.formatJson).toBe(initialFormatJson);
  });
});