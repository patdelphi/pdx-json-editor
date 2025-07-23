import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { Header } from '../components/Header';
import { TouchEnabledJsonEditor } from '../components/TouchEnabledJsonEditor';
// SidePanel 已移除
import { FileDropZone } from '../components/FileDropZone';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { LargeFileWarning } from '../components/LargeFileWarning';
import { ResponsiveLayout } from './ResponsiveLayout';
import { useFileOperations } from '../hooks/useFileOperations';
import { useBeforeUnload } from '../hooks/useBeforeUnload';

export function MainLayout({ 
  onSettingsClick,
  onErrorClick
}) {
  const [editorContent, setEditorContent] = useState('');
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
  const [pendingOperation, setPendingOperation] = useState(null);
  
  const fileInputRef = useRef(null);

  // 当前大文件
  const [currentLargeFile, setCurrentLargeFile] = useState(null);
  const [largeFileWarningOpen, setLargeFileWarningOpen] = useState(false);
  
  // 处理大文件
  const handleLargeFile = useCallback((file) => {
    setCurrentLargeFile(file);
    setLargeFileWarningOpen(true);
  }, []);
  
  // 文件操作Hook
  const { 
    currentFile,
    isDirty,
    isLoading,
    openFile,
    openFileWithPicker,
    saveCurrentFile,
    saveAs,
    createNew,
    setContent,
    isLargeFile
  } = useFileOperations({
    onContentChange: setEditorContent,
    onError: (error) => onErrorClick(error.message),
    onLargeFile: handleLargeFile
  });
  
  // 处理大文件继续
  const handleLargeFileContinue = useCallback(() => {
    setLargeFileWarningOpen(false);
    
    // 继续打开文件，跳过大小检查
    if (currentLargeFile) {
      openFile(currentLargeFile, true);
    }
    
    setCurrentLargeFile(null);
  }, [currentLargeFile, openFile]);
  
  // 处理大文件取消
  const handleLargeFileCancel = useCallback(() => {
    setLargeFileWarningOpen(false);
    setCurrentLargeFile(null);
  }, []);
  
  // 使用beforeunload钩子
  useBeforeUnload(isDirty);
  
  // 处理未保存更改检查
  const checkUnsavedChanges = useCallback((operation) => {
    if (isDirty) {
      setPendingOperation(operation);
      setUnsavedChangesDialogOpen(true);
      return true; // 有未保存的更改
    }
    return false; // 没有未保存的更改
  }, [isDirty]);
  
  // 监听触发文件选择对话框和设置当前文件的事件
  useEffect(() => {
    const handleTriggerFileOpen = () => {
      console.log('收到触发文件选择对话框事件');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    const handleSetCurrentFile = (event) => {
      console.log('收到设置当前文件事件:', event.detail);
      if (event.detail) {
        // 设置编辑器内容
        setEditorContent(event.detail.content || '');
        
        // 如果有文件操作钩子，更新当前文件
        if (setContent) {
          setContent(event.detail.content || '');
        }
      }
    };
    
    const handleUseFilePickerAPI = () => {
      console.log('收到使用文件选择器API事件');
      // 检查是否有未保存的更改
      const proceed = () => openFileWithPicker();
      
      if (!checkUnsavedChanges(proceed)) {
        proceed();
      }
    };
    
    window.addEventListener('triggerFileOpen', handleTriggerFileOpen);
    window.addEventListener('setCurrentFile', handleSetCurrentFile);
    window.addEventListener('useFilePickerAPI', handleUseFilePickerAPI);
    
    return () => {
      window.removeEventListener('triggerFileOpen', handleTriggerFileOpen);
      window.removeEventListener('setCurrentFile', handleSetCurrentFile);
      window.removeEventListener('useFilePickerAPI', handleUseFilePickerAPI);
    };
  }, [setContent, openFileWithPicker, checkUnsavedChanges]);
  
  // 处理未保存更改对话框关闭
  const handleUnsavedChangesClose = useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    setPendingOperation(null);
  }, []);
  
  // 处理保存并继续
  const handleSaveAndContinue = useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    
    // 保存文件并执行挂起的操作
    saveCurrentFile().then(() => {
      if (pendingOperation) {
        pendingOperation();
        setPendingOperation(null);
      }
    });
  }, [saveCurrentFile, pendingOperation]);
  
  // 处理放弃更改并继续
  const handleDiscardAndContinue = useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    
    // 执行挂起的操作
    if (pendingOperation) {
      pendingOperation();
      setPendingOperation(null);
    }
  }, [pendingOperation]);
  
  // 处理新建文件
  const handleNewFile = useCallback(() => {
    const proceed = () => createNew();
    
    if (!checkUnsavedChanges(proceed)) {
      proceed();
    }
  }, [createNew, checkUnsavedChanges]);
  
  // 处理打开文件
  const handleOpenFile = useCallback(() => {
    // 检查是否支持文件系统访问API
    if ('showOpenFilePicker' in window) {
      const proceed = () => openFileWithPicker();
      
      if (!checkUnsavedChanges(proceed)) {
        proceed();
      }
    } else {
      // 回退到传统的文件输入方式
      const proceed = () => fileInputRef.current?.click();
      
      if (!checkUnsavedChanges(proceed)) {
        proceed();
      }
    }
  }, [checkUnsavedChanges, openFileWithPicker]);
  
  // 处理文件选择
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      openFile(file);
    }
    // 重置input，以便能够重新选择同一个文件
    event.target.value = '';
  }, [openFile]);
  
  // 处理保存文件
  const handleSaveFile = useCallback(() => {
    // 使用新的文件系统访问API，总是弹出系统的文件选择对话框
    // 不再需要区分是否为未命名文件
    saveCurrentFile();
    
    // 如果浏览器不支持文件系统访问API，显示提示
    if (!window.showSaveFilePicker) {
      // 使用setTimeout确保提示在保存操作之后显示
      setTimeout(() => {
        alert('您的浏览器不支持文件系统访问API，将使用传统的下载方式保存文件。');
      }, 100);
    }
  }, [saveCurrentFile]);
  
  // 处理另存为
  const handleSaveAsFile = useCallback(() => {
    // 使用新的文件系统访问API，直接弹出系统的文件选择对话框
    // 不再需要通过自定义对话框输入文件名
    const suggestedName = currentFile?.name || 'untitled.json';
    saveAs(suggestedName);
    
    // 如果浏览器不支持文件系统访问API，显示提示
    if (!window.showSaveFilePicker) {
      // 使用setTimeout确保提示在保存操作之后显示
      setTimeout(() => {
        alert('您的浏览器不支持文件系统访问API，将使用传统的下载方式保存文件。');
      }, 100);
    }
  }, [currentFile, saveAs]);
  
  // 另存为对话框相关函数已移除，使用系统原生文件选择对话框
  
  // 处理编辑器内容变化
  const handleEditorContentChange = useCallback((content) => {
    setContent(content);
  }, [setContent]);

  return (
    <>
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileSelect}
      />
      
      <ResponsiveLayout
        header={
          <Header 
            onNewFile={handleNewFile}
            onOpenFile={handleOpenFile}
            onSaveFile={handleSaveFile}
            onSaveAsFile={handleSaveAsFile}
            onErrorClick={onErrorClick}
            currentFileName={currentFile?.name}
            isDirty={isDirty}
          />
        }
        sidebar={null}
        content={
          <TouchEnabledJsonEditor 
            onSettingsClick={onSettingsClick}
            value={editorContent}
            onChange={handleEditorContentChange}
            isLoading={isLoading}
            isLargeFile={isLargeFile}
          />
        }
        isDirty={isDirty}
        onSave={handleSaveFile}
      />
      
      {/* 文件拖放区域 */}
      <FileDropZone 
        onFileDrop={openFile}
        onError={(error) => onErrorClick(error.message)}
      />
      
      {/* 另存为对话框已移除，使用系统原生文件选择对话框 */}
      
      {/* 未保存更改对话框 */}
      <UnsavedChangesDialog
        open={unsavedChangesDialogOpen}
        onClose={handleUnsavedChangesClose}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        fileName={currentFile?.name}
      />
      
      {/* 大文件警告对话框 */}
      <LargeFileWarning
        open={largeFileWarningOpen}
        fileSize={currentLargeFile?.size}
        fileName={currentLargeFile?.name}
        onContinue={handleLargeFileContinue}
        onCancel={handleLargeFileCancel}
      />
    </>
  );
}