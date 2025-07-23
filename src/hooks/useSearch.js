/**
 * 搜索Hook
 * 提供搜索和替换功能
 */

import { useState, useCallback, useEffect } from 'preact/hooks';
import { searchInText, replaceInText } from '../services/searchService';

/**
 * 使用搜索的Hook
 * @param {string} text - 要搜索的文本
 * @param {Function} onTextChange - 文本变化回调函数
 * @returns {{
 *   searchText: string,
 *   setSearchText: (text: string) => void,
 *   replaceText: string,
 *   setReplaceText: (text: string) => void,
 *   caseSensitive: boolean,
 *   setCaseSensitive: (value: boolean) => void,
 *   wholeWord: boolean,
 *   setWholeWord: (value: boolean) => void,
 *   regex: boolean,
 *   setRegex: (value: boolean) => void,
 *   searchResults: import('../services/searchService').SearchResult[],
 *   currentMatchIndex: number,
 *   totalMatches: number,
 *   findNext: () => void,
 *   findPrevious: () => void,
 *   replace: () => void,
 *   replaceAll: () => void,
 *   highlightMatch: (monaco: any, editor: any) => void
 * }} - 搜索相关状态和方法
 */
export const useSearch = (text, onTextChange) => {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  
  // 搜索选项
  const searchOptions = useCallback(() => ({
    caseSensitive,
    wholeWord,
    regex
  }), [caseSensitive, wholeWord, regex]);
  
  // 执行搜索
  const performSearch = useCallback(() => {
    if (!text || !searchText) {
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return [];
    }
    
    try {
      const results = searchInText(text, searchText, searchOptions());
      setSearchResults(results);
      setCurrentMatchIndex(results.length > 0 ? 0 : -1);
      return results;
    } catch (error) {
      console.error('搜索错误:', error);
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return [];
    }
  }, [text, searchText, searchOptions]);
  
  // 当搜索文本或选项变化时执行搜索
  useEffect(() => {
    performSearch();
  }, [performSearch]);
  
  // 查找下一个匹配项
  const findNext = useCallback(() => {
    if (searchResults.length === 0) {
      return;
    }
    
    setCurrentMatchIndex((prevIndex) => {
      if (prevIndex === searchResults.length - 1) {
        return 0; // 循环到第一个
      }
      return prevIndex + 1;
    });
  }, [searchResults]);
  
  // 查找上一个匹配项
  const findPrevious = useCallback(() => {
    if (searchResults.length === 0) {
      return;
    }
    
    setCurrentMatchIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return searchResults.length - 1; // 循环到最后一个
      }
      return prevIndex - 1;
    });
  }, [searchResults]);
  
  // 替换当前匹配项
  const replace = useCallback(() => {
    if (searchResults.length === 0 || currentMatchIndex === -1 || !onTextChange) {
      return;
    }
    
    const { text: newText } = replaceInText(
      text,
      searchText,
      replaceText,
      searchOptions(),
      false,
      currentMatchIndex
    );
    
    onTextChange(newText);
  }, [text, searchText, replaceText, searchOptions, currentMatchIndex, searchResults, onTextChange]);
  
  // 替换所有匹配项
  const replaceAll = useCallback(() => {
    if (searchResults.length === 0 || !onTextChange) {
      return 0;
    }
    
    try {
      const { text: newText, replacedCount } = replaceInText(
        text,
        searchText,
        replaceText,
        searchOptions(),
        true
      );
      
      onTextChange(newText);
      
      // 重新执行搜索以更新匹配项
      setTimeout(() => {
        performSearch();
      }, 0);
      
      return replacedCount;
    } catch (error) {
      console.error('替换错误:', error);
      return 0;
    }
  }, [text, searchText, replaceText, searchOptions, searchResults, onTextChange, performSearch]);
  
  // 高亮当前匹配项
  const highlightMatch = useCallback((monaco, editor) => {
    if (!monaco || !editor || searchResults.length === 0 || currentMatchIndex === -1) {
      return;
    }
    
    const match = searchResults[currentMatchIndex];
    
    // 创建选择范围
    const selection = {
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    };
    
    // 设置编辑器选择
    editor.setSelection(selection);
    
    // 滚动到选择位置
    editor.revealPositionInCenter({
      lineNumber: match.lineNumber,
      column: match.column
    });
  }, [searchResults, currentMatchIndex]);
  
  return {
    searchText,
    setSearchText,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    wholeWord,
    setWholeWord,
    regex,
    setRegex,
    searchResults,
    currentMatchIndex,
    totalMatches: searchResults.length,
    findNext,
    findPrevious,
    replace,
    replaceAll,
    highlightMatch
  };
};