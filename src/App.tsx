import { useState, useRef, useEffect } from 'react';
import './App.css';
import './styles/editor.css';
import ResponsiveEditor from './components/Editor/ResponsiveEditor';
import { SettingsPanel } from './components/Settings';
import { FileOperations, FileDropZone } from './components/FileManager';
import { SearchPanel, ToolbarSearchPanel } from './components/SearchReplace';
import { ErrorBoundary, ToastContainer, Modal } from './components/UI';
// import { ErrorService } from './services/errorService';
import useToast from './hooks/useToast';
import useModal from './hooks/useModal';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { configureMonaco, registerJsonSchema } from './utils/monacoConfig';
import useMonacoSearch from './hooks/useMonacoSearch';
import { getAllSchemas } from './utils/jsonSchemas';
import { registerAllProviders } from './utils/monacoProviders';
import { 
  isLargeFile, 
  optimizedFormatJson, 
  optimizedMinifyJson,
  LARGE_FILE_WARNING_THRESHOLD,
  LARGE_FILE_ERROR_THRESHOLD
} from './utils/largeFileHandler';
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

// Monaco Editor 配置将在编辑器挂载时进行

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
  
  // 在编辑器挂载时配置Monaco
  useEffect(() => {
    if (editorRef.current && editorRef.current.getMonaco) {
      const monaco = editorRef.current.getMonaco();
      if (monaco) {
        // 配置Monaco编辑器
        configureMonaco(monaco);
        
        // 注册JSON Schema
        registerJsonSchema(monaco, getAllSchemas());
        
        // 注册悬停提示和链接检测提供程序
        const providers = registerAllProviders(monaco);
        
        console.log('Monaco editor configured with JSON schemas and providers');
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
    foldingEnabled: true,
    formatOnPaste: true,
    formatOnType: false,
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
    // 检查文件大小
    if (isLargeFile(file.content, LARGE_FILE_ERROR_THRESHOLD)) {
      showError(
        '文件过大',
        `文件大小超过 ${Math.round(LARGE_FILE_ERROR_THRESHOLD / 1024 / 1024)}MB，可能导致性能问题。请尝试使用其他工具打开此文件。`
      );
      return;
    }
    
    // 检查是否是大文件（但未超过错误阈值）
    if (isLargeFile(file.content, LARGE_FILE_WARNING_THRESHOLD)) {
      showWarning(
        '大文件警告',
        `您正在打开一个大型JSON文件（${Math.round(file.content.length / 1024)}KB），这可能导致性能下降。是否继续？`,
        () => {
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
        }
      );
      return;
    }
    
    // 正常打开文件
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
      // 保存原始内容用于差异比较
      const originalJson = content;
      
      // 检查是否是大文件
      if (isLargeFile(content, LARGE_FILE_WARNING_THRESHOLD)) {
        // 显示警告
        showWarning(
          '大文件警告',
          '您正在格式化一个大型JSON文件，这可能需要一些时间。是否继续？',
          () => {
            try {
              // 使用优化的格式化方法
              const formatted = optimizedFormatJson(content, settings.indentSize);
              setContent(formatted);
              setIsDirty(formatted !== originalContent);
              showModalSuccess('JSON 格式化成功', '大型JSON文件已成功格式化。');
            } catch (error) {
              showError('格式化错误', `无法格式化JSON: ${(error as Error).message}`);
            }
          }
        );
        return;
      }
      
      // 正常格式化
      const formatted = JSON.stringify(JSON.parse(content), null, settings.indentSize);
      setContent(formatted);
      setIsDirty(formatted !== originalContent);
      
      // 如果内容有变化，显示差异比较
      if (formatted !== originalJson && editorRef.current && editorRef.current.showDiffEditor) {
        editorRef.current.showDiffEditor(originalJson);
        showModalSuccess('JSON 格式化成功', '已显示格式化前后的差异比较。');
      } else {
        showModalSuccess('JSON 格式化成功', '您的 JSON 已成功格式化。');
      }
    } catch (error) {
      showError('格式化错误', `无法格式化无效的 JSON: ${(error as Error).message}`);
    }
  };

  const handleMinify = () => {
    try {
      // 保存原始内容用于差异比较
      const originalJson = content;
      
      // 检查是否是大文件
      if (isLargeFile(content, LARGE_FILE_WARNING_THRESHOLD)) {
        // 显示警告
        showWarning(
          '大文件警告',
          '您正在压缩一个大型JSON文件，这可能需要一些时间。是否继续？',
          () => {
            try {
              // 使用优化的压缩方法
              const minified = optimizedMinifyJson(content);
              setContent(minified);
              setIsDirty(minified !== originalContent);
              showModalSuccess('JSON 压缩成功', '大型JSON文件已成功压缩。');
            } catch (error) {
              showError('压缩错误', `无法压缩JSON: ${(error as Error).message}`);
            }
          }
        );
        return;
      }
      
      // 正常压缩
      const minified = JSON.stringify(JSON.parse(content));
      setContent(minified);
      setIsDirty(minified !== originalContent);
      
      // 如果内容有变化，显示差异比较
      if (minified !== originalJson && editorRef.current && editorRef.current.showDiffEditor) {
        editorRef.current.showDiffEditor(originalJson);
        showModalSuccess('JSON 压缩成功', '已显示压缩前后的差异比较。');
      } else {
        showModalSuccess('JSON 压缩成功', '您的 JSON 已成功压缩。');
      }
    } catch (error) {
      showError('压缩错误', `无法压缩无效的 JSON: ${(error as Error).message}`);
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

  // 使用Monaco搜索Hook
  const { search, replace, replaceAll, findNext, findPrevious } = useMonacoSearch();

  // 搜索处理函数
  const handleSearch = (query: string, options: SearchOptions) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      search(editor, query, options);
    }
  };

  // 替换处理函数
  const handleReplace = (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      replace(editor, searchQuery, replaceText, options);
    }
  };

  // 全部替换处理函数
  const handleReplaceAll = (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      replaceAll(editor, searchQuery, replaceText, options);
    }
  };

  // 查找下一个处理函数
  const handleFindNext = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      findNext(editor);
    }
  };

  // 查找上一个处理函数
  const handleFindPrevious = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      findPrevious(editor);
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
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-blue-700 hover:bg-blue-600 text-white hover:text-white border border-blue-600 hover:border-blue-500 hover:shadow-md" 
              onClick={() => {
                // 切换缩略图设置
                handleSettingsChange({ minimap: !settings.minimap });
                showModalSuccess('设置已更新', `缩略图已${!settings.minimap ? '启用' : '禁用'}`);
              }}
            >
              <span className="flex items-center space-x-2">
                <span>🗺️</span>
                <span>{settings.minimap ? '隐藏缩略图' : '显示缩略图'}</span>
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
          <div className="flex items-center">
            <FileOperations
              onOpen={handleFileOpen}
              onSave={handleFileSave}
              onNew={handleFileNew}
              isDirty={isDirty}
              currentFile={currentFile}
              theme={theme}
            />
            
            {/* 添加工具栏搜索面板 */}
            <ToolbarSearchPanel
              isVisible={true}
              onSearch={handleSearch}
              onReplace={handleReplace}
              onReplaceAll={handleReplaceAll}
              onFindNext={handleFindNext}
              onFindPrevious={handleFindPrevious}
              theme={theme}
            />
            
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" style={{ margin: '0 16px' }}></div>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleFormat}
              style={{ marginRight: '16px' }}
            >
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>格式化</span>
              </span>
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleMinify}
              style={{ marginRight: '16px' }}
            >
              <span className="flex items-center space-x-2">
                <span>🗜️</span>
                <span>压缩</span>
              </span>
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 hover:shadow-md hover:scale-105" 
              onClick={handleValidate}
              style={{ marginRight: '16px' }}
            >
              <span className="flex items-center space-x-2">
                <span>✅</span>
                <span>验证</span>
              </span>
            </button>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" style={{ margin: '0 16px' }}></div>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 dark:hover:from-gray-700/60 dark:hover:to-slate-700/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50 hover:shadow-md hover:scale-105" 
              onClick={toggleSettings}
              style={{ marginRight: '16px' }}
            >
              <span className="flex items-center space-x-2">
                <span>⚙️</span>
                <span>设置</span>
              </span>
            </button>
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
              <div className="editor-container h-full force-minimap">
                <ResponsiveEditor
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
