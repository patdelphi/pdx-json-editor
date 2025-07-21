/**
 * 响应式Hook
 * 提供响应式设计相关的功能
 */

import { useState, useEffect } from 'preact/hooks';

/**
 * 断点定义
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

/**
 * 使用媒体查询的Hook
 * @param {string} query - 媒体查询字符串
 * @returns {boolean} - 媒体查询结果
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // 设置初始值
    setMatches(mediaQuery.matches);
    
    // 监听媒体查询变化
    const handleChange = (event) => {
      setMatches(event.matches);
    };
    
    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }
    
    // 清理监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);
  
  return matches;
};

/**
 * 使用断点的Hook
 * @returns {{
 *   isMobile: boolean,
 *   isTablet: boolean,
 *   isDesktop: boolean,
 *   isLargeDesktop: boolean,
 *   breakpoint: string
 * }} - 断点相关状态
 */
export const useBreakpoint = () => {
  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  
  // 当前断点
  const breakpoint = isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : 'xl';
  
  return {
    isMobile: isXs,
    isTablet: isSm || isMd,
    isDesktop: isLg || isXl,
    isLargeDesktop: isXl,
    breakpoint
  };
};

/**
 * 使用触摸设备检测的Hook
 * @returns {boolean} - 是否为触摸设备
 */
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    // 检测是否为触摸设备
    const isTouchDevice = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;
    
    setIsTouch(isTouchDevice);
  }, []);
  
  return isTouch;
};

/**
 * 使用屏幕方向的Hook
 * @returns {string} - 屏幕方向 ('portrait' 或 'landscape')
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    // 获取初始方向
    const getOrientation = () => {
      if (window.screen && window.screen.orientation) {
        return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
      } else if (window.matchMedia) {
        return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      }
      return 'portrait';
    };
    
    setOrientation(getOrientation());
    
    // 监听方向变化
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else if (window.matchMedia) {
      window.matchMedia('(orientation: portrait)').addEventListener('change', handleOrientationChange);
    }
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else if (window.matchMedia) {
        window.matchMedia('(orientation: portrait)').removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);
  
  return orientation;
};