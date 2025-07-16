// Core editor types
export interface EditorState {
  content: string;
  isValid: boolean;
  errors: JsonError[];
  isDirty: boolean;
  currentFile: FileInfo | null;
  theme: 'light' | 'dark';
  settings: EditorSettings;
}

// JSON error interface
export interface JsonError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

// File information interface
export interface FileInfo {
  name: string;
  size: number;
  lastModified: Date;
  content: string;
}

// Editor settings interface
export interface EditorSettings {
  indentSize: 2 | 4;
  indentType: 'spaces' | 'tabs';
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
}

// Global application state
export interface AppState {
  editor: EditorState;
  ui: {
    showSearchPanel: boolean;
    showSettings: boolean;
    sidebarCollapsed: boolean;
  };
  recent: FileInfo[];
}

// Action types for state management
export type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_VALIDATION_ERRORS'; payload: JsonError[] }
  | { type: 'SET_FILE'; payload: FileInfo | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<EditorSettings> }
  | { type: 'TOGGLE_SEARCH_PANEL' }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_RECENT_FILE'; payload: FileInfo };

// Local storage data structure
export interface StoredData {
  settings: EditorSettings;
  theme: 'light' | 'dark';
  recentFiles: FileInfo[];
  lastContent: string;
}

// Search and replace types
export interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

// Monaco Editor types
export interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (errors: JsonError[]) => void;
  onCursorPositionChange?: (position: CursorPosition) => void;
  onSelectionChange?: (selection: Selection) => void;
  theme: 'light' | 'dark';
  settings: EditorSettings;
}

// Editor methods interface for ref
export interface EditorMethods {
  formatDocument: () => void;
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  find: () => void;
  replace: () => void;
  gotoLine: (line: number, column?: number) => void;
  getSelection: () => any;
  getSelectedText: () => string;
  insertText: (text: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  focus: () => void;
  getEditor: () => any;
  getMonaco: () => any;
}

// Cursor and selection types
export interface CursorPosition {
  line: number;
  column: number;
}

export interface Selection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

// Component props types
export interface EditorToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onToggleSearch: () => void;
  isValid: boolean;
  isDirty: boolean;
}

export interface FileOperationsProps {
  onOpen: () => void;
  onSave: () => void;
  onNew: () => void;
  isDirty: boolean;
  currentFile: FileInfo | null;
}

export interface StatusBarProps {
  isValid: boolean;
  errors: JsonError[];
  cursorPosition: { line: number; column: number };
  fileSize: number;
}

export interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

// Utility types
export type Theme = 'light' | 'dark';
export type IndentType = 'spaces' | 'tabs';
export type IndentSize = 2 | 4;
export type ErrorSeverity = 'error' | 'warning';
