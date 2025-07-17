import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { MonacoEditorProps, EditorMethods } from '../../types/editor.types';

const JsonEditor = forwardRef<EditorMethods, MonacoEditorProps>(({
  value,
  onChange,
  onValidationChange,
  onCursorPositionChange,
  onSelectionChange,
  theme,
  settings
}, ref) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Editor methods that can be called from parent components
  const formatDocument = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('editor', 'editor.action.formatDocument', {});
    }
  }, []);

  const undo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('editor', 'undo', {});
    }
  }, []);

  const redo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('editor', 'redo', {});
    }
  }, []);

  const selectAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('editor', 'editor.action.selectAll', {});
    }
  }, []);

  const find = useCallback(() => {
    if (editorRef.current) {
      try {
        // 确保编辑器获得焦点
        editorRef.current.focus();
        
        // 使用Monaco编辑器的内置命令
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        
        // 方法1: 使用actions.find命令ID (这是Monaco推荐的方式)
        try {
          editor.trigger('keyboard', 'actions.find', null);
          return;
        } catch (e) {
          console.log('Method 1 failed:', e);
        }
        
        // 方法2: 使用editor.action.startFindAction命令ID (备用方式)
        try {
          editor.trigger('keyboard', 'editor.action.startFindAction', null);
          return;
        } catch (e) {
          console.log('Method 2 failed:', e);
        }
        
        // 方法3: 使用编辑器的内置操作
        try {
          // Use getAction for specific actions instead of getActions
          const actions = [];
          const findAction1 = (editor as any).getAction('actions.find');
          const findAction2 = (editor as any).getAction('editor.action.startFindAction');
          if (findAction1) actions.push(findAction1);
          if (findAction2) actions.push(findAction2);
          
          // Try to find any action with 'find' in its ID
          const findAction = actions.find((a: { id: string; run: () => void }) => 
            a.id === 'actions.find' || 
            a.id === 'editor.action.startFindAction' ||
            a.id.toLowerCase().includes('find')
          );
          if (findAction) {
            findAction.run();
            return;
          }
        } catch (e) {
          console.log('Method 3 failed:', e);
        }
        
        // 方法4: 使用Monaco的键盘命令
        try {
          if (monaco) {
            editor.trigger('keyboard', monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, null);
            return;
          }
        } catch (e) {
          console.log('Method 4 failed:', e);
        }
        
        // 方法5: 使用浏览器的原生搜索 (最后的备选方案)
        try {
          // Use window.find as a fallback, but need to declare it properly for TypeScript
          (window as any).find();
        } catch (e) {
          console.log('Method 5 failed:', e);
        }
      } catch (error) {
        console.error('Error in find function:', error);
      }
    }
  }, []);

  const replace = useCallback(() => {
    if (editorRef.current) {
      try {
        // 确保编辑器获得焦点
        editorRef.current.focus();
        
        // 使用Monaco编辑器的内置命令
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        
        // 方法1: 使用editor.action.startFindReplaceAction命令ID (主要方式)
        try {
          editor.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
          return;
        } catch (e) {
          console.log('Method 1 failed:', e);
        }
        
        // 方法2: 使用actions.findWithReplace命令ID (备用方式)
        try {
          editor.trigger('keyboard', 'actions.findWithReplace', null);
          return;
        } catch (e) {
          console.log('Method 2 failed:', e);
        }
        
        // 方法3: 使用编辑器的内置操作
        try {
          // Use getAction for specific actions instead of getActions
          const actions = [];
          const replaceAction1 = (editor as any).getAction('editor.action.startFindReplaceAction');
          const replaceAction2 = (editor as any).getAction('actions.findWithReplace');
          if (replaceAction1) actions.push(replaceAction1);
          if (replaceAction2) actions.push(replaceAction2);
          
          // Try to find any action with 'replace' in its ID
          const replaceAction = actions.find((a: { id: string; run: () => void }) => 
            a.id === 'editor.action.startFindReplaceAction' || 
            a.id === 'actions.findWithReplace' ||
            a.id.toLowerCase().includes('replace')
          );
          if (replaceAction) {
            replaceAction.run();
            return;
          }
        } catch (e) {
          console.log('Method 3 failed:', e);
        }
        
        // 方法4: 使用Monaco的键盘命令
        try {
          if (monaco) {
            editor.trigger('keyboard', monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, null);
            return;
          }
        } catch (e) {
          console.log('Method 4 failed:', e);
        }
      } catch (error) {
        console.error('Error in replace function:', error);
      }
    }
  }, []);

  const gotoLine = useCallback((line: number, column?: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: column || 1 });
      editorRef.current.focus();
    }
  }, []);

  const getSelection = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getSelection();
    }
    return null;
  }, []);

  const getSelectedText = useCallback(() => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const model = editorRef.current.getModel();
      if (selection && model) {
        return model.getValueInRange(selection);
      }
    }
    return '';
  }, []);

  const insertText = useCallback((text: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const range = selection || new monacoRef.current.Range(1, 1, 1, 1);
      editorRef.current.executeEdits('insert-text', [{
        range,
        text,
        forceMoveMarkers: true
      }]);
    }
  }, []);

  const canUndo = useCallback(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      return model ? model.canUndo() : false;
    }
    return false;
  }, []);

  const canRedo = useCallback(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      return model ? model.canRedo() : false;
    }
    return false;
  }, []);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    formatDocument,
    undo,
    redo,
    selectAll,
    find,
    replace,
    gotoLine,
    getSelection,
    getSelectedText,
    insertText,
    canUndo,
    canRedo,
    focus: () => editorRef.current?.focus(),
    getEditor: () => editorRef.current,
    getMonaco: () => monacoRef.current
  }), [formatDocument, undo, redo, selectAll, find, replace, gotoLine, getSelection, getSelectedText, insertText, canUndo, canRedo]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // 配置搜索控件，防止自动关闭
    editor.updateOptions({
      find: {
        addExtraSpaceOnTop: true,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
        loop: true
        // Removed closeOnFocusLost as it's not in IEditorFindOptions
      }
    });
    
    // Configure JSON language settings with enhanced validation
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
      schemaValidation: 'error',
      schemaRequest: 'error'
    });

    // Enhanced bracket matching configuration
    monaco.languages.setLanguageConfiguration('json', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['"', '"']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '"', close: '"', notIn: ['string'] }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '"', close: '"' }
      ]
    });

    // 添加搜索窗口状态监听器
    const findController = editor.getContribution('editor.contrib.findController') as any;
    if (findController && typeof findController.getState === 'function') {
      // 监听搜索控制器状态变化
      editor.onDidBlurEditorWidget(() => {
        // 当编辑器失去焦点时，尝试保持搜索窗口打开
        setTimeout(() => {
          try {
            const state = findController.getState();
            if (state && state.isRevealed) {
              // 如果搜索窗口已经打开，尝试保持它打开
              findController.focus && findController.focus();
            }
          } catch (e) {
            console.log('Error keeping find widget open:', e);
          }
        }, 100);
      });
    }

    // Add keyboard shortcut for search (Ctrl+F)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      // This will open the search widget
      // Use getAction for each action ID instead of getActions
      const actions = [];
      const findAction1 = editor.getAction('actions.find');
      const findAction2 = editor.getAction('editor.action.startFindAction');
      if (findAction1) actions.push(findAction1);
      if (findAction2) actions.push(findAction2);
      
      // Try to find the search action
      const findAction = actions.find((a: { id: string; run: () => void }) => 
        a.id === 'actions.find' || 
        a.id === 'editor.action.startFindAction'
      );
      
      if (findAction) {
        findAction.run();
      } else {
        // Fallback to trigger method
        editor.trigger('keyboard', 'actions.find', null);
      }
    });
    
    // Add keyboard shortcut for replace (Ctrl+H)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      // This will open the replace widget
      // Use getAction for each action ID instead of getActions
      const actions = [];
      const replaceAction1 = editor.getAction('editor.action.startFindReplaceAction');
      const replaceAction2 = editor.getAction('actions.findWithReplace');
      if (replaceAction1) actions.push(replaceAction1);
      if (replaceAction2) actions.push(replaceAction2);
      
      // Try to find the replace action
      const replaceAction = actions.find((a: { id: string; run: () => void }) => 
        a.id === 'editor.action.startFindReplaceAction'
      );
      
      if (replaceAction) {
        replaceAction.run();
      } else {
        // Fallback to trigger method
        editor.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
      }
    });
    
    const model = editor.getModel();
    if (model) {
      // Set up validation change listener with enhanced error reporting
      const markersDisposable = monaco.editor.onDidChangeMarkers((uris) => {
        const editorUri = model.uri;
        if (uris.find(uri => uri.toString() === editorUri.toString())) {
          const markers = monaco.editor.getModelMarkers({ resource: editorUri });
          const errors = markers.map(marker => ({
            line: marker.startLineNumber,
            column: marker.startColumn,
            message: marker.message,
            severity: marker.severity === monaco.MarkerSeverity.Error ? 'error' as const : 'warning' as const
          }));
          onValidationChange(errors);
        }
      });

      // Set up cursor position change listener
      const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
        if (onCursorPositionChange) {
          onCursorPositionChange({
            line: e.position.lineNumber,
            column: e.position.column
          });
        }
      });

      // Set up selection change listener
      const selectionDisposable = editor.onDidChangeCursorSelection((e) => {
        if (onSelectionChange) {
          onSelectionChange({
            startLine: e.selection.startLineNumber,
            startColumn: e.selection.startColumn,
            endLine: e.selection.endLineNumber,
            endColumn: e.selection.endColumn
          });
        }
      });

      // Set up content change listener for undo/redo state
      const contentDisposable = model.onDidChangeContent(() => {
        // This will trigger validation automatically
        // Additional logic can be added here for undo/redo state tracking
      });

      // Enhanced keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
        // Duplicate line
        editor.trigger('keyboard', 'editor.action.copyLinesDownAction', {});
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
        // Delete line
        editor.trigger('keyboard', 'editor.action.deleteLines', {});
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
        // Toggle line comment (though JSON doesn't support comments, this is for future extensibility)
        editor.trigger('keyboard', 'editor.action.commentLine', {});
      });

      // Clean up on unmount
      return () => {
        markersDisposable.dispose();
        cursorDisposable.dispose();
        selectionDisposable.dispose();
        contentDisposable.dispose();
      };
    }
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        tabSize: settings.indentSize,
        insertSpaces: settings.indentType === 'spaces',
        wordWrap: settings.wordWrap ? 'on' : 'off',
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
        minimap: { enabled: settings.minimap }
      });
    }
  }, [settings]);

  const editorOptions: any = {
    language: 'json',
    theme: theme === 'dark' ? 'vs-dark' : 'vs',
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    tabSize: settings.indentSize,
    insertSpaces: settings.indentType === 'spaces',
    wordWrap: settings.wordWrap ? 'on' : 'off',
    lineNumbers: settings.lineNumbers ? 'on' : 'off',
    minimap: { enabled: settings.minimap },
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    
    // Enhanced bracket and matching features
    bracketPairColorization: { enabled: true },
    matchBrackets: 'always',
    showFoldingControls: 'always',
    foldingStrategy: 'indentation',
    foldingHighlight: true,
    
    // Enhanced auto-completion and suggestions
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoClosingDelete: 'always',
    autoClosingOvertype: 'always',
    autoSurround: 'languageDefined',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    
    // Enhanced IntelliSense
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showIssues: true,
      showUsers: true,
      insertMode: 'insert',
      filterGraceful: true,
      snippetsPreventQuickSuggestions: false
    },
    
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true
    },
    
    // Enhanced editing features
    multiCursorModifier: 'ctrlCmd',
    multiCursorMergeOverlapping: true,
    multiCursorPaste: 'spread',
    
    // Find and replace enhancements
    find: {
      addExtraSpaceOnTop: true,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'always',
      loop: true
      // Removed closeOnFocusLost as it's not in IEditorFindOptions
    },
    
    // Enhanced error and warning display
    renderValidationDecorations: 'on',
    renderLineHighlight: 'all',
    renderLineHighlightOnlyWhenFocus: false,
    
    // Undo/Redo enhancements
    undoStopOnWordBoundary: true,
    
    // Performance optimizations
    largeFileOptimizations: true,
    
    // Accessibility features
    accessibilitySupport: 'auto',
    ariaLabel: 'PDX JSON Editor',
    
    // Selection and cursor enhancements
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    cursorWidth: 2,
    
    // Scrolling enhancements
    smoothScrolling: true,
    mouseWheelScrollSensitivity: 1,
    fastScrollSensitivity: 5
  };

  return (
    <div className="w-full h-full">
      <Editor
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
});

export default JsonEditor;