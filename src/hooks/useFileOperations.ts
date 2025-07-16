// File operations hook
import { useState, useCallback } from 'react';
import type { FileInfo } from '../types/editor.types';
import { FileService } from '../services/fileService';

const useFileOperations = () => {
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openFile = useCallback(async (file: File): Promise<FileInfo | null> => {
    setIsLoading(true);
    try {
      if (!FileService.validateFileType(file)) {
        throw new Error(
          'Invalid file type. Please select a JSON or text file.'
        );
      }

      const fileInfo = await FileService.readFile(file);
      setCurrentFile(fileInfo);
      return fileInfo;
    } catch (error) {
      console.error('Error opening file:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFile = useCallback(
    (content: string, filename?: string) => {
      try {
        const name = filename || currentFile?.name || 'untitled.json';
        FileService.downloadFile(content, name);
        return true;
      } catch (error) {
        console.error('Error saving file:', error);
        return false;
      }
    },
    [currentFile]
  );

  const newFile = useCallback(() => {
    setCurrentFile(null);
  }, []);

  const handleFileDrop = useCallback(
    async (file: File) => {
      return await openFile(file);
    },
    [openFile]
  );

  return {
    currentFile,
    isLoading,
    openFile,
    saveFile,
    newFile,
    handleFileDrop,
  };
};

export default useFileOperations;
