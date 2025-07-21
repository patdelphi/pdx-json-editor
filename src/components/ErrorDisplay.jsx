/**
 * 错误显示组件
 * 显示错误信息和错误历史
 */

import { useState, useEffect } from 'preact/hooks';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton, 
  Paper, 
  Collapse, 
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import errorService, { ErrorSeverity } from '../services/errorService';

/**
 * 错误显示组件
 */
export function ErrorDisplay({ maxErrors = 10 }) {
  const [errors, setErrors] = useState([]);
  const [expandedError, setExpandedError] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  // 加载错误历史
  useEffect(() => {
    // 获取当前错误历史
    setErrors(errorService.getErrorHistory().slice(0, maxErrors));
    
    // 添加错误监听器
    const handleError = (error) => {
      setErrors(prev => [error, ...prev].slice(0, maxErrors));
    };
    
    errorService.addListener(handleError);
    
    // 清理监听器
    return () => {
      errorService.removeListener(handleError);
    };
  }, [maxErrors]);
  
  // 切换错误详情展开/折叠
  const toggleErrorDetails = (index) => {
    setExpandedError(expandedError === index ? null : index);
  };
  
  // 清除所有错误
  const handleClearErrors = () => {
    errorService.clearErrorHistory();
    setErrors([]);
    setClearDialogOpen(false);
  };
  
  // 获取错误图标
  const getErrorIcon = (severity) => {
    switch (severity) {
      case ErrorSeverity.ERROR:
      case ErrorSeverity.FATAL:
        return <ErrorIcon color="error" />;
      case ErrorSeverity.WARNING:
        return <WarningIcon color="warning" />;
      case ErrorSeverity.INFO:
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // 获取错误时间格式化
  const formatErrorTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // 如果没有错误，显示空状态
  if (errors.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          没有错误记录
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <Typography variant="subtitle1">
          错误历史 ({errors.length})
        </Typography>
        <Button
          startIcon={<DeleteIcon />}
          size="small"
          onClick={() => setClearDialogOpen(true)}
        >
          清除
        </Button>
      </Box>
      
      <Divider />
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {errors.map((error, index) => (
          <Box key={index}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" onClick={() => toggleErrorDetails(index)}>
                  {expandedError === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            >
              <ListItemIcon>
                {getErrorIcon(error.severity)}
              </ListItemIcon>
              <ListItemText
                primary={error.message}
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatErrorTime(error.timestamp)} - {error.type}
                  </Typography>
                }
              />
            </ListItem>
            
            <Collapse in={expandedError === index} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    backgroundColor: 'background.default',
                    overflowX: 'auto'
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {error.originalError ? error.originalError.stack : '无详细信息'}
                  </Typography>
                </Paper>
              </Box>
            </Collapse>
            
            {index < errors.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
      
      {/* 清除确认对话框 */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>清除错误历史</DialogTitle>
        <DialogContent>
          <Typography>
            确定要清除所有错误历史记录吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>取消</Button>
          <Button onClick={handleClearErrors} color="error" variant="contained">
            清除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}