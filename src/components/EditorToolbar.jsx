import { Box, Button, Tooltip, IconButton, Divider } from '@mui/material';
import {
  FormatIndentIncrease,
  CompressOutlined,
  Healing,
  Search,
  Settings,
  
  UnfoldLess,
  UnfoldMore,
  Keyboard,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo
} from '@mui/icons-material';
import { SchemaSelector } from './SchemaSelector';

/**
 * 编辑器工具栏组件
 * 提供格式化、压缩、搜索等功能按钮
 * 
 * @param {Object} props - 组件属性
 * @param {Function} props.onSearchClick - 搜索按钮点击处理函数
 * @param {Function} props.onSettingsClick - 设置按钮点击处理函数
 * @param {Function} props.onFoldAllClick - 折叠所有按钮点击处理函数
 * @param {Function} props.onUnfoldAllClick - 展开所有按钮点击处理函数
 * @param {Function} props.onIncreaseFontSize - 增大字体按钮点击处理函数
 * @param {Function} props.onDecreaseFontSize - 减小字体按钮点击处理函数
 * @param {Object[]} props.schemas - 可用的Schema列表
 * @param {string|null} props.selectedSchemaId - 当前选中的Schema ID
 * @param {Function} props.onSelectSchema - 选择Schema的回调函数
 * @param {Function} props.onAddSchema - 添加Schema的回调函数
 * @param {Function} props.onDeleteSchema - 删除Schema的回调函数
 * @param {Function} props.onUpdateSchema - 更新Schema的回调函数
 * @param {Function} props.onAutoDetectSchema - 自动检测Schema的回调函数
 */
export function EditorToolbar({ 
  onSettingsClick, 
  onFoldAllClick,
  onUnfoldAllClick,
  onKeyboardShortcutsClick,
  onIncreaseFontSize = () => {},
  onDecreaseFontSize = () => {},
  schemas = [],
  selectedSchemaId = null,
  onSelectSchema = () => {},
  onAddSchema = () => {},
  onDeleteSchema = () => {},
  onUpdateSchema = () => {},
  onAutoDetectSchema = () => {}
}) {
  // 处理格式化按钮点击
  const handleFormat = () => {
    console.log('格式化按钮点击');
    if (window.pdxJsonEditor && window.pdxJsonEditor.formatJson) {
      console.log('调用 formatJson 函数');
      window.pdxJsonEditor.formatJson();
    } else {
      console.error('formatJson 函数不存在');
    }
  };
  
  // 处理压缩按钮点击
  const handleCompress = () => {
    console.log('压缩按钮点击');
    if (window.pdxJsonEditor && window.pdxJsonEditor.compressJson) {
      console.log('调用 compressJson 函数');
      window.pdxJsonEditor.compressJson();
    } else {
      console.error('compressJson 函数不存在');
    }
  };
  
  // 处理修复按钮点击
  const handleTryFix = () => {
    console.log('修复按钮点击');
    if (window.pdxJsonEditor && window.pdxJsonEditor.tryFixJson) {
      console.log('调用 tryFixJson 函数');
      window.pdxJsonEditor.tryFixJson();
    } else {
      console.error('tryFixJson 函数不存在');
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#F9FAFB',
        overflowX: 'auto'
      }}
    >
      {/* 格式化和压缩按钮组 */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="格式化 JSON (Ctrl+Shift+F)">
          <Button
            startIcon={<FormatIndentIncrease />}
            size="small"
            onClick={handleFormat}
            sx={{ mr: 1 }}
          >
            格式化
          </Button>
        </Tooltip>
        
        <Tooltip title="压缩 JSON (Ctrl+Shift+M)">
          <Button
            startIcon={<CompressOutlined />}
            size="small"
            onClick={handleCompress}
            sx={{ mr: 1 }}
          >
            压缩
          </Button>
        </Tooltip>
        
        <Tooltip title="尝试修复 JSON">
          <Button
            startIcon={<Healing />}
            size="small"
            onClick={handleTryFix}
          >
            修复
          </Button>
        </Tooltip>
      </Box>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      
      {/* Schema选择器 */}
      <Box sx={{ flexGrow: 1 }}>
        <SchemaSelector
          schemas={schemas}
          selectedSchemaId={selectedSchemaId}
          onSelectSchema={onSelectSchema}
          onAddSchema={onAddSchema}
          onDeleteSchema={onDeleteSchema}
          onUpdateSchema={onUpdateSchema}
          onAutoDetect={onAutoDetectSchema}
        />
      </Box>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      
      {/* 折叠控制按钮组 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Tooltip title="折叠所有">
          <IconButton size="small" onClick={onFoldAllClick}>
            <UnfoldLess fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="展开所有">
          <IconButton size="small" onClick={onUnfoldAllClick}>
            <UnfoldMore fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* 字体大小调整按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Tooltip title="增大字体">
          <IconButton size="small" onClick={onIncreaseFontSize}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="减小字体">
          <IconButton size="small" onClick={onDecreaseFontSize}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* 撤销和重做按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Tooltip title="撤销 (Ctrl+Z)">
          <IconButton size="small" onClick={() => {
            if (window.pdxJsonEditor?.getEditorRef?.()) {
              const editor = window.pdxJsonEditor.getEditorRef();
              editor.trigger('keyboard', 'undo', null);
            }
          }}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="重做 (Ctrl+Y)">
          <IconButton size="small" onClick={() => {
            if (window.pdxJsonEditor?.getEditorRef?.()) {
              const editor = window.pdxJsonEditor.getEditorRef();
              editor.trigger('keyboard', 'redo', null);
            }
          }}>
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* 工具按钮组 */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="搜索 (Ctrl+F)">
          <IconButton size="small" onClick={() => {
            // 触发Monaco编辑器的原生搜索功能
            if (window.pdxJsonEditor?.getEditorRef?.()) {
              const editor = window.pdxJsonEditor.getEditorRef();
              // 使用正确的搜索动作ID
              const findAction = editor.getAction('actions.find');
              if (findAction) {
                findAction.run();
              } else {
                // 备用方法：直接触发搜索
                editor.trigger('keyboard', 'actions.find', null);
              }
            }
          }}>
            <Search />
          </IconButton>
        </Tooltip>
        

        
        <Tooltip title="设置">
          <IconButton size="small" onClick={onSettingsClick}>
            <Settings />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="键盘快捷键 (?)">
          <IconButton size="small" onClick={onKeyboardShortcutsClick}>
            <Keyboard />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}