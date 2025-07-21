# Monaco编辑器搜索定位Bug修复

日期: 2025-07-20

## 问题描述

搜索功能无法在Monaco编辑器中正确定位到搜索项，具体表现为：
1. 点击"下一个"或"上一个"按钮时，编辑器不会滚动到匹配项位置
2. 匹配项没有被正确高亮显示
3. 用户无法直观地看到搜索结果在文档中的位置

## 修复方案

### 1. 改进高亮匹配项函数

修改`highlightMatch`函数，使用更可靠的方式在编辑器中定位和高亮匹配项：

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
    
    console.log('高亮匹配项:', match);
    
    // 创建选择范围
    const selection = {
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    };
    
    // 设置编辑器选择
    editor.setSelection(selection);
    
    // 滚动到选择位置（确保可见）
    editor.revealRangeInCenter({
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    });
    
    // 聚焦编辑器
    editor.focus();
  } catch (error) {
    console.error('高亮匹配项失败:', error);
  }
};
```

主要改进：
- 使用`revealRangeInCenter`代替`revealPositionInCenter`，确保整个匹配项都可见
- 添加`editor.focus()`确保编辑器获得焦点
- 添加更详细的日志输出，便于调试

### 2. 增强搜索结果验证

在`performSearch`函数中添加搜索结果验证，确保只使用有效的匹配项：

```javascript
// 验证搜索结果
const validResults = results.filter(match => 
  typeof match.lineNumber === 'number' && 
  typeof match.column === 'number' && 
  typeof match.length === 'number'
);

if (validResults.length !== results.length) {
  console.warn('过滤掉了一些无效的搜索结果');
}

setSearchResults(validResults);
```

### 3. 使用setTimeout确保编辑器准备就绪

在高亮第一个匹配项时使用setTimeout，确保编辑器已经准备好：

```javascript
// 高亮第一个匹配项
if (editorRef.current && monacoRef.current) {
  // 确保编辑器已经准备好
  setTimeout(() => {
    highlightMatch(validResults[0]);
  }, 0);
}
```

### 4. 监听编辑器内容变化

添加对编辑器内容变化的监听，当内容变化时重新执行搜索：

```javascript
// 当编辑器内容变化时，重新执行搜索
useEffect(() => {
  if (open && searchText && searchResults.length > 0) {
    // 使用防抖，避免频繁搜索
    const timer = setTimeout(() => {
      performSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [text]);
```

## 修复影响

- 搜索功能现在可以正确定位到匹配项
- 匹配项会被高亮显示，并且编辑器会滚动到匹配项位置
- 用户可以直观地看到搜索结果在文档中的位置
- 当编辑器内容变化时，搜索结果会自动更新
- 搜索功能更加稳定和可靠