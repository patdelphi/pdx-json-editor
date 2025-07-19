/**
 * 大文件处理工具
 */

/**
 * 检查文件大小是否超过阈值
 * @param content 文件内容
 * @param threshold 阈值（字节）
 * @returns 是否超过阈值
 */
export function isLargeFile(content: string, threshold: number = 1024 * 1024): boolean {
  return new Blob([content]).size > threshold;
}

/**
 * 分块处理大文件
 * @param content 文件内容
 * @param chunkSize 块大小（字节）
 * @param processor 处理函数
 * @returns 处理结果
 */
export function processInChunks<T>(
  content: string,
  chunkSize: number = 100000,
  processor: (chunk: string) => T
): T[] {
  const results: T[] = [];
  let start = 0;
  
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    const chunk = content.substring(start, end);
    results.push(processor(chunk));
    start = end;
  }
  
  return results;
}

/**
 * 优化大JSON文件的格式化
 * @param content JSON内容
 * @param indentSize 缩进大小
 * @returns 格式化后的JSON
 */
export function optimizedFormatJson(content: string, indentSize: number = 2): string {
  try {
    // 对于小文件，直接使用标准方法
    if (!isLargeFile(content)) {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, indentSize);
    }
    
    // 对于大文件，使用流式处理
    // 注意：这是一个简化的实现，实际上大型JSON的格式化需要更复杂的处理
    // 这里我们使用一个简单的方法，将JSON解析后重新序列化
    
    // 首先尝试解析JSON
    const parsed = JSON.parse(content);
    
    // 使用自定义格式化函数，避免一次性生成大字符串
    let result = '';
    let level = 0;
    
    // 递归格式化对象
    function formatObject(obj: any, isArray: boolean = false): void {
      const indent = ' '.repeat(indentSize * level);
      const nextIndent = ' '.repeat(indentSize * (level + 1));
      
      if (isArray) {
        if (obj.length === 0) {
          result += '[]';
          return;
        }
        
        result += '[\n';
        level++;
        
        for (let i = 0; i < obj.length; i++) {
          result += nextIndent;
          formatValue(obj[i]);
          
          if (i < obj.length - 1) {
            result += ',';
          }
          result += '\n';
        }
        
        level--;
        result += indent + ']';
      } else {
        const keys = Object.keys(obj);
        
        if (keys.length === 0) {
          result += '{}';
          return;
        }
        
        result += '{\n';
        level++;
        
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          result += nextIndent + '"' + key + '": ';
          formatValue(obj[key]);
          
          if (i < keys.length - 1) {
            result += ',';
          }
          result += '\n';
        }
        
        level--;
        result += indent + '}';
      }
    }
    
    // 格式化值
    function formatValue(value: any): void {
      if (value === null) {
        result += 'null';
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          formatObject(value, true);
        } else {
          formatObject(value);
        }
      } else if (typeof value === 'string') {
        result += JSON.stringify(value);
      } else {
        result += String(value);
      }
    }
    
    // 开始格式化
    formatValue(parsed);
    
    return result;
  } catch (error) {
    console.error('Error formatting large JSON:', error);
    throw error;
  }
}

/**
 * 优化大JSON文件的压缩
 * @param content JSON内容
 * @returns 压缩后的JSON
 */
export function optimizedMinifyJson(content: string): string {
  try {
    // 对于小文件，直接使用标准方法
    if (!isLargeFile(content)) {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed);
    }
    
    // 对于大文件，使用流式处理
    // 这里我们使用一个简单的方法，将JSON解析后重新序列化，不添加空格
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('Error minifying large JSON:', error);
    throw error;
  }
}

/**
 * 大文件警告阈值（字节）
 */
export const LARGE_FILE_WARNING_THRESHOLD = 1 * 1024 * 1024; // 1MB

/**
 * 大文件错误阈值（字节）
 */
export const LARGE_FILE_ERROR_THRESHOLD = 10 * 1024 * 1024; // 10MB

export default {
  isLargeFile,
  processInChunks,
  optimizedFormatJson,
  optimizedMinifyJson,
  LARGE_FILE_WARNING_THRESHOLD,
  LARGE_FILE_ERROR_THRESHOLD
};