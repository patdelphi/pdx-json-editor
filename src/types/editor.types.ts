// Editor state interface
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

// Monaco Editor theme type
export type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black';