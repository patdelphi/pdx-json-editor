/**
 * 文本输入框组件
 * 基于设计系统的文本输入框组件
 */

import { TextField as MuiTextField, InputAdornment } from '@mui/material';
import { ariaAttributes, createErrorId } from '../../utils/accessibilityUtils';

/**
 * 文本输入框组件
 * @param {Object} props - 组件属性
 * @param {string} props.label - 标签
 * @param {string} props.placeholder - 占位符
 * @param {string} props.value - 值
 * @param {Function} props.onChange - 值变化回调
 * @param {string} props.type - 输入类型
 * @param {boolean} props.fullWidth - 是否占满宽度
 * @param {boolean} props.required - 是否必填
 * @param {boolean} props.disabled - 是否禁用
 * @param {boolean} props.error - 是否错误
 * @param {string} props.helperText - 帮助文本
 * @param {string} props.id - 输入框ID
 * @param {string} props.name - 输入框名称
 * @param {string} props.variant - 变体（outlined, filled, standard）
 * @param {string} props.size - 大小（small, medium）
 * @param {number} props.maxLength - 最大长度
 * @param {number} props.minLength - 最小长度
 * @param {string} props.pattern - 正则表达式模式
 * @param {boolean} props.autoFocus - 是否自动聚焦
 * @param {boolean} props.autoComplete - 是否自动完成
 * @param {React.ReactNode} props.startAdornment - 开始装饰
 * @param {React.ReactNode} props.endAdornment - 结束装饰
 * @param {Function} props.onFocus - 聚焦回调
 * @param {Function} props.onBlur - 失焦回调
 * @param {Function} props.onKeyDown - 按键回调
 * @param {Function} props.onKeyUp - 按键回调
 * @param {Function} props.onKeyPress - 按键回调
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @param {string} props.ariaLabel - ARIA标签
 * @param {string} props.ariaDescribedby - ARIA描述元素ID
 * @param {boolean} props.ariaRequired - ARIA必填
 * @param {boolean} props.ariaInvalid - ARIA无效
 * @param {string} props.ariaErrorMessage - ARIA错误消息
 * @returns {React.ReactElement} - 文本输入框组件
 */
export function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  fullWidth = true,
  required = false,
  disabled = false,
  error = false,
  helperText,
  id,
  name,
  variant = 'outlined',
  size = 'medium',
  maxLength,
  minLength,
  pattern,
  autoFocus = false,
  autoComplete = 'off',
  startAdornment,
  endAdornment,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  className,
  sx,
  ariaLabel,
  ariaDescribedby,
  ariaRequired,
  ariaInvalid,
  ariaErrorMessage,
  ...rest
}) {
  // 生成错误ID
  const errorId = id ? createErrorId(id) : undefined;
  
  // 创建ARIA属性
  const ariaProps = ariaAttributes({
    label: ariaLabel || label,
    required: ariaRequired !== undefined ? ariaRequired : required,
    invalid: ariaInvalid !== undefined ? ariaInvalid : error,
    errorMessage: ariaErrorMessage,
    describedBy: ariaDescribedby || (error && helperText ? errorId : undefined)
  });
  
  // 输入属性
  const inputProps = {
    maxLength,
    minLength,
    pattern,
    autoComplete,
    ...ariaProps
  };
  
  // 输入装饰
  const inputAdornmentProps = {};
  
  if (startAdornment) {
    inputAdornmentProps.startAdornment = (
      <InputAdornment position="start">{startAdornment}</InputAdornment>
    );
  }
  
  if (endAdornment) {
    inputAdornmentProps.endAdornment = (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    );
  }
  
  return (
    <MuiTextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      id={id}
      name={name}
      variant={variant}
      size={size}
      autoFocus={autoFocus}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onKeyPress={onKeyPress}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
        '& .MuiFilledInput-root': {
          borderRadius: '8px 8px 0 0',
        },
        ...sx
      }}
      InputProps={inputAdornmentProps}
      inputProps={inputProps}
      FormHelperTextProps={{
        id: error ? errorId : undefined
      }}
      {...rest}
    />
  );
}