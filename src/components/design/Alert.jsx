/**
 * 警告提示组件
 * 基于设计系统的警告提示组件
 */

import { Alert as MuiAlert, AlertTitle } from '@mui/material';
import { ariaAttributes, createAlert } from '../../utils/accessibilityUtils';

/**
 * 警告提示组件
 * @param {Object} props - 组件属性
 * @param {string} props.severity - 严重程度（success, info, warning, error）
 * @param {string} props.title - 标题
 * @param {boolean} props.outlined - 是否显示边框
 * @param {boolean} props.filled - 是否填充
 * @param {boolean} props.icon - 是否显示图标
 * @param {React.ReactNode} props.action - 操作
 * @param {Function} props.onClose - 关闭回调
 * @param {string} props.id - 提示ID
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 警告提示组件
 */
export function Alert({
  severity = 'info',
  title,
  outlined = false,
  filled = false,
  icon = true,
  action,
  onClose,
  id,
  className,
  sx,
  children,
  ...rest
}) {
  // 创建ARIA属性
  const alertAttrs = createAlert(children, severity);
  
  // 变体
  const variant = filled ? 'filled' : outlined ? 'outlined' : 'standard';
  
  return (
    <MuiAlert
      severity={severity}
      variant={variant}
      icon={icon}
      action={action}
      onClose={onClose}
      id={id || alertAttrs.id}
      className={className}
      sx={{
        borderRadius: '8px',
        '& .MuiAlert-icon': {
          alignItems: 'center'
        },
        ...sx
      }}
      role="alert"
      {...rest}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}

/**
 * 成功提示组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 成功提示组件
 */
export function SuccessAlert(props) {
  return <Alert severity="success" {...props} />;
}

/**
 * 信息提示组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 信息提示组件
 */
export function InfoAlert(props) {
  return <Alert severity="info" {...props} />;
}

/**
 * 警告提示组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 警告提示组件
 */
export function WarningAlert(props) {
  return <Alert severity="warning" {...props} />;
}

/**
 * 错误提示组件
 * @param {Object} props - 组件属性
 * @returns {React.ReactElement} - 错误提示组件
 */
export function ErrorAlert(props) {
  return <Alert severity="error" {...props} />;
}