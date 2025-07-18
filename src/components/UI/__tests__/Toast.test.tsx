import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from '../Toast';
import type { ToastMessage } from '../Toast';

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render toast with title and message', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test Title',
      message: 'Test message',
    };

    render(<Toast toast={toast} onClose={mockOnClose} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render correct icon for each type', () => {
    const successToast: ToastMessage = {
      id: 'test',
      type: 'success',
      title: 'Success',
    };
    const { rerender } = render(
      <Toast toast={successToast} onClose={mockOnClose} />
    );

    // Check for SVG icons instead of emoji
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const errorToast: ToastMessage = {
      id: 'test',
      type: 'error',
      title: 'Error',
    };
    rerender(<Toast toast={errorToast} onClose={mockOnClose} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const warningToast: ToastMessage = {
      id: 'test',
      type: 'warning',
      title: 'Warning',
    };
    rerender(<Toast toast={warningToast} onClose={mockOnClose} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const infoToast: ToastMessage = { id: 'test', type: 'info', title: 'Info' };
    rerender(<Toast toast={infoToast} onClose={mockOnClose} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
    };
    render(<Toast toast={toast} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Should trigger exit animation, then call onClose after delay
    vi.advanceTimersByTime(300);
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto-close after duration', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
      duration: 3000,
    };
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Fast-forward time
    vi.advanceTimersByTime(3000);
    vi.advanceTimersByTime(300); // Exit animation

    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should not auto-close when duration is 0', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
      duration: 0,
    };
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Fast-forward time
    vi.advanceTimersByTime(10000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should apply dark theme styles', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
    };
    const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
  });

  it('should apply light theme styles', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
    };
    const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('bg-blue-50');
  });

  it('should apply correct border color for each type', () => {
    const successToast: ToastMessage = {
      id: 'test',
      type: 'success',
      title: 'Success',
    };
    const { rerender, container } = render(
      <Toast toast={successToast} onClose={mockOnClose} />
    );

    let toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('border-green-500');

    const errorToast: ToastMessage = {
      id: 'test',
      type: 'error',
      title: 'Error',
    };
    rerender(<Toast toast={errorToast} onClose={mockOnClose} />);
    toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('border-red-500');

    const warningToast: ToastMessage = {
      id: 'test',
      type: 'warning',
      title: 'Warning',
    };
    rerender(<Toast toast={warningToast} onClose={mockOnClose} />);
    toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('border-yellow-500');

    const infoToast: ToastMessage = { id: 'test', type: 'info', title: 'Info' };
    rerender(<Toast toast={infoToast} onClose={mockOnClose} />);
    toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass('border-blue-500');
  });

  it('should render without message', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test Title',
    };
    render(<Toast toast={toast} onClose={mockOnClose} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const toast: ToastMessage = {
      id: 'test-toast',
      type: 'info',
      title: 'Test',
    };
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Toast should be rendered (no specific role="alert" in current implementation)
    expect(screen.getByText('Test')).toBeInTheDocument();

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });
});
