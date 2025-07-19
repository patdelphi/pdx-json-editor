import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from './SearchIcon';
import ReplaceIcon from './ReplaceIcon';

interface ToolbarSearchPanelProps {
  isVisible: boolean;
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
 * 工具栏集成版搜索面板
 */
const ToolbarSearchPanel: React.FC<ToolbarSearchPanelProps> = ({
  isVisible = true,
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

  const buttonBaseClass = `
    px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2
    ${
      theme === 'dark'
        ? 'bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white border-gray-600/50 hover:border-gray-500'
        : 'bg-white/80 hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300'
    }
    cursor-pointer hover:shadow-md hover:scale-105
    border backdrop-blur-sm
  `;

  const inputClass = `
    px-3 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm h-10
    ${
      theme === 'dark'
        ? 'bg-gray-800/80 text-gray-200 border-gray-600/50 focus:border-blue-500/50 placeholder-gray-400'
        : 'bg-white/90 text-gray-700 border-gray-300/50 focus:border-blue-500/50 placeholder-gray-500'
    }
  `;

  const optionButtonClass = (active: boolean) => `
    px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 border backdrop-blur-sm
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
    flex items-center justify-center px-2 border h-10
    ${
      theme === 'dark'
        ? 'bg-gray-700 text-gray-300 border-gray-600'
        : 'bg-gray-200 text-gray-600 border-gray-300'
    }
  `;

  return (
    <div className={`flex items-center ${!isVisible ? 'hidden' : ''}`}>
      <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" style={{ margin: '0 16px' }}></div>
      
      {/* 搜索输入框 */}
      <div className="flex items-center">
        <div className={`${iconContainerClass} rounded-l-lg border-r-0`}>
          <SearchIcon className="text-gray-500 dark:text-gray-300" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className={`${inputClass} rounded-l-none rounded-r-lg`}
          style={{ width: '140px' }}
        />
      </div>
      
      {/* 搜索选项按钮 */}
      <div className="flex items-center space-x-2" style={{ marginLeft: '16px' }}>
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
      <div className="flex items-center space-x-2" style={{ marginLeft: '16px' }}>
        <button
          className={buttonBaseClass.replace('px-4', 'px-2')}
          onClick={onFindPrevious}
          title="查找上一个 (Shift+Enter)"
        >
          <span className="text-lg">⬆️</span>
        </button>
        <button
          className={buttonBaseClass.replace('px-4', 'px-2')}
          onClick={onFindNext}
          title="查找下一个 (Enter)"
        >
          <span className="text-lg">⬇️</span>
        </button>
      </div>
      
      {/* 替换切换按钮 */}
      <button
        className={`${buttonBaseClass} ${showReplace ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' : ''}`}
        onClick={() => setShowReplace(!showReplace)}
        title={showReplace ? '隐藏替换' : '替换'}
        style={{ marginLeft: '16px' }}
      >
        <span className="flex items-center space-x-1">
          <span>{showReplace ? '🔽' : '🔄'}</span>
          <span>替换</span>
        </span>
      </button>
      
      {/* 替换输入框和按钮 */}
      {showReplace && (
        <div className="flex items-center border-l border-gray-300 dark:border-gray-600" style={{ marginLeft: '16px', paddingLeft: '16px' }}>
          <div className="flex items-center">
            <div className={`${iconContainerClass} rounded-l-lg border-r-0`}>
              <ReplaceIcon className="text-gray-500 dark:text-gray-300" />
            </div>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="替换为..."
              className={`${inputClass} rounded-l-none rounded-r-lg`}
              style={{ width: '120px' }}
            />
          </div>
          <div className="flex items-center" style={{ marginLeft: '16px' }}>
            <button
              className={`${buttonBaseClass.replace('px-4', 'px-2')} bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300`}
              onClick={handleReplace}
              title="替换当前"
              style={{ marginRight: '16px' }}
            >
              <span className="flex items-center space-x-1">
                <span>🎯</span>
                <span className="text-xs">替换</span>
              </span>
            </button>
            <button
              className={`${buttonBaseClass.replace('px-4', 'px-2')} bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300`}
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
  );
};

export default ToolbarSearchPanel;