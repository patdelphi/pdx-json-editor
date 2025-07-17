import React, { useState, useEffect, useRef } from 'react';
import Z_INDEX from '../../constants/zIndex';

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
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const inputClass = `
    w-full px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500
    ${theme === 'dark' 
      ? 'bg-gray-800 text-gray-200 border-gray-600' 
      : 'bg-white text-gray-700 border-gray-300'
    }
  `;
  
  const buttonClass = `
    px-1.5 py-0.5 text-xs font-medium rounded-md transition-colors
    ${theme === 'dark' 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
    }
    border
  `;
  
  const optionButtonClass = (active: boolean) => `
    px-1.5 py-0.5 text-xs font-medium rounded-md transition-colors border
    ${theme === 'dark'
      ? active 
        ? 'bg-blue-600 text-white border-blue-700' 
        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
      : active
        ? 'bg-blue-500 text-white border-blue-600'
        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
    }
  `;

  return (
    <div 
      className={`flex-shrink-0 ${!isVisible ? 'hidden' : ''}`}
      style={{ 
        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
        borderLeft: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
        padding: '0.25rem 0.5rem',
        zIndex: Z_INDEX.SEARCH_PANEL,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0
      }}
    >
      <div className="flex items-center space-x-1">
        {/* 搜索输入框 */}
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className={inputClass}
          style={{ width: '150px' }}
        />
        
        {/* 搜索选项按钮 */}
        <button 
          className={optionButtonClass(options.caseSensitive)}
          onClick={() => toggleOption('caseSensitive')}
          title="区分大小写"
        >
          Aa
        </button>
        <button 
          className={optionButtonClass(options.wholeWord)}
          onClick={() => toggleOption('wholeWord')}
          title="全字匹配"
        >
          W
        </button>
        <button 
          className={optionButtonClass(options.useRegex)}
          onClick={() => toggleOption('useRegex')}
          title="使用正则表达式"
        >
          .*
        </button>
        
        {/* 导航按钮 */}
        <button 
          className={buttonClass}
          onClick={onFindPrevious}
          title="查找上一个 (Shift+Enter)"
        >
          ↑
        </button>
        <button 
          className={buttonClass}
          onClick={onFindNext}
          title="查找下一个 (Enter)"
        >
          ↓
        </button>
        
        {/* 替换切换按钮 */}
        <button 
          className={buttonClass}
          onClick={() => setShowReplace(!showReplace)}
          title={showReplace ? "隐藏替换" : "显示替换"}
        >
          {showReplace ? "−" : "+"}
        </button>
        
        {/* 替换输入框和按钮 */}
        {showReplace && (
          <>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="替换为..."
              className={inputClass}
              style={{ width: '120px' }}
            />
            <button 
              className={buttonClass}
              onClick={handleReplace}
              title="替换"
            >
              替换
            </button>
            <button 
              className={buttonClass}
              onClick={handleReplaceAll}
              title="全部替换"
            >
              全部
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;