import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useJsonValidation from '../useJsonValidation';

// Mock ValidationService
vi.mock('../../services/validationService', () => {
  const mockValidateJson = vi.fn();
  const mockGetErrorSummary = vi.fn();

  return {
    ValidationService: {
      validateJson: mockValidateJson,
      getErrorSummary: mockGetErrorSummary,
    },
    mockValidateJson,
    mockGetErrorSummary,
  };
});

// Mock debounce helper
vi.mock('../../utils/helpers', () => ({
  debounce: vi.fn((fn) => fn), // Return function immediately for testing
}));

// Mock constants
vi.mock('../../utils/constants', () => ({
  VALIDATION_SETTINGS: {
    DEBOUNCE_DELAY: 300,
  },
}));

describe('useJsonValidation', () => {
  let mockValidateJson: any;
  let mockGetErrorSummary: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mocks = await import('../../services/validationService');
    mockValidateJson = (mocks as any).mockValidateJson;
    mockGetErrorSummary = (mocks as any).mockGetErrorSummary;
    mockValidateJson.mockReturnValue([]);
    mockGetErrorSummary.mockReturnValue('Valid JSON');
  });

  it('should initialize with empty errors for empty content', () => {
    const { result } = renderHook(() => useJsonValidation(''));

    expect(result.current.errors).toEqual([]);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should validate content on initialization', async () => {
    const content = '{"test": "value"}';
    mockValidateJson.mockReturnValue([]);

    const { result } = renderHook(() => useJsonValidation(content));

    await waitFor(() => {
      expect(mockValidateJson).toHaveBeenCalledWith(content);
    });

    expect(result.current.errors).toEqual([]);
    expect(result.current.isValid).toBe(true);
  });

  it('should handle validation errors', async () => {
    const content = 'invalid json';
    const errors = [
      {
        line: 1,
        column: 1,
        message: 'Unexpected token',
        severity: 'error' as const,
      },
    ];

    mockValidateJson.mockReturnValue(errors);

    const { result } = renderHook(() => useJsonValidation(content));

    await waitFor(() => {
      expect(result.current.errors).toEqual(errors);
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.isValidating).toBe(false);
  });

  it('should update validation when content changes', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useJsonValidation(content),
      {
        initialProps: { content: '{"valid": "json"}' },
      }
    );

    // Initial validation
    await waitFor(() => {
      expect(mockValidateJson).toHaveBeenCalledWith('{"valid": "json"}');
    });

    // Change to invalid content
    const errors = [
      {
        line: 1,
        column: 1,
        message: 'Syntax error',
        severity: 'error' as const,
      },
    ];
    mockValidateJson.mockReturnValue(errors);

    rerender({ content: 'invalid json' });

    await waitFor(() => {
      expect(mockValidateJson).toHaveBeenCalledWith('invalid json');
      expect(result.current.errors).toEqual(errors);
      expect(result.current.isValid).toBe(false);
    });
  });

  it('should not validate empty or whitespace-only content', () => {
    const { result } = renderHook(() => useJsonValidation('   '));

    expect(result.current.errors).toEqual([]);
    expect(result.current.isValid).toBe(true);
    expect(mockValidateJson).not.toHaveBeenCalled();
  });

  it('should validate manually', () => {
    const content = '{"test": "value"}';
    const { result } = renderHook(() => useJsonValidation(content));

    mockValidateJson.mockReturnValue([]);

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(mockValidateJson).toHaveBeenCalledWith(content);
    expect(isValid!).toBe(true);
  });

  it('should return false for manual validation with errors', async () => {
    const content = 'invalid json';
    const errors = [
      {
        line: 1,
        column: 1,
        message: 'Syntax error',
        severity: 'error' as const,
      },
    ];

    // Set up mock to return errors for this content
    mockValidateJson.mockReturnValue(errors);

    const { result } = renderHook(() => useJsonValidation(content));

    // Wait for initial validation to complete
    await waitFor(() => {
      expect(result.current.errors).toEqual(errors);
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
  });

  it('should get error summary', () => {
    const content = '{"test": "value"}';
    const summary = 'Valid JSON';
    mockGetErrorSummary.mockReturnValue(summary);

    const { result } = renderHook(() => useJsonValidation(content));

    const errorSummary = result.current.getErrorSummary();

    expect(mockGetErrorSummary).toHaveBeenCalledWith(result.current.errors);
    expect(errorSummary).toBe(summary);
  });

  it('should get error summary with errors', () => {
    const content = 'invalid json';
    const errors = [
      {
        line: 1,
        column: 1,
        message: 'Syntax error',
        severity: 'error' as const,
      },
    ];
    const summary = '1 error';

    mockValidateJson.mockReturnValue(errors);
    mockGetErrorSummary.mockReturnValue(summary);

    const { result } = renderHook(() => useJsonValidation(content));

    const errorSummary = result.current.getErrorSummary();

    expect(mockGetErrorSummary).toHaveBeenCalledWith(errors);
    expect(errorSummary).toBe(summary);
  });

  it('should handle validation state correctly', async () => {
    const content = '{"test": "value"}';

    // Mock validation to be synchronous but check the state
    mockValidateJson.mockReturnValue([]);

    const { result } = renderHook(() => useJsonValidation(content));

    // Since debounce is mocked to be immediate, validation should complete quickly
    await waitFor(() => {
      expect(result.current.isValidating).toBe(false);
    });

    expect(result.current.errors).toEqual([]);
    expect(result.current.isValid).toBe(true);
  });

  it('should maintain function stability across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useJsonValidation('{"test": "value"}')
    );

    const initialValidate = result.current.validate;
    const initialGetErrorSummary = result.current.getErrorSummary;

    rerender();

    expect(result.current.validate).toBe(initialValidate);
    expect(result.current.getErrorSummary).toBe(initialGetErrorSummary);
  });
});
