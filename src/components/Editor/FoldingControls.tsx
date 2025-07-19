import React from 'react';
import { EditorMethods } from '../../types/editor.types';

interface FoldingControlsProps {
  editorRef: React.RefObject<EditorMethods>;
  theme: 'light' | 'dark';
}

/**
 * 代码折叠控制组件
 */
const FoldingControls: React.FC<FoldingControlsProps> = ({ editorRef, theme }) => {
  const handleFoldAll = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      editor.getAction('editor.foldAll')?.run();
    }
  };

  const handleUnfoldAll = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      editor.getAction('editor.unfoldAll')?.run();
    }
  };

  const handleToggleFolding = () => {
    if (editorRef.current && editorRef.current.toggleFolding) {
      editorRef.current.toggleFolding();
    }
  };

  return (
    <div className="absolute top-2 left-2 z-50 flex space-x-2">
      <button
        onClick={handleFoldAll}
        className={`px-2 py-1 text-xs rounded hover:opacity-100 transition-opacity flex items-center ${
          theme === 'dark'
            ? 'bg-gray-700 text-gray-200 opacity-70 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 opacity-70 hover:bg-gray-300'
        }`}
        title="折叠所有代码"
      >
        <span className="mr-1">📑</span>
        <span>折叠全部</span>
      </button>
      <button
        onClick={handleUnfoldAll}
        className={`px-2 py-1 text-xs rounded hover:opacity-100 transition-opacity flex items-center ${
          theme === 'dark'
            ? 'bg-gray-700 text-gray-200 opacity-70 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 opacity-70 hover:bg-gray-300'
        }`}
        title="展开所有代码"
      >
        <span className="mr-1">📖</span>
        <span>展开全部</span>
      </button>
      <button
        onClick={handleToggleFolding}
        className={`px-2 py-1 text-xs rounded hover:opacity-100 transition-opacity flex items-center ${
          theme === 'dark'
            ? 'bg-blue-700 text-white opacity-70 hover:bg-blue-600'
            : 'bg-blue-600 text-white opacity-70 hover:bg-blue-500'
        }`}
        title="切换折叠状态"
      >
        <span className="mr-1">📎</span>
        <span>切换折叠</span>
      </button>
    </div>
  );
};

export default FoldingControls;