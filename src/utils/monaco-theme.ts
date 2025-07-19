import type { MonacoTheme } from '../types/editor.types';

// Global Monaco theme manager
class MonacoThemeManager {
  private monaco: any = null;
  private editors: Set<any> = new Set();
  private currentTheme: MonacoTheme = 'vs';

  setMonaco(monaco: any) {
    this.monaco = monaco;
  }

  addEditor(editor: any) {
    this.editors.add(editor);
    // Apply current theme to new editor immediately
    if (this.monaco && this.monaco.editor) {
      try {
        this.monaco.editor.setTheme(this.currentTheme);
      } catch (error) {
        console.error('Error applying theme to new editor:', error);
      }
    }
  }

  removeEditor(editor: any) {
    this.editors.delete(editor);
  }

  setTheme(theme: MonacoTheme) {
    this.currentTheme = theme;
    
    if (this.monaco && this.monaco.editor) {
      try {
        // Apply theme immediately without setTimeout
        this.monaco.editor.setTheme(theme);
        
        // Force layout update for all editors
        this.editors.forEach(editor => {
          if (editor && typeof editor.layout === 'function') {
            editor.layout();
          }
        });
      } catch (error) {
        console.error('Error setting Monaco theme:', error);
      }
    }
  }

  getCurrentTheme(): MonacoTheme {
    return this.currentTheme;
  }

  isReady(): boolean {
    return this.monaco !== null && this.monaco.editor !== null;
  }

  // Force theme refresh for all editors
  refreshTheme() {
    if (this.isReady()) {
      this.setTheme(this.currentTheme);
    }
  }
}

// Export singleton instance
export const monacoThemeManager = new MonacoThemeManager();

// Helper function to update Monaco theme
export function updateMonacoTheme(theme: MonacoTheme) {
  monacoThemeManager.setTheme(theme);
}