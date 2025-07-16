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
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content
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
    px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2
    ${theme === 'dark' 
      ? 'text-gray-300 hover:text-white hover:bg-gray-700 border-gray-600' 
      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    border
  `;

  const primaryButtonClass = `
    px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2
    ${theme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const dangerButtonClass = `
    px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-2
    ${theme === 'dark' 
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
        title="Create new file (Ctrl+N)"
      >
        <span>📄</span>
        <span>New</span>
      </button>

      {/* Open File Button */}
      <button
        onClick={handleOpenClick}
        className={buttonBaseClass}
        disabled={disabled}
        title="Open file (Ctrl+O)"
      >
        <span>📁</span>
        <span>Open</span>
      </button>

      {/* Save File Button */}
      <button
        onClick={handleSaveClick}
        className={isDirty ? primaryButtonClass : buttonBaseClass}
        disabled={disabled}
        title="Save file (Ctrl+S)"
      >
        <span>💾</span>
        <span>Save</span>
        {isDirty && (
          <span className="w-2 h-2 bg-orange-500 rounded-full ml-1" title="Unsaved changes" />
        )}
      </button>

      {/* File Info */}
      {currentFile && (
        <div className={`
          px-3 py-2 text-sm rounded-md border
          ${theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-gray-300' 
            : 'bg-gray-50 border-gray-300 text-gray-600'
          }
        `}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{currentFile.name}</span>
            <span className="text-xs opacity-75">
              ({formatFileSize(currentFile.size)})
            </span>
            {isDirty && (
              <span className="text-orange-500 text-xs">●</span>
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