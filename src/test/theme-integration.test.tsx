import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../app';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Theme Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('should initialize with light theme by default', () => {
    render(<App />);
    
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle theme when theme button is clicked', async () => {
    render(<App />);
    
    // Find theme toggle button by text content
    const themeButton = screen.getByRole('button', { name: /切换到暗黑主题/i });
    expect(themeButton).toBeInTheDocument();
    expect(screen.getByText('暗黑模式')).toBeInTheDocument();
    
    // Click to switch to dark theme
    fireEvent.click(themeButton);
    
    // Check if dark theme is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should persist theme choice in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(<App />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply theme to all layout components', () => {
    render(<App />);
    
    // Check if header has correct theme classes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'dark:bg-gray-800');
    
    // Check if main content has correct theme classes
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});