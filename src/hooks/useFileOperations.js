/**
 * 文件操作Hook
 * 提供文件读取、保存和管理功能
 */

import { useState, useCallback, useEffect } from 'preact/hooks';
import { 
  readFile, 
  readFileWithPicker,
  saveFile, 
  createNewFile, 
  isJsonFile, 
  isLargeFile,
  ensureJsonExtension,
  isFileSystemAccessSupported
} from '../services/fileService';
import PersistenceService from '../services/persistenceService';
import errorService from '../services/errorService';

/**
 * 使用文件操作的Hook
 * @param {Object} options - 选项
 * @param {Function} options.onContentChange - 内容变化回调
 * @param {Function} options.onError - 错误回调
 * @param {Function} options.onLargeFile - 大文件处理回调
 * @param {number} [options.fileSizeLimit=5242880] - 文件大小限制（字节）
 * @returns {{
 *   currentFile: import('../services/fileService').FileInfo|null,
 *   isDirty: boolean,
 *   isLoading: boolean,
 *   openFile: (file: File, skipSizeCheck?: boolean) => Promise<void>,
 *   saveCurrentFile: () => Promise<void>,
 *   saveAs: (filename: string) => Promise<void>,
 *   createNew: () => void,
 *   setContent: (content: string) => void,
 *   checkLargeFile: (file: File) => boolean
 * }} - 文件操作相关状态和方法
 */
export const useFileOperations = ({ 
  onContentChange, 
  onError,
  onLargeFile,
  fileSizeLimit = 5242880
}) => {
  const [currentFile, setCurrentFile] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  /**
   * 从本地存储加载编辑器状态
   */
  const loadFromStorage = useCallback(() => {
    try {
      if (!PersistenceService.isStorageAvailable()) {
        return;
      }
      
      const savedState = PersistenceService.loadEditorContent();
      if (!savedState) {
        return;
      }
      
      const { content, fileInfo } = savedState;
      
      if (content && fileInfo) {
        setCurrentFile({
          name: fileInfo.name,
          content,
          size: new Blob([content]).size,
          lastModified: fileInfo.lastModified,
          type: fileInfo.type,
          path: fileInfo.path
        });
        setOriginalContent(content);
        setIsDirty(false);
        
        onContentChange && onContentChange(content);
      }
    } catch (error) {
      errorService.handleError(error);
    }
  }, [onContentChange]);
  
  // 初始化时从本地存储加载
  useEffect(() => {
    if (!isInitialized) {
      loadFromStorage();
      setIsInitialized(true);
    }
  }, [isInitialized, loadFromStorage]);
  
  /**
   * 打开文件
   * @param {File} file - 文件对象
   * @param {boolean} [skipSizeCheck=false] - 是否跳过大小检查
   * @returns {Promise<void>}
   */
  const openFile = useCallback(async (file, skipSizeCheck = false) => {
    if (!file) return;
    
    // 检查是否为JSON文件
    if (!isJsonFile(file)) {
      onError && onError(new Error('只能打开JSON文件'));
      return;
    }
    
    // 检查文件大小
    if (!skipSizeCheck && isLargeFile(file, fileSizeLimit)) {
      // 检查用户是否已经设置了记住选择
      const savedChoice = localStorage.getItem('pdx-json-editor-large-file-choice');
      
      if (savedChoice === 'cancel') {
        return;
      } else if (savedChoice !== 'continue') {
        // 如果没有保存选择，则触发大文件警告
        // 这里需要通过回调通知父组件显示大文件警告
        if (onLargeFile) {
          onLargeFile(file);
          return;
        }
        
        // 如果没有提供大文件处理回调，则使用传统确认框
        const shouldContinue = window.confirm(
          `文件大小超过${Math.round(fileSizeLimit / 1024 / 1024)}MB，可能会影响性能。是否继续？`
        );
        
        if (!shouldContinue) return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const fileInfo = await readFile(file);
      
      setCurrentFile(fileInfo);
      setOriginalContent(fileInfo.content);
      setIsDirty(false);
      
      // 保存到本地存储
      PersistenceService.saveEditorContent(fileInfo.content, fileInfo);
      
      // 最近文件功能已移除
      
      onContentChange && onContentChange(fileInfo.content);
    } catch (error) {
      onError && onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [onContentChange, onError, fileSizeLimit, onLargeFile]);
  
  /**
   * 使用文件选择器打开文件
   * @returns {Promise<void>}
   */
  const openFileWithPicker = useCallback(async () => {
    try {
      setIsLoading(true);
      // 使用文件服务打开文件
      const result = await readFileWithPicker();
      if (result) {
        // 检查文件大小
        const isLarge = isLargeFile(result.content);
        // 更新当前文件信息
        setCurrentFile({
          name: result.name,
          path: result.path,
          content: result.content,
          handle: result.handle,
          directoryHandle: result.directoryHandle,
          isLarge
        });
        // 更新原始内容，用于脏检查
        setOriginalContent(result.content);
        setIsDirty(false);
        // 更新本地存储
        PersistenceService.saveEditorContent(result.content, {
          name: result.name,
          path: result.path,
          handle: result.handle,
          directoryHandle: result.directoryHandle
        });
        // 如果是大文件，触发回调
        if (isLarge && onLargeFile) {
          onLargeFile(result.content, result.name);
        }
      }
    } catch (error) {
      onError && onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onLargeFile]);
  
  /**
   * 保存当前文件
   * @returns {Promise<void>}
   */
  const saveCurrentFile = useCallback(async () => {
    if (!currentFile) {
      onError && onError(new Error('没有打开的文件'));
      return;
    }
    
    try {
      // 传递当前文件的句柄，以便保存对话框可以打开在相同目录
      const saveOptions = {
        fileHandle: currentFile.handle,
        directoryHandle: currentFile.directoryHandle
      };
      
      const saveResult = await saveFile(currentFile.content, currentFile.name, saveOptions);
      
      // 如果用户取消了保存操作，saveResult可能为undefined
      if (!saveResult) return;
      
      // 更新文件信息
      const updatedFile = {
        ...currentFile,
        name: saveResult.name,
        path: saveResult.path,
        handle: saveResult.handle,
        directoryHandle: saveResult.directoryHandle
      };
      
      setCurrentFile(updatedFile);
      setOriginalContent(currentFile.content);
      setIsDirty(false);
      
      // 更新本地存储
      PersistenceService.saveEditorContent(currentFile.content, updatedFile);
      
      // 最近文件功能已移除
    } catch (error) {
      // 如果是用户取消操作，不显示错误
      if (error.message === '用户取消了保存操作') {
        return;
      }
      onError && onError(error);
    }
  }, [currentFile, onError]);
  
  /**
   * 另存为
   * @param {string} filename - 文件名
   * @returns {Promise<void>}
   */
  const saveAs = useCallback(async (filename) => {
    if (!currentFile) {
      onError && onError(new Error('没有打开的文件'));
      return;
    }
    
    const safeFilename = ensureJsonExtension(filename);
    
    try {
      // 传递当前文件的句柄，以便保存对话框可以打开在相同目录
      const saveOptions = {
        fileHandle: currentFile.handle,
        directoryHandle: currentFile.directoryHandle
      };
      
      const saveResult = await saveFile(currentFile.content, safeFilename, saveOptions);
      
      // 如果用户取消了保存操作，saveResult可能为undefined
      if (!saveResult) return;
      
      // 更新当前文件信息
      const updatedFile = {
        ...currentFile,
        name: saveResult.name,
        path: saveResult.path,
        handle: saveResult.handle,
        directoryHandle: saveResult.directoryHandle
      };
      
      setCurrentFile(updatedFile);
      setOriginalContent(currentFile.content);
      setIsDirty(false);
      
      // 更新本地存储
      PersistenceService.saveEditorContent(currentFile.content, updatedFile);
      
      // 最近文件功能已移除
    } catch (error) {
      // 如果是用户取消操作，不显示错误
      if (error.message === '用户取消了保存操作') {
        return;
      }
      onError && onError(error);
    }
  }, [currentFile, onError]);
  
  /**
   * 创建新文件
   */
  const createNew = useCallback(() => {
    // 如果有未保存的更改，提示用户
    if (isDirty) {
      const shouldContinue = window.confirm('有未保存的更改，是否继续？');
      if (!shouldContinue) return;
    }
    
    const newFile = createNewFile('untitled.json', '{}');
    
    setCurrentFile(newFile);
    setOriginalContent(newFile.content);
    setIsDirty(false);
    
    // 更新本地存储
    PersistenceService.saveEditorContent(newFile.content, newFile);
    
    onContentChange && onContentChange(newFile.content);
  }, [isDirty, onContentChange]);
  
  /**
   * 设置内容
   * @param {string} content - 新内容
   */
  const setContent = useCallback((content) => {
    if (!currentFile) return;
    
    const newFile = {
      ...currentFile,
      content,
      size: new Blob([content]).size
    };
    
    setCurrentFile(newFile);
    const newIsDirty = content !== originalContent;
    setIsDirty(newIsDirty);
    
    // 保存到本地存储
    try {
      PersistenceService.saveEditorContent(content, newFile);
    } catch (error) {
      errorService.handleError(error);
    }
  }, [currentFile, originalContent]);
  
  /**
   * 检查是否为大文件
   * @param {File} file - 文件对象
   * @returns {boolean} - 是否为大文件
   */
  const checkLargeFile = useCallback((file) => {
    return isLargeFile(file, fileSizeLimit);
  }, [fileSizeLimit]);
  
  // 检查当前文件是否为大文件
  const isCurrentFileLarge = currentFile ? isLargeFile(currentFile.size, fileSizeLimit) : false;
  
  /**
   * 清除本地存储
   */
  const clearStorage = useCallback(() => {
    try {
      PersistenceService.clearEditorContent();
    } catch (error) {
      errorService.handleError(error);
    }
  }, []);
  
  return {
    currentFile,
    isDirty,
    isLoading,
    openFile,
    openFileWithPicker,
    saveCurrentFile,
    saveAs,
    createNew,
    setContent,
    checkLargeFile,
    isLargeFile: isCurrentFileLarge,
    clearStorage,
    loadFromStorage,
    isFileSystemAccessSupported: isFileSystemAccessSupported()
  };
};