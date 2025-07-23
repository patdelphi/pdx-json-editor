import { useState, useEffect, useRef } from 'preact/hooks';
import { CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ThemeProvider } from './components/ThemeProvider';
import { MainLayout } from './layouts/MainLayout';

import { SettingsDialog } from './components/SettingsDialog';
import { FileDropZone } from './components/FileDropZone';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LargeFileWarning } from './components/LargeFileWarning';
import { DiffViewer } from './components/DiffViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VersionInfo } from './components/VersionInfo';
import errorService, { ErrorSeverity } from './services/errorService';

// 导入设计系统组件
import { 
  Button, 
  Alert, 
  FadeTransition, 
  
  PageTransition
} from './components/design';

export function App() {

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [largeFileWarningOpen, setLargeFileWarningOpen] = useState(false);
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  
  // 最近文件功能已移除
  
  // 错误通知状态
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '', severity: 'error', action: null });
  
  // 当前大文件
  const [currentLargeFile, setCurrentLargeFile] = useState(null);
  
  // 差异对比状态
  const [diffViewerContent, setDiffViewerContent] = useState({
    original: '{\n  "example": "original content"\n}',
    modified: '{\n  "example": "modified content"\n}',
    originalTitle: '原始',
    modifiedTitle: '修改后'
  });
  
  // 保存原始内容的引用
  const originalContentRef = useRef('');

  // 监听错误服务
  useEffect(() => {
    const handleError = (error) => {
      // 只显示警告和错误级别的通知
      if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.WARNING) {
        setErrorAlert({
          open: true,
          message: error.message,
          severity: error.severity === ErrorSeverity.ERROR ? 'error' : 'warning'
        });
      }
    };
    
    // 添加错误监听器
    errorService.addListener(handleError);
    
    // 清理监听器
    return () => {
      errorService.removeListener(handleError);
    };
  }, []);
  
  // 扩展pdxJsonEditor全局对象，添加差异对比相关功能
  useEffect(() => {
    // 保存原始内容的函数
    const saveOriginalContent = (content) => {
      originalContentRef.current = content;
    };
    
    // 打开差异对比视图的函数
    const openDiffViewer = (original, modified, originalTitle = '原始', modifiedTitle = '修改后') => {
      setDiffViewerContent({
        original: original || originalContentRef.current,
        modified: modified || (window.pdxJsonEditor?.getCurrentContent?.() || ''),
        originalTitle,
        modifiedTitle
      });
      setDiffViewerOpen(true);
    };
    
    // 处理大文件的函数
    const handleLargeFile = (file) => {
      if (file) {
        setCurrentLargeFile(file);
        setLargeFileWarningOpen(true);
      }
    };

    // 最近文件功能已移除
    
    // 触发文件选择对话框
    const triggerFileOpen = () => {
      // 检查是否支持文件系统访问API
      if ('showOpenFilePicker' in window && window.pdxJsonEditor?.openFileWithPicker) {
        // 使用文件系统访问API
        window.pdxJsonEditor.openFileWithPicker();
      } else {
        // 回退到传统方式
        // 通过自定义事件通知MainLayout组件打开文件选择对话框
        window.dispatchEvent(new CustomEvent('triggerFileOpen'));
        
        // 同时尝试直接查找文件输入元素（备用方案）
        setTimeout(() => {
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            fileInput.click();
          } else {
            console.error('未找到文件输入元素');
          }
        }, 100);
      }
    };
    
    // 设置当前文件
    const setCurrentFile = (fileInfo) => {
      // 这个函数需要在MainLayout组件中实现
      // 这里只是一个占位符
      console.log('设置当前文件:', fileInfo);
      
      // 尝试通过事件通知MainLayout组件
      window.dispatchEvent(new CustomEvent('setCurrentFile', { detail: fileInfo }));
    };
    
    // 将函数添加到全局对象
    // 确保window.pdxJsonEditor已初始化
    if (!window.pdxJsonEditor) {
      window.pdxJsonEditor = {};
    }

    // 将函数添加到全局对象
    window.pdxJsonEditor.saveOriginalContent = saveOriginalContent;
    window.pdxJsonEditor.openDiffViewer = openDiffViewer;
    window.pdxJsonEditor.handleLargeFile = handleLargeFile;
    window.pdxJsonEditor.triggerFileOpen = triggerFileOpen;
    window.pdxJsonEditor.setCurrentFile = setCurrentFile;
    
    // 添加openFileWithPicker函数
    if (!window.pdxJsonEditor.openFileWithPicker && window.showOpenFilePicker) {
      window.pdxJsonEditor.openFileWithPicker = () => {
        // 通过自定义事件通知MainLayout组件使用文件选择器API打开文件
        window.dispatchEvent(new CustomEvent('useFilePickerAPI'));
      };
    }
    
    // 如果没有定义openFileByPath函数，添加一个基本实现
    if (!window.pdxJsonEditor.openFileByPath) {
      window.pdxJsonEditor.openFileByPath = (filePath) => {
        console.log('尝试打开文件路径:', filePath);
        // 这里可以添加实际的文件打开逻辑，如果有文件系统API支持
        // 目前只是记录日志，实际功能需要根据应用环境实现
      };
    }
    // 清理函数
    return () => {
      if (window.pdxJsonEditor) {
        delete window.pdxJsonEditor.saveOriginalContent;
        delete window.pdxJsonEditor.openDiffViewer;
        delete window.pdxJsonEditor.handleLargeFile;
        delete window.pdxJsonEditor.triggerFileOpen;
        delete window.pdxJsonEditor.setCurrentFile;
      }
    };
  }, []);



  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  

  const toggleDiffViewer = () => {
    if (diffViewerOpen) {
      setDiffViewerOpen(false);
      return;
    }

    // 打开差异对比视图时，获取当前内容作为修改后内容
    const currentContent = window.pdxJsonEditor?.getCurrentContent?.() || '{\n  "example": "modified content"\n}';
    
    // 检查内容大小
    const contentSize = new Blob([currentContent]).size;
    if (contentSize > 2 * 1024 * 1024) { // 2MB
      // 对于大文件，显示警告而不是直接打开差异对比视图
      setErrorAlert({
        open: true,
        message: '文件过大，差异对比可能导致性能问题',
        severity: 'warning'
      });
      return;
    }
    
    // 如果有原始内容，使用它；否则使用格式化后的当前内容作为原始内容
    let originalContent = originalContentRef.current;
    if (!originalContent) {
      try {
        // 尝试格式化当前内容作为原始内容
        originalContent = JSON.stringify(JSON.parse(currentContent), null, 2);
      } catch (e) {
        // 如果解析失败，使用当前内容
        originalContent = currentContent;
      }
    }
    
    setDiffViewerContent({
      original: originalContent,
      modified: currentContent,
      originalTitle: '原始',
      modifiedTitle: '当前'
    });
    setDiffViewerOpen(true);
  };
  
  // 保存差异对比结果
  const handleDiffSave = (content) => {
    if (window.pdxJsonEditor?.setContent) {
      window.pdxJsonEditor.setContent(content);
    }
    setDiffViewerOpen(false);
  };
  
  const toggleErrorDialog = () => {
    setErrorDialogOpen(!errorDialogOpen);
  };
  
  // 处理文件拖放
  const handleFileDrop = (file) => {
    // 检查是否为大文件
    if (file && file.size > 1000000) { // 1MB
      // 保存文件引用
      setCurrentLargeFile(file);
      // 显示大文件警告
      setLargeFileWarningOpen(true);
    } else if (window.pdxJsonEditor?.openFile) {
      // 如果不是大文件，直接处理
      window.pdxJsonEditor.openFile(file);
    }
  };
  
  // 处理大文件继续
  const handleLargeFileContinue = () => {
    setLargeFileWarningOpen(false);
    
    // 继续打开文件，跳过大小检查
    if (currentLargeFile && window.pdxJsonEditor?.openFile) {
      window.pdxJsonEditor.openFile(currentLargeFile, true);
    }
    
    setCurrentLargeFile(null);
  };
  
  // 处理大文件取消
  const handleLargeFileCancel = () => {
    setLargeFileWarningOpen(false);
    setCurrentLargeFile(null);
  };
  
  // 处理错误通知关闭
  const handleErrorAlertClose = () => {
    setErrorAlert(prev => ({ ...prev, open: false }));
  };
  
  // 处理应用错误
  const handleAppError = (error) => {
    // 使用错误服务处理错误
    errorService.handleError(error);
  };

  return (
    <ErrorBoundary onError={handleAppError}>
      <ThemeProvider>
        <CssBaseline />
        <PageTransition type="fade">
          <MainLayout 
            onSettingsClick={toggleSettings}
            onErrorClick={toggleErrorDialog}
          />
        </PageTransition>
        

        <SettingsDialog open={settingsOpen} onClose={toggleSettings} />
        <FileDropZone 
          onFileDrop={handleFileDrop} 
          onError={handleAppError} 
        />
        
        {/* 错误对话框 */}
        <Dialog
          open={errorDialogOpen}
          onClose={toggleErrorDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>错误历史</DialogTitle>
          <DialogContent>
            <ErrorDisplay />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleErrorDialog}>关闭</Button>
          </DialogActions>
        </Dialog>
        
        <LargeFileWarning 
          open={largeFileWarningOpen} 
          fileSize={currentLargeFile?.size || 5242880}
          fileName={currentLargeFile?.name}
          onContinue={handleLargeFileContinue}
          onCancel={handleLargeFileCancel}
        />
        
        {diffViewerOpen && (
          <DiffViewer 
            original={diffViewerContent.original}
            modified={diffViewerContent.modified}
            originalTitle={diffViewerContent.originalTitle}
            modifiedTitle={diffViewerContent.modifiedTitle}
            onClose={toggleDiffViewer}
            onSave={handleDiffSave}
          />
        )}
        
        {/* 错误通知 */}
        {errorAlert.open && (
          <FadeTransition in={true}>
            <Alert 
              severity={errorAlert.severity}
              variant="filled"
              onClose={handleErrorAlertClose}
              action={errorAlert.action}
              sx={{ 
                position: 'fixed',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                minWidth: 300,
                maxWidth: '90%'
              }}
            >
              {errorAlert.message}
            </Alert>
          </FadeTransition>
        )}
        
        {/* 版本信息 */}
        <VersionInfo />
      </ThemeProvider>
    </ErrorBoundary>
  );
}