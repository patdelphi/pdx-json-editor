import { useState, useRef } from 'react';
import './App.css';
import JsonEditor from './components/Editor/JsonEditor';
import { SettingsPanel } from './components/Settings';
import { FileOperations, FileDropZone } from './components/FileManager';
import { SearchPanel } from './components/SearchReplace';
import { ErrorBoundary, ToastContainer } from './components/UI';
// import { ErrorService } from './services/errorService';
import useToast from './hooks/useToast';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import type { EditorSettings, JsonError, FileInfo, EditorMethods } from './types/editor.types';

function App() {
  const [content, setContent] = useState('{\n  "example": "JSON content",\n  "number": 42,\n  "boolean": true\n}');
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState({ startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 });
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [originalContent, setOriginalContent] = useState('{\n  "example": "JSON content",\n  "number": 42,\n  "boolean": true\n}');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
  const editorRef = useRef<EditorMethods>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const [settings, setSettings] = useState<EditorSettings>({
    indentSize: 2,
    indentType: 'spaces',
    wordWrap: false,
    lineNumbers: true,
    minimap: true
  });

  const handleContentChange = (value: string) => {
    handleContentChangeWithDirty(value);
  };

  const handleValidationChange = (validationErrors: JsonError[]) => {
    setErrors(validationErrors);
  };

  const handleCursorPositionChange = (position: { line: number; column: number }) => {
    setCursorPosition(position);
  };

  const handleSelectionChange = (sel: { startLine: number; startColumn: number; endLine: number; endColumn: number }) => {
    setSelection(sel);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // File operations handlers
  const handleFileOpen = (file: FileInfo) => {
    if (isDirty) {
      const shouldDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldDiscard) return;
    }
    
    setCurrentFile(file);
    setContent(file.content);
    setOriginalContent(file.content);
    setIsDirty(false);
  };

  const handleFileSave = () => {
    const filename = currentFile?.name || 'untitled.json';
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setOriginalContent(content);
    setIsDirty(false);
    showSuccess('File Saved', `Successfully saved ${filename}`);
  };

  const handleFileNew = () => {
    if (isDirty) {
      const shouldDiscard = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldDiscard) return;
    }
    
    const newContent = '{\n  \n}';
    setCurrentFile(null);
    setContent(newContent);
    setOriginalContent(newContent);
    setIsDirty(false);
  };

  const handleFileError = (error: string) => {
    showError('File Error', error);
  };

  // Track content changes for dirty state
  const handleContentChangeWithDirty = (value: string) => {
    setContent(value);
    setIsDirty(value !== originalContent);
  };

  // Format and minify handlers
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, settings.indentSize);
      setContent(formatted);
      setIsDirty(formatted !== originalContent);
      showSuccess('JSON Formatted', 'Your JSON has been formatted successfully');
    } catch (error) {
      showError('Format Error', 'Cannot format invalid JSON. Please fix syntax errors first.');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      setContent(minified);
      setIsDirty(minified !== originalContent);
      showSuccess('JSON Minified', 'Your JSON has been minified successfully');
    } catch (error) {
      showError('Minify Error', 'Cannot minify invalid JSON. Please fix syntax errors first.');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(content);
      showSuccess('JSON Valid', 'Your JSON syntax is valid!');
    } catch (error) {
      showError('JSON Invalid', `JSON syntax error: ${(error as Error).message}`);
    }
  };

  // Search and replace handlers
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  };

  const handleSearch = (query: string, options: any) => {
    if (!editorRef.current) return;
    
    // Use Monaco Editor's built-in search functionality
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('search', 'actions.find', {});
    }
  };

  const handleReplace = (searchQuery: string, replaceText: string, options: any) => {
    if (!editorRef.current) return;
    
    // Use Monaco Editor's built-in replace functionality
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('replace', 'editor.action.startFindReplaceAction', {});
    }
  };

  const handleReplaceAll = (searchQuery: string, replaceText: string, options: any) => {
    if (!editorRef.current) return;
    
    // Use Monaco Editor's built-in replace all functionality
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('replaceAll', 'editor.action.startFindReplaceAction', {});
    }
  };

  const handleFindNext = () => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('findNext', 'editor.action.nextMatchFindAction', {});
    }
  };

  const handleFindPrevious = () => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('findPrevious', 'editor.action.previousMatchFindAction', {});
    }
  };

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: 'n',
      ctrlKey: true,
      action: handleFileNew,
      description: 'Create new file'
    },
    {
      key: 'o',
      ctrlKey: true,
      action: () => {
        // Trigger file input click
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
      },
      description: 'Open file'
    },
    {
      key: 's',
      ctrlKey: true,
      action: handleFileSave,
      description: 'Save file'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: toggleSearch,
      description: 'Find/Search'
    },
    {
      key: ',',
      ctrlKey: true,
      action: toggleSettings,
      description: 'Open settings'
    },
    {
      key: 'Enter',
      ctrlKey: true,
      shiftKey: true,
      action: handleFormat,
      description: 'Format JSON'
    },
    {
      key: 'Enter',
      ctrlKey: true,
      altKey: true,
      action: handleMinify,
      description: 'Minify JSON'
    },
    {
      key: 'Enter',
      ctrlKey: true,
      action: handleValidate,
      description: 'Validate JSON'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: toggleTheme,
      description: 'Toggle dark/light theme'
    }
  ];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
        <h1 className="text-lg font-semibold">JSON Editor</h1>
        <div className="ml-auto flex items-center space-x-2">
          <button className="btn-secondary text-sm" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 space-x-2 flex-shrink-0">
        <FileOperations
          onOpen={handleFileOpen}
          onSave={handleFileSave}
          onNew={handleFileNew}
          isDirty={isDirty}
          currentFile={currentFile}
          theme={theme}
        />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <button className="btn-secondary text-sm" onClick={handleFormat}>Format</button>
        <button className="btn-secondary text-sm" onClick={handleMinify}>Minify</button>
        <button className="btn-secondary text-sm" onClick={handleValidate}>Validate</button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <button className="btn-secondary text-sm" onClick={toggleSearch}>Search</button>
        <button className="btn-secondary text-sm" onClick={toggleSettings}>Settings</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Area with File Drop Zone */}
        <div className="flex-1 p-4">
          <FileDropZone
            onFileDrop={handleFileOpen}
            onError={handleFileError}
            theme={theme}
          >
            <div className="editor-container h-full">
              <JsonEditor
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onValidationChange={handleValidationChange}
                onCursorPositionChange={handleCursorPositionChange}
                onSelectionChange={handleSelectionChange}
                theme={theme}
                settings={settings}
              />
            </div>
          </FileDropZone>
        </div>

        {/* Search Panel */}
        <SearchPanel
          isVisible={showSearch}
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onFindNext={handleFindNext}
          onFindPrevious={handleFindPrevious}
          searchResults={searchResults}
          currentResultIndex={currentResultIndex}
          theme={theme}
        />
      </main>

      {/* Status Bar */}
      <footer className="h-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
        <span>
          {errors.length === 0 ? (
            <span className="text-green-600 dark:text-green-400">✓ Valid JSON</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              ✗ {errors.length} error{errors.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span className="ml-4">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        {selection.startLine !== selection.endLine || selection.startColumn !== selection.endColumn ? (
          <span className="ml-4">
            ({Math.abs(selection.endLine - selection.startLine) + 1} lines, {
              selection.startLine === selection.endLine 
                ? Math.abs(selection.endColumn - selection.startColumn)
                : 'multiple'
            } chars selected)
          </span>
        ) : null}
        <span className="ml-auto">Characters: {content.length}</span>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="top-right"
      />
    </div>
    </ErrorBoundary>
  );
}

export default App;
