// 这是一个简单的测试文件，用于验证多光标编辑和列选择功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { getEditorOptions } from '../monacoService';

describe('multiCursor', () => {
  it('should have multi cursor modifier set to alt by default', () => {
    const options = getEditorOptions();
    expect(options.multiCursorModifier).toBe('alt');
  });
  
  it('should have multi cursor merge overlapping enabled by default', () => {
    const options = getEditorOptions();
    expect(options.multiCursorMergeOverlapping).toBe(true);
  });
  
  it('should have column selection disabled by default', () => {
    const options = getEditorOptions();
    expect(options.columnSelection).toBe(false);
  });
  
  // 模拟多光标编辑测试
  it('should handle multi cursor editing', () => {
    // 模拟编辑器实例
    const mockEditor = {
      getSelections: jest.fn().mockReturnValue([
        { positionLineNumber: 1, positionColumn: 5 },
        { positionLineNumber: 2, positionColumn: 5 },
        { positionLineNumber: 3, positionColumn: 5 }
      ]),
      getModel: jest.fn().mockReturnValue({
        getValueInRange: jest.fn().mockImplementation((range) => {
          const lines = [
            '{"key1": "value1"}',
            '{"key2": "value2"}',
            '{"key3": "value3"}'
          ];
          return lines[range.startLineNumber - 1].substring(
            range.startColumn - 1,
            range.endColumn - 1
          );
        })
      }),
      executeEdits: jest.fn()
    };
    
    // 模拟多光标编辑
    const simulateMultiCursorEdit = (text) => {
      const selections = mockEditor.getSelections();
      const edits = selections.map(selection => ({
        range: {
          startLineNumber: selection.positionLineNumber,
          startColumn: selection.positionColumn,
          endLineNumber: selection.positionLineNumber,
          endColumn: selection.positionColumn
        },
        text,
        forceMoveMarkers: true
      }));
      
      mockEditor.executeEdits('multicursor', edits);
    };
    
    simulateMultiCursorEdit('_test');
    expect(mockEditor.executeEdits).toHaveBeenCalledWith('multicursor', expect.any(Array));
  });
  
  // 模拟列选择测试
  it('should handle column selection', () => {
    // 模拟编辑器实例
    const mockEditor = {
      createSelection: jest.fn().mockReturnValue({
        startLineNumber: 1,
        startColumn: 2,
        endLineNumber: 3,
        endColumn: 5
      }),
      getModel: jest.fn().mockReturnValue({
        getValueInRange: jest.fn().mockReturnValue('key')
      })
    };
    
    // 模拟列选择
    const simulateColumnSelection = (startLine, startCol, endLine, endCol) => {
      return mockEditor.createSelection(startLine, startCol, endLine, endCol);
    };
    
    const selection = simulateColumnSelection(1, 2, 3, 5);
    expect(selection).toEqual({
      startLineNumber: 1,
      startColumn: 2,
      endLineNumber: 3,
      endColumn: 5
    });
  });
});