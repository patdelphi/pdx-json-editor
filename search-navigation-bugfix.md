# 搜索导航功能（下一个/上一个）Bug修复

日期: 2025-07-20

## 问题描述

搜索面板中的"下一个"和"上一个"按钮功能存在以下问题：

1. 当搜索结果为空或当前索引无效时，点击按钮可能导致错误
2. 高亮匹配项时缺少必要的错误处理和类型检查
3. 搜索触发逻辑可能导致不必要的频繁搜索
4. 搜索结果状态管理不够健壮

## 修复方案

### 1. 增强边界条件检查

在`findNext`和`findPrevious`函数中：
- 添加对`searchText`为空的检查
- 添加对当前索引有效性的检查
- 在访问`searchResults`数组前进行安全检查

```javascript
// 查找下一个匹配项
const findNext = () => {
  if (searchText.trim() === '') return;
  
  // 如果没有搜索结果，执行搜索
  if (searchResults.length === 0) {
    performSearch();
    return;
  }
  
  // 确保当前索引有效
  if (currentMatchIndex < 0 || currentMatchIndex >= searchResults.length) {
    setCurrentMatchIndex(0);
    if (searchResults.length > 0) {
      highlightMatch(searchResults[0]);
    }
    return;
  }
  
  // ...其余代码
};
```

### 2. 改进高亮匹配项逻辑

在`highlightMatch`函数中：
- 添加更多的错误处理和类型检查
- 使用try-catch块捕获可能的异常
- 添加对匹配项属性的验证

```javascript
// 高亮匹配项
const highlightMatch = (match) => {
  if (!editorRef.current || !match) return;
  
  try {
    const editor = editorRef.current;
    
    // 确保匹配项有必要的属性
    if (typeof match.lineNumber !== 'number' || typeof match.column !== 'number' || typeof match.length !== 'number') {
      console.error('无效的匹配项:', match);
      return;
    }
    
    // ...其余代码
  } catch (error) {
    console.error('高亮匹配项失败:', error);
  }
};
```

### 3. 优化搜索触发逻辑

在`useEffect`钩子中：
- 添加防抖处理，避免频繁搜索
- 清理定时器，避免内存泄漏

```javascript
// 当搜索文本或选项变化时执行搜索
useEffect(() => {
  if (open && searchText) {
    // 使用防抖，避免频繁搜索
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timer);
  }
}, [open, searchText, caseSensitive, wholeWord, regex, text]);
```

### 4. 增强搜索函数的健壮性

在`performSearch`函数中：
- 添加更详细的日志输出
- 改进错误处理和状态管理
- 确保在设置状态前进行必要的检查

```javascript
// 执行搜索
const performSearch = () => {
  if (!text || !searchText) {
    setSearchResults([]);
    setCurrentMatchIndex(-1);
    return;
  }
  
  try {
    console.log('执行搜索:', searchText, searchOptions);
    const results = searchInText(text, searchText, searchOptions);
    console.log('搜索结果:', results);
    
    setSearchResults(results);
    
    if (results.length > 0) {
      setCurrentMatchIndex(0);
      
      // 高亮第一个匹配项
      if (editorRef.current && monacoRef.current) {
        highlightMatch(results[0]);
      }
    } else {
      setCurrentMatchIndex(-1);
      
      // 当没有找到匹配项时显示提示
      if (searchText.trim() !== '') {
        showAlert(`未找到匹配项: "${searchText}"`, 'info');
      }
    }
  } catch (error) {
    // ...错误处理
  }
};
```

## 修复影响

- 搜索"下一个"和"上一个"功能更加可靠和稳定
- 避免了可能的数组越界错误
- 提供了更好的错误处理和用户反馈
- 优化了搜索性能，避免不必要的频繁搜索
- 增强了代码的健壮性和可维护性