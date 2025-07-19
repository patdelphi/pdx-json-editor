import React, { useState, useEffect, useRef } from 'react';
import Z_INDEX from '../../constants/zIndex';
import SearchIcon from './SearchIcon';
import ReplaceIcon from './ReplaceIcon';

interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => void;
  onReplaceAll: (
    searchQuery: string,
    replaceText: string,
    options: SearchOptions
  ) => void;
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

/**
 * 自定义搜索面板，固定在菜单行右侧
 */
const SearchPanel: React.FC<SearchPanelProps> = ({
  isVisible,
  onSearch,
  onReplace,
  onReplaceAll,
  onFindNext,
  onFindPrevious,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    useRegex: false,
    wholeWord: false,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 当面板变为可见时，聚焦搜索输入框
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  // 处理搜索 - 当输入框内容变化时自动触发搜索
  useEffect(() => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, options);
    }
  }, [searchQuery, options, onSearch]);

  // 处理替换
  const handleReplace = () => {
    if (searchQuery.trim()) {
      onReplace(searchQuery, replaceText, options);
    }
  };

  // 处理全部替换
  const handleReplaceAll = () => {
    if (searchQuery.trim()) {
      onReplaceAll(searchQuery, replaceText, options);
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onFindPrevious();
      } else {
        onFindNext();
      }
      e.preventDefault();
    }
  };

  // 切换选项
  const toggleOption = (option: keyof SearchOptions) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const inputClass = `
    w-full px-3 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm
    ${
      theme === 'dark'
        ? 'bg-gray-800/80 text-gray-200 border-gray-600/50 focus:border-blue-500/50 placeholder-gray-400'
        : 'bg-white/90 text-gray-700 border-gray-300/50 focus:border-blue-500/50 placeholder-gray-500'
    }
  `;

  const buttonClass = `
    px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 backdrop-blur-sm
    ${
      theme === 'dark'
        ? 'bg-gray-700/60 hover:bg-gray-600/70 text-gray-200 border-gray-600/50 hover:border-gray-500'
        : 'bg-white/80 hover:bg-gray-50 text-gray-700 border-gray-300/50 hover:border-gray-400'
    }
    border hover:shadow-md hover:scale-105
  `;

  const optionButtonClass = (active: boolean) => `
    px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border backdrop-blur-sm
    ${
      theme === 'dark'
        ? active
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-lg'
          : 'bg-gray-700/60 text-gray-300 border-gray-600/50 hover:bg-gray-600/70 hover:border-gray-500'
        : active
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg'
          : 'bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50 hover:border-gray-400'
    }
    ${active ? '' : 'hover:shadow-md hover:scale-105'}
  `;

  const iconContainerClass = `
    flex items-center justify-center px-3 border
    ${
      theme === 'dark'
        ? 'bg-gray-700 text-gray-300 border-gray-600'
        : 'bg-gray-200 text-gray-600 border-gray-300'
    }
  `;

  return (
    <div
      className={`flex-shrink-0 ${!isVisible ? 'hidden' : ''}`}
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderLeft: `1px solid ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`,
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
        padding: '0.75rem 1rem',
        zIndex: Z_INDEX.SEARCH_PANEL,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        backdropFilter: 'blur(8px)',
        borderRadius: '0 0 0 12px',
        boxShadow: theme === 'dark' 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center space-x-2">
        {/* 搜索图标和输入框 */}
        <div className="flex items-center">
          <div className={`${iconContainerClass} rounded-l-lg border-r-0 h-10`}>
            <SearchIcon className="text-gray-500 dark:text-gray-300" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索..."
            className={`${inputClass} rounded-l-none rounded-r-lg h-10`}
            style={{ width: '160px' }}
          />
        </div>

        {/* 搜索选项按钮 */}
        <div className="flex items-center space-x-1">
          <button
            className={optionButtonClass(options.caseSensitive)}
            onClick={() => toggleOption('caseSensitive')}
            title="区分大小写"
          >
            <span className="font-mono">Aa</span>
          </button>
          <button
            className={optionButtonClass(options.wholeWord)}
            onClick={() => toggleOption('wholeWord')}
            title="全字匹配"
          >
            <span className="font-mono">W</span>
          </button>
          <button
            className={optionButtonClass(options.useRegex)}
            onClick={() => toggleOption('useRegex')}
            title="使用正则表达式"
          >
            <span className="font-mono">.*</span>
          </button>
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center space-x-1">
          <button
            className={buttonClass}
            onClick={onFindPrevious}
            title="查找上一个 (Shift+Enter)"
          >
            <span className="text-lg">⬆️</span>
          </button>
          <button
            className={buttonClass}
            onClick={onFindNext}
            title="查找下一个 (Enter)"
          >
            <span className="text-lg">⬇️</span>
          </button>
        </div>

        {/* 替换切换按钮 */}
        <button
          className={`${buttonClass} ${showReplace ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' : ''}`}
          onClick={() => setShowReplace(!showReplace)}
          title={showReplace ? '隐藏替换' : '显示替换'}
        >
          <span className="flex items-center space-x-1">
            <span>{showReplace ? '🔽' : '🔄'}</span>
            <span className="text-xs">{showReplace ? '隐藏' : '替换'}</span>
          </span>
        </button>

        {/* 替换输入框和按钮 */}
        {showReplace && (
          <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-300 dark:border-gray-600">
            <div className="flex items-center">
              <div className={`${iconContainerClass} rounded-l-lg border-r-0 h-10`}>
                <ReplaceIcon className="text-gray-500 dark:text-gray-300" />
              </div>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="替换为..."
                className={`${inputClass} rounded-l-none rounded-r-lg h-10`}
                style={{ width: '140px' }}
              />
            </div>
            <div className="flex items-center space-x-1">
              <button
                className={`${buttonClass} bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300`}
                onClick={handleReplace}
                title="替换当前"
              >
                <span className="flex items-center space-x-1">
                  <span>🎯</span>
                  <span className="text-xs">替换</span>
                </span>
              </button>
              <button
                className={`${buttonClass} bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300`}
                onClick={handleReplaceAll}
                title="全部替换"
              >
                <span className="flex items-center space-x-1">
                  <span>🎯</span>
                  <span className="text-xs">全部</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;