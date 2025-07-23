/**
 * JSON验证服务
 * 提供JSON验证和错误处理功能
 */

/**
 * JSON错误接口
 * @typedef {Object} JsonError
 * @property {number} line - 错误所在行号
 * @property {number} column - 错误所在列号
 * @property {string} message - 错误信息
 * @property {('error'|'warning')} severity - 错误严重程度
 */

/**
 * 验证JSON字符串
 * @param {string} jsonString - 要验证的JSON字符串
 * @returns {JsonError[]} - 错误列表
 */
export const validateJson = (jsonString) => {
  if (!jsonString || jsonString.trim() === '') {
    return [];
  }

  try {
    JSON.parse(jsonString);
    return []; // 如果解析成功，返回空错误列表
  } catch (error) {
    return parseJsonError(error, jsonString);
  }
};

/**
 * 解析JSON错误并转换为编辑器可用的错误对象
 * @param {Error} error - JSON解析错误
 * @param {string} jsonString - 原始JSON字符串
 * @returns {JsonError[]} - 错误列表
 */
export const parseJsonError = (error, jsonString) => {
  const message = error.message;
  const lines = jsonString.split('\n');
  
  // 尝试从错误消息中提取位置信息
  const positionMatch = /at position (\d+)/.exec(message);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const { line, column } = positionToLineColumn(position, jsonString);
    
    // 获取错误所在行的内容
    const lineContent = line <= lines.length ? lines[line - 1] : '';
    
    return [{
      line,
      column,
      lineContent,
      message: message.replace(/^JSON\.parse: /, '').replace(/^Unexpected token /, '意外的标记 '),
      severity: 'error'
    }];
  }
  
  // 尝试从错误消息中提取行号和列号
  const lineColMatch = /at line (\d+) column (\d+)/.exec(message);
  if (lineColMatch) {
    const line = parseInt(lineColMatch[1], 10);
    const column = parseInt(lineColMatch[2], 10);
    
    // 获取错误所在行的内容
    const lineContent = line <= lines.length ? lines[line - 1] : '';
    
    return [{
      line,
      column,
      lineContent,
      message: message.replace(/^JSON\.parse: /, '').replace(/^Unexpected token /, '意外的标记 '),
      severity: 'error'
    }];
  }
  
  // 如果无法提取位置信息，返回一个通用错误
  return [{
    line: 1,
    column: 1,
    lineContent: lines.length > 0 ? lines[0] : '',
    message: message.replace(/^JSON\.parse: /, ''),
    severity: 'error'
  }];
};

/**
 * 将字符位置转换为行号和列号
 * @param {number} position - 字符位置
 * @param {string} text - 文本内容
 * @returns {{line: number, column: number}} - 行号和列号
 */
export const positionToLineColumn = (position, text) => {
  const lines = text.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  
  return { line, column };
};

/**
 * 将Monaco编辑器的标记转换为JsonError对象
 * @param {Object} marker - Monaco编辑器的标记
 * @returns {JsonError} - JsonError对象
 */
export const markerToJsonError = (marker) => {
  return {
    line: marker.startLineNumber,
    column: marker.startColumn,
    message: marker.message,
    severity: marker.severity === 8 ? 'error' : 'warning'
  };
};

/**
 * 将JsonError对象转换为Monaco编辑器的标记
 * @param {JsonError} error - JsonError对象
 * @param {string} modelUri - 模型URI
 * @returns {Object} - Monaco编辑器的标记
 */
export const jsonErrorToMarker = (error, modelUri) => {
  // 获取行内容以确定更准确的错误范围
  const lineContent = error.lineContent || '';
  
  // 计算错误范围
  let endColumn = error.column + 1;
  
  // 如果有行内容，尝试确定更精确的错误范围
  if (lineContent) {
    // 对于常见的JSON错误，尝试确定更精确的范围
    if (error.message.includes('Unexpected token')) {
      // 从错误位置开始，找到下一个分隔符
      const separators = [',', '}', ']', '{', '[', ':', '\n'];
      let nextSeparatorPos = -1;
      
      for (const sep of separators) {
        const pos = lineContent.indexOf(sep, error.column - 1);
        if (pos !== -1 && (nextSeparatorPos === -1 || pos < nextSeparatorPos)) {
          nextSeparatorPos = pos;
        }
      }
      
      if (nextSeparatorPos !== -1) {
        endColumn = nextSeparatorPos + 1;
      } else {
        // 如果找不到分隔符，使用行尾
        endColumn = lineContent.length + 1;
      }
    } else if (error.message.includes('Expected') || error.message.includes('Missing')) {
      // 对于缺少某些内容的错误，高亮整行
      endColumn = lineContent.length + 1;
    }
  }
  
  return {
    severity: error.severity === 'error' ? 8 : 4,
    message: error.message,
    startLineNumber: error.line,
    startColumn: error.column,
    endLineNumber: error.line,
    endColumn,
    source: 'PDX JSON Editor',
    modelUri,
    // 添加标签，用于自定义装饰器
    tags: ['json-error']
  };
};