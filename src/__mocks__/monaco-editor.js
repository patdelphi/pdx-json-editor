/**
 * Monaco Editor 模拟模块
 * 用于在测试环境中模拟Monaco Editor的功能
 */

// 模拟Monaco编辑器API
const monaco = {
  editor: {
    create: jest.fn(),
    createModel: jest.fn(),
    createDiffEditor: jest.fn(),
    EditorOption: {
      lineHeight: 'lineHeight',
      fontSize: 'fontSize',
      fontFamily: 'fontFamily',
      minimap: 'minimap',
      wordWrap: 'wordWrap',
      lineNumbers: 'lineNumbers',
      renderWhitespace: 'renderWhitespace',
      tabSize: 'tabSize'
    },
    RenderLineNumbersType: {
      On: 'on',
      Off: 'off',
      Relative: 'relative'
    }
  },
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn(),
        setModeConfiguration: jest.fn()
      }
    },
    registerDocumentFormattingEditProvider: jest.fn(),
    registerFoldingRangeProvider: jest.fn(),
    registerCompletionItemProvider: jest.fn()
  },
  Range: jest.fn().mockImplementation((startLineNumber, startColumn, endLineNumber, endColumn) => ({
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn
  })),
  Position: jest.fn().mockImplementation((lineNumber, column) => ({
    lineNumber,
    column
  })),
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
    Info: 2,
    Hint: 1
  },
  Uri: {
    parse: jest.fn(value => ({ path: value }))
  }
};

// 导出模拟模块
module.exports = monaco;