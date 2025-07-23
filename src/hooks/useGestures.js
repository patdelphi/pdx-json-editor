/**
 * 手势Hook
 * 提供触摸手势相关的功能
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import { useTouchDevice } from './useResponsive';

/**
 * 使用滑动手势的Hook
 * @param {Object} options - 选项
 * @param {number} options.threshold - 滑动阈值（像素）
 * @param {Function} options.onSwipeLeft - 向左滑动回调
 * @param {Function} options.onSwipeRight - 向右滑动回调
 * @param {Function} options.onSwipeUp - 向上滑动回调
 * @param {Function} options.onSwipeDown - 向下滑动回调
 * @returns {Object} - 手势处理函数
 */
export const useSwipe = ({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown
} = {}) => {
  const isTouch = useTouchDevice();
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchEndRef = useRef({ x: 0, y: 0, time: 0 });
  
  // 处理触摸开始
  const handleTouchStart = (e) => {
    if (!isTouch) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };
  
  // 处理触摸结束
  const handleTouchEnd = (e) => {
    if (!isTouch) return;
    
    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    handleSwipe();
  };
  
  // 处理滑动
  const handleSwipe = () => {
    const { x: startX, y: startY, time: startTime } = touchStartRef.current;
    const { x: endX, y: endY, time: endTime } = touchEndRef.current;
    
    const distanceX = endX - startX;
    const distanceY = endY - startY;
    const duration = endTime - startTime;
    
    // 检查是否为快速滑动（小于300毫秒）
    const isQuickSwipe = duration < 300;
    
    // 水平滑动
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > threshold) {
      if (distanceX > 0 && onSwipeRight) {
        onSwipeRight({ distance: distanceX, duration, isQuick: isQuickSwipe });
      } else if (distanceX < 0 && onSwipeLeft) {
        onSwipeLeft({ distance: Math.abs(distanceX), duration, isQuick: isQuickSwipe });
      }
    }
    // 垂直滑动
    else if (Math.abs(distanceY) > threshold) {
      if (distanceY > 0 && onSwipeDown) {
        onSwipeDown({ distance: distanceY, duration, isQuick: isQuickSwipe });
      } else if (distanceY < 0 && onSwipeUp) {
        onSwipeUp({ distance: Math.abs(distanceY), duration, isQuick: isQuickSwipe });
      }
    }
  };
  
  return {
    handleTouchStart,
    handleTouchEnd,
    isEnabled: isTouch
  };
};

/**
 * 使用捏合手势的Hook
 * @param {Object} options - 选项
 * @param {Function} options.onPinchIn - 捏合回调
 * @param {Function} options.onPinchOut - 展开回调
 * @param {number} options.threshold - 捏合阈值
 * @returns {Object} - 手势处理函数
 */
export const usePinch = ({
  onPinchIn,
  onPinchOut,
  threshold = 10
} = {}) => {
  const isTouch = useTouchDevice();
  const touchesRef = useRef([]);
  const initialDistanceRef = useRef(null);
  
  // 处理触摸开始
  const handleTouchStart = (e) => {
    if (!isTouch) return;
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      touchesRef.current = [
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      ];
      
      initialDistanceRef.current = getDistance(touchesRef.current[0], touchesRef.current[1]);
    }
  };
  
  // 处理触摸移动
  const handleTouchMove = (e) => {
    if (!isTouch) return;
    
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentTouches = [
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      ];
      
      const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
      const distanceDiff = currentDistance - initialDistanceRef.current;
      
      if (Math.abs(distanceDiff) > threshold) {
        if (distanceDiff < 0 && onPinchIn) {
          onPinchIn({ distance: Math.abs(distanceDiff) });
        } else if (distanceDiff > 0 && onPinchOut) {
          onPinchOut({ distance: distanceDiff });
        }
        
        // 更新初始距离，以便连续捏合
        initialDistanceRef.current = currentDistance;
      }
    }
  };
  
  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isTouch) return;
    initialDistanceRef.current = null;
  };
  
  // 计算两点之间的距离
  const getDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isEnabled: isTouch
  };
};

/**
 * 使用长按手势的Hook
 * @param {Object} options - 选项
 * @param {Function} options.onLongPress - 长按回调
 * @param {number} options.delay - 长按延迟（毫秒）
 * @returns {Object} - 手势处理函数
 */
export const useLongPress = ({
  onLongPress,
  delay = 500
} = {}) => {
  const isTouch = useTouchDevice();
  const timerRef = useRef(null);
  const touchPositionRef = useRef({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  
  // 处理触摸开始
  const handleTouchStart = (e) => {
    if (!isTouch) return;
    
    const touch = e.touches[0];
    touchPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    timerRef.current = setTimeout(() => {
      setIsLongPress(true);
      if (onLongPress) {
        onLongPress({
          x: touchPositionRef.current.x,
          y: touchPositionRef.current.y
        });
      }
    }, delay);
  };
  
  // 处理触摸移动
  const handleTouchMove = (e) => {
    if (!isTouch) return;
    
    const touch = e.touches[0];
    const currentPosition = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    // 如果移动距离超过阈值，取消长按
    const moveThreshold = 10;
    const dx = currentPosition.x - touchPositionRef.current.x;
    const dy = currentPosition.y - touchPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > moveThreshold) {
      clearTimeout(timerRef.current);
      setIsLongPress(false);
    }
  };
  
  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isTouch) return;
    clearTimeout(timerRef.current);
    setIsLongPress(false);
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isLongPress,
    isEnabled: isTouch
  };
};

/**
 * 使用双击手势的Hook
 * @param {Object} options - 选项
 * @param {Function} options.onDoubleTap - 双击回调
 * @param {number} options.delay - 双击间隔（毫秒）
 * @returns {Object} - 手势处理函数
 */
export const useDoubleTap = ({
  onDoubleTap,
  delay = 300
} = {}) => {
  const isTouch = useTouchDevice();
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  
  // 处理触摸结束（点击）
  const handleTouchEnd = (e) => {
    if (!isTouch) return;
    
    const touch = e.changedTouches[0];
    const currentTime = Date.now();
    const currentPosition = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    const { time: lastTime, x: lastX, y: lastY } = lastTapRef.current;
    const timeDiff = currentTime - lastTime;
    
    // 检查是否为双击
    if (timeDiff < delay) {
      // 检查两次点击的位置是否接近
      const dx = currentPosition.x - lastX;
      const dy = currentPosition.y - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20) {
        // 防止事件冒泡
        e.preventDefault();
        
        if (onDoubleTap) {
          onDoubleTap({
            x: currentPosition.x,
            y: currentPosition.y
          });
        }
        
        // 重置最后点击时间，防止连续触发
        lastTapRef.current.time = 0;
        return;
      }
    }
    
    // 更新最后点击信息
    lastTapRef.current = {
      time: currentTime,
      x: currentPosition.x,
      y: currentPosition.y
    };
  };
  
  return {
    handleTouchEnd,
    isEnabled: isTouch
  };
};

/**
 * 使用旋转手势的Hook
 * @param {Object} options - 选项
 * @param {Function} options.onRotate - 旋转回调
 * @param {number} options.threshold - 旋转阈值（度）
 * @returns {Object} - 手势处理函数
 */
export const useRotate = ({
  onRotate,
  threshold = 5
} = {}) => {
  const isTouch = useTouchDevice();
  const initialAngleRef = useRef(null);
  const lastAngleRef = useRef(null);
  
  // 处理触摸开始
  const handleTouchStart = (e) => {
    if (!isTouch) return;
    
    if (e.touches.length === 2) {
      const angle = getAngle(e.touches[0], e.touches[1]);
      initialAngleRef.current = angle;
      lastAngleRef.current = angle;
    }
  };
  
  // 处理触摸移动
  const handleTouchMove = (e) => {
    if (!isTouch) return;
    
    if (e.touches.length === 2 && initialAngleRef.current !== null) {
      const currentAngle = getAngle(e.touches[0], e.touches[1]);
      let rotation = currentAngle - lastAngleRef.current;
      
      // 处理角度跨越360度的情况
      if (rotation > 180) rotation -= 360;
      if (rotation < -180) rotation += 360;
      
      if (Math.abs(rotation) > threshold && onRotate) {
        onRotate({
          rotation,
          absolute: currentAngle,
          relative: currentAngle - initialAngleRef.current
        });
        
        lastAngleRef.current = currentAngle;
      }
    }
  };
  
  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isTouch) return;
    initialAngleRef.current = null;
    lastAngleRef.current = null;
  };
  
  // 计算两点之间的角度
  const getAngle = (touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    
    // 计算角度（弧度）并转换为度
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 将角度转换为0-360范围
    if (angle < 0) {
      angle += 360;
    }
    
    return angle;
  };
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isEnabled: isTouch
  };
};