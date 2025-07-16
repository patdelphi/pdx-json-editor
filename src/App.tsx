import { useState } from 'react';
import './App.css';
import JsonEditor from './components/Editor/JsonEditor';
import type { EditorSettings, JsonError } from './types/editor.types';

function App() {
  const [content, setContent] = useState('{\n  "example": "JSON content",\n  "number": 42,\n  "boolean": true\n}');
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState({ startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 });
  
  const defaultSettings: EditorSettings = {
    indentSize: 2,
    indentType: 'spaces',
    wordWrap: false,
    lineNumbers: true,
    minimap: true
  };

  const handleContentChange = (value: string) => {
    setContent(value);
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

  return (
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
        <button className="btn-secondary text-sm">New</button>
        <button className="btn-secondary text-sm">Open</button>
        <button className="btn-secondary text-sm">Save</button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <button className="btn-secondary text-sm">Format</button>
        <button className="btn-secondary text-sm">Minify</button>
        <button className="btn-secondary text-sm">Validate</button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <button className="btn-secondary text-sm">Search</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 p-4">
          <div className="editor-container h-full">
            <JsonEditor
              value={content}
              onChange={handleContentChange}
              onValidationChange={handleValidationChange}
              onCursorPositionChange={handleCursorPositionChange}
              onSelectionChange={handleSelectionChange}
              theme={theme}
              settings={defaultSettings}
            />
          </div>
        </div>
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
    </div>
  );
}

export default App;
