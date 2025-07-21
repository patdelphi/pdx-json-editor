import { useState, useEffect } from 'preact/hooks';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatFileSize } from '../services/fileService';

/**
 * 大文件警告对话框组件
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开对话框
 * @param {number} props.fileSize - 文件大小（字节）
 * @param {string} props.fileName - 文件名
 * @param {Function} props.onContinue - 继续按钮点击处理函数
 * @param {Function} props.onCancel - 取消按钮点击处理函数
 * @param {number} props.warningThreshold - 警告阈值（字节），默认为5MB
 * @param {number} props.dangerThreshold - 危险阈值（字节），默认为20MB
 */
export function LargeFileWarning({ 
  open, 
  fileSize, 
  fileName, 
  onContinue, 
  onCancel,
  warningThreshold = 5 * 1024 * 1024, // 5MB
  dangerThreshold = 20 * 1024 * 1024  // 20MB
}) {
  const [rememberChoice, setRememberChoice] = useState(false);
  const [optimizing, setOptimizing] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // 文件大小级别
  const sizeLevel = fileSize >= dangerThreshold ? 'danger' : 'warning';
  
  // 模拟优化进度
  useEffect(() => {
    if (!open) {
      setProgress(0);
      setOptimizing(true);
      return;
    }
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOptimizing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [open]);
  
  // 处理继续按钮点击
  const handleContinue = () => {
    // 如果选择记住选择，保存到本地存储
    if (rememberChoice) {
      localStorage.setItem('pdx-json-editor-large-file-choice', 'continue');
    }
    
    onContinue();
  };
  
  // 处理取消按钮点击
  const handleCancel = () => {
    // 如果选择记住选择，保存到本地存储
    if (rememberChoice) {
      localStorage.setItem('pdx-json-editor-large-file-choice', 'cancel');
    }
    
    onCancel();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={optimizing}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <WarningAmberIcon color={sizeLevel === 'danger' ? 'error' : 'warning'} sx={{ mr: 1 }} />
        大文件警告
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Alert severity={sizeLevel === 'danger' ? 'error' : 'warning'} sx={{ mb: 2 }}>
            {fileName ? `文件 "${fileName}"` : '该文件'}大小为 {formatFileSize(fileSize || 5000000)}
            {sizeLevel === 'danger' ? '，超过了推荐的最大大小！' : '。'}
          </Alert>
          
          <Typography variant="body1" paragraph>
            打开大文件可能会导致编辑器性能下降，甚至在某些设备上导致浏览器崩溃。
          </Typography>
          
          <Typography variant="body2" paragraph>
            为了提高性能，编辑器将：
          </Typography>
          
          <Typography component="ul" variant="body2">
            <li>禁用某些高级功能（如实时验证）</li>
            <li>使用虚拟滚动优化渲染</li>
            <li>延迟验证和格式化操作</li>
            <li>限制撤销/重做历史记录</li>
            {sizeLevel === 'danger' && (
              <li>分块加载文件内容</li>
            )}
          </Typography>
          
          {sizeLevel === 'danger' && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              建议：考虑使用专门的大文件编辑器或将文件拆分为多个小文件。
            </Alert>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              正在优化编辑器设置 ({progress}%)...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                disabled={optimizing}
              />
            }
            label="记住我的选择"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={optimizing}>取消</Button>
        <Button 
          onClick={handleContinue} 
          variant="contained" 
          color={sizeLevel === 'danger' ? 'error' : 'primary'}
          disabled={optimizing}
        >
          继续打开
        </Button>
      </DialogActions>
    </Dialog>
  );
}