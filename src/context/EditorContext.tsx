// Editor context for global state management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, EditorAction } from '../types';
import { DEFAULT_EDITOR_SETTINGS, DEFAULT_THEME } from '../utils/constants';
import { StorageService } from '../services/storageService';

// Initialize state with data from localStorage
const getInitialState = (): AppState => {
  const storedData = StorageService.getAllStoredData();
  
  return {
    editor: {
      content: storedData.lastContent,
      isValid: true,
      errors: [],
      isDirty: false,
      currentFile: null,
      theme: storedData.theme,
      settings: storedData.settings,
    },
    ui: {
      showSearchPanel: false,
      showSettings: false,
      sidebarCollapsed: false,
    },
    recent: storedData.recentFiles,
  };
};

const editorReducer = (state: AppState, action: EditorAction): AppState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return {
        ...state,
        editor: {
          ...state.editor,
          content: action.payload,
          isDirty: true,
        },
      };
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        editor: {
          ...state.editor,
          errors: action.payload,
          isValid: action.payload.length === 0,
        },
      };
    case 'SET_FILE':
      return {
        ...state,
        editor: {
          ...state.editor,
          currentFile: action.payload,
          content: action.payload?.content || '',
          isDirty: false,
        },
      };
    case 'SET_THEME':
      return {
        ...state,
        editor: {
          ...state.editor,
          theme: action.payload,
        },
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        editor: {
          ...state.editor,
          settings: {
            ...state.editor.settings,
            ...action.payload,
          },
        },
      };
    case 'TOGGLE_SEARCH_PANEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showSearchPanel: !state.ui.showSearchPanel,
        },
      };
    case 'SET_DIRTY':
      return {
        ...state,
        editor: {
          ...state.editor,
          isDirty: action.payload,
        },
      };
    case 'TOGGLE_SETTINGS':
      return {
        ...state,
        ui: {
          ...state.ui,
          showSettings: !state.ui.showSettings,
        },
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };
    case 'ADD_RECENT_FILE': {
      const newRecent = [
        action.payload,
        ...state.recent.filter((f) => f.name !== action.payload.name),
      ].slice(0, 10);
      return {
        ...state,
        recent: newRecent,
      };
    }
    default:
      return state;
  }
};

const EditorContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<EditorAction>;
} | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, getInitialState());

  // Persist state changes to localStorage
  useEffect(() => {
    StorageService.saveSettings(state.editor.settings);
  }, [state.editor.settings]);

  useEffect(() => {
    StorageService.saveTheme(state.editor.theme);
  }, [state.editor.theme]);

  useEffect(() => {
    StorageService.saveRecentFiles(state.recent);
  }, [state.recent]);

  useEffect(() => {
    // Debounce content saving to avoid too frequent writes
    const timeoutId = setTimeout(() => {
      if (state.editor.content) {
        StorageService.saveLastContent(state.editor.content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.editor.content]);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext;
