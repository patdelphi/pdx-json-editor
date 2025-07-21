# 搜索与替换功能全面修复

日期: 2025-07-20

## 问题概述

搜索与替换功能存在多个问题，包括：

1. 正则表达式转义问题
2. 搜索结果依赖问题
3. Monaco编辑器的搜索API未使用
4. 搜索结果高亮不明显
5. 替换功能不可靠

## 修复方案

### 1. 修复正则表达式转义问题

在`searchService.js`中，将错误的正则表达式转义方式：

```javascript
const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\UUID');
```

修改为标准的转义方式：

```javascript
const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

### 2. 添加Monaco编辑器的搜索API支持

添加了两个新函数，利用Monaco编辑器的内置搜索功能：

```javascript
/**
 * 使用Monaco编辑器的内置搜索功能
 * @param {Object} editor - Monaco编辑器实例
 * @param {string} searchText - 搜索文本
 * @param {SearchOptions} options - 搜索选项
 * @returns {Object[]} - 搜索结果列表
 */
export const searchWithMonaco = (editor, searchText, options = {}) => {
  // ...实现代码...
};

/**
 * 使用Monaco编辑器的内置替换功能
 * @param {Object} editor - Monaco编辑器实例
 * @param {string} searchText - 搜索文本
 * @param {string} replaceText - 替换文本
 * @param {SearchOptions} options - 搜索选项
 * @param {boolean} [replaceAll=false] - 是否替换所有匹配项
 * @returns {number} - 替换的匹配项数量
 */
export const replaceWithMonaco = (editor, searchText, replaceText, options = {}, replaceAll = false) => {
  // ...实现代码...
};
```

### 3. 改进搜索结果高亮

在`highlightMatch`函数中添加了装饰器，使搜索结果更加明显：

```javascript
// 添加装饰器以突出显示匹配项
const decorations = editor.deltaDecorations([], [
  {
    range: {
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    },
    options: {
      className: 'search-match-highlight',
      inlineClassName: 'search-match-highlight-inline',
      stickiness: 1, // TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      hoverMessage: { value: '搜索匹配项' }
    }
  }
]);
```

### 4. 修复搜索结果依赖问题

在`useEffect`钩子中添加了必要的依赖项：

```javascript
useEffect(() => {
  if (open && searchText && searchResults.length > 0) {
    // 使用防抖，避免频繁搜索
    const timer = setTimeout(() => {
      performSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [open, searchText, searchResults.length, text, performSearch]);
```

### 5. 优化搜索和替换功能

将`performSearch`函数改为使用`useCallback`，并优先使用Monaco编辑器的搜索功能：

```javascript
const performSearch = useCallback(() => {
  // ...
  // 如果编辑器实例可用，优先使用Monaco的搜索功能
  if (editorRef.current && monacoRef.current) {
    results = searchWithMonaco(editorRef.current, searchText, searchOptions);
  } else {
    // 回退到文本搜索
    results = searchInText(text, searchText, searchOptions);
  }
  // ...
}, [text, searchText, searchOptions, editorRef, monacoRef]);
```

同样，替换功能也优先使用Monaco编辑器的替换功能：

```javascript
// 如果编辑器实例可用，优先使用Monaco的替换功能
if (editorRef.current && monacoRef.current) {
  const replacedCount = replaceWithMonaco(
    editorRef.current,
    searchText,
    replaceText,
    searchOptions,
    false
  );
  // ...
} else {
  // 回退到文本替换
  const { text: newText } = replaceInText(
    text,
    searchText,
    replaceText,
    searchOptions,
    false,
    currentMatchIndex
  );
  // ...
}
```

## 修复影响

1. **正则表达式搜索更加可靠**：修复了正则表达式转义问题，使搜索更加准确。

2. **搜索结果高亮更加明显**：添加了装饰器，使搜索结果在编辑器中更加突出。

3. **搜索和替换功能更加稳定**：优先使用Monaco编辑器的内置功能，提高了可靠性。

4. **性能更好**：使用Monaco编辑器的内置功能，避免了不必要的文本解析和处理。

5. **用户体验更好**：搜索结果更加明显，替换操作更加可靠，提供了更好的用户体验。

这些修复确保了搜索与替换功能在Monaco编辑器中正确工作，提高了功能的可靠性和用户体验。