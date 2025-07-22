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
    // 首先验证JSON是否有效
    const parsed = JSON.parse(jsonString);
    
    // 使用JSON.stringify进行格式化
    // 注意：这可能会改变一些值的表示形式，比如数字、布尔值和null
    // 但这是标准的JSON格式化行为
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
    // 首先验证JSON是否有效
    JSON.parse(jsonString);
    
    // 使用更安全的方法压缩JSON
    // 这个方法会保留所有原始内容，只移除不必要的空白字符
    let inString = false;  // 是否在字符串内
    let escaped = false;   // 是否转义
    let compressed = '';   // 压缩后的结果
    
    // 逐字符处理
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      
      // 处理字符串内的字符
      if (inString) {
        compressed += char;
        if (escaped) {
          escaped = false;  // 重置转义状态
        } else if (char === '\\') {
          escaped = true;   // 设置转义状态
        } else if (char === '"') {
          inString = false; // 字符串结束
        }
        continue;
      }
      
      // 处理字符串外的字符
      if (char === '"') {
        inString = true;    // 字符串开始
        compressed += char;
      } else if (/\s/.test(char)) {
        // 忽略字符串外的空白字符
        continue;
      } else {
        compressed += char;
      }
    }
    
    return compressed;
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
    return jsonString; // 返回原始字符串，而不是空字符串
  }
  
  // 尝试先解析，如果已经是有效的JSON，则直接返回原始字符串
  try {
    JSON.parse(jsonString);
    return jsonString; // 已经是有效的JSON，无需修复
  } catch (initialError) {
    // 继续尝试修复
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