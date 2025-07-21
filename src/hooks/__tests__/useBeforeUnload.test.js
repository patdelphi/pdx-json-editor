/**
 * useBeforeUnload Hook测试
 */

import { renderHook } from '@testing-library/preact-hooks';
import { useBeforeUnload } from '../useBeforeUnload';

describe('useBeforeUnload', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;
  
  beforeEach(() => {
    // 模拟window.addEventListener和window.removeEventListener
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });
  
  afterEach(() => {
    // 恢复原始方法
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
  
  test('应在isDirty为true时添加beforeunload事件监听器', () => {
    renderHook(() => useBeforeUnload(true));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
  
  test('应在isDirty为false时添加beforeunload事件监听器', () => {
    renderHook(() => useBeforeUnload(false));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
  
  test('应在组件卸载时移除beforeunload事件监听器', () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
  
  test('事件处理函数应在isDirty为true时阻止默认行为', () => {
    renderHook(() => useBeforeUnload(true));
    
    // 获取事件处理函数
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // 创建模拟事件
    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: ''
    };
    
    // 调用事件处理函数
    const result = handler(mockEvent);
    
    // 检查是否阻止了默认行为
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('您有未保存的更改，确定要离开吗？');
    expect(result).toBe('您有未保存的更改，确定要离开吗？');
  });
  
  test('事件处理函数应在isDirty为false时不阻止默认行为', () => {
    renderHook(() => useBeforeUnload(false));
    
    // 获取事件处理函数
    const handler = addEventListenerSpy.mock.calls[0][1];
    
    // 创建模拟事件
    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: ''
    };
    
    // 调用事件处理函数
    const result = handler(mockEvent);
    
    // 检查是否没有阻止默认行为
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('');
    expect(result).toBeUndefined();
  });
});