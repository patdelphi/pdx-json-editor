import React, { useState, useCallback, useEffect } from 'react';

interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (searchQuery: string, replaceText: string, options: SearchOptions) => void;
  onReplaceAll: (searchQuery: string, replaceText: string, options: SearchOptions) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
  theme: 'light' | 'dark';
}

interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  isVisible,
  onClose,
  onSearch,
  onReplace,
  onReplaceAll,
  onFindNext,
  onFindPrevious,
  searchResults,
  currentResultIndex,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    useRegex: false,
    wholeWord: false
  });

  // Auto-search when query or options change
  useEffect(() => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, options);
    }
  }, [searchQuery, options, onSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleReplaceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setReplaceText(e.target.value);
  }, []);

  const handleOptionChange = useCallback((option: keyof SearchOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  }, []);

  const handleReplace = useCallback(() => {
    if (searchQuery.trim() && replaceText !== undefined) {
      onReplace(searchQuery, replaceText, options);
    }
  }, [searchQuery, replaceText, options, onReplace]);

  const handleReplaceAll = useCallback(() => {
    if (searchQuery.trim() && replaceText !== undefined) {
      onReplaceAll(searchQuery, replaceText, options);
    }
  }, [searchQuery, replaceText, options, onReplaceAll]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onFindPrevious();
      } else {
        onFindNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [onFindNext, onFindPrevious, onClose]);

  if (!isVisible) return null;

  const panelClass = `
    absolute top-0 right-0 z-20 w-80 p-4 shadow-lg border-l
    ${theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 text-gray-100' 
      : 'bg-white border-gray-200 text-gray-900'
    }
  `;

  const inputClass = `
    w-full px-3 py-2 text-sm border rounded-md transition-colors
    ${theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }
    focus:outline-none focus:ring-1 focus:ring-blue-500
  `;

  const buttonClass = `
    px-3 py-1.5 text-sm font-medium rounded-md transition-colors
    ${theme === 'dark' 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
    }
    border
  `;

  const primaryButtonClass = `
    px-3 py-1.5 text-sm font-medium rounded-md transition-colors
    bg-blue-600 hover:bg-blue-700 text-white
  `;

  const toggleButtonClass = (active: boolean) => `
    px-2 py-1 text-xs font-medium rounded transition-colors
    ${active 
      ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
      : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600')
    }
  `;

  return (
    <div className={panelClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {showReplace ? 'Find & Replace' : 'Find'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={buttonClass}
            title="Toggle replace mode"
          >
            {showReplace ? '🔍' : '🔄'}
          </button>
          <button
            onClick={onClose}
            className={buttonClass}
            title="Close search panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className={inputClass}
          autoFocus
        />
      </div>

      {/* Replace Input */}
      {showReplace && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={handleReplaceChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
          />
        </div>
      )}

      {/* Search Options */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOptionChange('caseSensitive')}
            className={toggleButtonClass(options.caseSensitive)}
            title="Match case"
          >
            Aa
          </button>
          <button
            onClick={() => handleOptionChange('wholeWord')}
            className={toggleButtonClass(options.wholeWord)}
            title="Match whole word"
          >
            Ab
          </button>
          <button
            onClick={() => handleOptionChange('useRegex')}
            className={toggleButtonClass(options.useRegex)}
            title="Use regular expression"
          >
            .*
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-4">
          <div className={`
            text-sm px-2 py-1 rounded
            ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
          `}>
            {searchResults.length > 0 
              ? `${currentResultIndex + 1} of ${searchResults.length} results`
              : 'No results found'
            }
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={onFindPrevious}
            disabled={searchResults.length === 0}
            className={`${buttonClass} ${searchResults.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Find previous (Shift+Enter)"
          >
            ↑
          </button>
          <button
            onClick={onFindNext}
            disabled={searchResults.length === 0}
            className={`${buttonClass} ${searchResults.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Find next (Enter)"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Replace Buttons */}
      {showReplace && (
        <div className="space-y-2">
          <button
            onClick={handleReplace}
            disabled={searchResults.length === 0}
            className={`w-full ${searchResults.length === 0 ? buttonClass + ' opacity-50 cursor-not-allowed' : primaryButtonClass}`}
            title="Replace current match"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={searchResults.length === 0}
            className={`w-full ${searchResults.length === 0 ? buttonClass + ' opacity-50 cursor-not-allowed' : primaryButtonClass}`}
            title="Replace all matches"
          >
            Replace All ({searchResults.length})
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className={`
        mt-4 pt-3 border-t text-xs
        ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}
      `}>
        <div>Enter: Find next</div>
        <div>Shift+Enter: Find previous</div>
        <div>Escape: Close panel</div>
      </div>
    </div>
  );
};

export default SearchPanel;