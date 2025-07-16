import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { StorageService } from '../../services/storageService';

// Mock StorageService
vi.mock('../../services/storageService', () => ({
  StorageService: {
    getTheme: vi.fn(),
    saveTheme: vi.fn(),
  }
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Test component that uses the theme context
const TestComponent: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={toggleTheme} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset document classes
    document.documentElement.className = '';
    
    // Mock matchMedia to return light theme preference
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('should provide theme context to children', () => {
    (StorageService.getTheme as any).mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should initialize with stored theme', () => {
    (StorageService.getTheme as any).mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should initialize with system preference when no stored theme', () => {
    (StorageService.getTheme as any).mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: true, // Dark theme preference
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should default to light theme when no storage or system preference', () => {
    (StorageService.getTheme as any).mockReturnValue(null);
    
    // Mock matchMedia to be undefined (no system preference support)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should update theme when setTheme is called', () => {
    (StorageService.getTheme as any).mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(StorageService.saveTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme correctly', () => {
    (StorageService.getTheme as any).mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Toggle from light to dark
    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(StorageService.saveTheme).toHaveBeenCalledWith('dark');

    // Toggle from dark to light
    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(StorageService.saveTheme).toHaveBeenCalledWith('light');
  });

  it('should apply dark class to document when theme is dark', () => {
    (StorageService.getTheme as any).mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light theme, no dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Switch to dark theme
    act(() => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Switch back to light theme
    act(() => {
      fireEvent.click(screen.getByTestId('set-light'));
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should set CSS custom properties for theme colors', () => {
    (StorageService.getTheme as any).mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check that CSS custom properties are set
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-bg-primary')).toBeTruthy();
    expect(root.style.getPropertyValue('--color-text-primary')).toBeTruthy();
  });

  it('should throw error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });

  it('should listen for system theme changes', () => {
    (StorageService.getTheme as any).mockReturnValue(null); // No stored theme
    
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    
    // Reset matchMedia mock to ensure it's called
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      })),
    });
    
    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should not auto-switch theme if user has manually set one', () => {
    (StorageService.getTheme as any).mockReturnValue('light'); // User has set theme
    
    let changeHandler: (e: MediaQueryListEvent) => void;
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });
    
    // Reset matchMedia mock to ensure it's called
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      })),
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Only simulate if changeHandler was set
    if (changeHandler) {
      act(() => {
        changeHandler({ matches: true } as MediaQueryListEvent);
      });
    }

    // Theme should not change because user has manually set it
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });
});