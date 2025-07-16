import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileOperations from '../FileOperations';
import type { FileInfo } from '../../../types/editor.types';

// Mock FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  onload: null as any,
  onerror: null as any,
  result: null as any
};

global.FileReader = vi.fn(() => mockFileReader) as any;

describe('FileOperations', () => {
  const mockOnOpen = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnNew = vi.fn();

  const mockCurrentFile: FileInfo = {
    name: 'test.json',
    size: 1024,
    lastModified: new Date('2023-01-01'),
    content: '{"test": "value"}'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all buttons', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    expect(screen.getByTitle('Create new file (Ctrl+N)')).toBeInTheDocument();
    expect(screen.getByTitle('Open file (Ctrl+O)')).toBeInTheDocument();
    expect(screen.getByTitle('Save file (Ctrl+S)')).toBeInTheDocument();
  });

  it('should call onNew when New button is clicked', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    fireEvent.click(screen.getByTitle('Create new file (Ctrl+N)'));
    expect(mockOnNew).toHaveBeenCalled();
  });

  it('should call onSave when Save button is clicked', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    fireEvent.click(screen.getByTitle('Save file (Ctrl+S)'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should trigger file input when Open button is clicked', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    const fileInput = screen.getByLabelText('Select JSON file');
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByTitle('Open file (Ctrl+O)'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle file selection', async () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    const fileContent = '{"name": "test"}';
    const file = new File([fileContent], 'test.json', { type: 'application/json' });
    const fileInput = screen.getByLabelText('Select JSON file');

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Simulate FileReader success
    setTimeout(() => {
      mockFileReader.onload({ target: { result: fileContent } });
    }, 0);

    await waitFor(() => {
      expect(mockOnOpen).toHaveBeenCalledWith({
        name: 'test.json',
        size: file.size,
        lastModified: expect.any(Date),
        content: fileContent
      });
    });
  });

  it('should show current file info', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={mockCurrentFile}
        theme="light"
      />
    );

    expect(screen.getByText('test.json')).toBeInTheDocument();
    expect(screen.getByText('(1.0 KB)')).toBeInTheDocument();
  });

  it('should show dirty indicator when file is modified', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={true}
        currentFile={mockCurrentFile}
        theme="light"
      />
    );

    // Should show dirty indicator in save button
    const saveButton = screen.getByTitle('Save file (Ctrl+S)');
    expect(saveButton.querySelector('.bg-orange-500')).toBeInTheDocument();

    // Should show dirty indicator in file info
    expect(screen.getByText('●')).toBeInTheDocument();
  });

  it('should disable buttons when disabled prop is true', () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
        disabled={true}
      />
    );

    expect(screen.getByTitle('Create new file (Ctrl+N)')).toBeDisabled();
    expect(screen.getByTitle('Open file (Ctrl+O)')).toBeDisabled();
    expect(screen.getByTitle('Save file (Ctrl+S)')).toBeDisabled();
  });

  it('should apply dark theme styles', () => {
    const { container } = render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={mockCurrentFile}
        theme="dark"
      />
    );

    // Check if dark theme classes are applied
    const fileInfo = container.querySelector('.bg-gray-800');
    expect(fileInfo).toBeInTheDocument();
  });

  it('should format file sizes correctly', () => {
    const largeFile: FileInfo = {
      ...mockCurrentFile,
      size: 2097152 // 2MB
    };

    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={largeFile}
        theme="light"
      />
    );

    expect(screen.getByText('(2.0 MB)')).toBeInTheDocument();
  });

  it('should reset file input value after selection', async () => {
    render(
      <FileOperations
        onOpen={mockOnOpen}
        onSave={mockOnSave}
        onNew={mockOnNew}
        isDirty={false}
        currentFile={null}
        theme="light"
      />
    );

    const fileInput = screen.getByLabelText('Select JSON file') as HTMLInputElement;
    const file = new File(['{}'], 'test.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Simulate FileReader success
    setTimeout(() => {
      mockFileReader.onload({ target: { result: '{}' } });
    }, 0);

    await waitFor(() => {
      expect(fileInput.value).toBe('');
    });
  });
});