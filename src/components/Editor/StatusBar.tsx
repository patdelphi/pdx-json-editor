interface StatusBarProps {
  line?: number;
  column?: number;
  fileSize?: number;
  errorCount?: number;
  warningCount?: number;
}

export function StatusBar({ 
  line = 1, 
  column = 1, 
  fileSize = 0, 
  errorCount = 0, 
  warningCount = 0 
}: StatusBarProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between px-4 py-1 text-sm w-full max-w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Ln {line}, Col {column}
        </span>
        
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 whitespace-nowrap">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorCount}
              </span>
            )}
            
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {warningCount}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="text-gray-600 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
        {formatFileSize(fileSize)}
      </div>
    </div>
  );
}