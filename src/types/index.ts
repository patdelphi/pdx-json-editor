// Re-export all types from editor.types.ts
export * from './editor.types';

// Additional utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event handler types
export type EventHandler<T = void> = () => T;
export type EventHandlerWithPayload<P, T = void> = (payload: P) => T;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// File operation result types
export interface FileOperationResult {
  success: boolean;
  file?: import('./editor.types').FileInfo;
  error?: string;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: import('./editor.types').JsonError[];
}

// Format operation result
export interface FormatResult {
  success: boolean;
  content?: string;
  error?: string;
}
