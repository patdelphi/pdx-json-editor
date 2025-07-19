import { useState, useCallback, useEffect } from 'preact/hooks';
import { JsonEditor } from './JsonEditor';
import { EditorToolbar } from './EditorToolbar';
import { StatusBar } from './StatusBar';
import { useTheme } from '../../hooks/useTheme';
import { useJsonValidation } from '../../hooks/useJsonValidation';
import type { MonacoTheme } from '../../types/editor.types';

const DEFAULT_JSON = `{
  "name": "example",
  "version": "1.0.0",
  "description": "A sample JSON file",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "First item",
        "active": true
      },
      {
        "id": 2,
        "title": "Second item",
        "active": false
      }
    ],
    "metadata": {
      "created": "2024-01-01T00:00:00Z",
      "updated": "2024-01-01T12:00:00Z"
    }
  }
}`;

export function EditorContainer() {
  const [content, setContent] = useState(DEFAULT_JSON);
  const [cursorPosition] = useState({ line: 1, column: 1 });

  
  const { theme } = useTheme();
  const { errors, isValid, validate } = useJsonValidation();
  
  const getMonacoTheme = (): MonacoTheme => {
    return theme === 'dark' ? 'vs-dark' : 'vs';
  };

  // Monaco theme is handled by JsonEditor component directly

  // Validate JSON on content change
  useEffect(() => {
    validate(content);
  }, [content, validate]);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
    } catch (error) {
      // If JSON is invalid, show error but don't change content
      console.warn('Cannot format invalid JSON:', error);
    }
  }, [content]);

  const handleValidate = useCallback(() => {
    const validationErrors = validate(content);
    if (validationErrors.length === 0) {
      // Could show a success toast here
      console.log('JSON is valid!');
    } else {
      // Could show error details here
      console.log('JSON validation errors:', validationErrors);
    }
  }, [content, validate]);



  const fileSize = new Blob([content]).size;
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <div className="editor-container flex flex-col h-full w-full max-w-full overflow-hidden">
      <EditorToolbar
        onFormat={handleFormat}
        onValidate={handleValidate}
        isValid={isValid}
      />
      
      <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden">
        <JsonEditor
          value={content}
          onChange={handleContentChange}
          theme={getMonacoTheme()}
        />
      </div>
      
      <StatusBar
        line={cursorPosition.line}
        column={cursorPosition.column}
        fileSize={fileSize}
        errorCount={errorCount}
        warningCount={warningCount}
      />
    </div>
  );
}