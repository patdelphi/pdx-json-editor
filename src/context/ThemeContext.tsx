import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { StorageService } from '../services/storageService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize theme from storage or system preference
    const storedTheme = StorageService.getTheme();
    if (storedTheme) {
      return storedTheme;
    }

    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    StorageService.saveTheme(newTheme);

    // Apply theme to document
    applyThemeToDocument(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom properties for theme colors
    const colors = getThemeColors(theme);
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const getThemeColors = (theme: Theme) => {
    if (theme === 'dark') {
      return {
        'bg-primary': '#1f2937', // gray-800
        'bg-secondary': '#374151', // gray-700
        'bg-tertiary': '#4b5563', // gray-600
        'text-primary': '#f9fafb', // gray-50
        'text-secondary': '#d1d5db', // gray-300
        'text-tertiary': '#9ca3af', // gray-400
        'border-primary': '#4b5563', // gray-600
        'border-secondary': '#6b7280', // gray-500
        'accent-primary': '#3b82f6', // blue-500
        'accent-secondary': '#1d4ed8', // blue-700
      };
    } else {
      return {
        'bg-primary': '#ffffff', // white
        'bg-secondary': '#f9fafb', // gray-50
        'bg-tertiary': '#f3f4f6', // gray-100
        'text-primary': '#111827', // gray-900
        'text-secondary': '#374151', // gray-700
        'text-tertiary': '#6b7280', // gray-500
        'border-primary': '#d1d5db', // gray-300
        'border-secondary': '#9ca3af', // gray-400
        'accent-primary': '#3b82f6', // blue-500
        'accent-secondary': '#1d4ed8', // blue-700
      };
    }
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        // Only auto-switch if user hasn't manually set a theme
        const storedTheme = StorageService.getTheme();
        if (!storedTheme) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
