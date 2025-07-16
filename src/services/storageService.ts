// Local storage service
import type { EditorSettings, FileInfo, StoredData } from '../types';
import {
  STORAGE_KEYS,
  DEFAULT_EDITOR_SETTINGS,
  DEFAULT_THEME,
} from '../utils/constants';

export class StorageService {
  static getSettings(): EditorSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EDITOR_SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_EDITOR_SETTINGS;
    } catch {
      return DEFAULT_EDITOR_SETTINGS;
    }
  }

  static saveSettings(settings: EditorSettings): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.EDITOR_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getTheme(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      return (stored as 'light' | 'dark') || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }

  static saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  static getRecentFiles(): FileInfo[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_FILES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveRecentFiles(files: FileInfo[]): void {
    try {
      const limited = files.slice(0, 10); // Keep only last 10 files
      localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save recent files:', error);
    }
  }

  static getLastContent(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_CONTENT) || '';
    } catch {
      return '';
    }
  }

  static saveLastContent(content: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_CONTENT, content);
    } catch (error) {
      console.error('Failed to save last content:', error);
    }
  }

  static getAllStoredData(): StoredData {
    return {
      settings: this.getSettings(),
      theme: this.getTheme(),
      recentFiles: this.getRecentFiles(),
      lastContent: this.getLastContent(),
    };
  }

  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
