import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="JSON Editor"
    />
  )
}));

// Mock file operations
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
});

// Mock file reader
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  result: string | null = null;

  readAsText(file: File) {
    setTimeout(() => {
      this.result = '{"test": "mock file content"}';
      this.onload?.({ target: { result: this.result } });
    }, 0);
  }
}

Object.defineProperty(window, 'FileReader', {
  value: MockFileReader,
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main application components', () => {
    render(<App />);
    
    // Check header
    expect(screen.getByText('JSON Editor')).toBeInTheDocument();
    
    // Check theme toggle
    expect(screen.getByText('Dark')).toBeInTheDocument();
    
    // Check toolbar buttons
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Minify')).toBeInTheDocument();
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check editor
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    
    // Check status bar
    expect(screen.getByText(/✓ Valid JSON/)).toBeInTheDocument();
    expect(screen.getByText(/Characters:/)).toBeInTheDocument();
  });

  test('theme toggle functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const themeButton = screen.getByText('Dark');
    await user.click(themeButton);
    
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('settings panel opens and closes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);
    
    // Settings panel should be visible
    expect(screen.getByText('Editor Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    
    // Close settings
    const closeButton = screen.getByLabelText('Close settings');
    await user.click(closeButton);
    
    // Settings panel should be hidden
    expect(screen.queryByText('Editor Settings')).not.toBeInTheDocument();
  });

  test('search panel opens and closes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    
    // Search panel should be visible
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    // Close search panel
    const closeButton = screen.getByTitle('Close search panel');
    await user.click(closeButton);
    
    // Search panel should be hidden
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  test('JSON formatting functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    const formatButton = screen.getByText('Format');
    
    // Enter unformatted JSON
    await user.clear(editor);
    fireEvent.change(editor, { target: { value: '{"test":"value","number":123}' } });
    
    // Format the JSON
    await user.click(formatButton);
    
    // Should show success toast
    await waitFor(() => {
      expect(screen.getByText('JSON Formatted')).toBeInTheDocument();
    });
  });

  test('JSON minification functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    const minifyButton = screen.getByText('Minify');
    
    // Enter formatted JSON
    await user.clear(editor);
    fireEvent.change(editor, { target: { value: '{\n  "test": "value",\n  "number": 123\n}' } });
    
    // Minify the JSON
    await user.click(minifyButton);
    
    // Should show success toast
    await waitFor(() => {
      expect(screen.getByText('JSON Minified')).toBeInTheDocument();
    });
  });

  test('JSON validation functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const validateButton = screen.getByText('Validate');
    
    // Valid JSON should show success
    await user.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('JSON Valid')).toBeInTheDocument();
    });
  });

  test('invalid JSON validation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    const validateButton = screen.getByText('Validate');
    
    // Enter invalid JSON
    await user.clear(editor);
    fireEvent.change(editor, { target: { value: '{"invalid": json}' } });
    
    // Validate the JSON
    await user.click(validateButton);
    
    // Should show error toast
    await waitFor(() => {
      expect(screen.getByText('JSON Invalid')).toBeInTheDocument();
    });
  });

  test('file save functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Mock document.createElement and appendChild
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    // Should show success toast
    await waitFor(() => {
      expect(screen.getByText('File Saved')).toBeInTheDocument();
    });
    
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.click).toHaveBeenCalled();
    
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  test('new file functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    const newButton = screen.getByText('New');
    
    // Modify content first
    await user.clear(editor);
    fireEvent.change(editor, { target: { value: '{"modified": "content"}' } });
    
    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    await user.click(newButton);
    
    // Should ask for confirmation and reset content
    expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Do you want to discard them?');
    
    mockConfirm.mockRestore();
  });

  test('keyboard shortcuts work', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Test Ctrl+S (save)
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    
    await user.keyboard('{Control>}s{/Control}');
    
    await waitFor(() => {
      expect(screen.getByText('File Saved')).toBeInTheDocument();
    });
    
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  test('content changes update dirty state', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    
    // Initially should not be dirty
    expect(screen.queryByText(/●/)).not.toBeInTheDocument();
    
    // Modify content
    await user.clear(editor);
    fireEvent.change(editor, { target: { value: '{"modified": "content"}' } });
    
    // Should show dirty indicator in save button
    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      expect(saveButton.closest('button')).toHaveClass('bg-blue-600'); // Primary button style for dirty state
    });
  });

  test('error boundary catches and displays errors', () => {
    // Mock console.error to avoid noise in test output
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a component that throws an error
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const AppWithError = () => (
      <App>
        <ThrowError />
      </App>
    );
    
    render(<AppWithError />);
    
    // Should show error boundary UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    
    mockConsoleError.mockRestore();
  });
});