import * as monaco from 'monaco-editor';

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
  // 新增设置
  foldingEnabled?: boolean;
  linkDetection?: boolean;
  hoverEnabled?: boolean;
  schemaValidation?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
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
  getSelection: () => monaco.Selection | null;
  getSelectedText: () => string;
  insertText: (text: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  focus: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor;
  getMonaco: () => typeof monaco;
  // 新增方法
  toggleFolding?: () => void;
  showDiffEditor?: (originalContent: string) => void;
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
  theme?: 'light' | 'dark';
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

// Monaco配置选项接口
export interface MonacoConfigOptions {
  theme: 'light' | 'dark';
  minimap: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  indentSize: 2 | 4;
  indentType: 'spaces' | 'tabs';
  foldingEnabled?: boolean;
  linkDetection?: boolean;
  hoverEnabled?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
}

// JSON Schema接口
export interface JsonSchemaConfig {
  uri: string;
  fileMatch?: string[];
  schema: any;
}

// Utility types
export type Theme = 'light' | 'dark';
export type IndentType = 'spaces' | 'tabs';
export type IndentSize = 2 | 4;
export type ErrorSeverity = 'error' | 'warning';