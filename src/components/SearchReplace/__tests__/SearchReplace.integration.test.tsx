import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../../App';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, onMount }) => {
      // Simulate the editor mounting
      React.useEffect(() => {
        if (onMount) {
          const mockEditor = {
            getAction: jest.fn().mockReturnValue({
              run: jest.fn()
            }),
            focus: jest.fn(),
            getModel: jest.fn().mockReturnValue({
              getValue: jest.fn().mockReturnValue(value),
              setValue: jest.fn(),
              onDidChangeContent: jest.fn().mockReturnValue({ dispose: jest.fn() }),
              canUndo: jest.fn().mockReturnValue(true),
              canRedo: jest.fn().mockReturnValue(true)
            }),
            onDidChangeCursorPosition: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            onDidChangeCursorSelection: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            onDidBlurEditorWidget: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            addCommand: jest.fn(),
            executeEdits: jest.fn(),
            revealLineInCenter: jest.fn(),
            setPosition: jest.fn()
          };
          
          const mockMonaco = {
            editor: {
              onDidChangeMarkers: jest.fn().mockReturnValue({ dispose: jest.fn() }),
              getModelMarkers: jest.fn().mockReturnValue([]),
              MarkerSeverity: { Error: 1, Warning: 2 }
            },
            KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 3 },
            KeyCode: { KeyF: 70, KeyH: 72, KeyD: 68, KeyK: 75 },
            Range: class {
              constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
                this.startLineNumber = startLineNumber;
                this.startColumn = startColumn;
                this.endLineNumber = endLineNumber;
                this.endColumn = endColumn;
              }
            },
            languages: {
              json: {
                jsonDefaults: {
                  setDiagnosticsOptions: jest.fn()
                }
              },
              setLanguageConfiguration: jest.fn()
            }
          };
          
          onMount(mockEditor, mockMonaco);
        }
      }, [onMount]);

      return (
        <div data-testid="monaco-editor">
          <textarea
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            data-testid="monaco-editor-textarea"
          />
        </div>
      );
    }
  };
});

// Mock hooks
jest.mock('../../../hooks/useMonacoSearch', () => {
  return {
    __esModule: true,
    default: () => ({
      search: jest.fn(),
      replace: jest.fn(),
      replaceAll: jest.fn(),
      findNext: jest.fn(),
      findPrevious: jest.fn()
    })
  };
});

describe('SearchReplace Integration Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  it('renders the toolbar search panel', async () => {
    render(<App />);
    
    // Check if the search button is rendered in the toolbar
    const searchButton = screen.getByTitle('搜索 (Ctrl+F)');
    expect(searchButton).toBeInTheDocument();
    
    // Check if the search input is rendered
    const searchInput = screen.getByPlaceholderText('搜索...');
    expect(searchInput).toBeInTheDocument();
  });

  it('shows replace section when replace button is clicked', async () => {
    render(<App />);
    
    // Initially replace section should not be visible
    expect(screen.queryByPlaceholderText('替换为...')).not.toBeInTheDocument();
    
    // Click the replace toggle button
    const replaceButton = screen.getByTitle('显示替换');
    fireEvent.click(replaceButton);
    
    // Now replace section should be visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText('替换为...')).toBeInTheDocument();
    });
  });

  it('integrates with editor settings', async () => {
    render(<App />);
    
    // Open settings panel
    const settingsButton = screen.getByText('设置');
    fireEvent.click(settingsButton);
    
    // Wait for settings panel to appear
    await waitFor(() => {
      expect(screen.getByText('编辑器设置')).toBeInTheDocument();
    });
    
    // Close settings panel
    const closeButton = screen.getByRole('button', { name: /关闭/i });
    fireEvent.click(closeButton);
    
    // Verify search panel is still visible after settings interaction
    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    render(<App />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('搜索...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Verify the input value changed
    expect(searchInput).toHaveValue('test search');
  });

  it('toggles search options correctly', async () => {
    render(<App />);
    
    // Find the case sensitive button (Aa)
    const caseButton = screen.getByTitle('区分大小写');
    
    // Initially it should not be active (check for absence of active class)
    expect(caseButton).not.toHaveClass('from-blue-600');
    
    // Click to activate
    fireEvent.click(caseButton);
    
    // Now it should have the active class (this is a simplified check)
    // In a real test, you'd check for the specific active class or styling
    await waitFor(() => {
      // Re-query the button as it might have been re-rendered
      const updatedButton = screen.getByTitle('区分大小写');
      expect(updatedButton).toHaveClass('from-blue-600');
    });
  });
});