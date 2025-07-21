/**
 * 反馈组件
 * 提供各种状态反馈和微交互组件
 */

import { useState, useEffect } from 'preact/hooks';
import { Box, CircularProgress, LinearProgress, Fade, Grow, Zoom, Collapse } from '@mui/material';
import { 
  createAnimation, 
  fadeIn, 
  fadeOut, 
  slideInFromTop, 
  slideInFromBottom,
  pulse,
  rotate,
  createLoadingAnimation,
  createSkeletonAnimation
} from '../../utils/animationUtils';

/**
 * 加载中组件
 * @param {Object} props - 组件属性
 * @param {string} props.size - 大小（small, medium, large）
 * @param {string} props.color - 颜色（primary, secondary, error, warning, info, success）
 * @param {string} props.variant - 变体（circular, linear, skeleton）
 * @param {number} props.value - 进度值（0-100）
 * @param {boolean} props.indeterminate - 是否不确定进度
 * @param {string} props.text - 加载文本
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 加载中组件
 */
export function Loading({
  size = 'medium',
  color = 'primary',
  variant = 'circular',
  value = 0,
  indeterminate = true,
  text,
  className,
  sx,
  ...rest
}) {
  // 大小映射
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56
  };
  
  // 计算实际大小
  const actualSize = typeof size === 'string' ? sizeMap[size] || 40 : size;
  
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuetext={text}
      {...rest}
    >
      {variant === 'circular' && (
        <CircularProgress
          size={actualSize}
          color={color}
          variant={indeterminate ? 'indeterminate' : 'determinate'}
          value={value}
          sx={{
            animation: `${rotate} 1.5s linear infinite`,
          }}
        />
      )}
      
      {variant === 'linear' && (
        <LinearProgress
          color={color}
          variant={indeterminate ? 'indeterminate' : 'determinate'}
          value={value}
          sx={{
            width: '100%',
            height: size === 'small' ? 4 : size === 'large' ? 8 : 6,
            borderRadius: '4px',
          }}
        />
      )}
      
      {variant === 'skeleton' && (
        <Box
          sx={{
            width: '100%',
            height: actualSize,
            borderRadius: '4px',
            ...createSkeletonAnimation()
          }}
        />
      )}
      
      {text && (
        <Box
          sx={{
            mt: 2,
            color: `${color}.main`,
            fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
          }}
        >
          {text}
        </Box>
      )}
    </Box>
  );
}

/**
 * 骨架屏组件
 * @param {Object} props - 组件属性
 * @param {string} props.variant - 变体（text, circular, rectangular）
 * @param {number} props.width - 宽度
 * @param {number} props.height - 高度
 * @param {string} props.animation - 动画类型（pulse, wave, false）
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 骨架屏组件
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
  className,
  sx,
  ...rest
}) {
  return (
    <Box
      className={className}
      sx={{
        width,
        height,
        borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.11)',
        ...(animation !== false && createSkeletonAnimation()),
        ...sx
      }}
      {...rest}
    />
  );
}

/**
 * 淡入淡出组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 淡入淡出组件
 */
export function FadeTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Fade in={inProp} timeout={timeout} {...rest}>
      {children}
    </Fade>
  );
}

/**
 * 缩放过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 缩放过渡组件
 */
export function ZoomTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Zoom in={inProp} timeout={timeout} {...rest}>
      {children}
    </Zoom>
  );
}

/**
 * 增长过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 增长过渡组件
 */
export function GrowTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Grow in={inProp} timeout={timeout} {...rest}>
      {children}
    </Grow>
  );
}

/**
 * 折叠过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 折叠过渡组件
 */
export function CollapseTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Collapse in={inProp} timeout={timeout} {...rest}>
      {children}
    </Collapse>
  );
}

/**
 * 脉冲组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.active - 是否激活
 * @param {number} props.duration - 动画持续时间
 * @param {React.ReactNode} props.children - 子元素
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 脉冲组件
 */
export function Pulse({
  active = true,
  duration = 1.5,
  children,
  className,
  sx,
  ...rest
}) {
  return (
    <Box
      className={className}
      sx={{
        ...(active && {
          animation: `${pulse} ${duration}s ease-in-out infinite`
        }),
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * 波纹组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.active - 是否激活
 * @param {string} props.color - 波纹颜色
 * @param {number} props.size - 波纹大小
 * @param {number} props.duration - 动画持续时间
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 波纹组件
 */
export function Ripple({
  active = true,
  color = 'rgba(0, 0, 0, 0.1)',
  size = 100,
  duration = 1.5,
  className,
  sx,
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  
  // 添加波纹
  useEffect(() => {
    if (active) {
      const id = Date.now();
      setRipples(prev => [...prev, { id }]);
      
      // 移除波纹
      const timer = setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [active, duration]);
  
  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        ...sx
      }}
      {...rest}
    >
      {ripples.map(ripple => (
        <Box
          key={ripple.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 1,
            animation: `${fadeOut} ${duration}s ease-out forwards, ${pulse} ${duration}s ease-out forwards`
          }}
        />
      ))}
    </Box>
  );
}

/**
 * 打字机效果组件
 * @param {Object} props - 组件属性
 * @param {string} props.text - 文本
 * @param {number} props.speed - 打字速度
 * @param {boolean} props.loop - 是否循环
 * @param {number} props.delay - 循环延迟
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 打字机效果组件
 */
export function Typewriter({
  text,
  speed = 100,
  loop = false,
  delay = 1000,
  className,
  sx,
  ...rest
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!text) return;
    
    let timer;
    
    if (isDeleting) {
      // 删除文本
      if (displayText.length === 0) {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % (Array.isArray(text) ? text.length : 1));
        timer = setTimeout(() => {}, delay);
      } else {
        timer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, speed / 2);
      }
    } else {
      // 添加文本
      const currentText = Array.isArray(text) ? text[currentIndex] : text;
      
      if (displayText.length < currentText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, speed);
      } else if (loop) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
      }
    }
    
    return () => clearTimeout(timer);
  }, [text, displayText, currentIndex, isDeleting, speed, loop, delay]);
  
  return (
    <Box
      className={className}
      sx={{
        display: 'inline-block',
        ...sx
      }}
      {...rest}
    >
      {displayText}
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: '0.5em',
          height: '1em',
          backgroundColor: 'text.primary',
          animation: `${pulse} 1s ease-in-out infinite`
        }}
      />
    </Box>
  );
}

/**
 * 计数器组件
 * @param {Object} props - 组件属性
 * @param {number} props.start - 起始值
 * @param {number} props.end - 结束值
 * @param {number} props.duration - 动画持续时间
 * @param {string} props.prefix - 前缀
 * @param {string} props.suffix - 后缀
 * @param {number} props.decimals - 小数位数
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 计数器组件
 */
export function Counter({
  start = 0,
  end,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  sx,
  ...rest
}) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (end === undefined) return;
    
    const startTime = Date.now();
    const difference = end - start;
    
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);
      
      const currentCount = start + difference * progress;
      setCount(currentCount);
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [start, end, duration]);
  
  return (
    <Box
      className={className}
      sx={sx}
      {...rest}
    >
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </Box>
  );
}