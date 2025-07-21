// 这是一个简单的测试文件，用于验证useJsonValidation Hook的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { renderHook, act } from '@testing-library/preact-hooks';
import { useJsonValidation } from '../useJsonValidation';

// 模拟validationService
jest.mock('../../services/validationService', () => ({
  validateJson: jest.fn((json) => {
    if (json.includes('"name": "test"')) {
      return [];
    } else {
      return [{ line: 1, column: 10, message: 'Invalid JSON', severity: 'error' }];
    }
  }),
  jsonErrorToMarker: jest.fn((error) => ({
    severity: error.severity === 'error' ? 8 : 4,
    message: error.message,
    startLineNumber: error.line,
    startColumn: error.column,
    endLineNumber: error.line,
    endColumn: error.column + 1
  }))
}));

describe('useJsonValidation', () => {
  it('should validate JSON and update errors state', () => {
    const { result } = renderHook(() => useJsonValidation());
    
    // 初始状态
    expect(result.current.errors).toEqual([]);
    expect(result.current.isValid).toBe(true);
    
    // 验证有效JSON
    act(() => {
      result.current.validate('{"name": "test"}');
    });
    expect(result.current.errors).toEqual([]);
    expect(result.current.isValid).toBe(true);
    
    // 验证无效JSON
    act(() => {
      result.current.validate('{"invalid": true}');
    });
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.isValid).toBe(false);
  });
  
  it('should set model markers', () => {
    const { result } = renderHook(() => useJsonValidation());
    
    // 模拟Monaco和Model
    const mockMonaco = {
      editor: {
        setModelMarkers: jest.fn()
      }
    };
    const mockModel = {
      uri: 'file:///test.json'
    };
    
    // 设置错误
    act(() => {
      result.current.validate('{"invalid": true}');
    });
    
    // 设置标记
    act(() => {
      result.current.setModelMarkers(mockMonaco, mockModel);
    });
    
    expect(mockMonaco.editor.setModelMarkers).toHaveBeenCalledWith(
      mockModel,
      'pdx-json-editor',
      expect.any(Array)
    );
  });
});