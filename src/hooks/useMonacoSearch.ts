import { useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { SearchOptions } from '../types/editor.types';

/**
 * 提供Monaco编辑器搜索和替换功能的Hook
 */
export function useMonacoSearch() {
  /**
   * 执行搜索
   * @param editor Monaco编辑器实例
   * @param query 搜索查询
   * @param options 搜索选项
   */
  const search = useCallback((
    editor: monaco.editor.IStandaloneCodeEditor,
    query: string,
    options: SearchOptions
  ) => {
    if (!editor || !query.trim()) return;

    try {
      // 获取搜索控制器
      const findController = editor.getContribution('editor.contrib.findController');
      if (findController && 'getState' in findController && typeof findController.getState === 'function') {
        // 设置搜索选项
        const findState = findController.getState();
        if (findState && 'change' in findState && typeof findState.change === 'function') {
          findState.change({
            searchString: query,
            isRegex: options.useRegex,
            matchCase: options.caseSensitive,
            wholeWord: options.wholeWord,
            searchScope: null,
            matchesPosition: null,
            matchesCount: null,
          }, false);

          // 执行搜索
          if ('start' in findController && typeof findController.start === 'function') {
            findController.start({
              forceRevealReplace: false,
              seedSearchStringFromSelection: false,
              seedSearchStringFromGlobalClipboard: false,
              shouldFocus: 0,
              shouldAnimate: true,
              updateSearchScope: false,
              loop: true,
            });
            return;
          }
        }
      }

      // 回退方法：使用编辑器命令
      editor.getAction('actions.find')?.run();
    } catch (error) {
      console.error('Error executing search:', error);
      // 最后的回退方法
      editor.getAction('actions.find')?.run();
    }
  }, []);

  /**
   * 执行替换
   * @param editor Monaco编辑器实例
   * @param searchQuery 搜索查询
   * @param replaceText 替换文本
   * @param options 搜索选项
   */
  const replace = useCallback((
    editor: monaco.editor.IStandaloneCodeEditor,
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => {
    if (!editor || !searchQuery.trim()) return;

    try {
      // 获取搜索控制器
      const findController = editor.getContribution('editor.contrib.findController');
      if (findController && 'getState' in findController && typeof findController.getState === 'function') {
        // 设置搜索和替换选项
        const findState = findController.getState();
        if (findState && 'change' in findState && typeof findState.change === 'function') {
          findState.change({
            searchString: searchQuery,
            replaceString: replaceText,
            isRegex: options.useRegex,
            matchCase: options.caseSensitive,
            wholeWord: options.wholeWord,
            searchScope: null,
            matchesPosition: null,
            matchesCount: null,
          }, false);

          // 执行替换
          if ('replace' in findController && typeof findController.replace === 'function') {
            findController.replace();
            return;
          }
        }
      }

      // 回退方法：使用编辑器命令
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    } catch (error) {
      console.error('Error executing replace:', error);
      // 最后的回退方法
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    }
  }, []);

  /**
   * 执行全部替换
   * @param editor Monaco编辑器实例
   * @param searchQuery 搜索查询
   * @param replaceText 替换文本
   * @param options 搜索选项
   */
  const replaceAll = useCallback((
    editor: monaco.editor.IStandaloneCodeEditor,
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => {
    if (!editor || !searchQuery.trim()) return;

    try {
      // 获取搜索控制器
      const findController = editor.getContribution('editor.contrib.findController');
      if (findController && 'getState' in findController && typeof findController.getState === 'function') {
        // 设置搜索和替换选项
        const findState = findController.getState();
        if (findState && 'change' in findState && typeof findState.change === 'function') {
          findState.change({
            searchString: searchQuery,
            replaceString: replaceText,
            isRegex: options.useRegex,
            matchCase: options.caseSensitive,
            wholeWord: options.wholeWord,
            searchScope: null,
            matchesPosition: null,
            matchesCount: null,
          }, false);

          // 执行全部替换
          if ('replaceAll' in findController && typeof findController.replaceAll === 'function') {
            findController.replaceAll();
            return;
          }
        }
      }

      // 回退方法：使用编辑器命令
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    } catch (error) {
      console.error('Error executing replace all:', error);
      // 最后的回退方法
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    }
  }, []);

  /**
   * 查找下一个匹配项
   * @param editor Monaco编辑器实例
   */
  const findNext = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    if (!editor) return;
    editor.getAction('editor.action.nextMatchFindAction')?.run();
  }, []);

  /**
   * 查找上一个匹配项
   * @param editor Monaco编辑器实例
   */
  const findPrevious = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    if (!editor) return;
    editor.getAction('editor.action.previousMatchFindAction')?.run();
  }, []);

  return {
    search,
    replace,
    replaceAll,
    findNext,
    findPrevious
  };
}

export default useMonacoSearch;