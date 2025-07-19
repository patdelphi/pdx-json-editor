import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/preact';
import { JsonEditor } from './JsonEditor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, theme }: any) => (
    <div data-testid="monaco-editor" data-theme={theme}>
      <textarea 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="editor-textarea"
      />
    </div>
  )
}));

describe('JsonEditor', () => {
  it('renders Monaco Editor with correct props', () => {
    const mockOnChange = vi.fn();
    const testValue = '{"test": "value"}';
    
    const { getByTestId } = render(
      <JsonEditor 
        value={testValue}
        onChange={mockOnChange}
        theme="vs"
      />
    );

    const editor = getByTestId('monaco-editor');
    const textarea = getByTestId('editor-textarea');
    
    expect(editor).toBeInTheDocument();
    expect(textarea).toHaveValue(testValue);
  });

  it('calls onChange when content changes', () => {
    const mockOnChange = vi.fn();
    
    const { getByTestId } = render(
      <JsonEditor 
        value=""
        onChange={mockOnChange}
        theme="vs"
      />
    );

    const textarea = getByTestId('editor-textarea');
    textarea.value = '{"new": "content"}';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    expect(mockOnChange).toHaveBeenCalledWith('{"new": "content"}');
  });
});