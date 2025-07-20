import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export function LargeFileWarning({ open, fileSize, onContinue, onCancel }) {
  // 将文件大小转换为可读格式
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
        大文件警告
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" paragraph>
            您正在尝试打开一个大型 JSON 文件（{formatFileSize(fileSize || 5000000)}）。
            打开大文件可能会导致编辑器性能下降。
          </Typography>
          
          <Typography variant="body2" paragraph>
            为了提高性能，编辑器将：
          </Typography>
          
          <Typography component="ul" variant="body2">
            <li>禁用某些高级功能</li>
            <li>使用虚拟滚动优化渲染</li>
            <li>延迟验证和格式化操作</li>
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" display="block" gutterBottom>
              优化中...
            </Typography>
            <LinearProgress />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={onContinue} variant="contained">继续打开</Button>
      </DialogActions>
    </Dialog>
  );
}