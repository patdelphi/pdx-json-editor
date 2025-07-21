/**
 * JSON处理服务
 * 提供JSON格式化、压缩和其他处理功能
 */

/**
 * 格式化JSON字符串
 * @param {string} jsonString - 要格式化的JSON字符串
 * @param {number} indentSize - 缩进大小（空格数）
 * @returns {string} - 格式化后的JSON字符串
 * @throws {Error} - 如果JSON无效，则抛出错误
 */
export const formatJson = (jsonString, indentSize = 2) => {
  if (!jsonString || jsonString.trim() === '') {
    return '';
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, indentSize);
  } catch (error) {
    throw new Error(`无法格式化无效的JSON: ${error.message}`);
  }
};

/**
 * 压缩JSON字符串（移除所有空白字符）
 * @param {string} jsonString - 要压缩的JSON字符串
 * @returns {string} - 压缩后的JSON字符串
 * @throws {Error} - 如果JSON无效，则抛出错误
 */
export const compressJson = (jsonString) => {
  if (!jsonString || jsonString.trim() === '') {
    return '';
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`无法压缩无效的JSON: ${error.message}`);
  }
};

/**
 * 尝试修复简单的JSON错误
 * @param {string} jsonString - 可能包含错误的JSON字符串
 * @returns {string} - 尝试修复后的JSON字符串
 */
export const tryFixJson = (jsonString) => {
  if (!jsonString || jsonString.trim() === '') {
    return '';
  }
  
  // 尝试修复常见错误
  let fixedJson = jsonString
    // 修复缺少引号的键
    .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
    // 修复单引号
    .replace(/([{,]\s*)"?(\w+)"?\s*:\s*'([^']*)'(\s*[},])/g, '$1"$2":"$3"$4')
    // 修复尾随逗号
    .replace(/,(\s*[}\]])/g, '$1');
  
  try {
    // 验证修复是否成功
    JSON.parse(fixedJson);
    return fixedJson;
  } catch (error) {
    // 如果修复失败，返回原始字符串
    return jsonString;
  }
};

/**
 * 获取JSON的结构摘要
 * @param {string} jsonString - JSON字符串
 * @returns {Object} - 包含键数量、嵌套深度等信息的摘要对象
 */
export const getJsonSummary = (jsonString) => {
  if (!jsonString || jsonString.trim() === '') {
    return {
      valid: false,
      keyCount: 0,
      depth: 0,
      arrayCount: 0,
      objectCount: 0
    };
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // 计算键数量、嵌套深度等
    let keyCount = 0;
    let maxDepth = 0;
    let arrayCount = 0;
    let objectCount = 0;
    
    const traverse = (obj, depth = 1, maxAllowedDepth = 100) => {
      // 添加深度限制以防止栈溢出
      if (depth > maxAllowedDepth) {
        throw new Error(`JSON嵌套深度超过${maxAllowedDepth}层，可能导致性能问题`);
      }
      
      if (depth > maxDepth) maxDepth = depth;
      
      if (Array.isArray(obj)) {
        arrayCount++;
        obj.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            traverse(item, depth + 1, maxAllowedDepth);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        objectCount++;
        Object.keys(obj).forEach(key => {
          keyCount++;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], depth + 1, maxAllowedDepth);
          }
        });
      }
    };
    
    traverse(parsed);
    
    return {
      valid: true,
      keyCount,
      depth: maxDepth,
      arrayCount,
      objectCount
    };
  } catch (error) {
    return {
      valid: false,
      keyCount: 0,
      depth: 0,
      arrayCount: 0,
      objectCount: 0,
      error: error.message
    };
  }
};