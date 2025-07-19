import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { ThemeToggle } from './ThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
const matchMediaMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true,
  });
  
  // Default matchMedia mock (prefers light)
  matchMediaMock.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ThemeToggle />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Should show moon icon and "暗黑模式" text for light theme (default when system prefers light)
    expect(screen.getByTitle(/切换到暗黑主题/)).toBeInTheDocument();
    expect(screen.getByText('暗黑模式')).toBeInTheDocument();
  });

  it('toggles between light and dark themes when clicked', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Initial state should be light
    expect(screen.getByTitle(/切换到暗黑主题/)).toBeInTheDocument();
    expect(screen.getByText('暗黑模式')).toBeInTheDocument();
    
    // Click to go to dark
    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
});