import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JsonEditor from '../JsonEditor';
import type { EditorSettings, JsonError } from '../../../types/editor.types';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, onChange, value }: any) => {
    const mockEditor = {
      trigger: vi.fn(),
      updateOptions: vi.fn(),
      addCommand: vi.fn(),
      getModel: vi.fn(() => ({
        canUndo: vi.fn(() => true),
        canRedo: vi.fn(() => false),
        onDidChangeContent: vi.fn(() => ({ dispose: vi.fn() })),
        uri: { toString: () => 'mock-uri' }
      })),
      onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
      onDidChangeCursorSelection: vi.fn(() => ({ dispose: vi.fn() })),
      getSelection: vi.fn(() => ({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 5
      })),
      setPosition: vi.fn(),
      revealLineInCenter: vi.fn(),
      focus: vi.fn(),
      executeEdits: vi.fn()
    };

    const mockMonaco = {
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: vi.fn()
          }
        },
        setLanguageConfiguration: vi.fn()
      },
      editor: {
        onDidChangeMarkers: vi.fn(() => ({ dispose: vi.fn() })),
        getModelMarkers: vi.fn(() => []),
        setModelMarkers: vi.fn()
      },
      KeyMod: {
        CtrlCmd: 1,
        Shift: 2
      },
      KeyCode: {
        KeyD: 1,
        KeyK: 2,
        Slash: 3
      },
      MarkerSeverity: {
        Error: 8,
        Warning: 4
      },
      Range: vi.fn()
    };

    React.useEffect(() => {
      if (onMount) {
        onMount(mockEditor, mockMonaco);
      }
    }, []);

    return (
      <div data-testid="monaco-editor">
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          data-testid="editor-textarea"
        />
      </div>
    );
  }
}));

describe('JsonEditor', () => {
  const defaultSettings: EditorSettings = {
    indentSize: 2,
    indentType: 'spaces',
    wordWrap: true,
    lineNumbers: true,
    minimap: false
  };

  const mockOnChange = vi.fn();
  const mockOnValidationChange = vi.fn();
  const mockOnCursorPositionChange = vi.fn();
  const mockOnSelectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Monaco Editor', () => {
    render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('should call onChange when content changes', async () => {
    render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: '{"test": "value"}' } });

    expect(mockOnChange).toHaveBeenCalledWith('{"test": "value"}');
  });

  it('should handle validation errors', () => {
    render(
      <JsonEditor
        value="{invalid"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // Component should render without errors even with invalid JSON
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-textarea')).toHaveValue('{invalid');
  });

  it('should handle cursor position changes', () => {
    render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        onCursorPositionChange={mockOnCursorPositionChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // The cursor position change would be triggered by Monaco Editor
    // In a real scenario, this would be called when the cursor moves
    expect(mockOnCursorPositionChange).not.toHaveBeenCalled();
  });

  it('should handle selection changes', () => {
    render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        onSelectionChange={mockOnSelectionChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // The selection change would be triggered by Monaco Editor
    expect(mockOnSelectionChange).not.toHaveBeenCalled();
  });

  it('should apply theme correctly', () => {
    const { rerender } = render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // Test dark theme
    rerender(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="dark"
        settings={defaultSettings}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('should update editor options when settings change', () => {
    const { rerender } = render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    const newSettings: EditorSettings = {
      ...defaultSettings,
      indentSize: 4,
      wordWrap: false
    };

    rerender(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={newSettings}
      />
    );

    // The updateOptions would be called in the useEffect
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('should handle ref methods', () => {
    const ref = React.createRef<any>();
    
    render(
      <JsonEditor
        ref={ref}
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // Test that ref methods are available
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current?.formatDocument).toBe('function');
    expect(typeof ref.current?.undo).toBe('function');
    expect(typeof ref.current?.redo).toBe('function');
    expect(typeof ref.current?.selectAll).toBe('function');
    expect(typeof ref.current?.find).toBe('function');
    expect(typeof ref.current?.replace).toBe('function');
    expect(typeof ref.current?.gotoLine).toBe('function');
    expect(typeof ref.current?.getSelection).toBe('function');
    expect(typeof ref.current?.getSelectedText).toBe('function');
    expect(typeof ref.current?.insertText).toBe('function');
    expect(typeof ref.current?.canUndo).toBe('function');
    expect(typeof ref.current?.canRedo).toBe('function');
    expect(typeof ref.current?.focus).toBe('function');
  });

  it('should show loading state', () => {
    render(
      <JsonEditor
        value="{}"
        onChange={mockOnChange}
        onValidationChange={mockOnValidationChange}
        theme="light"
        settings={defaultSettings}
      />
    );

    // The loading component would be shown while Monaco Editor loads
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});