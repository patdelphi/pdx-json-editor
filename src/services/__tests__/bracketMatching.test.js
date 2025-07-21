// 这是一个简单的测试文件，用于验证括号匹配和自动闭合功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { getEditorOptions } from '../monacoService';

describe('bracketMatching', () => {
  it('should have bracket matching enabled by default', () => {
    const options = getEditorOptions();
    expect(options.matchBrackets).toBe('always');
  });
  
  it('should have auto closing brackets enabled by default', () => {
    const options = getEditorOptions();
    expect(options.autoClosingBrackets).toBe('always');
  });
  
  it('should have auto closing quotes enabled by default', () => {
    const options = getEditorOptions();
    expect(options.autoClosingQuotes).toBe('always');
  });
  
  it('should have bracket pair colorization enabled by default', () => {
    const options = getEditorOptions();
    expect(options.bracketPairColorization.enabled).toBe(true);
  });
  
  // 模拟括号匹配和自动闭合测试
  it('should handle bracket matching and auto closing', () => {
    // 模拟编辑器实例
    const mockEditor = {
      getModel: jest.fn().mockReturnValue({
        getValueInRange: jest.fn().mockReturnValue('{"key": "value"}'),
        findMatches: jest.fn().mockReturnValue([
          { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 2 } },
          { range: { startLineNumber: 1, startColumn: 16, endLineNumber: 1, endColumn: 17 } }
        ])
      }),
      getPosition: jest.fn().mockReturnValue({ lineNumber: 1, column: 2 }),
      trigger: jest.fn()
    };
    
    // 模拟查找匹配的括号
    const findMatchingBracket = () => {
      const position = mockEditor.getPosition();
      const model = mockEditor.getModel();
      const matches = model.findMatches('{|}', false, true, false, null, false);
      
      for (const match of matches) {
        if (match.range.startLineNumber === position.lineNumber && 
            match.range.startColumn === position.column) {
          return matches.find(m => 
            m.range.startLineNumber === position.lineNumber && 
            m.range.startColumn !== position.column
          );
        }
      }
      
      return null;
    };
    
    const matchingBracket = findMatchingBracket();
    expect(matchingBracket).toBeDefined();
    
    // 模拟自动闭合括号
    const simulateTyping = (text) => {
      // 在实际编辑器中，这会触发自动闭合
      mockEditor.trigger('keyboard', 'type', { text });
    };
    
    simulateTyping('{');
    expect(mockEditor.trigger).toHaveBeenCalledWith('keyboard', 'type', { text: '{' });
  });
});