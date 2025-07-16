import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorProvider, useEditorContext } from '../EditorContext';
import type { ReactNode } from 'react';
import type { EditorAction } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock constants and services
vi.mock('../../utils/constants', () => ({
  DEFAULT_EDITOR_SETTINGS: {
    indentSize: 2,
    indentType: 'spaces',
    wordWrap: true,
    lineNumbers: true,
    minimap: false,
  },
  DEFAULT_THEME: 'light',
  STORAGE_KEYS: {
    EDITOR_SETTINGS: 'json-editor-settings',
    THEME: 'json-editor-theme',
    RECENT_FILES: 'json-editor-recent-files',
    LAST_CONTENT: 'json-editor-last-content',
  },
}));

// Mock StorageService
vi.mock('../../services/storageService', () => ({
  StorageService: {
    getAllStoredData: vi.fn(() => ({
      settings: {
        indentSize: 2,
        indentType: 'spaces',
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
      },
      theme: 'light',
      recentFiles: [],
      lastContent: '',
    })),
    saveSettings: vi.fn(),
    saveTheme: vi.fn(),
    saveRecentFiles: vi.fn(),
    saveLastContent: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <EditorProvider>{children}</EditorProvider>
);

describe('EditorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEditorContext', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useEditorContext());
      }).toThrow('useEditorContext must be used within an EditorProvider');
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      expect(result.current.state.editor.content).toBe('');
      expect(result.current.state.editor.isValid).toBe(true);
      expect(result.current.state.editor.errors).toEqual([]);
      expect(result.current.state.editor.isDirty).toBe(false);
      expect(result.current.state.editor.currentFile).toBeNull();
      expect(result.current.state.editor.theme).toBe('light');
      expect(result.current.state.ui.showSearchPanel).toBe(false);
      expect(result.current.state.ui.showSettings).toBe(false);
      expect(result.current.state.ui.sidebarCollapsed).toBe(false);
      expect(result.current.state.recent).toEqual([]);
    });
  });

  describe('EditorActions', () => {
    it('should handle SET_CONTENT action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'SET_CONTENT',
          payload: '{"test": "value"}',
        });
      });

      expect(result.current.state.editor.content).toBe('{"test": "value"}');
      expect(result.current.state.editor.isDirty).toBe(true);
    });

    it('should handle SET_VALIDATION_ERRORS action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const errors = [
        {
          line: 1,
          column: 5,
          message: 'Syntax error',
          severity: 'error' as const,
        },
      ];

      act(() => {
        result.current.dispatch({
          type: 'SET_VALIDATION_ERRORS',
          payload: errors,
        });
      });

      expect(result.current.state.editor.errors).toEqual(errors);
      expect(result.current.state.editor.isValid).toBe(false);
    });

    it('should handle SET_FILE action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const fileInfo = {
        name: 'test.json',
        size: 100,
        lastModified: new Date(),
        content: '{"file": "content"}',
      };

      act(() => {
        result.current.dispatch({
          type: 'SET_FILE',
          payload: fileInfo,
        });
      });

      expect(result.current.state.editor.currentFile).toEqual(fileInfo);
      expect(result.current.state.editor.content).toBe('{"file": "content"}');
      expect(result.current.state.editor.isDirty).toBe(false);
    });

    it('should handle SET_THEME action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'SET_THEME',
          payload: 'dark',
        });
      });

      expect(result.current.state.editor.theme).toBe('dark');
    });

    it('should handle UPDATE_SETTINGS action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'UPDATE_SETTINGS',
          payload: { indentSize: 4, wordWrap: false },
        });
      });

      expect(result.current.state.editor.settings.indentSize).toBe(4);
      expect(result.current.state.editor.settings.wordWrap).toBe(false);
      expect(result.current.state.editor.settings.lineNumbers).toBe(true); // unchanged
    });

    it('should handle TOGGLE_SEARCH_PANEL action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SEARCH_PANEL' });
      });

      expect(result.current.state.ui.showSearchPanel).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SEARCH_PANEL' });
      });

      expect(result.current.state.ui.showSearchPanel).toBe(false);
    });

    it('should handle SET_DIRTY action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'SET_DIRTY',
          payload: true,
        });
      });

      expect(result.current.state.editor.isDirty).toBe(true);
    });

    it('should handle TOGGLE_SETTINGS action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SETTINGS' });
      });

      expect(result.current.state.ui.showSettings).toBe(true);
    });

    it('should handle TOGGLE_SIDEBAR action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SIDEBAR' });
      });

      expect(result.current.state.ui.sidebarCollapsed).toBe(true);
    });

    it('should handle ADD_RECENT_FILE action', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const fileInfo = {
        name: 'recent.json',
        size: 200,
        lastModified: new Date(),
        content: '{"recent": true}',
      };

      act(() => {
        result.current.dispatch({
          type: 'ADD_RECENT_FILE',
          payload: fileInfo,
        });
      });

      expect(result.current.state.recent).toHaveLength(1);
      expect(result.current.state.recent[0]).toEqual(fileInfo);
    });

    it('should limit recent files to 10 items', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      // Add 12 files
      for (let i = 0; i < 12; i++) {
        act(() => {
          result.current.dispatch({
            type: 'ADD_RECENT_FILE',
            payload: {
              name: `file${i}.json`,
              size: 100,
              lastModified: new Date(),
              content: `{"file": ${i}}`,
            },
          });
        });
      }

      expect(result.current.state.recent).toHaveLength(10);
      expect(result.current.state.recent[0].name).toBe('file11.json');
    });

    it('should move existing file to top when added again', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const file1 = {
        name: 'file1.json',
        size: 100,
        lastModified: new Date(),
        content: '{"file": 1}',
      };
      const file2 = {
        name: 'file2.json',
        size: 200,
        lastModified: new Date(),
        content: '{"file": 2}',
      };

      // Add file1, then file2
      act(() => {
        result.current.dispatch({ type: 'ADD_RECENT_FILE', payload: file1 });
      });
      act(() => {
        result.current.dispatch({ type: 'ADD_RECENT_FILE', payload: file2 });
      });

      expect(result.current.state.recent[0]).toEqual(file2);
      expect(result.current.state.recent[1]).toEqual(file1);

      // Add file1 again - should move to top
      act(() => {
        result.current.dispatch({ type: 'ADD_RECENT_FILE', payload: file1 });
      });

      expect(result.current.state.recent[0]).toEqual(file1);
      expect(result.current.state.recent[1]).toEqual(file2);
      expect(result.current.state.recent).toHaveLength(2);
    });
  });

  describe('Reducer edge cases', () => {
    it('should handle unknown action type', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });
      const initialState = result.current.state;

      act(() => {
        result.current.dispatch({
          type: 'UNKNOWN_ACTION' as any,
        } as EditorAction);
      });

      expect(result.current.state).toEqual(initialState);
    });

    it('should handle SET_FILE with null payload', () => {
      const { result } = renderHook(() => useEditorContext(), { wrapper });

      // First set some content
      act(() => {
        result.current.dispatch({
          type: 'SET_CONTENT',
          payload: 'some content',
        });
      });

      // Then set file to null
      act(() => {
        result.current.dispatch({
          type: 'SET_FILE',
          payload: null,
        });
      });

      expect(result.current.state.editor.currentFile).toBeNull();
      expect(result.current.state.editor.content).toBe('');
      expect(result.current.state.editor.isDirty).toBe(false);
    });
  });
});