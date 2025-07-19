import React, { useRef, useEffect } from 'react';
import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface DiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  theme: 'light' | 'dark';
  onClose: () => void;
}

/**
 * 差异编辑器组件
 */
const DiffEditor: React.FC<DiffEditorProps> = ({
  original,
  modified,
  language = 'json',
  theme,
  onClose
}) => {
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneDiffEditor) => {
    diffEditorRef.current = editor;
    
    // 配置编辑器选项
    editor.updateOptions({
      renderSideBySide: true,
      enableSplitViewResizing: true,
      originalEditable: false,
      readOnly: false,
      folding: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      contextmenu: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    });
    
    // 聚焦编辑器
    editor.focus();
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC键关闭差异编辑器
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 shadow-lg">
      {/* 差异编辑器头部 */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          差异比较
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            关闭
          </button>
        </div>
      </div>
      
      {/* 差异编辑器内容 */}
      <div className="flex-1 overflow-hidden">
        <MonacoDiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={{
            renderSideBySide: true,
            enableSplitViewResizing: true,
            originalEditable: false,
            readOnly: false,
          }}
        />
      </div>
      
      {/* 差异编辑器底部 */}
      <div className={`flex items-center justify-between p-2 border-t ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          左侧: 原始内容 | 右侧: 修改后内容
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (diffEditorRef.current) {
                const nextDiff = diffEditorRef.current.getAction('editor.action.diffReview.next');
                nextDiff?.run();
              }
            }}
            className={`px-3 py-1 rounded ${
              theme === 'dark'
                ? 'bg-blue-700 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            下一个差异
          </button>
          <button
            onClick={() => {
              if (diffEditorRef.current) {
                const prevDiff = diffEditorRef.current.getAction('editor.action.diffReview.prev');
                prevDiff?.run();
              }
            }}
            className={`px-3 py-1 rounded ${
              theme === 'dark'
                ? 'bg-blue-700 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            上一个差异
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffEditor;