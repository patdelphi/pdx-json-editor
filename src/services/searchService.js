/**
 * 搜索服务 - 提供文本搜索和替换功能
 */

/**
 * 在文本中搜索指定模式
 * @param {string} text - 要搜索的文本
 * @param {string|RegExp} pattern - 搜索模式，可以是字符串或正则表达式
 * @param {Object} options - 搜索选项
 * @param {boolean} options.caseSensitive - 是否区分大小写
 * @param {boolean} options.wholeWord - 是否匹配整个单词
 * @param {boolean} options.regex - 是否使用正则表达式
 * @returns {Array} 匹配结果数组，每个结果包含索引和匹配文本
 */
export function searchInText(text, pattern, options = {}) {
  if (!text || !pattern) return [];
  
  const { caseSensitive = false, wholeWord = false, regex = false } = options;
  
  let searchRegex;
  if (regex && typeof pattern === 'string') {
    try {
      searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    } catch (e) {
      console.error('Invalid regex pattern:', e);
      return [];
    }
  } else if (typeof pattern === 'string') {
    let patternStr = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
    
    if (wholeWord) {
      patternStr = `\\b${patternStr}\\b`;
    }
    
    searchRegex = new RegExp(patternStr, caseSensitive ? 'g' : 'gi');
  } else {
    searchRegex = pattern;
  }
  
  const results = [];
  let match;
  
  while ((match = searchRegex.exec(text)) !== null) {
    // 计算行号和列号
    const lines = text.substring(0, match.index).split('\n');
    const lineNumber = lines.length;
    const columnNumber = lines[lines.length - 1].length + 1;
    
    results.push({
      index: match.index,
      text: match[0],
      line: lineNumber,
      lineNumber,
      column: columnNumber,
      length: match[0].length
    });
  }
  
  return results;
}

/**
 * 在文本中替换指定模式
 * @param {string} text - 原始文本
 * @param {string|RegExp} pattern - 要替换的模式，可以是字符串或正则表达式
 * @param {string} replacement - 替换文本
 * @param {Object} options - 替换选项
 * @param {boolean} options.caseSensitive - 是否区分大小写
 * @param {boolean} options.wholeWord - 是否匹配整个单词
 * @param {boolean} options.regex - 是否使用正则表达式
 * @param {boolean} replaceAll - 是否替换所有匹配项
 * @param {number} index - 要替换的匹配项索引，仅当replaceAll为false时有效
 * @returns {object} 包含替换后的文本和替换次数
 */
export function replaceInText(text, pattern, replacement, options = {}, replaceAll = true, index = 0) {
  if (!text || !pattern) return { text, replacedCount: 0 };
  
  const { caseSensitive = false, wholeWord = false, regex = false } = options;
  
  let searchRegex;
  if (regex && typeof pattern === 'string') {
    try {
      searchRegex = new RegExp(pattern, replaceAll ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i'));
    } catch (e) {
      console.error('Invalid regex pattern:', e);
      return { text, replacedCount: 0 };
    }
  } else if (typeof pattern === 'string') {
    let patternStr = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
    
    if (wholeWord) {
      patternStr = `\\b${patternStr}\\b`;
    }
    
    searchRegex = new RegExp(patternStr, replaceAll ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? '' : 'i'));
  } else {
    searchRegex = pattern;
  }
  
  // 计算替换次数
  const matches = text.match(searchRegex);
  const replacedCount = matches ? matches.length : 0;
  
  // 执行替换
  let newText;
  if (replaceAll) {
    newText = text.replace(searchRegex, replacement);
  } else {
    // 只替换指定索引的匹配项
    const results = searchInText(text, pattern, options);
    if (results.length > index) {
      const match = results[index];
      newText = text.substring(0, match.index) + 
               replacement + 
               text.substring(match.index + match.length);
    } else {
      newText = text;
    }
  }
  
  return {
    text: newText,
    replacedCount
  };
}