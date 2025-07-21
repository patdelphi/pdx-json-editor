/**
 * useGestures Hook测试
 */

import { renderHook, act } from '@testing-library/preact-hooks';
import { useSwipe, usePinch, useLongPress, useDoubleTap, useRotate } from '../useGestures';
import { useTouchDevice } from '../useResponsive';

// 模拟useTouchDevice hook
jest.mock('../useResponsive', () => ({
  useTouchDevice: jest.fn()
}));

describe('useGestures', () => {
  beforeEach(() => {
    // 默认模拟为触摸设备
    useTouchDevice.mockReturnValue(true);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('useSwipe', () => {
    test('应检测水平滑动', () => {
      const onSwipeLeft = jest.fn();
      const onSwipeRight = jest.fn();
      
      const { result } = renderHook(() => useSwipe({
        threshold: 50,
        onSwipeLeft,
        onSwipeRight
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 200, clientY: 100 }]
        });
      });
      
      // 模拟向左滑动
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      expect(onSwipeLeft).toHaveBeenCalled();
      expect(onSwipeRight).not.toHaveBeenCalled();
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      // 模拟向右滑动
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 200, clientY: 100 }]
        });
      });
      
      expect(onSwipeRight).toHaveBeenCalled();
    });
    
    test('应检测垂直滑动', () => {
      const onSwipeUp = jest.fn();
      const onSwipeDown = jest.fn();
      
      const { result } = renderHook(() => useSwipe({
        threshold: 50,
        onSwipeUp,
        onSwipeDown
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 100, clientY: 200 }]
        });
      });
      
      // 模拟向上滑动
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      expect(onSwipeUp).toHaveBeenCalled();
      expect(onSwipeDown).not.toHaveBeenCalled();
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      // 模拟向下滑动
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 200 }]
        });
      });
      
      expect(onSwipeDown).toHaveBeenCalled();
    });
    
    test('在非触摸设备上不应触发', () => {
      // 模拟非触摸设备
      useTouchDevice.mockReturnValue(false);
      
      const onSwipeLeft = jest.fn();
      
      const { result } = renderHook(() => useSwipe({
        onSwipeLeft
      }));
      
      // 模拟触摸事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 200, clientY: 100 }]
        });
        
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      expect(onSwipeLeft).not.toHaveBeenCalled();
      expect(result.current.isEnabled).toBe(false);
    });
  });
  
  describe('usePinch', () => {
    test('应检测捏合手势', () => {
      const onPinchIn = jest.fn();
      const onPinchOut = jest.fn();
      
      const { result } = renderHook(() => usePinch({
        threshold: 10,
        onPinchIn,
        onPinchOut
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 }
          ]
        });
      });
      
      // 模拟捏合手势
      act(() => {
        result.current.handleTouchMove({
          touches: [
            { clientX: 120, clientY: 120 },
            { clientX: 180, clientY: 180 }
          ]
        });
      });
      
      expect(onPinchIn).toHaveBeenCalled();
      expect(onPinchOut).not.toHaveBeenCalled();
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [
            { clientX: 120, clientY: 120 },
            { clientX: 180, clientY: 180 }
          ]
        });
      });
      
      // 模拟展开手势
      act(() => {
        result.current.handleTouchMove({
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 }
          ]
        });
      });
      
      expect(onPinchOut).toHaveBeenCalled();
    });
  });
  
  describe('useLongPress', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    test('应检测长按手势', () => {
      const onLongPress = jest.fn();
      
      const { result } = renderHook(() => useLongPress({
        delay: 500,
        onLongPress
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      // 快进500毫秒
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(onLongPress).toHaveBeenCalled();
      expect(result.current.isLongPress).toBe(true);
      
      // 模拟触摸结束事件
      act(() => {
        result.current.handleTouchEnd();
      });
      
      expect(result.current.isLongPress).toBe(false);
    });
    
    test('移动超过阈值应取消长按', () => {
      const onLongPress = jest.fn();
      
      const { result } = renderHook(() => useLongPress({
        delay: 500,
        onLongPress
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 100, clientY: 100 }]
        });
      });
      
      // 模拟触摸移动事件（移动距离超过阈值）
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientX: 120, clientY: 120 }]
        });
      });
      
      // 快进500毫秒
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(onLongPress).not.toHaveBeenCalled();
      expect(result.current.isLongPress).toBe(false);
    });
  });
  
  describe('useDoubleTap', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    test('应检测双击手势', () => {
      const onDoubleTap = jest.fn();
      
      const { result } = renderHook(() => useDoubleTap({
        delay: 300,
        onDoubleTap
      }));
      
      // 模拟第一次点击
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }],
          preventDefault: jest.fn()
        });
      });
      
      // 快进200毫秒
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // 模拟第二次点击（同一位置）
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }],
          preventDefault: jest.fn()
        });
      });
      
      expect(onDoubleTap).toHaveBeenCalled();
    });
    
    test('点击间隔过长不应触发双击', () => {
      const onDoubleTap = jest.fn();
      
      const { result } = renderHook(() => useDoubleTap({
        delay: 300,
        onDoubleTap
      }));
      
      // 模拟第一次点击
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }],
          preventDefault: jest.fn()
        });
      });
      
      // 快进400毫秒（超过延迟）
      act(() => {
        jest.advanceTimersByTime(400);
      });
      
      // 模拟第二次点击
      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientX: 100, clientY: 100 }],
          preventDefault: jest.fn()
        });
      });
      
      expect(onDoubleTap).not.toHaveBeenCalled();
    });
  });
  
  describe('useRotate', () => {
    test('应检测旋转手势', () => {
      const onRotate = jest.fn();
      
      const { result } = renderHook(() => useRotate({
        threshold: 5,
        onRotate
      }));
      
      // 模拟触摸开始事件
      act(() => {
        result.current.handleTouchStart({
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 }
          ]
        });
      });
      
      // 模拟旋转手势
      act(() => {
        result.current.handleTouchMove({
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 150 }
          ]
        });
      });
      
      expect(onRotate).toHaveBeenCalled();
    });
  });
});