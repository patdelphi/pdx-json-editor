// 这是一个简单的测试文件，用于验证useJsonEditor Hook的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { renderHook, act } from '@testing-library/preact-hooks';
import { useJsonEditor } from '../useJsonEditor';

// 模拟jsonService
jest.mock('../../services/jsonService', () => ({
  formatJson: jest.fn((json, indent) => {
    if (json === '{"name":"test"}') {
      return '{\n  "name": "test"\n}';
    }
    if (json === 'invalid') {
      throw new Error('Invalid JSON');
    }
    return json;
  }),
  compressJson: jest.fn((json) => {
    if (json === '{\n  "name": "test"\n}') {
      return '{"name":"test"}';
    }
    if (json === 'invalid') {
      throw new Error('Invalid JSON');
    }
    return json;
  }),
  tryFixJson: jest.fn((json) => {
    if (json === '{name:"test"}') {
      return '{"name":"test"}';
    }
    return json;
  })
}));

describe('useJsonEditor', () => {
  it('should initialize with provided value', () => {
    const initialValue = '{"name":"test"}';
    const { result } = renderHook(() => useJsonEditor(initialValue));
    
    expect(result.current.value).toBe(initialValue);
    expect(result.current.indentSize).toBe(2);
    expect(result.current.error).toBeNull();
  });
  
  it('should format JSON', () => {
    const initialValue = '{"name":"test"}';
    const { result } = renderHook(() => useJsonEditor(initialValue));
    
    act(() => {
      result.current.formatJson();
    });
    
    expect(result.current.value).toBe('{\n  "name": "test"\n}');
    expect(result.current.error).toBeNull();
  });
  
  it('should handle format error', () => {
    const { result } = renderHook(() => useJsonEditor('invalid'));
    
    act(() => {
      result.current.formatJson();
    });
    
    expect(result.current.error).not.toBeNull();
  });
  
  it('should compress JSON', () => {
    const initialValue = '{\n  "name": "test"\n}';
    const { result } = renderHook(() => useJsonEditor(initialValue));
    
    act(() => {
      result.current.compressJson();
    });
    
    expect(result.current.value).toBe('{"name":"test"}');
    expect(result.current.error).toBeNull();
  });
  
  it('should handle compress error', () => {
    const { result } = renderHook(() => useJsonEditor('invalid'));
    
    act(() => {
      result.current.compressJson();
    });
    
    expect(result.current.error).not.toBeNull();
  });
  
  it('should try to fix JSON', () => {
    const initialValue = '{name:"test"}';
    const { result } = renderHook(() => useJsonEditor(initialValue));
    
    act(() => {
      result.current.tryFixJson();
    });
    
    expect(result.current.value).toBe('{"name":"test"}');
  });
  
  it('should update indent size', () => {
    const { result } = renderHook(() => useJsonEditor());
    
    act(() => {
      result.current.setIndentSize(4);
    });
    
    expect(result.current.indentSize).toBe(4);
  });
});