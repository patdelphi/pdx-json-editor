import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Box
} from '@mui/material';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

/**
 * 键盘快捷键对话框组件
 * 显示可用的键盘快捷键
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开对话框
 * @param {Function} props.onClose - 关闭对话框的回调函数
 */
export function KeyboardShortcutsDialog({ open, onClose }) {
  // 格式化修饰键
  const formatModifier = (modifier) => {
    if (!modifier) return '';
    
    return modifier.split('+').map(key => (
      <Chip 
        key={key} 
        label={key} 
        size="small" 
        variant="outlined" 
        sx={{ mr: 0.5, fontSize: '0.75rem' }} 
      />
    ));
  };
  
  // 格式化按键
  const formatKey = (key) => {
    return <Chip label={key} size="small" color="primary" sx={{ fontSize: '0.75rem' }} />;
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="keyboard-shortcuts-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="keyboard-shortcuts-dialog-title">
        键盘快捷键
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          以下是可用的键盘快捷键，帮助您更高效地使用PDX JSON编辑器。
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>操作</TableCell>
                <TableCell>快捷键</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(SHORTCUTS).map((shortcut) => (
                <TableRow key={shortcut.action}>
                  <TableCell>{shortcut.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formatModifier(shortcut.modifier)}
                      {shortcut.modifier && ' + '}
                      {formatKey(shortcut.key)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
          注意：Monaco Editor还提供了许多内置快捷键，如Ctrl+/ (注释)、Ctrl+Space (自动完成)等。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
}