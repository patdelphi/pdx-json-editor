import React from 'react';
import type { JsonError, CursorPosition, Selection } from '../../types/editor.types';

interface StatusBarProps {
  errors: JsonError[];
  cursorPosition: CursorPosition;
  selection: Selection | null;
  characterCount: number;
  wordCount: number;
  fileSize?: number;
  isModified: boolean;
  theme: 'light' | 'dark';
}

const StatusBar: React.FC<StatusBarProps> = ({
  errors,
  cursorPosition,
  selection,
  characterCount,
  wordCount,
  fileSize,
  isModified,
  theme
}) => {
  const hasSelection = selection && (
    selection.startLine !== selection.endLine || 
    selection.startColumn !== selection.endColumn
  );

  const getValidationStatus = () => {
    if (errors.length === 0) {
      return { text: 'Valid JSON', className: 'text-green-600 dark:text-green-400' };
    }
    
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;
    
    if (errorCount > 0) {
      return { 
        text: `${errorCount} error${errorCount > 1 ? 's' : ''}${warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}`, 
        className: 'text-red-600 dark:text-red-400' 
      };
    } else {
      return { 
        text: `${warningCount} warning${warningCount > 1 ? 's' : ''}`, 
        className: 'text-yellow-600 dark:text-yellow-400' 
      };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSelectionInfo = () => {
    if (!hasSelection) return null;
    
    const lines = Math.abs(selection!.endLine - selection!.startLine) + 1;
    const chars = selection!.endLine === selection!.startLine 
      ? Math.abs(selection!.endColumn - selection!.startColumn)
      : 0; // For multi-line selections, character count is more complex
    
    if (lines === 1) {
      return `${chars} chars selected`;
    } else {
      return `${lines} lines selected`;
    }
  };

  const validationStatus = getValidationStatus();

  return (
    <div className={`
      h-6 px-3 flex items-center justify-between text-xs border-t
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-gray-300' 
        : 'bg-gray-100 border-gray-200 text-gray-600'
      }
    `}>
      {/* Left section - Cursor position and selection */}
      <div className="flex items-center space-x-4">
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        {hasSelection && (
          <span className="text-blue-600 dark:text-blue-400">
            {getSelectionInfo()}
          </span>
        )}
      </div>

      {/* Center section - Document stats */}
      <div className="flex items-center space-x-4">
        <span>
          {characterCount.toLocaleString()} chars
        </span>
        <span>
          {wordCount.toLocaleString()} words
        </span>
        {fileSize !== undefined && (
          <span>
            {formatFileSize(fileSize)}
          </span>
        )}
        {isModified && (
          <span className="text-orange-600 dark:text-orange-400">
            Modified
          </span>
        )}
      </div>

      {/* Right section - Validation status */}
      <div className="flex items-center space-x-2">
        <span className={validationStatus.className}>
          {validationStatus.text}
        </span>
        {errors.length > 0 && (
          <button
            className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => {
              // Scroll to first error
              const firstError = errors[0];
              const event = new CustomEvent('goto-line', { 
                detail: { line: firstError.line, column: firstError.column } 
              });
              window.dispatchEvent(event);
            }}
            title="Go to first error"
          >
            Go to error
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusBar;