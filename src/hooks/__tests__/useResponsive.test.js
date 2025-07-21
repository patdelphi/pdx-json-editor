/**
 * useResponsive Hook测试
 */

import { renderHook } from '@testing-library/preact-hooks';
import { useMediaQuery, useBreakpoint, useTouchDevice } from '../useResponsive';

// 模拟matchMedia
const createMatchMedia = (matches) => {
  return (query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

describe('useResponsive', () => {
  const originalMatchMedia = window.matchMedia;
  
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });
  
  describe('useMediaQuery', () => {
    test('应返回媒体查询结果', () => {
      // 模拟匹配
      window.matchMedia = createMatchMedia(true);
      
      const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
      
      expect(result.current).toBe(true);
      
      // 模拟不匹配
      window.matchMedia = createMatchMedia(false);
      
      const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 600px)'));
      
      expect(result2.current).toBe(false);
    });
  });
  
  describe('useBreakpoint', () => {
    test('应返回正确的断点信息', () => {
      // 模拟移动设备
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 599px)') {
          return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
        }
        return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      });
      
      const { result } = renderHook(() => useBreakpoint());
      
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.breakpoint).toBe('xs');
      
      // 模拟平板设备
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(min-width: 600px) and (max-width: 959px)') {
          return { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
        }
        return { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      });
      
      const { result: result2 } = renderHook(() => useBreakpoint());
      
      expect(result2.current.isMobile).toBe(false);
      expect(result2.current.isTablet).toBe(true);
      expect(result2.current.isDesktop).toBe(false);
      expect(result2.current.breakpoint).toBe('sm');
    });
  });
  
  describe('useTouchDevice', () => {
    test('应检测触摸设备', () => {
      // 模拟触摸设备
      window.ontouchstart = {};
      
      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toBe(true);
      
      // 模拟非触摸设备
      delete window.ontouchstart;
      
      const { result: result2 } = renderHook(() => useTouchDevice());
      
      expect(result2.current).toBe(false);
    });
  });
});