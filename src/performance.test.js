/**
 * 性能测试
 */

import { monitorEditorPerformance, needsPerformanceOptimization } from './services/performanceService';

// 生成大型JSON数据
const generateLargeJson = (size) => {
  const data = {
    items: []
  };
  
  for (let i = 0; i < size; i++) {
    data.items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is item ${i}`,
      value: Math.random(),
      tags: ['tag1', 'tag2', 'tag3'],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: i % 2 === 0 ? 'active' : 'inactive'
      }
    });
  }
  
  return JSON.stringify(data, null, 2);
};

// 测试不同大小的JSON数据
const testSizes = [100, 1000, 10000, 50000];

// 模拟编辑器和模型
const createMockEditor = (content) => {
  return {
    layout: jest.fn(),
    getValue: jest.fn().mockReturnValue(content),
    getModel: jest.fn().mockReturnValue({
      getValue: jest.fn().mockReturnValue(content),
      getLineCount: jest.fn().mockReturnValue(content.split('\n').length)
    }),
    updateOptions: jest.fn()
  };
};

// 性能测试
describe('性能测试', () => {
  // 测试初始加载时间
  test('测量初始加载时间', async () => {
    // 记录开始时间
    const startTime = performance.now();
    
    // 导入App组件（模拟初始加载）
    const { App } = await import('./App');
    
    // 记录结束时间
    const endTime = performance.now();
    
    // 计算加载时间
    const loadTime = endTime - startTime;
    
    // 输出加载时间
    console.log(`初始加载时间: ${loadTime.toFixed(2)}ms`);
    
    // 验证加载时间是否在可接受范围内
    expect(loadTime).toBeLessThan(1000);
  });
  
  // 测试不同大小的JSON数据处理性能
  test.each(testSizes)('测量处理%d项的JSON性能', async (size) => {
    // 生成大型JSON数据
    const content = generateLargeJson(size);
    
    // 创建模拟编辑器
    const mockEditor = createMockEditor(content);
    
    // 记录开始时间
    const startTime = performance.now();
    
    // 解析JSON
    JSON.parse(content);
    
    // 记录解析时间
    const parseTime = performance.now() - startTime;
    
    // 监控编辑器性能
    const metrics = await monitorEditorPerformance(mockEditor, mockEditor.getModel());
    
    // 输出性能指标
    console.log(`JSON大小(${size}项):`);
    console.log(`- 文件大小: ${metrics.fileSize / 1024} KB`);
    console.log(`- 行数: ${metrics.lineCount}`);
    console.log(`- 解析时间: ${parseTime.toFixed(2)}ms`);
    console.log(`- 渲染时间: ${metrics.renderTime.toFixed(2)}ms`);
    
    // 检查是否需要性能优化
    const needsOptimization = needsPerformanceOptimization(metrics);
    console.log(`- 需要性能优化: ${needsOptimization}`);
    
    // 验证大文件是否需要性能优化
    if (size >= 10000) {
      expect(needsOptimization).toBe(true);
    }
  });
  
  // 测试格式化性能
  test.each([100, 1000, 10000])('测量格式化%d项的JSON性能', (size) => {
    // 生成压缩的JSON数据
    const content = JSON.stringify(JSON.parse(generateLargeJson(size)));
    
    // 记录开始时间
    const startTime = performance.now();
    
    // 格式化JSON
    const formatted = JSON.stringify(JSON.parse(content), null, 2);
    
    // 记录格式化时间
    const formatTime = performance.now() - startTime;
    
    // 输出格式化时间
    console.log(`格式化${size}项JSON的时间: ${formatTime.toFixed(2)}ms`);
    
    // 验证格式化时间是否在可接受范围内
    expect(formatTime).toBeLessThan(size * 0.5);
  });
  
  // 测试压缩性能
  test.each([100, 1000, 10000])('测量压缩%d项的JSON性能', (size) => {
    // 生成格式化的JSON数据
    const content = generateLargeJson(size);
    
    // 记录开始时间
    const startTime = performance.now();
    
    // 压缩JSON
    const compressed = JSON.stringify(JSON.parse(content));
    
    // 记录压缩时间
    const compressTime = performance.now() - startTime;
    
    // 输出压缩时间
    console.log(`压缩${size}项JSON的时间: ${compressTime.toFixed(2)}ms`);
    
    // 验证压缩时间是否在可接受范围内
    expect(compressTime).toBeLessThan(size * 0.5);
  });
  
  // 测试验证性能
  test.each([100, 1000, 10000])('测量验证%d项的JSON性能', (size) => {
    // 生成JSON数据
    const content = generateLargeJson(size);
    
    // 记录开始时间
    const startTime = performance.now();
    
    // 验证JSON
    try {
      JSON.parse(content);
    } catch (error) {
      console.error('JSON验证失败:', error);
    }
    
    // 记录验证时间
    const validateTime = performance.now() - startTime;
    
    // 输出验证时间
    console.log(`验证${size}项JSON的时间: ${validateTime.toFixed(2)}ms`);
    
    // 验证验证时间是否在可接受范围内
    expect(validateTime).toBeLessThan(size * 0.5);
  });
});