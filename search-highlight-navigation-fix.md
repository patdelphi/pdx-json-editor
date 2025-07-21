# 搜索高亮和导航功能修复

日期: 2025-07-20

## 问题描述

搜索功能存在两个主要问题：

1. **输入关键字时Monaco编辑器中没有高亮显示所有匹配项**：当用户输入搜索关键字时，只有当前选中的匹配项会被高亮显示，其他匹配项没有任何视觉提示。

2. **上一个/下一个按钮在找到的结果中循环定位不正确**：当用户点击"上一个"或"下一个"按钮时，导航可能不会正确循环遍历所有匹配项。

## 修复方案

### 1. 添加全局匹配项高亮

添加了一个新的`highlightAllMatches`函数，用于高亮显示所有匹配项：

```javascript
// 存储当前装饰器ID的引用
const decorationsRef = useRef([]);

// 高亮所有匹配项
const highlightAllMatches = useCallback((results) => {
  if (!editorRef.current || !results || results.length === 0) return;
  
  try {
    const editor = editorRef.current;
    
    // 创建所有匹配项的装饰器
    const decorationOptions = results.map(match => ({
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
    }));
    
    // 应用装饰器并保存ID
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorationOptions);
    
    console.log(`高亮了 ${results.length} 个匹配项`);
  } catch (error) {
    console.error('高亮所有匹配项失败:', error);
  }
}, []);
```

### 2. 修改搜索函数以高亮所有匹配项

在`performSearch`函数中添加了对`highlightAllMatches`的调用：

```javascript
// 高亮所有匹配项
highlightAllMatches(validResults);

// 高亮第一个匹配项（特殊高亮）
if (editorRef.current && monacoRef.current) {
  // 确保编辑器已经准备好
  setTimeout(() => {
    highlightMatch(validResults[0]);
  }, 0);
}
```

### 3. 改进导航功能

修改了`findNext`和`findPrevious`函数，确保它们正确循环遍历所有匹配项：

```javascript
// 查找下一个匹配项
const findNext = useCallback(() => {
  // ...
  
  // 计算下一个索引，如果到达末尾则循环到开头
  const newIndex = currentMatchIndex === searchResults.length - 1 ? 0 : currentMatchIndex + 1;
  setCurrentMatchIndex(newIndex);
  
  // 高亮匹配项（确保索引有效）
  if (newIndex >= 0 && newIndex < searchResults.length) {
    highlightMatch(searchResults[newIndex]);
  }
  
  // ...
}, [searchText, searchResults, currentMatchIndex, performSearch, addToSearchHistory]);

// 查找上一个匹配项
const findPrevious = useCallback(() => {
  // ...
  
  // 计算上一个索引，如果到达开头则循环到末尾
  const newIndex = currentMatchIndex <= 0 ? searchResults.length - 1 : currentMatchIndex - 1;
  setCurrentMatchIndex(newIndex);
  
  // ...
}, [searchText, searchResults, currentMatchIndex, performSearch]);
```

### 4. 添加清理逻辑

添加了组件卸载和面板关闭时的清理逻辑，确保装饰器被正确清除：

```javascript
// 当面板打开时聚焦搜索输入框
useEffect(() => {
  if (open) {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  } else {
    // 当面板关闭时，清除所有高亮
    if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }
}, [open]);

// 组件卸载时清理装饰器
useEffect(() => {
  return () => {
    if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };
}, []);
```

### 5. 修复正则表达式转义问题

修复了`searchService.js`中的正则表达式转义问题，使用标准的`\\$&`替换方式：

```javascript
// 正确转义正则表达式特殊字符
const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

## 修复影响

1. **所有匹配项都会被高亮显示**：用户可以直观地看到所有匹配项在文档中的位置。

2. **当前匹配项有特殊高亮**：当前选中的匹配项会有不同的高亮样式，使其更加突出。

3. **导航按钮正确循环**：点击"上一个"或"下一个"按钮时，会正确循环遍历所有匹配项，即使到达列表的开头或结尾。

4. **资源管理更好**：添加了清理逻辑，确保在组件卸载或面板关闭时释放资源。

5. **搜索更加准确**：修复了正则表达式转义问题，使搜索更加准确。

这些修复大大提高了搜索功能的可用性和用户体验，使用户能够更加直观地看到搜索结果，并且更加方便地在结果之间导航。