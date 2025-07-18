import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileDropZone from '../FileDropZone';

// Mock FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  onload: null as any,
  onerror: null as any,
  result: null as any,
};

global.FileReader = vi.fn(() => mockFileReader) as any;

describe('FileDropZone', () => {
  const mockOnFileDrop = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockDragEvent = (files: File[] = []) => {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files,
        items: files.map(() => ({})),
        dropEffect: 'copy',
      },
    } as any;
  };

  it('should render children', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div data-testid="child-content">Child Content</div>
      </FileDropZone>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should show drag overlay when dragging over', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;

    // Simulate drag enter
    fireEvent.dragEnter(
      dropZone!,
      createMockDragEvent([new File([''], 'test.json')])
    );

    expect(screen.getByText('Drop your JSON file here')).toBeInTheDocument();
  });

  it('should hide drag overlay when drag leaves', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;

    // Simulate drag enter then leave
    fireEvent.dragEnter(
      dropZone!,
      createMockDragEvent([new File([''], 'test.json')])
    );
    fireEvent.dragLeave(dropZone!, createMockDragEvent());

    // Overlay should be hidden (opacity-0)
    const overlay = screen
      .getByText('Drop your JSON file here')
      .closest('.absolute');
    expect(overlay).toHaveClass('opacity-0');
  });

  it('should handle file drop with valid JSON file', async () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    const file = new File(['{"test": "value"}'], 'test.json', {
      type: 'application/json',
    });

    fireEvent.drop(dropZone!, createMockDragEvent([file]));

    // Simulate FileReader success
    setTimeout(() => {
      mockFileReader.onload({ target: { result: '{"test": "value"}' } });
    }, 0);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockOnFileDrop).toHaveBeenCalledWith({
      name: 'test.json',
      size: file.size,
      lastModified: expect.any(Date),
      content: '{"test": "value"}',
    });
  });

  it('should reject invalid file types', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    const file = new File(['content'], 'test.exe', {
      type: 'application/octet-stream',
    });

    fireEvent.drop(dropZone!, createMockDragEvent([file]));

    expect(mockOnError).toHaveBeenCalledWith(
      'Please select a JSON or text file'
    );
    expect(mockOnFileDrop).not.toHaveBeenCalled();
  });

  it('should reject files that are too large', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    // Create a mock file that appears to be larger than 10MB
    const file = new File(['content'], 'large.json', {
      type: 'application/json',
    });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    fireEvent.drop(dropZone!, createMockDragEvent([file]));

    expect(mockOnError).toHaveBeenCalledWith(
      'File size must be less than 10MB'
    );
    expect(mockOnFileDrop).not.toHaveBeenCalled();
  });

  it('should reject multiple files', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    const files = [
      new File(['{}'], 'test1.json', { type: 'application/json' }),
      new File(['{}'], 'test2.json', { type: 'application/json' }),
    ];

    fireEvent.drop(dropZone!, createMockDragEvent(files));

    expect(mockOnError).toHaveBeenCalledWith(
      'Please drop only one file at a time'
    );
    expect(mockOnFileDrop).not.toHaveBeenCalled();
  });

  it('should handle empty file drop', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;

    fireEvent.drop(dropZone!, createMockDragEvent([]));

    expect(mockOnError).toHaveBeenCalledWith('No files were dropped');
    expect(mockOnFileDrop).not.toHaveBeenCalled();
  });

  it('should not respond to drag events when disabled', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
        disabled={true}
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;

    fireEvent.dragEnter(
      dropZone!,
      createMockDragEvent([new File([''], 'test.json')])
    );

    // Overlay should not be shown when disabled
    const overlay = screen
      .getByText('Drop your JSON file here')
      .closest('.absolute');
    expect(overlay).toHaveClass('opacity-0');
  });

  it('should apply dark theme styles', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="dark"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;

    // Trigger drag enter to show overlay
    fireEvent.dragEnter(
      dropZone!,
      createMockDragEvent([new File([''], 'test.json')])
    );

    // Check for dark theme classes
    const overlay = screen
      .getByText('Drop your JSON file here')
      .closest('.absolute');
    expect(overlay).toHaveClass('bg-gray-900/80', 'border-blue-400');
  });

  it('should handle file read errors', async () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    const file = new File(['{"test": "value"}'], 'test.json', {
      type: 'application/json',
    });

    fireEvent.drop(dropZone!, createMockDragEvent([file]));

    // Simulate FileReader error
    setTimeout(() => {
      mockFileReader.onerror();
    }, 0);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockOnError).toHaveBeenCalledWith('Failed to read file content');
    expect(mockOnFileDrop).not.toHaveBeenCalled();
  });

  it('should accept text files', async () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
        theme="light"
      >
        <div>Content</div>
      </FileDropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    const file = new File(['{"test": "value"}'], 'test.txt', {
      type: 'text/plain',
    });

    fireEvent.drop(dropZone!, createMockDragEvent([file]));

    // Simulate FileReader success
    setTimeout(() => {
      mockFileReader.onload({ target: { result: '{"test": "value"}' } });
    }, 0);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockOnFileDrop).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });
});
