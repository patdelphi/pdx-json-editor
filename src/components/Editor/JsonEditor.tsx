import { useRef, useEffect } from 'preact/hooks';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { MonacoTheme } from '../../types/editor.types';
import { monacoThemeManager } from '../../utils/monaco-theme';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  theme: MonacoTheme;
  readOnly?: boolean;
  height?: string;
}

export function JsonEditor({ 
  value, 
  onChange, 
  theme, 
  readOnly = false,
  height = '100%' 
}: JsonEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Register Monaco instance and editor with theme manager
    monacoThemeManager.setMonaco(monaco);
    monacoThemeManager.addEditor(editor);
    
    // Set initial theme
    monacoThemeManager.setTheme(theme);
    
    // Configure JSON language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });

    // Configure editor options
    editor.updateOptions({
      // Basic settings
      automaticLayout: true,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      
      // Code folding
      folding: true,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      showFoldingControls: 'always',
      
      // Smart editing
      autoClosingBrackets: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: false,
      
      // Search and find
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always'
      },
      
      // Accessibility
      accessibilitySupport: 'auto',
      
      // Appearance
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      roundedSelection: true,
      
      // Performance
      largeFileOptimizations: true,
    });

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange: OnChange = (value) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  // Cleanup editor from theme manager on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        monacoThemeManager.removeEditor(editorRef.current);
      }
    };
  }, []);

  // Handle window resize to ensure editor layout updates
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="monaco-editor-container w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
}