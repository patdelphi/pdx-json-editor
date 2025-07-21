import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { 
  Box, 
  Paper, 
  InputBase, 
  IconButton, 
  Divider, 
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Badge,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import HistoryIcon from '@mui/icons-material/History';
import { ReplaceConfirmDialog } from './ReplaceConfirmDialog';
import { useFocusTrap, useKeyboardNavigationMenu } from '../hooks/useKeyboardNavigation';
import { ariaAttributes, createSearchbox } from '../utils/accessibilityUtils';

/**
 * 搜索面板组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否打开搜索面板
 * @param {Function} props.onClose - 关闭搜索面板的回调函数
 * @param {string} props.text - 要搜索的文本
 * @param {Function} props.onTextChange - 文本变化回调函数
 * @param {Object} props.editorRef - 编辑器引用
 * @param {Object} props.monacoRef - Monaco引用
 */
export function SearchPanel({ open, onClose, text, onTextChange, editorRef, monacoRef }) {
  const [showReplace, setShowReplace] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [historyAnchorEl, setHistoryAnchorEl] = useState(null);
  
  // 引用
  const searchInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const panelRef = useRef(null);
  
  // 从本地存储加载搜索历史
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('pdx-json-editor-search-history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  }, []);
  
  // 搜索选项
  const searchOptions = {
    caseSensitive,
    wholeWord,
    regex
  };
  
  // 执行搜索
  const performSearch = () => {
    if (!text || !searchText) {
      setSearchResults([]);
      setCurrentMatchIndex(-1);
      return;
    }
    
    try {
      const { searchInText } = require('../services/searchService');
      const results = searchInText(text, searchText, searchOptions);
      setSearchResults(results);
      setCurrentMatchIndex(results.length > 0 ? 0 : -1);
      
      // 高亮第一个匹配项
      if (results.length > 0 && editorRef.current && monacoRef.current) {
        highlightMatch(results[0]);
      }
    } catch (error) {
      showAlert(`搜索错误: ${error.message}`, 'error');
    }
  };
  
  // 当搜索文本或选项变化时执行搜索
  useEffect(() => {
    if (open && searchText) {
      performSearch();
    }
  }, [open, searchText, caseSensitive, wholeWord, regex, text]);
  
  // 查找下一个匹配项
  const findNext = () => {
    if (searchText.trim() === '') return;
    
    // 如果没有搜索结果，执行搜索
    if (searchResults.length === 0) {
      performSearch();
      return;
    }
    
    const newIndex = currentMatchIndex === searchResults.length - 1 ? 0 : currentMatchIndex + 1;
    setCurrentMatchIndex(newIndex);
    
    // 高亮匹配项
    highlightMatch(searchResults[newIndex]);
    
    // 添加到搜索历史
    addToSearchHistory(searchText);
  };
  
  // 查找上一个匹配项
  const findPrevious = () => {
    if (searchResults.length === 0) {
      return;
    }
    
    const newIndex = currentMatchIndex <= 0 ? searchResults.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(newIndex);
    
    // 高亮匹配项
    highlightMatch(searchResults[newIndex]);
  };
  
  // 高亮匹配项
  const highlightMatch = (match) => {
    if (!editorRef.current || !match) return;
    
    const editor = editorRef.current;
    
    // 创建选择范围
    const selection = {
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    };
    
    // 设置编辑器选择
    editor.setSelection(selection);
    
    // 滚动到选择位置
    editor.revealPositionInCenter({
      lineNumber: match.lineNumber,
      column: match.column
    });
  };
  
  // 替换当前匹配项
  const replace = () => {
    if (searchResults.length === 0 || currentMatchIndex === -1 || !onTextChange) {
      return;
    }
    
    try {
      const { replaceInText } = require('../services/searchService');
      const { text: newText } = replaceInText(
        text,
        searchText,
        replaceText,
        searchOptions,
        false,
        currentMatchIndex
      );
      
      onTextChange(newText);
      
      // 重新执行搜索
      setTimeout(() => {
        performSearch();
      }, 0);
      
      showAlert('已替换1处匹配', 'success');
    } catch (error) {
      showAlert(`替换错误: ${error.message}`, 'error');
    }
  };
  
  // 打开替换确认对话框
  const openReplaceConfirm = () => {
    if (searchResults.length === 0) {
      return;
    }
    
    setReplaceConfirmOpen(true);
  };
  
  // 关闭替换确认对话框
  const closeReplaceConfirm = () => {
    setReplaceConfirmOpen(false);
  };
  
  // 替换所有匹配项
  const replaceAll = () => {
    if (searchResults.length === 0 || !onTextChange) {
      return;
    }
    
    try {
      const { replaceInText } = require('../services/searchService');
      const { text: newText, replacedCount } = replaceInText(
        text,
        searchText,
        replaceText,
        searchOptions,
        true
      );
      
      onTextChange(newText);
      
      // 重新执行搜索
      setTimeout(() => {
        performSearch();
      }, 0);
      
      showAlert(`已替换${replacedCount}处匹配`, 'success');
      
      // 关闭确认对话框
      setReplaceConfirmOpen(false);
      
      // 添加到搜索历史
      addToSearchHistory(searchText);
    } catch (error) {
      showAlert(`替换错误: ${error.message}`, 'error');
    }
  };
  
  // 打开历史菜单
  const openHistoryMenu = (event) => {
    setHistoryAnchorEl(event.currentTarget);
  };
  
  // 关闭历史菜单
  const closeHistoryMenu = () => {
    setHistoryAnchorEl(null);
  };
  
  // 从历史中选择搜索文本
  const selectFromHistory = (text) => {
    setSearchText(text);
    closeHistoryMenu();
  };
  
  // 显示提示信息
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // 关闭提示信息
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  // 处理搜索文本变化
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };
  
  // 添加到搜索历史
  const addToSearchHistory = useCallback((text) => {
    if (!text || text.trim() === '') return;
    
    setSearchHistory((prevHistory) => {
      // 移除重复项
      const filteredHistory = prevHistory.filter(item => item !== text);
      
      // 添加到历史记录开头
      const newHistory = [text, ...filteredHistory].slice(0, 10);
      
      // 保存到本地存储
      try {
        localStorage.setItem('pdx-json-editor-search-history', JSON.stringify(newHistory));
      } catch (error) {
        console.error('保存搜索历史失败:', error);
      }
      
      return newHistory;
    });
  }, []);
  
  // 处理替换文本变化
  const handleReplaceTextChange = (e) => {
    setReplaceText(e.target.value);
  };
  
  // 处理搜索框按键事件
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Tab' && showReplace && !e.shiftKey) {
      // 当按下Tab键且替换面板打开时，聚焦到替换输入框
      e.preventDefault();
      replaceInputRef.current?.focus();
    }
  };
  
  // 处理替换框按键事件
  const handleReplaceKeyDown = (e) => {
    if (e.key === 'Enter') {
      replace();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Tab' && e.shiftKey) {
      // 当按下Shift+Tab键时，聚焦回搜索输入框
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  
  // 使用焦点陷阱
  const { focusFirstElement } = useFocusTrap({
    containerSelector: '.search-panel',
    active: open,
    onEscape: onClose
  });
  
  // 使用键盘导航菜单
  const { selectCurrent } = useKeyboardNavigationMenu({
    menuSelector: '.search-history-menu',
    itemSelector: '.search-history-item',
    onSelect: (item) => {
      selectFromHistory(item.dataset.value);
    },
    onClose: closeHistoryMenu,
    isOpen: Boolean(historyAnchorEl)
  });
  
  // 当面板打开时聚焦搜索输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open]);
  
  if (!open) return null;
  
  // 创建搜索框ARIA属性
  const searchboxAttrs = createSearchbox('搜索JSON内容');
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 1000,
        width: '300px',
        maxWidth: '90%',
      }}
      ref={panelRef}
      className="search-panel"
      role="dialog"
      aria-modal="true"
      aria-label="搜索面板"
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            搜索
          </Typography>
          <IconButton 
            size="small" 
            onClick={onClose}
            aria-label="关闭搜索面板"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ position: 'relative', flexGrow: 1 }}>
            <InputBase
              placeholder="查找..."
              fullWidth
              size="small"
              value={searchText}
              onChange={handleSearchTextChange}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              inputRef={searchInputRef}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.875rem'
              }}
              {...searchboxAttrs}
            />
            {searchHistory.length > 0 && (
              <IconButton 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  right: 4, 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }}
                onClick={openHistoryMenu}
                aria-label="搜索历史"
                aria-haspopup="true"
                aria-expanded={Boolean(historyAnchorEl)}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <IconButton 
            size="small" 
            sx={{ ml: 1 }} 
            onClick={findPrevious}
            aria-label="查找上一个"
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={findNext}
            aria-label="查找下一个"
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            {searchResults.length > 0 
              ? `${currentMatchIndex + 1}/${searchResults.length} 个匹配项` 
              : searchText ? '无匹配项' : ''}
          </Typography>
        </Box>
        
        {showReplace && (
          <Box sx={{ display: 'flex', mb: 1 }}>
            <InputBase
              placeholder="替换为..."
              fullWidth
              size="small"
              value={replaceText}
              onChange={handleReplaceTextChange}
              onKeyDown={handleReplaceKeyDown}
              inputRef={replaceInputRef}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.875rem'
              }}
              aria-label="替换文本"
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <FormControlLabel 
            control={
              <Checkbox 
                size="small" 
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
            } 
            label="区分大小写" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
          <FormControlLabel 
            control={
              <Checkbox 
                size="small" 
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
              />
            } 
            label="全字匹配" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
          <FormControlLabel 
            control={
              <Checkbox 
                size="small" 
                checked={regex}
                onChange={(e) => setRegex(e.target.checked)}
              />
            } 
            label="正则表达式" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            startIcon={<FindReplaceIcon />}
            onClick={() => setShowReplace(!showReplace)}
            aria-expanded={showReplace}
            aria-controls="replace-section"
          >
            {showReplace ? '隐藏替换' : '显示替换'}
          </Button>
          
          {showReplace && (
            <Box>
              <Button 
                size="small" 
                variant="outlined" 
                sx={{ mr: 1 }}
                onClick={replace}
                disabled={searchResults.length === 0}
                aria-label="替换当前匹配项"
              >
                替换
              </Button>
              <Button 
                size="small" 
                variant="contained"
                onClick={openReplaceConfirm}
                disabled={searchResults.length === 0}
                aria-label="替换所有匹配项"
              >
                全部替换
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* 替换确认对话框 */}
      <ReplaceConfirmDialog
        open={replaceConfirmOpen}
        onClose={closeReplaceConfirm}
        onConfirm={replaceAll}
        count={searchResults.length}
        searchText={searchText}
        replaceText={replaceText}
      />
      
      {/* 搜索历史菜单 */}
      <Menu
        anchorEl={historyAnchorEl}
        open={Boolean(historyAnchorEl)}
        onClose={closeHistoryMenu}
        className="search-history-menu"
        role="menu"
        aria-label="搜索历史"
      >
        {searchHistory.map((item, index) => (
          <MenuItem 
            key={index} 
            onClick={() => selectFromHistory(item)}
            className="search-history-item"
            role="menuitem"
            tabIndex={-1}
            data-value={item}
          >
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item} />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}