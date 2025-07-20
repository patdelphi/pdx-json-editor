import { useState, useRef } from 'preact/hooks';
import { Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export function FileDropZone({ onFileDrop }) {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // 这里只是模拟，实际功能中会处理文件
      console.log('File dropped:', e.dataTransfer.files[0].name);
      if (onFileDrop) {
        onFileDrop(e.dataTransfer.files);
      }
      e.dataTransfer.clearData();
    }
  };

  return (
    <Box
      ref={dropRef}
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
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          拖放 JSON 文件
        </Typography>
        <Typography variant="body2" color="textSecondary">
          释放鼠标以上传文件
        </Typography>
      </Paper>
    </Box>
  );
}