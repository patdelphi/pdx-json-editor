import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type {
  MonacoEditorProps,
  EditorMethods,
} from '../../types/editor.types';
import { applyEditorOptions, registerJsonSchema } from '../../utils/monacoConfig';
import FoldingControls from './FoldingControls';
import SchemaSelector from './SchemaSelector';
import DiffEditor from './DiffEditor';
import { JsonSchemaConfig } from '../../types/editor.types';
import useEditorLayout from '../../hooks/useEditorLayout';

const JsonEditor = forwardRef<EditorMethods, MonacoEditorProps>(
  (
    {
      value,
      onChange,
      onValidationChange,
      onCursorPositionChange,
      onSelectionChange,
      theme,
      settings,
    },
    ref
  ) => {
    // 编辑器引用
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof monaco | null>(null);
    
    // 差异编辑器状态
    const [showDiff, setShowDiff] = useState(false);
    const [originalContent, setOriginalContent] = useState('');
    
    // 使用布局Hook
    const { forceLayout } = useEditorLayout(editorRef);

    // Editor methods that can be called from parent components
    const formatDocument = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
      }
    }, []);

    const undo = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.getAction('undo')?.run();
      }
    }, []);

    const redo = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.getAction('redo')?.run();
      }
    }, []);

    const selectAll = useCallback(() => {
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.selectAll')?.run();
      }
    }, []);

    const find = useCallback(() => {
      if (editorRef.current) {
        try {
          // 确保编辑器获得焦点
          editorRef.current.focus();
          
          // 使用标准API，按优先级尝试不同的操作
          const actions = [
            'actions.find',
            'editor.action.startFindAction'
          ];
          
          for (const actionId of actions) {
            const action = editorRef.current.getAction(actionId);
            if (action) {
              action.run();
              return;
            }
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
          
          // 使用标准API，按优先级尝试不同的操作
          const actions = [
            'editor.action.startFindReplaceAction',
            'actions.findWithReplace'
          ];
          
          for (const actionId of actions) {
            const action = editorRef.current.getAction(actionId);
            if (action) {
              action.run();
              return;
            }
          }
        } catch (error) {
          console.error('Error in replace function:', error);
        }
      }
    }, []);

    const gotoLine = useCallback((line: number, column?: number) => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(line);
        editorRef.current.setPosition({
          lineNumber: line,
          column: column || 1,
        });
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
      if (editorRef.current && monacoRef.current) {
        const selection = editorRef.current.getSelection();
        const range = selection || new monacoRef.current.Range(1, 1, 1, 1);
        editorRef.current.executeEdits('insert-text', [
          {
            range,
            text,
            forceMoveMarkers: true,
          },
        ]);
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

    // 新增：代码折叠功能
    const toggleFolding = useCallback(() => {
      if (editorRef.current) {
        const foldAction = editorRef.current.getAction('editor.foldAll');
        const unfoldAction = editorRef.current.getAction('editor.unfoldAll');
        
        if (foldAction && unfoldAction) {
          // 检查当前折叠状态并执行相反操作
          const model = editorRef.current.getModel();
          if (model) {
            const foldingRanges = (model as any).foldingRanges;
            const hasFoldedRanges = foldingRanges && foldingRanges.some((r: any) => r.isCollapsed);
            
            if (hasFoldedRanges) {
              unfoldAction.run();
            } else {
              foldAction.run();
            }
          }
        }
      }
    }, []);
    
    // 新增：显示差异编辑器
    const showDiffEditor = useCallback((originalContent: string) => {
      setOriginalContent(originalContent);
      setShowDiff(true);
    }, []);

    // Expose methods to parent components
    useImperativeHandle(
      ref,
      () => ({
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
        toggleFolding,
        showDiffEditor,
        focus: () => editorRef.current?.focus(),
        getEditor: () => editorRef.current!,
        getMonaco: () => monacoRef.current!,
      }),
      [
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
        toggleFolding,
        showDiffEditor,
      ]
    );

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      
      // 触发一个自定义事件，通知 Monaco 已加载
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('monaco-ready'));
      }

      // 应用编辑器选项
      applyEditorOptions(editor, {
        theme: theme,
        minimap: settings.minimap,
        wordWrap: settings.wordWrap,
        lineNumbers: settings.lineNumbers,
        indentSize: settings.indentSize,
        indentType: settings.indentType,
      });

      // 配置JSON语言设置 - 基本验证
      // 注意：详细的Schema配置在App.tsx中通过registerJsonSchema处理
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        enableSchemaRequest: true,
        schemaValidation: 'error',
      });

      // 括号匹配配置
      monaco.languages.setLanguageConfiguration('json', {
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['"', '"'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '"', close: '"', notIn: ['string'] },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '"', close: '"' },
        ],
      });

      // 添加搜索窗口状态监听器
      const findController = editor.getContribution(
        'editor.contrib.findController'
      ) as any;
      if (findController && typeof findController.getState === 'function') {
        // 监听搜索控制器状态变化
        const blurDisposable = editor.onDidBlurEditorWidget(() => {
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

      // 添加键盘快捷键，使用标准命令ID
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        // 尝试使用标准API
        const action = editor.getAction('actions.find');
        if (action) {
          action.run();
        } else {
          find();
        }
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
        // 尝试使用标准API
        const action = editor.getAction('editor.action.startFindReplaceAction');
        if (action) {
          action.run();
        } else {
          replace();
        }
      });

      const model = editor.getModel();
      if (model) {
        // 设置验证变更监听器
        const markersDisposable = monaco.editor.onDidChangeMarkers((uris) => {
          const editorUri = model.uri;
          if (uris.find((uri) => uri.toString() === editorUri.toString())) {
            const markers = monaco.editor.getModelMarkers({
              resource: editorUri,
            });
            const errors = markers.map((marker) => ({
              line: marker.startLineNumber,
              column: marker.startColumn,
              message: marker.message,
              severity:
                marker.severity === monaco.MarkerSeverity.Error
                  ? ('error' as const)
                  : ('warning' as const),
            }));
            onValidationChange(errors);
          }
        });

        // 设置光标位置变更监听器
        const cursorDisposable = editor.onDidChangeCursorPosition((e) => {
          if (onCursorPositionChange) {
            onCursorPositionChange({
              line: e.position.lineNumber,
              column: e.position.column,
            });
          }
        });

        // 设置选择变更监听器
        const selectionDisposable = editor.onDidChangeCursorSelection((e) => {
          if (onSelectionChange) {
            onSelectionChange({
              startLine: e.selection.startLineNumber,
              startColumn: e.selection.startColumn,
              endLine: e.selection.endLineNumber,
              endColumn: e.selection.endColumn,
            });
          }
        });

        // 设置内容变更监听器
        const contentDisposable = model.onDidChangeContent(() => {
          // 这将自动触发验证
        });

        // 增强的键盘快捷键
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
          // 复制行
          editor.getAction('editor.action.copyLinesDownAction')?.run();
        });

        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK,
          () => {
            // 删除行
            editor.getAction('editor.action.deleteLines')?.run();
          }
        );

        // 清理函数
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

    // 当设置变更时更新编辑器选项
    useEffect(() => {
      if (editorRef.current) {
        applyEditorOptions(editorRef.current, {
          theme: theme,
          minimap: settings.minimap,
          wordWrap: settings.wordWrap,
          lineNumbers: settings.lineNumbers,
          indentSize: settings.indentSize,
          indentType: settings.indentType,
        });
      }
    }, [settings, theme]);
    
    // 布局由useEditorLayout处理，不需要额外的resize监听

    // 编辑器选项
    const editorOptions = {
      language: 'json',
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      tabSize: settings.indentSize,
      insertSpaces: settings.indentType === 'spaces',
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      minimap: { 
        enabled: settings.minimap,
        maxColumn: 120,
        renderCharacters: true,
        showSlider: 'always',
        scale: 1,
        side: 'right',
      },
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',

      // 括号和匹配功能
      bracketPairColorization: { enabled: true },
      matchBrackets: 'always',
      showFoldingControls: 'always',
      foldingStrategy: 'indentation',
      foldingHighlight: true,

      // 自动完成和建议
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoClosingDelete: 'always',
      autoClosingOvertype: 'always',
      autoSurround: 'languageDefined',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,

      // 智能感知
      suggest: {
        showKeywords: true,
        showSnippets: true,
        filterGraceful: true,
        snippetsPreventQuickSuggestions: false,
      },

      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },

      // 编辑功能
      multiCursorModifier: 'ctrlCmd',
      multiCursorMergeOverlapping: true,
      multiCursorPaste: 'spread',

      // 查找和替换
      find: {
        addExtraSpaceOnTop: true,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
        loop: true,
      },

      // 错误和警告显示
      renderValidationDecorations: 'on',
      renderLineHighlight: 'all',

      // 撤销/重做
      undoStopOnWordBoundary: true,

      // 性能优化
      largeFileOptimizations: true,
      stickyScroll: { enabled: true },
      occurrencesHighlight: true,
      renderFinalNewline: true,
      renderValidationDecorations: 'on',

      // 可访问性
      accessibilitySupport: 'auto',
      ariaLabel: 'PDX JSON Editor',

      // 选择和光标
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      cursorStyle: 'line',
      cursorWidth: 2,

      // 滚动
      smoothScrolling: true,
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
    };

    // 处理Schema选择
    const handleSchemaSelect = useCallback((schema: JsonSchemaConfig) => {
      if (monacoRef.current) {
        registerJsonSchema(monacoRef.current, [schema]);
      }
    }, [monacoRef.current]);

    return (
      <div className="w-full h-full relative">
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
          className="monaco-editor-container"
        />
        
        {/* 折叠控制按钮 */}
        <FoldingControls editorRef={ref} theme={theme} />
        
        {/* 工具栏 */}
        <div className="absolute top-2 right-2 z-50 flex space-x-2">
          {/* 差异比较按钮 */}
          <button
            onClick={() => showDiffEditor(value)}
            className={`px-2 py-1 text-xs rounded hover:opacity-100 transition-opacity flex items-center ${
              theme === 'dark'
                ? 'bg-purple-700 text-white opacity-70 hover:bg-purple-600'
                : 'bg-purple-600 text-white opacity-70 hover:bg-purple-500'
            }`}
            title="与当前内容比较"
          >
            <span className="mr-1">🔄</span>
            <span>差异比较</span>
          </button>
          
          {/* Schema选择器 */}
          <SchemaSelector 
            currentFile={null} 
            onSchemaSelect={handleSchemaSelect} 
            theme={theme} 
          />
        </div>
        
        {/* 差异编辑器 */}
        {showDiff && (
          <DiffEditor
            original={originalContent}
            modified={value}
            language="json"
            theme={theme}
            onClose={() => setShowDiff(false)}
          />
        )}
      </div>
    );
  }
);

export default JsonEditor;