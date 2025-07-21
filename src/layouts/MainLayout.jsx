import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { Header } from '../components/Header';
import { JsonEditor } from '../components/JsonEditor';
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
  onDiffViewerClick,
  onErrorClick
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
    saveCurrentFile,
    saveAs,
    createNew,
    setContent,
    isLargeFile
  } = useFileOperations({
    onContentChange: setEditorContent,
    onError: (error) => setErrorMessage(error.message),
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
    
    window.addEventListener('triggerFileOpen', handleTriggerFileOpen);
    window.addEventListener('setCurrentFile', handleSetCurrentFile);
    
    return () => {
      window.removeEventListener('triggerFileOpen', handleTriggerFileOpen);
      window.removeEventListener('setCurrentFile', handleSetCurrentFile);
    };
  }, [setContent]);
  
  // 处理未保存更改检查
  const checkUnsavedChanges = useCallback((operation) => {
    if (isDirty) {
      setPendingOperation(operation);
      setUnsavedChangesDialogOpen(true);
      return true; // 有未保存的更改
    }
    return false; // 没有未保存的更改
  }, [isDirty]);
  
  // 处理未保存更改对话框关闭
  const handleUnsavedChangesClose = useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    setPendingOperation(null);
  }, []);
  
  // 处理保存并继续
  const handleSaveAndContinue = useCallback(() => {
    setUnsavedChangesDialogOpen(false);
    
    // 先保存文件
    if (currentFile?.name === 'untitled.json') {
      // 如果是未命名文件，打开另存为对话框
      setSaveAsFileName('untitled.json');
      setSaveAsDialogOpen(true);
      // 保存后的操作会在另存为对话框中处理
    } else {
      // 保存后执行挂起的操作
      saveCurrentFile().then(() => {
        if (pendingOperation) {
          pendingOperation();
          setPendingOperation(null);
        }
      });
    }
  }, [currentFile, saveCurrentFile, pendingOperation]);
  
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
    const proceed = () => fileInputRef.current?.click();
    
    if (!checkUnsavedChanges(proceed)) {
      proceed();
    }
  }, [checkUnsavedChanges]);
  
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
    if (currentFile?.name === 'untitled.json') {
      // 如果是未命名文件，打开另存为对话框
      setSaveAsFileName('untitled.json');
      setSaveAsDialogOpen(true);
    } else {
      saveCurrentFile();
    }
  }, [currentFile, saveCurrentFile]);
  
  // 处理另存为
  const handleSaveAsFile = useCallback(() => {
    setSaveAsFileName(currentFile?.name || 'untitled.json');
    setSaveAsDialogOpen(true);
  }, [currentFile]);
  
  // 处理另存为对话框确认
  const handleSaveAsConfirm = useCallback(() => {
    if (saveAsFileName.trim()) {
      saveAs(saveAsFileName);
      setSaveAsDialogOpen(false);
    } else {
      setErrorMessage('文件名不能为空');
    }
  }, [saveAsFileName, saveAs]);
  
  // 处理另存为对话框取消
  const handleSaveAsCancel = useCallback(() => {
    setSaveAsDialogOpen(false);
  }, []);
  
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
            onDiffViewerClick={onDiffViewerClick}
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
        onError={(error) => setErrorMessage(error.message)}
      />
      
      {/* 另存为对话框 */}
      <Dialog open={saveAsDialogOpen} onClose={handleSaveAsCancel}>
        <DialogTitle>另存为</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文件名"
            fullWidth
            value={saveAsFileName}
            onChange={(e) => setSaveAsFileName(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveAsCancel}>取消</Button>
          <Button onClick={handleSaveAsConfirm} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
      
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