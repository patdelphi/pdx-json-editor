/**
 * 搜索服务测试
 */

import { searchInText, replaceInText } from '../searchService';

describe('searchService', () => {
  const sampleText = `{
  "name": "PDX JSON Editor",
  "version": "1.0.0",
  "description": "A lightweight JSON editor",
  "features": [
    "Syntax highlighting",
    "Error validation",
    "Formatting"
  ]
}`;

  describe('searchInText', () => {
    test('应找到所有匹配项', () => {
      const results = searchInText(sampleText, 'JSON');
      
      expect(results).toHaveLength(2);
      expect(results[0].lineNumber).toBe(1);
      expect(results[1].lineNumber).toBe(3);
    });
    
    test('应区分大小写', () => {
      const results = searchInText(sampleText, 'json', { caseSensitive: true });
      
      expect(results).toHaveLength(0);
    });
    
    test('应支持全字匹配', () => {
      const results1 = searchInText(sampleText, 'light', { wholeWord: false });
      const results2 = searchInText(sampleText, 'light', { wholeWord: true });
      
      expect(results1).toHaveLength(1); // 匹配 "lightweight"
      expect(results2).toHaveLength(0); // 不匹配，因为 "light" 是 "lightweight" 的一部分
    });
    
    test('应支持正则表达式', () => {
      const results = searchInText(sampleText, '"[^"]*":', { regex: true });
      
      expect(results).toHaveLength(4); // 匹配所有JSON键
    });
    
    test('应返回正确的行号和列号', () => {
      const results = searchInText(sampleText, 'version');
      
      expect(results).toHaveLength(1);
      expect(results[0].lineNumber).toBe(3);
      expect(results[0].column).toBe(4);
    });
    
    test('应处理空输入', () => {
      expect(searchInText('', 'test')).toEqual([]);
      expect(searchInText(sampleText, '')).toEqual([]);
      expect(searchInText('', '')).toEqual([]);
    });
  });
  
  describe('replaceInText', () => {
    test('应替换所有匹配项', () => {
      const { text, replacedCount } = replaceInText(sampleText, 'JSON', 'XML', {}, true);
      
      expect(replacedCount).toBe(2);
      expect(text).toContain('"name": "PDX XML Editor"');
      expect(text).toContain('"description": "A lightweight XML editor"');
    });
    
    test('应替换指定索引的匹配项', () => {
      const { text, replacedCount } = replaceInText(sampleText, 'JSON', 'XML', {}, false, 0);
      
      expect(replacedCount).toBe(1);
      expect(text).toContain('"name": "PDX XML Editor"');
      expect(text).toContain('"description": "A lightweight JSON editor"');
    });
    
    test('应区分大小写', () => {
      const { text, replacedCount } = replaceInText(sampleText, 'json', 'XML', { caseSensitive: true }, true);
      
      expect(replacedCount).toBe(0);
      expect(text).toBe(sampleText);
    });
    
    test('应支持全字匹配', () => {
      const { text: text1, replacedCount: count1 } = replaceInText(
        sampleText, 
        'light', 
        'small', 
        { wholeWord: false }, 
        true
      );
      
      const { text: text2, replacedCount: count2 } = replaceInText(
        sampleText, 
        'light', 
        'small', 
        { wholeWord: true }, 
        true
      );
      
      expect(count1).toBe(1);
      expect(text1).toContain('smallweight');
      
      expect(count2).toBe(0);
      expect(text2).toBe(sampleText);
    });
    
    test('应支持正则表达式', () => {
      const { text, replacedCount } = replaceInText(
        sampleText, 
        '"([^"]*)": ', 
        'key_$1: ', 
        { regex: true }, 
        true
      );
      
      expect(replacedCount).toBe(4);
      expect(text).toContain('key_name: "PDX JSON Editor"');
      expect(text).toContain('key_version: "1.0.0"');
    });
    
    test('应处理空输入', () => {
      expect(replaceInText('', 'test', 'replace')).toEqual({ text: '', replacedCount: 0 });
      expect(replaceInText(sampleText, '', 'replace')).toEqual({ text: sampleText, replacedCount: 0 });
    });
  });
});