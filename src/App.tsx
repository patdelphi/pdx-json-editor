import { useState, useRef } from 'react';
import './App.css';
import JsonEditor from './components/Editor/JsonEditor';
import { SettingsPanel } from './components/Settings';
import { FileOperations, FileDropZone } from './components/FileManager';
import { SearchPanel } from './components/SearchReplace';
import { ErrorBoundary, ToastContainer, Modal } from './components/UI';
// import { ErrorService } from './services/errorService';
import useToast from './hooks/useToast';
import useModal from './hooks/useModal';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import type {
  EditorSettings,
  JsonError,
  FileInfo,
  EditorMethods,
} from './types/editor.types';

// 开发环境下加载测试脚本
if (process.env.NODE_ENV === 'development') {
  // Use a more direct approach to avoid TypeScript errors with dynamic imports
  const importModalTest = async () => {
    try {
      // @ts-ignore - Ignore TypeScript error for this development-only import
      await import('./test/modalTest');
    } catch (error) {
      console.error('Error loading modalTest:', error);
    }
  };
  importModalTest();
}

function App() {
  const [content, setContent] = useState(
    '{\n  "example": "JSON content",\n  "number": 42,\n  "boolean": true\n}'
  );
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState({
    startLine: 1,
    startColumn: 1,
    endLine: 1,
    endColumn: 1,
  });
  const [showSettings, setShowSettings] = useState(false);
  // We still keep this state for the fallback search panel, but it's rarely used now
  // const [showSearch, setShowSearch] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [originalContent, setOriginalContent] = useState(
    '{\n  "example": "JSON content",\n  "number": 42,\n  "boolean": true\n}'
  );
  // 移除自定义搜索状态，使用Monaco内置搜索功能

  const editorRef = useRef<EditorMethods>(null);
  const { toasts, removeToast } = useToast();
  const {
    isOpen,
    options,
    closeModal,
    showError,
    showSuccess: showModalSuccess,
    showWarning,
    showConfirm,
  } = useModal();

  // 移除useEffect，改为直接在导航函数中处理

  const [settings, setSettings] = useState<EditorSettings>({
    indentSize: 2,
    indentType: 'spaces',
    wordWrap: false,
    lineNumbers: true,
    minimap: true,
  });

  const handleContentChange = (value: string) => {
    handleContentChangeWithDirty(value);
  };

  const handleValidationChange = (validationErrors: JsonError[]) => {
    setErrors(validationErrors);
  };

  const handleCursorPositionChange = (position: {
    line: number;
    column: number;
  }) => {
    setCursorPosition(position);
  };

  const handleSelectionChange = (sel: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  }) => {
    setSelection(sel);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // File operations handlers
  const handleFileOpen = (file: FileInfo) => {
    if (isDirty) {
      showConfirm(
        '未保存的更改',
        '您有未保存的更改。是否要放弃这些更改？',
        () => {
          setCurrentFile(file);
          setContent(file.content);
          setOriginalContent(file.content);
          setIsDirty(false);
        }
      );
      return;
    }

    setCurrentFile(file);
    setContent(file.content);
    setOriginalContent(file.content);
    setIsDirty(false);
  };

  const handleFileSave = () => {
    const filename = currentFile?.name || 'untitled.json';
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setOriginalContent(content);
    setIsDirty(false);
    showModalSuccess('文件已保存', `成功保存文件 ${filename}`);
  };

  const handleFileNew = () => {
    if (isDirty) {
      showConfirm(
        '未保存的更改',
        '您有未保存的更改。是否要放弃这些更改？',
        () => {
          const newContent = '{\n  \n}';
          setCurrentFile(null);
          setContent(newContent);
          setOriginalContent(newContent);
          setIsDirty(false);
        }
      );
      return;
    }

    const newContent = '{\n  \n}';
    setCurrentFile(null);
    setContent(newContent);
    setOriginalContent(newContent);
    setIsDirty(false);
  };

  const handleFileError = (error: string) => {
    showError('文件错误', error);
  };

  // Track content changes for dirty state
  const handleContentChangeWithDirty = (value: string) => {
    setContent(value);
    setIsDirty(value !== originalContent);
  };

  // Format and minify handlers
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, settings.indentSize);
      setContent(formatted);
      setIsDirty(formatted !== originalContent);
      showModalSuccess('JSON 格式化成功', '您的 JSON 已成功格式化。');
    } catch (error) {
      showError('格式化错误', '无法格式化无效的 JSON。请先修复语法错误。');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      setContent(minified);
      setIsDirty(minified !== originalContent);
      showModalSuccess('JSON 压缩成功', '您的 JSON 已成功压缩。');
    } catch (error) {
      showError('压缩错误', '无法压缩无效的 JSON。请先修复语法错误。');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(content);
      showModalSuccess('JSON 验证通过', '您的 JSON 语法有效！');
    } catch (error) {
      showError('JSON 验证失败', `JSON 语法错误: ${(error as Error).message}`);
    }
  };

  // 不再需要自定义装饰器处理，使用Monaco内置的搜索高亮

  // Search and replace handlers
  const toggleSearch = () => {
    // 使用Monaco编辑器内置的搜索功能
    if (editorRef.current) {
      try {
        // 确保编辑器获得焦点
        editorRef.current.focus && editorRef.current.focus();

        // 直接调用编辑器的find方法
        // 确保编辑器已经完全初始化
        setTimeout(() => {
          editorRef.current?.find();
        }, 0);

        return;
      } catch (error) {
        console.error('Error triggering search:', error);
      }
    }

    // 如果Monaco编辑器不可用，回退到原来的搜索面板
    // setShowSearch((prev) => !prev);
  };

  // 添加替换功能触发器
  const toggleReplace = () => {
    if (editorRef.current) {
      try {
        // 确保编辑器获得焦点
        editorRef.current.focus && editorRef.current.focus();

        // 直接调用JsonEditor组件中的replace方法
        // 确保编辑器已经完全初始化
        setTimeout(() => {
          editorRef.current?.replace();
        }, 0);
      } catch (error) {
        console.error('Error triggering replace:', error);
      }
    }
  };

  // 使用Monaco编辑器的搜索功能，但通过自定义搜索面板控制
  const handleSearch = (query: string, options: any) => {
    if (editorRef.current && query.trim()) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        // 获取Monaco的搜索控制器
        const findController = editor.getContribution(
          'editor.contrib.findController'
        ) as any;
        if (findController && typeof findController.getState === 'function') {
          try {
            // 设置搜索选项
            const findState = findController.getState();
            findState.change(
              {
                searchString: query,
                isRegex: options.useRegex,
                matchCase: options.caseSensitive,
                wholeWord: options.wholeWord,
                searchScope: null,
                matchesPosition: null,
                matchesCount: null,
              },
              false
            );

            // 执行搜索
            findController.start({
              forceRevealReplace: false,
              seedSearchStringFromSelection: false,
              seedSearchStringFromGlobalClipboard: false,
              shouldFocus: 0,
              shouldAnimate: true,
              updateSearchScope: false,
              loop: true,
            });
          } catch (e) {
            console.error('Error in custom search:', e);
            // 回退到基本搜索方法
            editor.trigger('keyboard', 'actions.find', {});
          }
        } else {
          // 回退到基本搜索方法
          editor.trigger('keyboard', 'actions.find', {});
        }
      }
    }
  };

  // 使用Monaco编辑器的替换功能，但通过自定义搜索面板控制
  const handleReplace = (
    searchQuery: string,
    replaceText: string,
    options: any
  ) => {
    if (editorRef.current && searchQuery.trim()) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        // 获取Monaco的搜索控制器
        const findController = editor.getContribution(
          'editor.contrib.findController'
        ) as any;
        if (findController && typeof findController.getState === 'function') {
          try {
            // 设置搜索和替换选项
            const findState = findController.getState();
            findState.change(
              {
                searchString: searchQuery,
                replaceString: replaceText,
                isRegex: options.useRegex,
                matchCase: options.caseSensitive,
                wholeWord: options.wholeWord,
                searchScope: null,
                matchesPosition: null,
                matchesCount: null,
              },
              false
            );

            // 执行替换
            findController.replace && findController.replace();
          } catch (e) {
            console.error('Error in custom replace:', e);
            // 回退到基本替换方法
            editor.trigger(
              'keyboard',
              'editor.action.startFindReplaceAction',
              {}
            );
          }
        } else {
          // 回退到基本替换方法
          editor.trigger(
            'keyboard',
            'editor.action.startFindReplaceAction',
            {}
          );
        }
      }
    }
  };

  const handleReplaceAll = (
    searchQuery: string,
    replaceText: string,
    options: any
  ) => {
    if (editorRef.current && searchQuery.trim()) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        // 获取Monaco的搜索控制器
        const findController = editor.getContribution(
          'editor.contrib.findController'
        ) as any;
        if (findController && typeof findController.getState === 'function') {
          try {
            // 设置搜索和替换选项
            const findState = findController.getState();
            findState.change(
              {
                searchString: searchQuery,
                replaceString: replaceText,
                isRegex: options.useRegex,
                matchCase: options.caseSensitive,
                wholeWord: options.wholeWord,
                searchScope: null,
                matchesPosition: null,
                matchesCount: null,
              },
              false
            );

            // 执行全部替换
            findController.replaceAll && findController.replaceAll();
          } catch (e) {
            console.error('Error in custom replace all:', e);
            // 回退到基本替换方法
            editor.trigger(
              'keyboard',
              'editor.action.startFindReplaceAction',
              {}
            );
          }
        } else {
          // 回退到基本替换方法
          editor.trigger(
            'keyboard',
            'editor.action.startFindReplaceAction',
            {}
          );
        }
      }
    }
  };

  const handleFindNext = () => {
    // 使用Monaco编辑器内置的查找下一个功能
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        editor.trigger('keyboard', 'editor.action.nextMatchFindAction', {});
      }
    }
  };

  const handleFindPrevious = () => {
    // 使用Monaco编辑器内置的查找上一个功能
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        editor.trigger('keyboard', 'editor.action.previousMatchFindAction', {});
      }
    }
  };

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: 'n',
      ctrlKey: true,
      action: handleFileNew,
      description: 'Create new file',
    },
    {
      key: 'o',
      ctrlKey: true,
      action: () => {
        // Trigger file input click
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        fileInput?.click();
      },
      description: 'Open file',
    },
    {
      key: 's',
      ctrlKey: true,
      action: handleFileSave,
      description: 'Save file',
    },
    {
      key: 'f',
      ctrlKey: true,
      action: toggleSearch,
      description: 'Find/Search',
    },
    {
      key: 'h',
      ctrlKey: true,
      action: toggleReplace,
      description: 'Find and Replace',
    },
    {
      key: ',',
      ctrlKey: true,
      action: toggleSettings,
      description: 'Open settings',
    },
    {
      key: 'Enter',
      ctrlKey: true,
      shiftKey: true,
      action: handleFormat,
      description: 'Format JSON',
    },
    {
      key: 'Enter',
      ctrlKey: true,
      altKey: true,
      action: handleMinify,
      description: 'Minify JSON',
    },
    {
      key: 'Enter',
      ctrlKey: true,
      action: handleValidate,
      description: 'Validate JSON',
    },
    {
      key: 'd',
      ctrlKey: true,
      action: toggleTheme,
      description: 'Toggle dark/light theme',
    },
  ];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
          <h1 className="text-lg font-semibold">PDX JSON 编辑器</h1>
          <div className="ml-auto flex items-center space-x-2">
            <button className="btn-secondary text-sm" onClick={toggleTheme}>
              {theme === 'light' ? '深色' : '浅色'}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0 relative">
          <div className="flex items-center space-x-2">
            <FileOperations
              onOpen={handleFileOpen}
              onSave={handleFileSave}
              onNew={handleFileNew}
              isDirty={isDirty}
              currentFile={currentFile}
              theme={theme}
            />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button className="btn-secondary text-sm" onClick={handleFormat}>
              格式化
            </button>
            <button className="btn-secondary text-sm" onClick={handleMinify}>
              压缩
            </button>
            <button className="btn-secondary text-sm" onClick={handleValidate}>
              验证
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button className="btn-secondary text-sm" onClick={toggleSettings}>
              设置
            </button>
          </div>

          {/* 固定在工具栏最右侧的搜索面板 */}
          <div className="ml-auto">
            <SearchPanel
              isVisible={true}
              onClose={() => {}}
              onSearch={handleSearch}
              onReplace={handleReplace}
              onReplaceAll={handleReplaceAll}
              onFindNext={handleFindNext}
              onFindPrevious={handleFindPrevious}
              searchResults={[]}
              currentResultIndex={0}
              theme={theme}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Editor Area with File Drop Zone */}
          <div className="flex-1 p-4">
            <FileDropZone
              onFileDrop={handleFileOpen}
              onError={handleFileError}
              theme={theme}
            >
              <div className="editor-container h-full">
                <JsonEditor
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  onValidationChange={handleValidationChange}
                  onCursorPositionChange={handleCursorPositionChange}
                  onSelectionChange={handleSelectionChange}
                  theme={theme}
                  settings={settings}
                />
              </div>
            </FileDropZone>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="h-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
          <span>
            {errors.length === 0 ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ JSON 有效
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                ✗ {errors.length} 个错误
              </span>
            )}
          </span>
          <span className="ml-4">
            行 {cursorPosition.line}, 列 {cursorPosition.column}
          </span>
          {selection.startLine !== selection.endLine ||
          selection.startColumn !== selection.endColumn ? (
            <span className="ml-4">
              (已选择 {Math.abs(selection.endLine - selection.startLine) + 1}{' '}
              行,{' '}
              {selection.startLine === selection.endLine
                ? Math.abs(selection.endColumn - selection.startColumn)
                : '多个'}{' '}
              字符)
            </span>
          ) : null}
          <span className="ml-auto">字符数: {content.length}</span>
        </footer>

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* Toast Notifications */}
        <ToastContainer
          toasts={toasts}
          onRemoveToast={removeToast}
          position="top-right"
        />

        {/* Modal Dialog */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={options.title}
          type={options.type}
          actions={
            options.showCancel ? (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    options.onConfirm?.();
                    closeModal();
                  }}
                >
                  {options.confirmText || '确定'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => {
                    options.onCancel?.();
                    closeModal();
                  }}
                >
                  {options.cancelText || '取消'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  options.onConfirm?.();
                  closeModal();
                }}
              >
                {options.confirmText || '确定'}
              </button>
            )
          }
        >
          <p className="text-gray-700 dark:text-gray-300">{options.message}</p>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

export default App;
