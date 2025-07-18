import { describe, it, expect } from 'vitest';
import type {
  EditorState,
  JsonError,
  FileInfo,
  EditorSettings,
  AppState,
  EditorAction,
  StoredData,
  SearchOptions,
  SearchResult,
  MonacoEditorProps,
  EditorToolbarProps,
  FileOperationsProps,
  StatusBarProps,
  ThemeSelectorProps,
  Theme,
  IndentType,
  IndentSize,
  ErrorSeverity,
} from '../editor.types';

describe('Editor Types', () => {
  describe('EditorState', () => {
    it('should have correct structure', () => {
      const editorState: EditorState = {
        content: '{"test": "value"}',
        isValid: true,
        errors: [],
        isDirty: false,
        currentFile: null,
        theme: 'light',
        settings: {
          indentSize: 2,
          indentType: 'spaces',
          wordWrap: true,
          lineNumbers: true,
          minimap: false,
        },
      };

      expect(editorState.content).toBe('{"test": "value"}');
      expect(editorState.isValid).toBe(true);
      expect(editorState.errors).toEqual([]);
      expect(editorState.isDirty).toBe(false);
      expect(editorState.currentFile).toBeNull();
      expect(editorState.theme).toBe('light');
      expect(editorState.settings.indentSize).toBe(2);
    });

    it('should support both light and dark themes', () => {
      const lightState: EditorState['theme'] = 'light';
      const darkState: EditorState['theme'] = 'dark';

      expect(lightState).toBe('light');
      expect(darkState).toBe('dark');
    });
  });

  describe('JsonError', () => {
    it('should have correct structure', () => {
      const error: JsonError = {
        line: 5,
        column: 10,
        message: 'Unexpected token',
        severity: 'error',
      };

      expect(error.line).toBe(5);
      expect(error.column).toBe(10);
      expect(error.message).toBe('Unexpected token');
      expect(error.severity).toBe('error');
    });

    it('should support both error and warning severities', () => {
      const errorSeverity: JsonError['severity'] = 'error';
      const warningSeverity: JsonError['severity'] = 'warning';

      expect(errorSeverity).toBe('error');
      expect(warningSeverity).toBe('warning');
    });
  });

  describe('FileInfo', () => {
    it('should have correct structure', () => {
      const fileInfo: FileInfo = {
        name: 'test.json',
        size: 1024,
        lastModified: new Date('2023-01-01'),
        content: '{"test": true}',
      };

      expect(fileInfo.name).toBe('test.json');
      expect(fileInfo.size).toBe(1024);
      expect(fileInfo.lastModified).toBeInstanceOf(Date);
      expect(fileInfo.content).toBe('{"test": true}');
    });
  });

  describe('EditorSettings', () => {
    it('should have correct structure with valid indent sizes', () => {
      const settings2: EditorSettings = {
        indentSize: 2,
        indentType: 'spaces',
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
      };

      const settings4: EditorSettings = {
        indentSize: 4,
        indentType: 'tabs',
        wordWrap: false,
        lineNumbers: false,
        minimap: true,
      };

      expect(settings2.indentSize).toBe(2);
      expect(settings2.indentType).toBe('spaces');
      expect(settings4.indentSize).toBe(4);
      expect(settings4.indentType).toBe('tabs');
    });

    it('should support both spaces and tabs indent types', () => {
      const spacesType: EditorSettings['indentType'] = 'spaces';
      const tabsType: EditorSettings['indentType'] = 'tabs';

      expect(spacesType).toBe('spaces');
      expect(tabsType).toBe('tabs');
    });
  });

  describe('AppState', () => {
    it('should have correct structure', () => {
      const appState: AppState = {
        editor: {
          content: '',
          isValid: true,
          errors: [],
          isDirty: false,
          currentFile: null,
          theme: 'light',
          settings: {
            indentSize: 2,
            indentType: 'spaces',
            wordWrap: true,
            lineNumbers: true,
            minimap: false,
          },
        },
        ui: {
          showSearchPanel: false,
          showSettings: false,
          sidebarCollapsed: false,
        },
        recent: [],
      };

      expect(appState.editor).toBeDefined();
      expect(appState.ui).toBeDefined();
      expect(appState.recent).toEqual([]);
      expect(appState.ui.showSearchPanel).toBe(false);
    });
  });

  describe('EditorAction', () => {
    it('should support SET_CONTENT action', () => {
      const action: EditorAction = {
        type: 'SET_CONTENT',
        payload: '{"new": "content"}',
      };

      expect(action.type).toBe('SET_CONTENT');
      expect(action.payload).toBe('{"new": "content"}');
    });

    it('should support SET_VALIDATION_ERRORS action', () => {
      const errors: JsonError[] = [
        {
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error',
        },
      ];

      const action: EditorAction = {
        type: 'SET_VALIDATION_ERRORS',
        payload: errors,
      };

      expect(action.type).toBe('SET_VALIDATION_ERRORS');
      expect(action.payload).toEqual(errors);
    });

    it('should support SET_FILE action', () => {
      const fileInfo: FileInfo = {
        name: 'test.json',
        size: 100,
        lastModified: new Date(),
        content: '{}',
      };

      const action: EditorAction = {
        type: 'SET_FILE',
        payload: fileInfo,
      };

      expect(action.type).toBe('SET_FILE');
      expect(action.payload).toEqual(fileInfo);
    });

    it('should support SET_THEME action', () => {
      const action: EditorAction = {
        type: 'SET_THEME',
        payload: 'dark',
      };

      expect(action.type).toBe('SET_THEME');
      expect(action.payload).toBe('dark');
    });

    it('should support UPDATE_SETTINGS action', () => {
      const settingsUpdate: Partial<EditorSettings> = {
        indentSize: 4,
        wordWrap: false,
      };

      const action: EditorAction = {
        type: 'UPDATE_SETTINGS',
        payload: settingsUpdate,
      };

      expect(action.type).toBe('UPDATE_SETTINGS');
      expect(action.payload).toEqual(settingsUpdate);
    });

    it('should support toggle actions', () => {
      const toggleSearchAction: EditorAction = { type: 'TOGGLE_SEARCH_PANEL' };
      const toggleSettingsAction: EditorAction = { type: 'TOGGLE_SETTINGS' };
      const toggleSidebarAction: EditorAction = { type: 'TOGGLE_SIDEBAR' };

      expect(toggleSearchAction.type).toBe('TOGGLE_SEARCH_PANEL');
      expect(toggleSettingsAction.type).toBe('TOGGLE_SETTINGS');
      expect(toggleSidebarAction.type).toBe('TOGGLE_SIDEBAR');
    });

    it('should support SET_DIRTY action', () => {
      const action: EditorAction = {
        type: 'SET_DIRTY',
        payload: true,
      };

      expect(action.type).toBe('SET_DIRTY');
      expect(action.payload).toBe(true);
    });

    it('should support ADD_RECENT_FILE action', () => {
      const fileInfo: FileInfo = {
        name: 'recent.json',
        size: 200,
        lastModified: new Date(),
        content: '{"recent": true}',
      };

      const action: EditorAction = {
        type: 'ADD_RECENT_FILE',
        payload: fileInfo,
      };

      expect(action.type).toBe('ADD_RECENT_FILE');
      expect(action.payload).toEqual(fileInfo);
    });
  });

  describe('StoredData', () => {
    it('should have correct structure', () => {
      const storedData: StoredData = {
        settings: {
          indentSize: 2,
          indentType: 'spaces',
          wordWrap: true,
          lineNumbers: true,
          minimap: false,
        },
        theme: 'dark',
        recentFiles: [],
        lastContent: '{"stored": "content"}',
      };

      expect(storedData.settings).toBeDefined();
      expect(storedData.theme).toBe('dark');
      expect(storedData.recentFiles).toEqual([]);
      expect(storedData.lastContent).toBe('{"stored": "content"}');
    });
  });

  describe('SearchOptions', () => {
    it('should have correct structure', () => {
      const searchOptions: SearchOptions = {
        caseSensitive: true,
        useRegex: false,
        wholeWord: true,
      };

      expect(searchOptions.caseSensitive).toBe(true);
      expect(searchOptions.useRegex).toBe(false);
      expect(searchOptions.wholeWord).toBe(true);
    });
  });

  describe('SearchResult', () => {
    it('should have correct structure', () => {
      const searchResult: SearchResult = {
        line: 3,
        column: 8,
        length: 5,
        text: 'match',
      };

      expect(searchResult.line).toBe(3);
      expect(searchResult.column).toBe(8);
      expect(searchResult.length).toBe(5);
      expect(searchResult.text).toBe('match');
    });
  });

  describe('Component Props Types', () => {
    it('should validate MonacoEditorProps', () => {
      const props: MonacoEditorProps = {
        value: '{"test": true}',
        onChange: (value: string) => console.log(value),
        onValidationChange: (errors: JsonError[]) => console.log(errors),
        theme: 'light',
        settings: {
          indentSize: 2,
          indentType: 'spaces',
          wordWrap: true,
          lineNumbers: true,
          minimap: false,
        },
      };

      expect(props.value).toBe('{"test": true}');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onValidationChange).toBe('function');
      expect(props.theme).toBe('light');
    });

    it('should validate EditorToolbarProps', () => {
      const props: EditorToolbarProps = {
        onFormat: () => {},
        onMinify: () => {},
        onValidate: () => {},
        onToggleSearch: () => {},
        isValid: true,
        isDirty: false,
      };

      expect(typeof props.onFormat).toBe('function');
      expect(typeof props.onMinify).toBe('function');
      expect(typeof props.onValidate).toBe('function');
      expect(typeof props.onToggleSearch).toBe('function');
      expect(props.isValid).toBe(true);
      expect(props.isDirty).toBe(false);
    });

    it('should validate FileOperationsProps', () => {
      const props: FileOperationsProps = {
        onOpen: () => {},
        onSave: () => {},
        onNew: () => {},
        isDirty: true,
        currentFile: {
          name: 'test.json',
          size: 100,
          lastModified: new Date(),
          content: '{}',
        },
      };

      expect(typeof props.onOpen).toBe('function');
      expect(typeof props.onSave).toBe('function');
      expect(typeof props.onNew).toBe('function');
      expect(props.isDirty).toBe(true);
      expect(props.currentFile?.name).toBe('test.json');
    });

    it('should validate StatusBarProps', () => {
      const props: StatusBarProps = {
        isValid: false,
        errors: [
          {
            line: 1,
            column: 1,
            message: 'Error',
            severity: 'error',
          },
        ],
        cursorPosition: { line: 5, column: 10 },
        fileSize: 1024,
      };

      expect(props.isValid).toBe(false);
      expect(props.errors).toHaveLength(1);
      expect(props.cursorPosition.line).toBe(5);
      expect(props.cursorPosition.column).toBe(10);
      expect(props.fileSize).toBe(1024);
    });

    it('should validate ThemeSelectorProps', () => {
      const props: ThemeSelectorProps = {
        theme: 'dark',
        onThemeChange: (theme: Theme) => console.log(theme),
      };

      expect(props.theme).toBe('dark');
      expect(typeof props.onThemeChange).toBe('function');
    });
  });

  describe('Utility Types', () => {
    it('should validate Theme type', () => {
      const lightTheme: Theme = 'light';
      const darkTheme: Theme = 'dark';

      expect(lightTheme).toBe('light');
      expect(darkTheme).toBe('dark');
    });

    it('should validate IndentType', () => {
      const spacesIndent: IndentType = 'spaces';
      const tabsIndent: IndentType = 'tabs';

      expect(spacesIndent).toBe('spaces');
      expect(tabsIndent).toBe('tabs');
    });

    it('should validate IndentSize', () => {
      const size2: IndentSize = 2;
      const size4: IndentSize = 4;

      expect(size2).toBe(2);
      expect(size4).toBe(4);
    });

    it('should validate ErrorSeverity', () => {
      const errorSeverity: ErrorSeverity = 'error';
      const warningSeverity: ErrorSeverity = 'warning';

      expect(errorSeverity).toBe('error');
      expect(warningSeverity).toBe('warning');
    });
  });
});
