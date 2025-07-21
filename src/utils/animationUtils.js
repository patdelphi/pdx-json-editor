/**
 * 动画工具函数
 * 提供动画和过渡相关的辅助功能
 */

import { keyframes } from '@emotion/react';

/**
 * 淡入动画
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * 淡出动画
 */
export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

/**
 * 从上滑入动画
 */
export const slideInFromTop = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * 从下滑入动画
 */
export const slideInFromBottom = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * 从左滑入动画
 */
export const slideInFromLeft = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * 从右滑入动画
 */
export const slideInFromRight = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * 缩放入场动画
 */
export const zoomIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * 缩放出场动画
 */
export const zoomOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
`;

/**
 * 弹跳动画
 */
export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

/**
 * 脉冲动画
 */
export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * 旋转动画
 */
export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * 闪烁动画
 */
export const blink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

/**
 * 波纹动画
 */
export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

/**
 * 抖动动画
 */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

/**
 * 创建动画样式
 * @param {keyframes} animation - 动画关键帧
 * @param {string} duration - 动画持续时间
 * @param {string} timingFunction - 动画时间函数
 * @param {string} delay - 动画延迟
 * @param {string} iterationCount - 动画迭代次数
 * @param {string} direction - 动画方向
 * @param {string} fillMode - 动画填充模式
 * @returns {Object} - 动画样式对象
 */
export const createAnimation = (
  animation,
  duration = '0.3s',
  timingFunction = 'ease',
  delay = '0s',
  iterationCount = '1',
  direction = 'normal',
  fillMode = 'forwards'
) => {
  return {
    animation: `${animation} ${duration} ${timingFunction} ${delay} ${iterationCount} ${direction} ${fillMode}`
  };
};

/**
 * 创建过渡样式
 * @param {string} properties - 过渡属性
 * @param {string} duration - 过渡持续时间
 * @param {string} timingFunction - 过渡时间函数
 * @param {string} delay - 过渡延迟
 * @returns {Object} - 过渡样式对象
 */
export const createTransition = (
  properties = 'all',
  duration = '0.3s',
  timingFunction = 'ease',
  delay = '0s'
) => {
  return {
    transition: `${properties} ${duration} ${timingFunction} ${delay}`
  };
};

/**
 * 创建悬停效果样式
 * @param {Object} baseStyle - 基础样式
 * @param {Object} hoverStyle - 悬停样式
 * @returns {Object} - 悬停效果样式对象
 */
export const createHoverEffect = (baseStyle, hoverStyle) => {
  return {
    ...baseStyle,
    ...createTransition('all', '0.2s', 'ease'),
    '&:hover': {
      ...hoverStyle
    }
  };
};

/**
 * 创建点击效果样式
 * @param {Object} baseStyle - 基础样式
 * @param {Object} activeStyle - 激活样式
 * @returns {Object} - 点击效果样式对象
 */
export const createActiveEffect = (baseStyle, activeStyle) => {
  return {
    ...baseStyle,
    ...createTransition('all', '0.1s', 'ease'),
    '&:active': {
      ...activeStyle
    }
  };
};

/**
 * 创建按钮点击效果
 * @returns {Object} - 按钮点击效果样式对象
 */
export const createButtonClickEffect = () => {
  return createActiveEffect(
    {},
    {
      transform: 'scale(0.98)',
      boxShadow: 'none'
    }
  );
};

/**
 * 创建卡片悬停效果
 * @returns {Object} - 卡片悬停效果样式对象
 */
export const createCardHoverEffect = () => {
  return createHoverEffect(
    {},
    {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  );
};

/**
 * 创建波纹效果
 * @param {string} color - 波纹颜色
 * @returns {Object} - 波纹效果样式对象
 */
export const createRippleEffect = (color = 'rgba(0, 0, 0, 0.1)') => {
  return {
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      backgroundColor: color,
      borderRadius: 'inherit',
      transform: 'scale(0)',
      opacity: 0,
      transition: 'transform 0.3s, opacity 0.3s'
    },
    '&:active::after': {
      transform: 'scale(2)',
      opacity: 0.3,
      transition: 'transform 0s'
    }
  };
};

/**
 * 创建加载动画
 * @param {string} color - 加载动画颜色
 * @param {string} size - 加载动画大小
 * @returns {Object} - 加载动画样式对象
 */
export const createLoadingAnimation = (color = 'currentColor', size = '20px') => {
  return {
    display: 'inline-block',
    width: size,
    height: size,
    borderRadius: '50%',
    border: `2px solid ${color}`,
    borderTopColor: 'transparent',
    animation: `${rotate} 0.8s linear infinite`
  };
};

/**
 * 创建骨架屏动画
 * @returns {Object} - 骨架屏动画样式对象
 */
export const createSkeletonAnimation = () => {
  const shimmer = keyframes`
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  `;
  
  return {
    background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.06) 25%, rgba(0, 0, 0, 0.12) 37%, rgba(0, 0, 0, 0.06) 63%)',
    backgroundSize: '400% 100%',
    animation: `${shimmer} 1.4s ease infinite`
  };
};

/**
 * 创建渐变背景动画
 * @param {Array} colors - 渐变颜色数组
 * @returns {Object} - 渐变背景动画样式对象
 */
export const createGradientAnimation = (colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']) => {
  const gradient = keyframes`
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  `;
  
  const colorString = colors.join(', ');
  
  return {
    background: `linear-gradient(45deg, ${colorString})`,
    backgroundSize: '400% 400%',
    animation: `${gradient} 15s ease infinite`
  };
};