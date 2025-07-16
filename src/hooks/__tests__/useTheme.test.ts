import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useTheme from '../useTheme';

// Mock StorageService
vi.mock('../../services/storageService', () => {
  const mockGetTheme = vi.fn();
  const mockSaveTheme = vi.fn();
  
  return {
    StorageService: {
      getTheme: mockGetTheme,
      saveTheme: mockSaveTheme,
    },
    mockGetTheme,
    mockSaveTheme,
  };
});

// Mock document
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
};

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList,
  },
  writable: true,
});

describe('useTheme', () => {
  let mockGetTheme: any;
  let mockSaveTheme: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mocks = await import('../../services/storageService');
    mockGetTheme = (mocks as any).mockGetTheme;
    mockSaveTheme = (mocks as any).mockSaveTheme;
    mockGetTheme.mockReturnValue('light');
  });

  afterEach(() => {
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(mockGetTheme).toHaveBeenCalled();
    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
  });

  it('should initialize with saved dark theme', () => {
    mockGetTheme.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(mockSaveTheme).toHaveBeenCalledWith('dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme from dark to light', () => {
    mockGetTheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(mockSaveTheme).toHaveBeenCalledWith('light');
    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
  });

  it('should set theme to dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(mockSaveTheme).toHaveBeenCalledWith('dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should set theme to light', () => {
    mockGetTheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(mockSaveTheme).toHaveBeenCalledWith('light');
    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
  });

  it('should maintain function stability across re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());

    const initialToggleTheme = result.current.toggleTheme;
    const initialSetTheme = result.current.setTheme;

    rerender();

    expect(result.current.toggleTheme).toBe(initialToggleTheme);
    expect(result.current.setTheme).toBe(initialSetTheme);
  });

  it('should handle multiple theme changes correctly', () => {
    const { result } = renderHook(() => useTheme());

    // Start with light
    expect(result.current.theme).toBe('light');

    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    // Set to light
    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');

    // Toggle to dark again
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    expect(mockSaveTheme).toHaveBeenCalledTimes(3);
  });
});