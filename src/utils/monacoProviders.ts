import * as monaco from 'monaco-editor';

/**
 * 注册JSON悬停提示提供程序
 * @param monacoInstance Monaco实例
 */
export function registerHoverProvider(monacoInstance: typeof monaco): monaco.IDisposable {
  return monacoInstance.languages.registerHoverProvider('json', {
    provideHover: (model, position) => {
      // 获取当前位置的单词
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      
      // 获取当前行的文本
      const lineContent = model.getLineContent(position.lineNumber);
      
      // 检查是否是键名
      const isKey = /"([^"]+)"\s*:/.test(lineContent);
      
      // 检查是否是值
      const isValue = /:\s*"?([^,"}\]]+)"?/.test(lineContent);
      
      // 根据上下文提供不同的悬停信息
      if (isKey) {
        return {
          contents: [
            { value: '**JSON 键**' },
            { value: '这是一个JSON对象的键名。' },
            { value: '键名应该是唯一的字符串。' }
          ]
        };
      } else if (isValue) {
        // 检查值的类型
        if (/true|false/.test(word.word)) {
          return {
            contents: [
              { value: '**布尔值**' },
              { value: '布尔值可以是 `true` 或 `false`。' }
            ]
          };
        } else if (/^-?\d+(\.\d+)?$/.test(word.word)) {
          return {
            contents: [
              { value: '**数值**' },
              { value: '这是一个JSON数值。可以是整数或浮点数。' }
            ]
          };
        } else if (/^".*"$/.test(word.word)) {
          return {
            contents: [
              { value: '**字符串**' },
              { value: '这是一个JSON字符串值。' }
            ]
          };
        } else if (/^null$/.test(word.word)) {
          return {
            contents: [
              { value: '**null**' },
              { value: '表示空值或不存在的值。' }
            ]
          };
        }
      }
      
      // 默认悬停信息
      return {
        contents: [
          { value: '**JSON 值**' },
          { value: '这是一个JSON值。' }
        ]
      };
    }
  });
}

/**
 * 注册JSON链接检测提供程序
 * @param monacoInstance Monaco实例
 */
export function registerLinkProvider(monacoInstance: typeof monaco): monaco.IDisposable {
  return monacoInstance.languages.registerLinkProvider('json', {
    provideLinks: (model) => {
      const links: monaco.languages.ILink[] = [];
      const text = model.getValue();
      
      // 匹配URL
      const urlRegex = /"(https?:\/\/[^\s"]+)"/g;
      let match;
      
      while ((match = urlRegex.exec(text)) !== null) {
        const startPos = model.getPositionAt(match.index + 1); // +1 to skip the opening quote
        const endPos = model.getPositionAt(match.index + match[1].length + 1);
        
        links.push({
          range: {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column
          },
          url: match[1]
        });
      }
      
      // 匹配文件路径
      const filePathRegex = /"(\.{0,2}\/[^\s"]+\.(json|js|ts|html|css|md))"/g;
      
      while ((match = filePathRegex.exec(text)) !== null) {
        const startPos = model.getPositionAt(match.index + 1); // +1 to skip the opening quote
        const endPos = model.getPositionAt(match.index + match[1].length + 1);
        
        links.push({
          range: {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column
          },
          url: match[1]
        });
      }
      
      return { links };
    }
  });
}

/**
 * 注册所有Monaco提供程序
 * @param monacoInstance Monaco实例
 */
export function registerAllProviders(monacoInstance: typeof monaco): monaco.IDisposable[] {
  const disposables: monaco.IDisposable[] = [];
  
  // 注册悬停提示提供程序
  disposables.push(registerHoverProvider(monacoInstance));
  
  // 注册链接检测提供程序
  disposables.push(registerLinkProvider(monacoInstance));
  
  return disposables;
}

export default {
  registerHoverProvider,
  registerLinkProvider,
  registerAllProviders
};