import { useState, useRef, useEffect } from 'react';
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
import { configureMonacoEditor, forceEnableMinimap } from './utils/monacoConfig';
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

// 配置 Monaco Editor
try {
  configureMonacoEditor();
} catch (error) {
  console.error('Error configuring Monaco Editor:', error);
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
  
  // 在编辑器引用可用时强制启用缩略图
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        forceEnableMinimap(editor);
      }
    }
  }, [editorRef.current]);

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
    // 更新设置并确保立即保存到本地存储
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // 确保设置立即保存到本地存储
    try {
      localStorage.setItem('json-editor-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="h-14 bg-gray-800 dark:bg-gray-900 backdrop-blur-sm border-b border-gray-700/50 dark:border-gray-600/50 flex items-center px-6 flex-shrink-0 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">J</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              PDX JSON 编辑器
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white border border-gray-600 hover:border-gray-500 hover:shadow-md" 
              onClick={() => {
                // 手动切换缩略图
                if (editorRef.current) {
                  const editor = editorRef.current.getEditor();
                  if (editor) {
                    const currentOptions = editor.getOptions();
                    const minimapEnabled = currentOptions.get(58)?.enabled;
                    
                    editor.updateOptions({
                      minimap: { 
                        enabled: !minimapEnabled,
                        maxColumn: 120,
                        renderCharacters: true,
                        showSlider: 'always',
                        scale: 1,
                        side: 'right'
                      }
                    });
                    
                    // 更新设置
                    handleSettingsChange({ minimap: !minimapEnabled });
                    
                    // 强制刷新布局
                    setTimeout(() => {
                      editor.layout();
                    }, 100);
                  }
                }
              }}
            >
              <span className="flex items-center space-x-2">
                <span>🗺️</span>
                <span>缩略图</span>
              </span>
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white border border-gray-600 hover:border-gray-500 hover:shadow-md" 
              onClick={toggleTheme}
            >
              <span className="flex items-center space-x-2">
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? '深色' : '浅色'}</span>
              </span>
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 flex items-center px-6 flex-shrink-0 relative shadow-sm">
          <div className="flex items-center space-x-2">
            <FileOperations
              onOpen={handleFileOpen}
              onSave={handleFileSave}
              onNew={handleFileNew}
              isDirty={isDirty}
              currentFile={currentFile}
              theme={theme}
            />
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleFormat}
            >
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>格式化</span>
              </span>
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleMinify}
            >
              <span className="flex items-center space-x-2">
                <span>🗜️</span>
                <span>压缩</span>
              </span>
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleValidate}
            >
              <span className="flex items-center space-x-2">
                <span>✅</span>
                <span>验证</span>
              </span>
            </button>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 dark:hover:from-gray-700/60 dark:hover:to-slate-700/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50 hover:shadow-md hover:scale-105" 
              onClick={toggleSettings}
            >
              <span className="flex items-center space-x-2">
                <span>⚙️</span>
                <span>设置</span>
              </span>
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
        <main className="flex-1 flex overflow-hidden relative bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-900/50 dark:to-slate-900/50">
          {/* Editor Area with File Drop Zone */}
          <div className="flex-1 p-6">
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
        <footer className="h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 flex items-center px-6 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 shadow-sm">
          <div className="flex items-center space-x-1">
            {errors.length === 0 ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-700/50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium">JSON 有效</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-700/50">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-medium">{errors.length} 个错误</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 ml-6">
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md">
              <span className="text-xs">📍</span>
              <span>行 {cursorPosition.line}, 列 {cursorPosition.column}</span>
            </div>
            {selection.startLine !== selection.endLine ||
            selection.startColumn !== selection.endColumn ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md">
                <span className="text-xs">🎯</span>
                <span>
                  已选择 {Math.abs(selection.endLine - selection.startLine) + 1}{' '}
                  行,{' '}
                  {selection.startLine === selection.endLine
                    ? Math.abs(selection.endColumn - selection.startColumn)
                    : '多个'}{' '}
                  字符
                </span>
              </div>
            ) : null}
          </div>
          <div className="ml-auto flex items-center space-x-1 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded-md">
            <span className="text-xs">📝</span>
            <span>字符数: {content.length.toLocaleString()}</span>
          </div>
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
