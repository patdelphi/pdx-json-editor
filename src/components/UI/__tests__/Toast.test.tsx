import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Toast from '../Toast';

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
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test Title"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render correct icon for each type', () => {
    const { rerender } = render(
      <Toast
        id="test-toast"
        type="success"
        title="Success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✅')).toBeInTheDocument();

    rerender(
      <Toast
        id="test-toast"
        type="error"
        title="Error"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('❌')).toBeInTheDocument();

    rerender(
      <Toast
        id="test-toast"
        type="warning"
        title="Warning"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(
      <Toast
        id="test-toast"
        type="info"
        title="Info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    // Should trigger exit animation, then call onClose after delay
    vi.advanceTimersByTime(300);
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto-close after duration', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        duration={3000}
        onClose={mockOnClose}
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(3000);
    vi.advanceTimersByTime(300); // Exit animation

    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should not auto-close when duration is 0', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        duration={0}
        onClose={mockOnClose}
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(10000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should apply dark theme styles', () => {
    const { container } = render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
        theme="dark"
      />
    );

    const toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('bg-gray-800', 'border-gray-700', 'text-gray-100');
  });

  it('should apply light theme styles', () => {
    const { container } = render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
        theme="light"
      />
    );

    const toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('bg-white', 'border-gray-200', 'text-gray-900');
  });

  it('should apply correct border color for each type', () => {
    const { rerender, container } = render(
      <Toast
        id="test-toast"
        type="success"
        title="Success"
        onClose={mockOnClose}
        theme="light"
      />
    );

    let toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('border-l-green-500');

    rerender(
      <Toast
        id="test-toast"
        type="error"
        title="Error"
        onClose={mockOnClose}
        theme="light"
      />
    );

    toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('border-l-red-500');

    rerender(
      <Toast
        id="test-toast"
        type="warning"
        title="Warning"
        onClose={mockOnClose}
        theme="light"
      />
    );

    toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('border-l-yellow-500');

    rerender(
      <Toast
        id="test-toast"
        type="info"
        title="Info"
        onClose={mockOnClose}
        theme="light"
      />
    );

    toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('border-l-blue-500');
  });

  it('should render without message', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test Title"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close notification');
    expect(closeButton).toBeInTheDocument();
  });
});