/**
 * 按钮组件
 * 基于设计系统的按钮组件
 */

import { Button as MuiButton } from '@mui/material';
import { ariaAttributes } from '../../utils/accessibilityUtils';

/**
 * 按钮组件
 * @param {Object} props - 组件属性
 * @param {string} props.variant - 按钮变体（contained, outlined, text）
 * @param {string} props.color - 按钮颜色（primary, secondary, success, error, warning, info）
 * @param {string} props.size - 按钮大小（small, medium, large）
 * @param {boolean} props.fullWidth - 是否占满宽度
 * @param {boolean} props.disabled - 是否禁用
 * @param {Function} props.onClick - 点击回调
 * @param {React.ReactNode} props.startIcon - 开始图标
 * @param {React.ReactNode} props.endIcon - 结束图标
 * @param {string} props.type - 按钮类型（button, submit, reset）
 * @param {string} props.href - 链接地址
 * @param {string} props.target - 链接目标
 * @param {string} props.rel - 链接关系
 * @param {string} props.download - 下载文件名
 * @param {string} props.id - 按钮ID
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @param {string} props.ariaLabel - ARIA标签
 * @param {boolean} props.ariaExpanded - ARIA展开状态
 * @param {string} props.ariaControls - ARIA控制元素ID
 * @param {boolean} props.ariaPressed - ARIA按下状态
 * @param {string} props.ariaDescribedby - ARIA描述元素ID
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 按钮组件
 */
export function Button({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  startIcon,
  endIcon,
  type = 'button',
  href,
  target,
  rel,
  download,
  id,
  className,
  sx,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  ariaDescribedby,
  children,
  ...rest
}) {
  // 创建ARIA属性
  const ariaProps = ariaAttributes({
    label: ariaLabel,
    expanded: ariaExpanded,
    controls: ariaControls,
    pressed: ariaPressed,
    describedBy: ariaDescribedby
  });
  
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      type={type}
      href={href}
      target={target}
      rel={rel}
      download={download}
      id={id}
      className={className}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: '8px',
        boxShadow: variant === 'contained' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        '&:hover': {
          boxShadow: variant === 'contained' ? '0 4px 8px rgba(0,0,0,0.15)' : 'none',
        },
        ...sx
      }}
      {...ariaProps}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}