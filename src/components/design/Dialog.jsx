/**
 * 对话框组件
 * 基于设计系统的对话框组件
 */

import { 
  Dialog as MuiDialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions 
} from '@mui/material';
import { ariaAttributes, createDialog } from '../../utils/accessibilityUtils';
import { Button } from './Button';

/**
 * 对话框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开
 * @param {Function} props.onClose - 关闭回调
 * @param {string} props.title - 标题
 * @param {string} props.description - 描述
 * @param {React.ReactNode} props.content - 内容
 * @param {React.ReactNode} props.actions - 操作
 * @param {boolean} props.fullWidth - 是否占满宽度
 * @param {string} props.maxWidth - 最大宽度（xs, sm, md, lg, xl）
 * @param {boolean} props.fullScreen - 是否全屏
 * @param {boolean} props.scroll - 滚动方式（paper, body）
 * @param {boolean} props.disableEscapeKeyDown - 是否禁用ESC键关闭
 * @param {boolean} props.disableBackdropClick - 是否禁用背景点击关闭
 * @param {string} props.id - 对话框ID
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 对话框组件
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  content,
  actions,
  fullWidth = true,
  maxWidth = 'sm',
  fullScreen = false,
  scroll = 'paper',
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  id,
  className,
  sx,
  children,
  ...rest
}) {
  // 创建对话框ARIA属性
  const dialogAttrs = createDialog(title, description);
  
  // 处理背景点击
  const handleBackdropClick = (event) => {
    if (disableBackdropClick) {
      event.stopPropagation();
    }
  };
  
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      scroll={scroll}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onBackdropClick={handleBackdropClick}
      id={id || dialogAttrs.dialog.id}
      className={className}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          ...sx
        }
      }}
      aria-labelledby={dialogAttrs.title.id}
      aria-describedby={dialogAttrs.description?.id}
      {...rest}
    >
      {title && (
        <DialogTitle id={dialogAttrs.title.id}>{title}</DialogTitle>
      )}
      
      <DialogContent>
        {description && (
          <DialogContentText id={dialogAttrs.description?.id}>
            {description}
          </DialogContentText>
        )}
        
        {content}
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </MuiDialog>
  );
}

/**
 * 确认对话框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onConfirm - 确认回调
 * @param {string} props.title - 标题
 * @param {string} props.message - 消息
 * @param {string} props.confirmText - 确认按钮文本
 * @param {string} props.cancelText - 取消按钮文本
 * @param {string} props.confirmColor - 确认按钮颜色
 * @param {boolean} props.disableBackdropClick - 是否禁用背景点击关闭
 * @param {boolean} props.disableEscapeKeyDown - 是否禁用ESC键关闭
 * @returns {React.ReactElement} - 确认对话框组件
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '确认',
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmColor = 'primary',
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  ...rest
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="contained" color={confirmColor} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
      {...rest}
    />
  );
}

/**
 * 警告对话框组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 警告对话框组件
 */
export function AlertDialog(props) {
  return (
    <ConfirmDialog
      confirmColor="warning"
      {...props}
    />
  );
}

/**
 * 危险操作对话框组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 危险操作对话框组件
 */
export function DangerDialog(props) {
  return (
    <ConfirmDialog
      confirmColor="error"
      confirmText={props.confirmText || '删除'}
      disableBackdropClick={props.disableBackdropClick !== undefined ? props.disableBackdropClick : true}
      {...props}
    />
  );
}