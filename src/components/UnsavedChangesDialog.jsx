import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

/**
 * 未保存更改提示对话框
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开对话框
 * @param {Function} props.onClose - 关闭对话框的回调函数
 * @param {Function} props.onSave - 保存按钮的回调函数
 * @param {Function} props.onDiscard - 放弃更改按钮的回调函数
 * @param {string} props.fileName - 文件名
 */
export function UnsavedChangesDialog({ open, onClose, onSave, onDiscard, fileName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unsaved-changes-dialog-title"
      aria-describedby="unsaved-changes-dialog-description"
    >
      <DialogTitle id="unsaved-changes-dialog-title">
        未保存的更改
      </DialogTitle>
      <DialogContent>
        <Typography id="unsaved-changes-dialog-description">
          {fileName ? `文件 "${fileName}" 有未保存的更改。` : '当前文件有未保存的更改。'}
          您想保存这些更改吗？
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDiscard} color="error">
          放弃更改
        </Button>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}