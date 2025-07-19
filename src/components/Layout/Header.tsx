import { ThemeToggle } from '../Settings/ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 w-full max-w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-4 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          PDX JSON Editor
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <ThemeToggle />
      </div>
    </header>
  );
}