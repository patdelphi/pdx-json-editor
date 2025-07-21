import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

/**
 * 替换确认对话框
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开对话框
 * @param {Function} props.onClose - 关闭对话框的回调函数
 * @param {Function} props.onConfirm - 确认替换的回调函数
 * @param {number} props.count - 匹配项数量
 * @param {string} props.searchText - 搜索文本
 * @param {string} props.replaceText - 替换文本
 */
export function ReplaceConfirmDialog({ open, onClose, onConfirm, count, searchText, replaceText }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="replace-confirm-dialog-title"
      aria-describedby="replace-confirm-dialog-description"
    >
      <DialogTitle id="replace-confirm-dialog-title">
        确认替换
      </DialogTitle>
      <DialogContent>
        <Typography id="replace-confirm-dialog-description">
          确定要将所有 <strong>{count}</strong> 处 "<strong>{searchText}</strong>" 替换为 "<strong>{replaceText}</strong>" 吗？
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          替换全部
        </Button>
      </DialogActions>
    </Dialog>
  );
}