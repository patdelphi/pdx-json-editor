// Monaco Editor 配置工具
import * as monaco from 'monaco-editor';

/**
 * Monaco编辑器配置选项接口
 */
export interface MonacoConfigOptions {
  theme: 'light' | 'dark';
  minimap: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  indentSize: 2 | 4;
  indentType: 'spaces' | 'tabs';
}

/**
 * 配置Monaco编辑器
 * @param monacoInstance Monaco实例
 */
export function configureMonaco(monacoInstance: typeof monaco): void {
  try {
    // 配置JSON语言支持
    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
      schemaValidation: 'error',
      schemaRequest: 'error',
    });

    // 配置JSON语言的括号匹配
    monacoInstance.languages.setLanguageConfiguration('json', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['"', '"'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '"', close: '"', notIn: ['string'] },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '"', close: '"' },
      ],
    });

    console.log('Monaco Editor configuration applied');
  } catch (error) {
    console.error('Error configuring Monaco Editor:', error);
  }
}

/**
 * 应用编辑器选项
 * @param editor Monaco编辑器实例
 * @param options 配置选项
 */
export function applyEditorOptions(
  editor: monaco.editor.IStandaloneCodeEditor,
  options: MonacoConfigOptions
): void {
  if (!editor) return;

  try {
    editor.updateOptions({
      theme: options.theme === 'dark' ? 'vs-dark' : 'vs',
      minimap: {
        enabled: options.minimap,
        showSlider: 'always',
        renderCharacters: true,
        maxColumn: 120,
      },
      wordWrap: options.wordWrap ? 'on' : 'off',
      lineNumbers: options.lineNumbers ? 'on' : 'off',
      tabSize: options.indentSize,
      insertSpaces: options.indentType === 'spaces',
      
      // 增强的编辑器选项
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      matchBrackets: 'always',
      
      // 折叠选项
      folding: options.foldingEnabled !== false,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      showFoldingControls: 'always',
      
      // 自动完成选项
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      
      // 搜索选项
      find: {
        addExtraSpaceOnTop: true,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
        loop: true,
      },
    });
    
    // 刷新布局
    editor.layout();
    
    console.log('Editor options applied successfully');
  } catch (error) {
    console.error('Error applying editor options:', error);
  }
}

/**
 * 注册JSON Schema
 * @param monacoInstance Monaco实例
 * @param schemas JSON Schema配置
 */
export function registerJsonSchema(
  monacoInstance: typeof monaco,
  schemas: Array<{ uri: string; fileMatch?: string[]; schema: any }>
): void {
  try {
    monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemas.map(schema => ({
        uri: schema.uri,
        fileMatch: schema.fileMatch || ['*'],
        schema: schema.schema
      })),
      enableSchemaRequest: true,
    });
    console.log('JSON schemas registered successfully');
  } catch (error) {
    console.error('Error registering JSON schemas:', error);
  }
}