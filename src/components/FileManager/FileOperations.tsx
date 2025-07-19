import React, { useRef } from 'react';
import type { FileInfo } from '../../types/editor.types';

interface FileOperationsProps {
  onOpen: (file: FileInfo) => void;
  onSave: () => void;
  onNew: () => void;
  isDirty: boolean;
  currentFile: FileInfo | null;
  theme: 'light' | 'dark';
  disabled?: boolean;
}

const FileOperations: React.FC<FileOperationsProps> = ({
  onOpen,
  onSave,
  onNew,
  isDirty,
  currentFile,
  theme,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content,
      };
      onOpen(fileInfo);
    } catch (error) {
      console.error('Error reading file:', error);
      // TODO: Show error toast
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleOpenClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleSaveClick = () => {
    if (disabled) return;
    onSave();
  };

  const handleNewClick = () => {
    if (disabled) return;
    onNew();
  };

  const buttonBaseClass = `
    px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2
    ${
      theme === 'dark'
        ? 'bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white border-gray-600/50 hover:border-gray-500'
        : 'bg-white/80 hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-105'}
    border backdrop-blur-sm
  `;

  const primaryButtonClass = `
    px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2
    ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-blue-500'
        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-blue-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-105'}
    border shadow-md
  `;

  const dangerButtonClass = `
    px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2
    ${
      theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-600 hover:bg-red-700 text-white'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <div className="flex items-center space-x-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select JSON file"
      />

      {/* New File Button */}
      <button
        onClick={handleNewClick}
        className={buttonBaseClass}
        disabled={disabled}
        title="创建新文件 (Ctrl+N)"
        style={{ marginRight: '16px' }}
      >
        <span>📄</span>
        <span>新建</span>
      </button>

      {/* Open File Button */}
      <button
        onClick={handleOpenClick}
        className={buttonBaseClass}
        disabled={disabled}
        title="打开文件 (Ctrl+O)"
        style={{ marginRight: '16px' }}
      >
        <span>📁</span>
        <span>打开</span>
      </button>

      {/* Save File Button */}
      <button
        onClick={handleSaveClick}
        className={isDirty ? primaryButtonClass : buttonBaseClass}
        disabled={disabled}
        title="保存文件 (Ctrl+S)"
        style={{ marginRight: '16px' }}
      >
        <span>💾</span>
        <span>保存</span>
        {isDirty && (
          <span
            className="w-2 h-2 bg-orange-500 rounded-full ml-1"
            title="未保存的更改"
          />
        )}
      </button>

      {/* File Info */}
      {currentFile && (
        <div
          className={`
          px-4 py-2.5 text-sm rounded-lg border backdrop-blur-sm
          ${
            theme === 'dark'
              ? 'bg-gray-800/60 border-gray-600/50 text-gray-300'
              : 'bg-white/80 border-gray-200 text-gray-600'
          }
        `}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">📄</span>
              <span className="font-medium">{currentFile.name}</span>
            </div>
            <span className="text-xs opacity-75 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              {formatFileSize(currentFile.size)}
            </span>
            {isDirty && (
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-orange-500 text-xs font-medium">未保存</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default FileOperations;
