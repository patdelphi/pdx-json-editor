import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusBar from '../StatusBar';
import type {
  JsonError,
  CursorPosition,
  Selection,
} from '../../../types/editor.types';

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

describe('StatusBar', () => {
  const mockCursorPosition: CursorPosition = { line: 1, column: 1 };
  const mockSelection: Selection = {
    startLine: 1,
    startColumn: 1,
    endLine: 1,
    endColumn: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render cursor position', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('Ln 1, Col 1')).toBeInTheDocument();
  });

  it('should show character and word count', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={1234}
        wordCount={567}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('1,234 chars')).toBeInTheDocument();
    expect(screen.getByText('567 words')).toBeInTheDocument();
  });

  it('should show file size when provided', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        fileSize={2048}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('should show modified status', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={true}
        theme="light"
      />
    );

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('should show selection info when text is selected', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={mockSelection}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('4 chars selected')).toBeInTheDocument();
  });

  it('should show multi-line selection info', () => {
    const multiLineSelection: Selection = {
      startLine: 1,
      startColumn: 1,
      endLine: 3,
      endColumn: 5,
    };

    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={multiLineSelection}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('3 lines selected')).toBeInTheDocument();
  });

  it('should show valid JSON status when no errors', () => {
    render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('Valid JSON')).toBeInTheDocument();
  });

  it('should show error count and status', () => {
    const errors: JsonError[] = [
      { line: 1, column: 5, message: 'Error 1', severity: 'error' },
      { line: 2, column: 3, message: 'Error 2', severity: 'error' },
    ];

    render(
      <StatusBar
        errors={errors}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('2 errors')).toBeInTheDocument();
  });

  it('should show warning count and status', () => {
    const errors: JsonError[] = [
      { line: 1, column: 5, message: 'Warning 1', severity: 'warning' },
      { line: 2, column: 3, message: 'Warning 2', severity: 'warning' },
    ];

    render(
      <StatusBar
        errors={errors}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('2 warnings')).toBeInTheDocument();
  });

  it('should show mixed errors and warnings', () => {
    const errors: JsonError[] = [
      { line: 1, column: 5, message: 'Error 1', severity: 'error' },
      { line: 2, column: 3, message: 'Warning 1', severity: 'warning' },
      { line: 3, column: 1, message: 'Error 2', severity: 'error' },
    ];

    render(
      <StatusBar
        errors={errors}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('2 errors, 1 warning')).toBeInTheDocument();
  });

  it('should dispatch goto-line event when "Go to error" is clicked', () => {
    const errors: JsonError[] = [
      { line: 5, column: 10, message: 'Syntax error', severity: 'error' },
    ];

    render(
      <StatusBar
        errors={errors}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    const gotoButton = screen.getByText('Go to error');
    fireEvent.click(gotoButton);

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'goto-line',
        detail: { line: 5, column: 10 },
      })
    );
  });

  it('should apply dark theme styles', () => {
    const { container } = render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="dark"
      />
    );

    const statusBar = container.firstChild as HTMLElement;
    expect(statusBar).toHaveClass(
      'bg-gray-800',
      'border-gray-700',
      'text-gray-300'
    );
  });

  it('should apply light theme styles', () => {
    const { container } = render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        isModified={false}
        theme="light"
      />
    );

    const statusBar = container.firstChild as HTMLElement;
    expect(statusBar).toHaveClass(
      'bg-gray-100',
      'border-gray-200',
      'text-gray-600'
    );
  });

  it('should format file sizes correctly', () => {
    const { rerender } = render(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        fileSize={500}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('500 B')).toBeInTheDocument();

    rerender(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        fileSize={1536}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('1.5 KB')).toBeInTheDocument();

    rerender(
      <StatusBar
        errors={[]}
        cursorPosition={mockCursorPosition}
        selection={null}
        characterCount={100}
        wordCount={20}
        fileSize={2097152}
        isModified={false}
        theme="light"
      />
    );

    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
  });
});
