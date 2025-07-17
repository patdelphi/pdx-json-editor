// Application constants
export const APP_NAME = 'PDX JSON Editor';
export const APP_VERSION = '1.0.0';

// Default editor settings
export const DEFAULT_EDITOR_SETTINGS = {
  indentSize: 2 as const,
  indentType: 'spaces' as const,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,
};

// Default theme
export const DEFAULT_THEME = 'light' as const;

// Local storage keys
export const STORAGE_KEYS = {
  EDITOR_SETTINGS: 'json-editor-settings',
  THEME: 'json-editor-theme',
  RECENT_FILES: 'json-editor-recent-files',
  LAST_CONTENT: 'json-editor-last-content',
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  WARNING_SIZE: 1024 * 1024, // 1MB
} as const;

// Validation settings
export const VALIDATION_SETTINGS = {
  DEBOUNCE_DELAY: 300, // ms
  MAX_ERRORS_DISPLAY: 100,
} as const;

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 250,
  TOOLBAR_HEIGHT: 48,
  STATUS_BAR_HEIGHT: 24,
} as const;
