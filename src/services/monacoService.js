/**
 * Monaco编辑器服务
 * 提供Monaco编辑器的配置和初始化功能
 */

// 配置JSON语言支持
export const configureJsonLanguage = (monaco) => {
  if (!monaco || !monaco.languages || !monaco.languages.json || !monaco.languages.json.jsonDefaults) {
    console.warn('Monaco JSON language support not available');
    return;
  }

  try {
    // 设置JSON语言诊断选项
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true,
      schemaRequest: 'warning'
    });
  } catch (error) {
    console.error('Failed to configure JSON language:', error);
  }

  // 配置JSON语言特性
  if (typeof monaco.languages.registerDocumentFormattingEditProvider === 'function') {
    monaco.languages.registerDocumentFormattingEditProvider('json', {
      provideDocumentFormattingEdits: (model) => {
        try {
          const text = model.getValue();
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          
          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        } catch (e) {
          console.error('JSON格式化失败:', e);
          return [];
        }
      }
    });
  }
  
  // 配置JSON自动完成提供程序
  if (typeof monaco.languages.registerCompletionItemProvider === 'function') {
    monaco.languages.registerCompletionItemProvider('json', {
      triggerCharacters: ['"', ':'],
      provideCompletionItems: (model, position) => {
        try {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });
          
          // 检查是否在键位置
          const isInKey = /"[^"]*$/.test(textUntilPosition);
        
          // 检查是否在值位置
          const isInValue = /:\s*$/.test(textUntilPosition);
          
          // 获取当前行内容
          const lineContent = model.getLineContent(position.lineNumber);
          
          // 获取当前行前面的内容
          const lineUntilPosition = lineContent.substring(0, position.column - 1);
          
          // 创建建议项
          const suggestions = [];
          
          if (isInKey) {
            // 在键位置提供建议
            // 这里的建议将由Schema提供，如果有Schema的话
            // 基本建议
            suggestions.push({
              label: '"name"',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'name',
              detail: '常用属性',
              documentation: '名称属性'
            });
            
            suggestions.push({
              label: '"description"',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'description',
              detail: '常用属性',
              documentation: '描述属性'
            });
            
            suggestions.push({
              label: '"version"',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'version',
              detail: '常用属性',
              documentation: '版本号属性'
            });
          } else if (isInValue) {
            // 在值位置提供建议
            // 检查键名
            const keyMatch = lineUntilPosition.match(/"([^"]+)"\s*:\s*$/);
            if (keyMatch) {
              const key = keyMatch[1];
              
              // 根据键名提供不同的建议
              if (key === 'type') {
                ['string', 'number', 'boolean', 'object', 'array', 'null'].forEach(type => {
                  suggestions.push({
                    label: `"${type}"`,
                    kind: monaco.languages.CompletionItemKind.Value,
                    insertText: `"${type}"`,
                    detail: 'JSON类型',
                    documentation: `JSON ${type} 类型`
                  });
                });
              } else if (key === 'boolean' || key.endsWith('able') || key.startsWith('is') || key.startsWith('has')) {
                ['true', 'false'].forEach(value => {
                  suggestions.push({
                    label: value,
                    kind: monaco.languages.CompletionItemKind.Value,
                    insertText: value,
                    detail: '布尔值',
                    documentation: `布尔值 ${value}`
                  });
                });
              }
            }
          }
          
          return {
            suggestions
          };
        } catch (e) {
          console.error('提供自动完成建议失败:', e);
          return { suggestions: [] };
        }
      }
    });
  }
  
  // 注册悬停提示提供程序
  if (typeof monaco.languages.registerHoverProvider === 'function') {
    monaco.languages.registerHoverProvider('json', {
      provideHover: (model, position) => {
        try {
          // 获取当前位置的单词
          const wordInfo = model.getWordAtPosition(position);
          if (!wordInfo) return null;
          
          const word = wordInfo.word;
          const lineContent = model.getLineContent(position.lineNumber);
          
          // 检查是否是键
          const isKey = /"([^"]+)"\s*:/.test(lineContent.substring(0, wordInfo.endColumn));
          
          // 检查是否是值
          const isValue = /:\s*"?([^",}\]]+)"?/.test(lineContent.substring(wordInfo.startColumn - 2));
          
          // 获取完整的JSON内容
          const text = model.getValue();
          try {
            JSON.parse(text);
          } catch (e) {
            // JSON无效，无法提供上下文信息
            return null;
          }
          
          // 构建悬停内容
          let contents = [];
          
          if (isKey) {
            // 对于键，显示类型信息
            contents.push({ value: `**键**: \`${word}\`` });
            
            // 尝试获取值的类型
            const keyMatch = lineContent.match(new RegExp(`"${word}"\\s*:\\s*(.+)`));
            if (keyMatch) {
              const valueText = keyMatch[1].trim().replace(/,$/, '');
              let valueType = 'unknown';
              
              if (valueText === 'true' || valueText === 'false') {
                valueType = 'boolean';
              } else if (valueText === 'null') {
                valueType = 'null';
              } else if (/^-?\d+(\.\d+)?$/.test(valueText)) {
                valueType = 'number';
              } else if (/^".*"$/.test(valueText)) {
                valueType = 'string';
              } else if (valueText.startsWith('{')) {
                valueType = 'object';
              } else if (valueText.startsWith('[')) {
                valueType = 'array';
              }
              
              contents.push({ value: `**值类型**: \`${valueType}\`` });
            }
          } else if (isValue) {
            // 对于值，显示类型和值信息
            let valueType = typeof word;
            if (word === 'true' || word === 'false') {
              valueType = 'boolean';
            } else if (word === 'null') {
              valueType = 'null';
            } else if (/^-?\d+(\.\d+)?$/.test(word)) {
              valueType = 'number';
            } else {
              valueType = 'string';
            }
            
            contents.push({ value: `**值**: \`${word}\`` });
            contents.push({ value: `**类型**: \`${valueType}\`` });
          }
          
          // 如果没有内容，返回null
          if (contents.length === 0) return null;
          
          return {
            contents
          };
        } catch (e) {
          console.error('提供悬停信息失败:', e);
          return null;
        }
      }
    });
  }
};

/**
 * 配置JSON折叠策略
 * @param {any} monaco - Monaco实例
 */
export const configureJsonFolding = (monaco) => {
  if (!monaco) return;
  
  // 注册自定义折叠提供程序
  if (typeof monaco.languages.registerFoldingRangeProvider === 'function') {
    monaco.languages.registerFoldingRangeProvider('json', {
      provideFoldingRanges: (model) => {
        const ranges = [];
        const text = model.getValue();
        const lines = text.split('\n');
        
        // 跟踪大括号和方括号的位置
        const stack = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // 检查开始括号
          if (line.includes('{') || line.includes('[')) {
            stack.push({
              type: line.includes('{') ? '{' : '[',
              startLine: i + 1
            });
          }
          
          // 检查结束括号
          if (line.includes('}') || line.includes(']')) {
            const bracket = line.includes('}') ? '}' : ']';
            const matchingBracket = bracket === '}' ? '{' : '[';
            
            // 查找匹配的开始括号
            for (let j = stack.length - 1; j >= 0; j--) {
              if (stack[j].type === matchingBracket) {
                // 只有当折叠区域至少有3行时才添加折叠范围
                if (i + 1 - stack[j].startLine >= 2) {
                  ranges.push({
                    start: stack[j].startLine,
                    end: i + 1,
                    kind: monaco.languages.FoldingRangeKind ? monaco.languages.FoldingRangeKind.Region : 'region'
                  });
                }
                stack.splice(j, 1);
                break;
              }
            }
          }
        }
        
        return ranges;
      }
    });
  }
};

/**
 * 获取编辑器默认选项
 * @param {boolean} darkMode - 是否为深色模式
 * @param {boolean} highContrast - 是否为高对比度模式
 * @param {boolean} isLargeFile - 是否为大文件
 * @param {number} fontSize - 字体大小
 * @returns {Object} - 编辑器选项
 */
export const getEditorOptions = (darkMode = false, isLargeFile = false, fontSize = 14) => {
  // 基本选项
  const baseOptions = {
    // 基本设置
    language: 'json',
    theme: darkMode ? 'vs-dark' : 'vs-light',
    automaticLayout: true,
    fontSize,

    // 代码折叠
    folding: true,
    foldingStrategy: 'indentation',
    foldingHighlight: true,
    showFoldingControls: 'always',
    unfoldOnClickAfterEndOfLine: true,

    // 智能编辑
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    autoSurround: 'languageDefined',
    bracketPairColorization: {
      enabled: true,
      independentColorPoolPerBracketType: true
    },
    matchBrackets: 'always',
    formatOnPaste: true,
    formatOnType: false,

    // 导航与搜索
    minimap: {
      enabled: true,
      showSlider: 'always',
      renderCharacters: true,
      maxColumn: 120,
      scale: 1,
      side: 'right'
    },
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'always'
    },

    // 性能优化
    largeFileOptimizations: true,

    // 可访问性
    accessibilitySupport: 'auto',

    // 外观
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    
    // 缩进
    tabSize: 2,
    
    // 多光标和选择
    multiCursorModifier: 'alt',
    multiCursorMergeOverlapping: true,
    columnSelection: false,
    
    // 错误装饰器
    glyphMargin: true, // 启用装订线图标
    
    // 标记导航
    overviewRulerBorder: true,
    overviewRulerLanes: 3, // 显示所有标记
    
    // 行高亮
    renderLineHighlightOnlyWhenFocus: false,
    
    // 错误和警告
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true
    },
    
    // 启用错误装饰器
    renderValidationDecorations: 'on'
  };
  
  // 大文件优化选项
  if (isLargeFile) {
    return {
      ...baseOptions,
      // 禁用一些高级功能以提高性能
      folding: false, // 禁用代码折叠
      minimap: {
        enabled: false // 禁用缩略图
      },
      bracketPairColorization: {
        enabled: false // 禁用括号对着色
      },
      formatOnPaste: false, // 禁用粘贴时格式化
      formatOnType: false, // 禁用输入时格式化
      renderWhitespace: 'none', // 不渲染空白字符
      renderControlCharacters: false, // 不渲染控制字符
      renderIndentGuides: false, // 不渲染缩进参考线
      occurrencesHighlight: false, // 禁用相同单词高亮
      renderLineHighlight: 'none', // 禁用当前行高亮
      
      // 性能优化
      largeFileOptimizations: true,
      
      // 限制撤销/重做历史记录
      wordBasedSuggestions: false, // 禁用基于单词的建议
      suggestOnTriggerCharacters: false, // 禁用触发字符的建议
      
      // 虚拟化设置
      scrollBeyondLastLine: false,
      
      // 延迟加载
      quickSuggestions: false, // 禁用快速建议
      parameterHints: {
        enabled: false // 禁用参数提示
      },
      
      // 减少内存使用
      maxTokenizationLineLength: 5000, // 限制标记化的行长度
      
      // 禁用不必要的功能
      links: false, // 禁用链接
      hover: {
        enabled: false // 禁用悬停提示
      }
    };
  }
  
  return baseOptions;
};