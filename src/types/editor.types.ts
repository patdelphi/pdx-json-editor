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
  getEditor: () => IStandaloneCodeEditor;
  getMonaco: () => any;
}

// Monaco Editor interfaces
export interface IStandaloneCodeEditor {
  getAction: (id: string) => IEditorAction | null;
  getActions: () => IEditorAction[];
  trigger: (source: string, handlerId: string, payload?: any) => void;
  focus: () => void;
  getModel: () => any;
  getSelection: () => any;
  executeEdits: (source: string, edits: any[], endCursorState?: any) => boolean;
  revealLineInCenter: (lineNumber: number) => void;
  setPosition: (position: { lineNumber: number; column: number }) => void;
  updateOptions: (options: any) => void;
  onDidChangeCursorPosition: (listener: (e: any) => void) => {
    dispose: () => void;
  };
  onDidChangeCursorSelection: (listener: (e: any) => void) => {
    dispose: () => void;
  };
  onDidBlurEditorWidget: (listener: () => void) => { dispose: () => void };
  addCommand: (keybinding: number, handler: () => void) => void;
  getContribution: (id: string) => IEditorContribution;
}

export interface IEditorAction {
  id: string;
  label: string;
  run: () => Promise<void>;
}

export interface IEditorContribution {
  getId: () => string;
  getState?: () => any;
  focus?: () => void;
  start?: (options: any) => void;
  replace?: () => void;
  replaceAll?: () => void;
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

// Toast types
export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

export interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
  theme?: 'light' | 'dark';
}

// SearchPanel types
export interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => void;
  onReplaceAll: (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
  theme: 'light' | 'dark';
}

// Utility types
export type Theme = 'light' | 'dark';
export type IndentType = 'spaces' | 'tabs';
export type IndentSize = 2 | 4;
export type ErrorSeverity = 'error' | 'warning';
