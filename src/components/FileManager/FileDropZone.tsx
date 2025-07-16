import React, { useState, useCallback } from 'react';
import type { FileInfo } from '../../types/editor.types';

interface FileDropZoneProps {
  onFileDrop: (file: FileInfo) => void;
  onError: (error: string) => void;
  theme: 'light' | 'dark';
  disabled?: boolean;
  children: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileDrop,
  onError,
  theme,
  disabled = false,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['application/json', 'text/plain'];
    const validExtensions = ['.json', '.txt'];
    
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      onError('Please select a JSON or text file');
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const content = await readFileContent(file);
      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content
      };
      onFileDrop(fileInfo);
    } catch (error) {
      onError('Failed to read file content');
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Set the dropEffect to indicate this is a copy operation
    e.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      onError('No files were dropped');
      return;
    }
    
    if (files.length > 1) {
      onError('Please drop only one file at a time');
      return;
    }
    
    await handleFile(files[0]);
  }, [disabled, onError]);

  const overlayClass = `
    absolute inset-0 z-10 flex items-center justify-center
    ${theme === 'dark' 
      ? 'bg-gray-900/80 border-blue-400' 
      : 'bg-white/80 border-blue-500'
    }
    border-2 border-dashed rounded-lg transition-all duration-200
    ${isDragOver ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  const dropMessageClass = `
    px-6 py-4 rounded-lg text-center
    ${theme === 'dark' 
      ? 'bg-gray-800 text-gray-200 border-gray-600' 
      : 'bg-white text-gray-700 border-gray-300'
    }
    border shadow-lg
  `;

  return (
    <div
      className="relative w-full h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drag overlay */}
      <div className={overlayClass}>
        <div className={dropMessageClass}>
          <div className="text-2xl mb-2">📁</div>
          <div className="text-lg font-medium mb-1">
            Drop your JSON file here
          </div>
          <div className="text-sm opacity-75">
            Supports .json and .txt files (max 10MB)
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;