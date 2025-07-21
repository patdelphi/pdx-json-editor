/**
 * 性能监控服务
 * 提供编辑器性能监控和优化功能
 */

/**
 * 性能指标
 * @typedef {Object} PerformanceMetrics
 * @property {number} renderTime - 渲染时间（毫秒）
 * @property {number} memoryUsage - 内存使用（MB）
 * @property {number} fileSize - 文件大小（字节）
 * @property {number} lineCount - 行数
 * @property {number} tokenCount - 标记数
 */

// 性能阈值
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: 100, // 毫秒
  MEMORY_USAGE: 100, // MB
  FILE_SIZE: 5 * 1024 * 1024, // 5MB
  LINE_COUNT: 10000,
  TOKEN_COUNT: 100000
};

/**
 * 监控编辑器性能
 * @param {Object} editor - Monaco编辑器实例
 * @param {Object} model - Monaco编辑器模型
 * @returns {Promise<PerformanceMetrics>} - 性能指标
 */
export const monitorEditorPerformance = async (editor, model) => {
  if (!editor || !model) {
    return null;
  }
  
  const metrics = {
    renderTime: 0,
    memoryUsage: 0,
    fileSize: 0,
    lineCount: 0,
    tokenCount: 0
  };
  
  try {
    // 测量渲染时间
    const startTime = performance.now();
    await new Promise(resolve => {
      // 触发重新渲染
      editor.layout();
      // 等待下一帧
      requestAnimationFrame(() => {
        metrics.renderTime = performance.now() - startTime;
        resolve();
      });
    });
    
    // 获取内存使用情况（如果可用）
    if (window.performance && window.performance.memory) {
      metrics.memoryUsage = window.performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    
    // 获取文件大小
    metrics.fileSize = new Blob([model.getValue()]).size;
    
    // 获取行数
    metrics.lineCount = model.getLineCount();
    
    // 估算标记数（每行平均10个标记）
    metrics.tokenCount = metrics.lineCount * 10;
    
    return metrics;
  } catch (error) {
    console.error('监控编辑器性能失败:', error);
    return metrics;
  }
};

/**
 * 检查是否需要性能优化
 * @param {PerformanceMetrics} metrics - 性能指标
 * @returns {boolean} - 是否需要性能优化
 */
export const needsPerformanceOptimization = (metrics) => {
  if (!metrics) {
    return false;
  }
  
  return (
    metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME ||
    metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_USAGE ||
    metrics.fileSize > PERFORMANCE_THRESHOLDS.FILE_SIZE ||
    metrics.lineCount > PERFORMANCE_THRESHOLDS.LINE_COUNT ||
    metrics.tokenCount > PERFORMANCE_THRESHOLDS.TOKEN_COUNT
  );
};

/**
 * 应用性能优化
 * @param {Object} editor - Monaco编辑器实例
 */
export const applyPerformanceOptimizations = (editor) => {
  if (!editor) {
    return;
  }
  
  // 应用优化选项
  editor.updateOptions({
    // 禁用一些高级功能以提高性能
    folding: false, // 禁用代码折叠
    minimap: {
      enabled: false // 禁用缩略图
    },
    bracketPairColorization: {
      enabled: false // 禁用括号对着色
    },
    formatOnPaste: false, // 禁用粘贴时格式化
    formatOnType: false, // 禁用输入时格式化
    renderWhitespace: 'none', // 不渲染空白字符
    renderControlCharacters: false, // 不渲染控制字符
    renderIndentGuides: false, // 不渲染缩进参考线
    occurrencesHighlight: false, // 禁用相同单词高亮
    renderLineHighlight: 'none', // 禁用当前行高亮
    
    // 性能优化
    largeFileOptimizations: true,
    
    // 限制撤销/重做历史记录
    wordBasedSuggestions: false, // 禁用基于单词的建议
    suggestOnTriggerCharacters: false, // 禁用触发字符的建议
    
    // 虚拟化设置
    scrollBeyondLastLine: false,
    
    // 延迟加载
    quickSuggestions: false, // 禁用快速建议
    parameterHints: {
      enabled: false // 禁用参数提示
    }
  });
};

/**
 * 分块处理大文件
 * @param {string} content - 文件内容
 * @param {number} chunkSize - 块大小（行数）
 * @returns {Array<string>} - 分块后的内容
 */
export const chunkLargeFile = (content, chunkSize = 1000) => {
  if (!content) {
    return [];
  }
  
  const lines = content.split('\n');
  const chunks = [];
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize).join('\n'));
  }
  
  return chunks;
};

/**
 * 延迟验证大文件
 * @param {Object} monaco - Monaco实例
 * @param {Object} model - 编辑器模型
 * @param {Function} validateFn - 验证函数
 */
export const deferredValidation = (monaco, model, validateFn) => {
  if (!monaco || !model || !validateFn) {
    return;
  }
  
  // 清除现有标记
  monaco.editor.setModelMarkers(model, 'pdx-json-editor', []);
  
  // 使用requestIdleCallback延迟验证（如果可用）
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      validateFn(model.getValue());
    }, { timeout: 2000 });
  } else {
    // 回退到setTimeout
    setTimeout(() => {
      validateFn(model.getValue());
    }, 1000);
  }
};