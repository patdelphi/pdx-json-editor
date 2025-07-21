// 这是一个简单的测试文件，用于验证Monaco折叠功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { configureJsonFolding } from '../monacoService';

describe('monacoFolding', () => {
  it('should register folding range provider', () => {
    // 创建模拟Monaco对象
    const mockMonaco = {
      languages: {
        registerFoldingRangeProvider: jest.fn(),
        FoldingRangeKind: {
          Region: 'region'
        }
      }
    };
    
    // 调用配置函数
    configureJsonFolding(mockMonaco);
    
    // 验证是否注册了折叠范围提供程序
    expect(mockMonaco.languages.registerFoldingRangeProvider).toHaveBeenCalledWith(
      'json',
      expect.any(Object)
    );
  });
  
  it('should provide folding ranges for JSON', () => {
    // 创建模拟Monaco对象
    const mockMonaco = {
      languages: {
        registerFoldingRangeProvider: jest.fn(),
        FoldingRangeKind: {
          Region: 'region'
        }
      }
    };
    
    // 调用配置函数
    configureJsonFolding(mockMonaco);
    
    // 获取注册的提供程序
    const provider = mockMonaco.languages.registerFoldingRangeProvider.mock.calls[0][1];
    
    // 创建模拟模型
    const mockModel = {
      getValue: () => `{
  "object": {
    "nested": {
      "value": 123
    }
  },
  "array": [
    1,
    2,
    3
  ]
}`
    };
    
    // 调用提供程序方法
    const ranges = provider.provideFoldingRanges(mockModel);
    
    // 验证返回的折叠范围
    expect(ranges.length).toBeGreaterThan(0);
  });
});