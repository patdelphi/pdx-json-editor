/**
 * Monaco Editor Mock
 */

const monaco = {
  editor: {
    create: jest.fn(() => ({
      getValue: jest.fn(() => '{}'),
      setValue: jest.fn(),
      getModel: jest.fn(() => ({
        getValue: jest.fn(() => '{}'),
        setValue: jest.fn(),
        onDidChangeContent: jest.fn(),
        getLineCount: jest.fn(() => 1),
        getLineContent: jest.fn(() => '{}')
      })),
      updateOptions: jest.fn(),
      onDidChangeCursorPosition: jest.fn(),
      getAction: jest.fn(() => ({ run: jest.fn() })),
      dispose: jest.fn(),
      focus: jest.fn(),
      layout: jest.fn()
    })),
    createDiffEditor: jest.fn(() => ({
      getOriginalEditor: jest.fn(() => ({
        getValue: jest.fn(() => '{}'),
        setValue: jest.fn()
      })),
      getModifiedEditor: jest.fn(() => ({
        getValue: jest.fn(() => '{}'),
        setValue: jest.fn()
      })),
      dispose: jest.fn(),
      layout: jest.fn()
    })),
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
    setModelMarkers: jest.fn()
  },
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn(),
        setModeConfiguration: jest.fn()
      }
    },
    registerCompletionItemProvider: jest.fn(),
    registerHoverProvider: jest.fn(),
    registerDocumentFormattingEditProvider: jest.fn(),
    registerFoldingRangeProvider: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    setLanguageConfiguration: jest.fn()
  },
  Range: jest.fn(),
  Position: jest.fn(),
  Selection: jest.fn(),
  MarkerSeverity: {
    Error: 8,
    Warning: 4,
    Info: 2,
    Hint: 1
  }
};

module.exports = monaco;