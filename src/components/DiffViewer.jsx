import { useState, useRef } from 'preact/hooks';
import { Box, Typography, IconButton, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import DiffEditor from '@monaco-editor/react';
import { useTheme } from '../theme/ThemeContext';

import { FadeTransition } from './design';

/**
 * 差异对比组件
 * @param {Object} props - 组件属性
 * @param {string} props.original - 原始内容
 * @param {string} props.modified - 修改后内容
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSave - 保存回调
 * @param {string} props.originalTitle - 原始内容标题
 * @param {string} props.modifiedTitle - 修改后内容标题
 * @returns {React.ReactElement} - 差异对比组件
 */
export function DiffViewer({ 
  original = '{\n  "example": "original content"\n}', 
  modified = '{\n  "example": "modified content"\n}', 
  onClose,
  onSave,
  originalTitle = '原始',
  modifiedTitle = '修改后'
}) {
  // 使用主题上下文
  const { monacoTheme } = useTheme();
  
  // 编辑器引用
  const diffEditorRef = useRef(null);
  
  // 状态
  const [layout, setLayout] = useState('vertical');
  const [isInline, setIsInline] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  
  // 处理编辑器挂载
  const handleEditorDidMount = (editor) => {
    diffEditorRef.current = editor;
  };
  
  // 处理布局变化
  const handleLayoutChange = (event, newLayout) => {
    if (newLayout !== null) {
      setLayout(newLayout);
    }
  };
  
  // 切换内联模式
  const toggleInlineMode = () => {
    setIsInline(!isInline);
  };
  
  // 复制修改后内容
  const copyModified = () => {
    navigator.clipboard.writeText(modified).then(() => {
      showAlert('已复制到剪贴板');
    }).catch(() => {
      showAlert('复制失败', 'error');
    });
  };
  
  // 保存修改后内容
  const handleSave = () => {
    if (onSave) {
      onSave(modified);
      showAlert('已保存');
    }
  };
  
  // 显示提示信息
  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertOpen(true);
    
    setTimeout(() => {
      setAlertOpen(false);
    }, 3000);
  };
  
  // 编辑器选项
  const editorOptions = {
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderSideBySide: layout === 'vertical',
    renderOverviewRuler: false,
    fontSize: 14,
    lineNumbers: 'on',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto'
    },
    diffWordWrap: 'on',
    ignoreTrimWhitespace: false,
    renderIndicators: true,
    originalEditable: false
  };
  
  return (
    <FadeTransition in={true}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'background.default',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="差异对比"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1">差异对比</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              value={layout}
              exclusive
              onChange={handleLayoutChange}
              size="small"
              aria-label="差异视图布局"
            >
              <ToggleButton value="vertical" aria-label="垂直布局">
                <Tooltip title="垂直布局">
                  <VerticalSplitIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="horizontal" aria-label="水平布局">
                <Tooltip title="水平布局">
                  <HorizontalSplitIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Tooltip title={isInline ? "并排视图" : "内联视图"}>
              <IconButton size="small" onClick={toggleInlineMode}>
                <CompareArrowsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="复制修改后内容">
              <IconButton size="small" onClick={copyModified}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {onSave && (
              <Tooltip title="保存修改">
                <IconButton size="small" onClick={handleSave}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <IconButton onClick={onClose} size="small" aria-label="关闭">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <DiffEditor
            height="100%"
            language="json"
            original={original}
            modified={modified}
            theme={monacoTheme}
            options={{
              ...editorOptions,
              renderSideBySide: !isInline && layout === 'vertical'
            }}
            onMount={handleEditorDidMount}
            originalTitle={originalTitle}
            modifiedTitle={modifiedTitle}
          />
        </Box>
        
        {/* 提示信息 */}
        <FadeTransition in={alertOpen}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'success.main',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 1200
            }}
          >
            {alertMessage}
          </Box>
        </FadeTransition>
      </Box>
    </FadeTransition>
  );
}