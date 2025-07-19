import { useState, useEffect, useCallback } from 'preact/hooks';
import { updateMonacoTheme } from '../utils/monaco-theme';
import type { MonacoTheme } from '../types/editor.types';

export type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  // Check localStorage first
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // Fall back to system preference
  return getSystemTheme();
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  
  // Remove both classes first to ensure clean state
  root.classList.remove('light', 'dark');
  
  // Add the current theme class
  root.classList.add(theme);
  
  // Set data attribute for additional styling hooks
  root.setAttribute('data-theme', theme);
}

function getMonacoTheme(theme: Theme): MonacoTheme {
  return theme === 'dark' ? 'vs-dark' : 'vs';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme to DOM and Monaco immediately when theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
    // Update Monaco theme synchronously
    const monacoTheme = getMonacoTheme(theme);
    updateMonacoTheme(monacoTheme);
  }, [theme]);

  // Initialize theme on first mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    } else {
      // Even if theme is the same, ensure DOM and Monaco are updated
      applyThemeToDOM(initialTheme);
      updateMonacoTheme(getMonacoTheme(initialTheme));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply changes immediately without waiting for useEffect
    applyThemeToDOM(newTheme);
    updateMonacoTheme(getMonacoTheme(newTheme));
  }, [theme]);

  return { theme, toggleTheme };
}