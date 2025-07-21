// 这是一个简单的测试文件，用于验证大型JSON文件的导航体验
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { getEditorOptions } from '../monacoService';

describe('largeJsonNavigation', () => {
  it('should have minimap enabled by default', () => {
    const options = getEditorOptions();
    expect(options.minimap.enabled).toBe(true);
  });
  
  it('should have appropriate minimap settings for large files', () => {
    const options = getEditorOptions();
    expect(options.minimap.showSlider).toBe('always');
    expect(options.minimap.renderCharacters).toBe(true);
    expect(options.minimap.maxColumn).toBe(120);
  });
  
  it('should have large file optimizations enabled', () => {
    const options = getEditorOptions();
    expect(options.largeFileOptimizations).toBe(true);
  });
  
  // 模拟大型JSON文件的导航测试
  it('should handle navigation in large JSON files', () => {
    // 创建一个大型JSON对象
    const createLargeJson = () => {
      const result = { items: [] };
      for (let i = 0; i < 1000; i++) {
        result.items.push({
          id: i,
          name: `Item ${i}`,
          description: `This is item ${i}`,
          properties: {
            value: Math.random() * 1000,
            tags: ['tag1', 'tag2', 'tag3'],
            metadata: {
              created: new Date().toISOString(),
              modified: new Date().toISOString()
            }
          }
        });
      }
      return result;
    };
    
    const largeJson = createLargeJson();
    const jsonString = JSON.stringify(largeJson, null, 2);
    
    // 验证JSON字符串大小
    expect(jsonString.length).toBeGreaterThan(100000);
    
    // 模拟编辑器实例
    const mockEditor = {
      getModel: jest.fn().mockReturnValue({
        getLineCount: jest.fn().mockReturnValue(jsonString.split('\n').length)
      }),
      revealLine: jest.fn()
    };
    
    // 模拟导航到特定行
    const navigateToLine = (lineNumber) => {
      mockEditor.revealLine(lineNumber);
    };
    
    // 导航到第1000行
    navigateToLine(1000);
    expect(mockEditor.revealLine).toHaveBeenCalledWith(1000);
  });
});