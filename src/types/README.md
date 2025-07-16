# Type Definitions

This directory contains all TypeScript type definitions for the JSON Editor application.

## Files

- `editor.types.ts` - Core editor interfaces and types
- `index.ts` - Re-exports and utility types
- `__tests__/` - Comprehensive unit tests for all type definitions

## Core Types

### EditorState
The main state interface for the editor component.

```typescript
interface EditorState {
  content: string;           // Current JSON content
  isValid: boolean;          // Whether JSON is valid
  errors: JsonError[];       // Validation errors
  isDirty: boolean;          // Whether content has unsaved changes
  currentFile: FileInfo | null; // Currently loaded file
  theme: 'light' | 'dark';   // UI theme
  settings: EditorSettings;   // Editor configuration
}
```

### JsonError
Represents a JSON validation error.

```typescript
interface JsonError {
  line: number;              // Line number (1-based)
  column: number;            // Column number (1-based)
  message: string;           // Error description
  severity: 'error' | 'warning'; // Error severity
}
```

### FileInfo
Information about a loaded file.

```typescript
interface FileInfo {
  name: string;              // File name
  size: number;              // File size in bytes
  lastModified: Date;        // Last modification date
  content: string;           // File content
}
```

### EditorSettings
Configuration options for the editor.

```typescript
interface EditorSettings {
  indentSize: 2 | 4;         // Indentation size
  indentType: 'spaces' | 'tabs'; // Indentation type
  wordWrap: boolean;         // Enable word wrapping
  lineNumbers: boolean;      // Show line numbers
  minimap: boolean;          // Show minimap
}
```

## State Management Types

### AppState
Global application state structure.

```typescript
interface AppState {
  editor: EditorState;       // Editor state
  ui: {                      // UI state
    showSearchPanel: boolean;
    showSettings: boolean;
    sidebarCollapsed: boolean;
  };
  recent: FileInfo[];        // Recently opened files
}
```

### EditorAction
Union type for all possible state actions.

```typescript
type EditorAction =
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
```

## Component Props Types

### MonacoEditorProps
Props for the Monaco Editor wrapper component.

```typescript
interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (errors: JsonError[]) => void;
  theme: 'light' | 'dark';
  settings: EditorSettings;
}
```

### EditorToolbarProps
Props for the editor toolbar component.

```typescript
interface EditorToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onToggleSearch: () => void;
  isValid: boolean;
  isDirty: boolean;
}
```

## Utility Types

### Optional<T, K>
Makes specified fields optional in a type.

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Usage example:
type PartialSettings = Optional<EditorSettings, 'minimap' | 'wordWrap'>;
```

### RequiredFields<T, K>
Makes specified optional fields required.

```typescript
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Usage example:
type RequiredFileInfo = RequiredFields<Partial<FileInfo>, 'name' | 'content'>;
```

## Result Types

### ValidationResult
Result of JSON validation operation.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: JsonError[];
}
```

### FormatResult
Result of JSON formatting operation.

```typescript
interface FormatResult {
  success: boolean;
  content?: string;
  error?: string;
}
```

### FileOperationResult
Result of file operations (open, save, etc.).

```typescript
interface FileOperationResult {
  success: boolean;
  file?: FileInfo;
  error?: string;
}
```

## Usage Examples

### Creating Editor State
```typescript
import { EditorState, EditorSettings } from './types';

const initialSettings: EditorSettings = {
  indentSize: 2,
  indentType: 'spaces',
  wordWrap: true,
  lineNumbers: true,
  minimap: false,
};

const initialState: EditorState = {
  content: '',
  isValid: true,
  errors: [],
  isDirty: false,
  currentFile: null,
  theme: 'light',
  settings: initialSettings,
};
```

### Handling Actions
```typescript
import { EditorAction } from './types';

function handleAction(action: EditorAction) {
  switch (action.type) {
    case 'SET_CONTENT':
      // action.payload is string
      console.log('New content:', action.payload);
      break;
    case 'SET_VALIDATION_ERRORS':
      // action.payload is JsonError[]
      console.log('Errors:', action.payload);
      break;
    case 'TOGGLE_SEARCH_PANEL':
      // No payload for toggle actions
      console.log('Toggling search panel');
      break;
  }
}
```

## Testing

All types are thoroughly tested with unit tests covering:

- Type structure validation
- Constraint enforcement
- Type discrimination for union types
- Complex type interactions
- Edge cases and error scenarios

Run tests with:
```bash
npm run test:run
```

## Type Safety

All types are designed with strict TypeScript settings to ensure:

- No implicit any types
- Strict null checks
- Proper type discrimination
- Compile-time error detection
- IntelliSense support in IDEs