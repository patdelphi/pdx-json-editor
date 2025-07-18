import React from 'react';

interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  disabled?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  theme,
  onThemeChange,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const buttonClass = `
    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const switchClass = `
    inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
  `;

  return (
    <div className="flex items-center space-x-3">
      {/* Light theme icon */}
      <span
        className={`text-sm ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`}
        title="Light theme"
      >
        ☀️
      </span>

      {/* Toggle switch */}
      <button
        type="button"
        className={buttonClass}
        onClick={handleToggle}
        disabled={disabled}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        <span className={switchClass} />
      </button>

      {/* Dark theme icon */}
      <span
        className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`}
        title="Dark theme"
      >
        🌙
      </span>

      {/* Theme label */}
      <span
        className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </div>
  );
};

export default ThemeSelector;
