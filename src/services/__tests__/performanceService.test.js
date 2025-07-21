/**
 * 性能服务测试
 */

import { 
  monitorEditorPerformance, 
  needsPerformanceOptimization, 
  applyPerformanceOptimizations,
  chunkLargeFile,
  deferredValidation
} from '../performanceService';

// 模拟performance API
const originalPerformance = global.performance;
const mockPerformance = {
  now: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(150),
  memory: {
    usedJSHeapSize: 120 * 1024 * 1024 // 120MB
  }
};

// 模拟requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));

// 模拟requestIdleCallback
global.requestIdleCallback = jest.fn(callback => setTimeout(callback, 0));

describe('性能服务', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.performance = mockPerformance;
  });
  
  afterEach(() => {
    global.performance = originalPerformance;
  });
  
  test('应能监控编辑器性能', async () => {
    // 模拟编辑器和模型
    const mockEditor = {
      layout: jest.fn()
    };
    
    const mockModel = {
      getValue: jest.fn().mockReturnValue('{"test":"value"}'),
      getLineCount: jest.fn().mockReturnValue(1000)
    };
    
    // 监控性能
    const metrics = await monitorEditorPerformance(mockEditor, mockModel);
    
    // 验证结果
    expect(metrics).toBeDefined();
    expect(metrics.renderTime).toBe(150);
    expect(metrics.memoryUsage).toBe(120);
    expect(metrics.lineCount).toBe(1000);
    expect(metrics.tokenCount).toBe(10000);
    
    // 验证方法调用
    expect(mockEditor.layout).toHaveBeenCalled();
    expect(mockModel.getValue).toHaveBeenCalled();
    expect(mockModel.getLineCount).toHaveBeenCalled();
  });
  
  test('应能检测是否需要性能优化', () => {
    // 不需要优化的指标
    const goodMetrics = {
      renderTime: 50,
      memoryUsage: 50,
      fileSize: 1024 * 1024, // 1MB
      lineCount: 5000,
      tokenCount: 50000
    };
    
    // 需要优化的指标
    const badMetrics = {
      renderTime: 200,
      memoryUsage: 200,
      fileSize: 10 * 1024 * 1024, // 10MB
      lineCount: 20000,
      tokenCount: 200000
    };
    
    // 验证结果
    expect(needsPerformanceOptimization(goodMetrics)).toBe(false);
    expect(needsPerformanceOptimization(badMetrics)).toBe(true);
  });
  
  test('应能应用性能优化', () => {
    // 模拟编辑器
    const mockEditor = {
      updateOptions: jest.fn()
    };
    
    // 应用优化
    applyPerformanceOptimizations(mockEditor);
    
    // 验证方法调用
    expect(mockEditor.updateOptions).toHaveBeenCalledWith(expect.objectContaining({
      folding: false,
      minimap: { enabled: false },
      largeFileOptimizations: true
    }));
  });
  
  test('应能分块处理大文件', () => {
    // 创建测试内容
    const content = Array(5000).fill('test line').join('\n');
    
    // 分块处理
    const chunks = chunkLargeFile(content, 1000);
    
    // 验证结果
    expect(chunks).toHaveLength(5);
    expect(chunks[0].split('\n')).toHaveLength(1000);
  });
  
  test('应能延迟验证大文件', () => {
    // 模拟Monaco和模型
    const mockMonaco = {
      editor: {
        setModelMarkers: jest.fn()
      }
    };
    
    const mockModel = {
      getValue: jest.fn().mockReturnValue('{"test":"value"}')
    };
    
    // 模拟验证函数
    const validateFn = jest.fn();
    
    // 延迟验证
    deferredValidation(mockMonaco, mockModel, validateFn);
    
    // 验证方法调用
    expect(mockMonaco.editor.setModelMarkers).toHaveBeenCalled();
    
    // 验证延迟验证
    return new Promise(resolve => {
      setTimeout(() => {
        expect(validateFn).toHaveBeenCalledWith('{"test":"value"}');
        resolve();
      }, 100);
    });
  });
});