export function StatusBar() {
  return (
    <footer className="flex items-center justify-between px-4 py-1 text-sm bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 dark:text-gray-400">Ready</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 dark:text-gray-400">JSON Editor</span>
      </div>
    </footer>
  );
}