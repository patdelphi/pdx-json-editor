/**
 * 搜索服务
 * 提供搜索和替换功能
 */

/**
 * 搜索结果接口
 * @typedef {Object} SearchResult
 * @property {number} index - 匹配项在文本中的索引
 * @property {number} length - 匹配项的长度
 * @property {number} lineNumber - 匹配项所在行号
 * @property {number} column - 匹配项所在列号
 * @property {string} lineContent - 匹配项所在行的内容
 */

/**
 * 搜索选项接口
 * @typedef {Object} SearchOptions
 * @property {boolean} [caseSensitive=false] - 是否区分大小写
 * @property {boolean} [wholeWord=false] - 是否全字匹配
 * @property {boolean} [regex=false] - 是否使用正则表达式
 */

/**
 * 在文本中搜索指定内容
 * @param {string} text - 要搜索的文本
 * @param {string} searchText - 搜索内容
 * @param {SearchOptions} options - 搜索选项
 * @returns {SearchResult[]} - 搜索结果列表
 */
export const searchInText = (text, searchText, options = {}) => {
  if (!text || !searchText) {
    return [];
  }
  
  const { caseSensitive = false, wholeWord = false, regex = false } = options;
  
  // 创建正则表达式
  let pattern;
  try {
    if (regex) {
      // 使用用户提供的正则表达式
      pattern = new RegExp(searchText, caseSensitive ? 'g' : 'gi');
    } else {
      // 转义正则表达式特殊字符
      const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // 构建正则表达式
      let patternStr = escapedSearchText;
      if (wholeWord) {
        patternStr = `\\b${patternStr}\\b`;
      }
      
      pattern = new RegExp(patternStr, caseSensitive ? 'g' : 'gi');
    }
  } catch (error) {
    console.error('创建正则表达式失败:', error);
    return [];
  }
  
  // 搜索结果
  const results = [];
  
  // 分割文本为行
  const lines = text.split('\n');
  
  // 遍历每一行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 重置lastIndex，以便从行首开始搜索
    pattern.lastIndex = 0;
    
    // 在当前行中查找所有匹配项
    let match;
    while ((match = pattern.exec(line)) !== null) {
      results.push({
        index: match.index,
        length: match[0].length,
        lineNumber: i + 1, // 行号从1开始
        column: match.index + 1, // 列号从1开始
        lineContent: line
      });
    }
  }
  
  return results;
};

/**
 * 替换文本中的匹配项
 * @param {string} text - 原始文本
 * @param {string} searchText - 搜索内容
 * @param {string} replaceText - 替换内容
 * @param {SearchOptions} options - 搜索选项
 * @param {boolean} [replaceAll=false] - 是否替换所有匹配项
 * @param {number} [currentMatchIndex=-1] - 当前匹配项索引，仅在replaceAll为false时使用
 * @returns {{text: string, replacedCount: number}} - 替换后的文本和替换次数
 */
export const replaceInText = (text, searchText, replaceText, options = {}, replaceAll = false, currentMatchIndex = -1) => {
  if (!text || !searchText) {
    return { text, replacedCount: 0 };
  }
  
  const { caseSensitive = false, wholeWord = false, regex = false } = options;
  
  // 创建正则表达式
  let pattern;
  try {
    if (regex) {
      // 使用用户提供的正则表达式
      pattern = new RegExp(searchText, caseSensitive ? 'g' : 'gi');
    } else {
      // 转义正则表达式特殊字符
      const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // 构建正则表达式
      let patternStr = escapedSearchText;
      if (wholeWord) {
        patternStr = `\\b${patternStr}\\b`;
      }
      
      pattern = new RegExp(patternStr, caseSensitive ? 'g' : 'gi');
    }
  } catch (error) {
    console.error('创建正则表达式失败:', error);
    return { text, replacedCount: 0 };
  }
  
  if (replaceAll) {
    // 替换所有匹配项
    const newText = text.replace(pattern, replaceText);
    
    // 计算替换次数
    const replacedCount = (text.match(pattern) || []).length;
    
    return { text: newText, replacedCount };
  } else {
    // 替换指定索引的匹配项
    if (currentMatchIndex < 0) {
      return { text, replacedCount: 0 };
    }
    
    // 查找所有匹配项
    const matches = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length
      });
    }
    
    // 检查索引是否有效
    if (currentMatchIndex >= matches.length) {
      return { text, replacedCount: 0 };
    }
    
    // 获取要替换的匹配项
    const targetMatch = matches[currentMatchIndex];
    
    // 替换指定匹配项
    const newText = 
      text.substring(0, targetMatch.index) + 
      replaceText + 
      text.substring(targetMatch.index + targetMatch.length);
    
    return { text: newText, replacedCount: 1 };
  }
};