import { useState, useRef, useEffect } from 'preact/hooks';
import { Box, Typography, Paper, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { isJsonFile } from '../services/fileService';

export function FileDropZone({ onFileDrop, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const dropRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // 检查是否为JSON文件
      if (!isJsonFile(file)) {
        const errorMsg = `不支持的文件类型: ${file.name}。请拖放JSON文件。`;
        setErrorMessage(errorMsg);
        setShowError(true);
        if (onError) {
          onError(new Error(errorMsg));
        }
        return;
      }
      
      // 处理文件
      if (onFileDrop) {
        onFileDrop(file);
      }
      e.dataTransfer.clearData();
    }
  };
  
  // 处理错误提示关闭
  const handleErrorClose = () => {
    setShowError(false);
  };
  
  // 组件卸载时重置拖放计数器
  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  return (
    <Box
      ref={dropRef}
      data-testid="file-drop-zone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: isDragging ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1200,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme => theme.palette.background.paper,
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'primary.main',
          maxWidth: '80%'
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          拖放 JSON 文件
        </Typography>
        <Typography variant="body2" color="textSecondary">
          释放鼠标以上传文件
        </Typography>
        
        {showError && (
          <Alert 
            severity="error" 
            onClose={handleErrorClose}
            sx={{ mt: 2, width: '100%' }}
          >
            {errorMessage}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}