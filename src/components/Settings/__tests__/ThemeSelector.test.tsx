import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeSelector from '../ThemeSelector';

describe('ThemeSelector', () => {
  const mockOnThemeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with light theme', () => {
    render(<ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />);

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('should render with dark theme', () => {
    render(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onThemeChange when clicked', () => {
    render(<ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />);

    const toggleButton = screen.getByRole('switch');
    fireEvent.click(toggleButton);

    expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
  });

  it('should toggle from dark to light', () => {
    render(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    const toggleButton = screen.getByRole('switch');
    fireEvent.click(toggleButton);

    expect(mockOnThemeChange).toHaveBeenCalledWith('light');
  });

  it('should not call onThemeChange when disabled', () => {
    render(
      <ThemeSelector
        theme="light"
        onThemeChange={mockOnThemeChange}
        disabled={true}
      />
    );

    const toggleButton = screen.getByRole('switch');
    fireEvent.click(toggleButton);

    expect(mockOnThemeChange).not.toHaveBeenCalled();
  });

  it('should have disabled styles when disabled', () => {
    render(
      <ThemeSelector
        theme="light"
        onThemeChange={mockOnThemeChange}
        disabled={true}
      />
    );

    const toggleButton = screen.getByRole('switch');
    expect(toggleButton).toBeDisabled();
    expect(toggleButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should have proper accessibility attributes', () => {
    render(<ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />);

    const toggleButton = screen.getByRole('switch');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(toggleButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should update aria-label based on current theme', () => {
    const { rerender } = render(
      <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
    );

    let toggleButton = screen.getByRole('switch');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark theme');

    rerender(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    toggleButton = screen.getByRole('switch');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('should show theme icons', () => {
    render(<ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />);

    expect(screen.getByTitle('Light theme')).toBeInTheDocument();
    expect(screen.getByTitle('Dark theme')).toBeInTheDocument();
  });

  it('should highlight active theme icon', () => {
    const { rerender } = render(
      <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
    );

    const lightIcon = screen.getByTitle('Light theme');
    const darkIcon = screen.getByTitle('Dark theme');

    expect(lightIcon).toHaveClass('text-yellow-500');
    expect(darkIcon).toHaveClass('text-gray-400');

    rerender(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    expect(lightIcon).toHaveClass('text-gray-400');
    expect(darkIcon).toHaveClass('text-blue-400');
  });

  it('should apply correct switch position styles', () => {
    const { rerender } = render(
      <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
    );

    let switchElement = screen.getByRole('switch').querySelector('span');
    expect(switchElement).toHaveClass('translate-x-1');

    rerender(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    switchElement = screen.getByRole('switch').querySelector('span');
    expect(switchElement).toHaveClass('translate-x-6');
  });

  it('should apply correct background colors', () => {
    const { rerender } = render(
      <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
    );

    let toggleButton = screen.getByRole('switch');
    expect(toggleButton).toHaveClass('bg-gray-200');

    rerender(<ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />);

    toggleButton = screen.getByRole('switch');
    expect(toggleButton).toHaveClass('bg-blue-600');
  });
});
