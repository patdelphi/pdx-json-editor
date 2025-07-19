// Theme initialization utility
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const getStoredTheme = (): 'light' | 'dark' | null => {
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  };

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    // Remove both theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Set data attribute
    root.setAttribute('data-theme', theme);
  };

  // Get initial theme
  const storedTheme = getStoredTheme();
  const initialTheme = storedTheme || getSystemTheme();
  
  // Apply theme immediately to prevent flash
  applyTheme(initialTheme);
  
  // Store theme if it wasn't stored before
  if (!storedTheme) {
    localStorage.setItem('theme', initialTheme);
  }

  return initialTheme;
}