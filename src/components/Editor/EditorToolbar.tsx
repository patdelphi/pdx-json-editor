interface EditorToolbarProps {
  onFormat?: () => void;
  onValidate?: () => void;
  isValid?: boolean;
}

export function EditorToolbar({ 
  onFormat, 
  onValidate, 
  isValid = true 
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 w-full max-w-full bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onFormat}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Format JSON (Ctrl+Shift+F)"
        >
          Format
        </button>
        
        <button
          onClick={onValidate}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          title="Validate JSON"
        >
          Validate
        </button>
      </div>
      
      <div className="flex-1 min-w-0" />
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-sm px-2 py-1 rounded whitespace-nowrap ${
          isValid 
            ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
            : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
        }`}>
          {isValid ? 'Valid JSON' : 'Invalid JSON'}
        </span>
      </div>
    </div>
  );
}