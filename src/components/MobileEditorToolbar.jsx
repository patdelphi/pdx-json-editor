import { useState } from 'preact/hooks';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import HealingIcon from '@mui/icons-material/Healing';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CompareIcon from '@mui/icons-material/Compare';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SchemaIcon from '@mui/icons-material/Schema';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useBreakpoint } from '../hooks/useResponsive';

/**
 * 移动端编辑器工具栏组件
 * 提供适合移动设备的工具栏布局
 * 
 * @param {Object} props - 组件属性
 * @param {Function} props.onFoldAllClick - 折叠所有按钮点击处理函数
 * @param {Function} props.onUnfoldAllClick - 展开所有按钮点击处理函数
 * @param {Function} props.onSearchClick - 搜索按钮点击处理函数
 * @param {Function} props.onSettingsClick - 设置按钮点击处理函数
 * @param {Function} props.onSchemaClick - Schema按钮点击处理函数
 */
export function MobileEditorToolbar({
  onFoldAllClick,
  onUnfoldAllClick,
  onSearchClick,
  onSettingsClick,
  onSchemaClick,
  onKeyboardShortcutsClick
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  
  // 处理菜单打开
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // 处理菜单关闭
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // 处理格式化按钮点击
  const handleFormat = () => {
    if (window.pdxJsonEditor && window.pdxJsonEditor.formatJson) {
      window.pdxJsonEditor.formatJson();
    }
    setSpeedDialOpen(false);
  };
  
  // 处理压缩按钮点击
  const handleCompress = () => {
    if (window.pdxJsonEditor && window.pdxJsonEditor.compressJson) {
      window.pdxJsonEditor.compressJson();
    }
    setSpeedDialOpen(false);
  };
  
  // 处理修复按钮点击
  const handleTryFix = () => {
    if (window.pdxJsonEditor && window.pdxJsonEditor.tryFixJson) {
      window.pdxJsonEditor.tryFixJson();
    }
    setSpeedDialOpen(false);
  };
  
  // 处理撤销操作
  const handleUndo = () => {
    if (window.pdxJsonEditor?.getEditorRef?.()) {
      const editor = window.pdxJsonEditor.getEditorRef();
      editor.trigger('keyboard', 'undo', null);
    }
    setSpeedDialOpen(false);
  };
  
  // 处理重做操作
  const handleRedo = () => {
    if (window.pdxJsonEditor?.getEditorRef?.()) {
      const editor = window.pdxJsonEditor.getEditorRef();
      editor.trigger('keyboard', 'redo', null);
    }
    setSpeedDialOpen(false);
  };

  // SpeedDial操作
  const actions = [
    { icon: <FormatIndentIncreaseIcon />, name: '格式化', onClick: handleFormat },
    { icon: <CompressOutlinedIcon />, name: '压缩', onClick: handleCompress },
    { icon: <HealingIcon />, name: '修复', onClick: handleTryFix },
    { icon: <UndoIcon />, name: '撤销', onClick: handleUndo },
    { icon: <RedoIcon />, name: '重做', onClick: handleRedo },
    { icon: <SearchIcon />, name: '搜索', onClick: () => { 
      // 触发Monaco编辑器的原生搜索功能
      if (window.pdxJsonEditor?.getEditorRef?.()) {
        const editor = window.pdxJsonEditor.getEditorRef();
        editor.getAction('actions.find')?.run();
      }
      setSpeedDialOpen(false); 
    } },
    { icon: <SchemaIcon />, name: 'Schema', onClick: () => { onSchemaClick(); setSpeedDialOpen(false); } }
  ];
  
  // 如果不是移动设备，使用常规工具栏
  if (!isMobile) {
    return null;
  }
  
  return (
    <>
      {/* 固定工具栏 */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title="更多选项">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ 
              backgroundColor: 'background.paper',
              boxShadow: 1
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* 浮动操作按钮 */}
      <SpeedDial
        ariaLabel="编辑器操作"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
      
      {/* 更多选项菜单 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onFoldAllClick(); handleMenuClose(); }}>
          <ListItemIcon>
            <UnfoldLessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="折叠所有" />
        </MenuItem>
        
        <MenuItem onClick={() => { onUnfoldAllClick(); handleMenuClose(); }}>
          <ListItemIcon>
            <UnfoldMoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="展开所有" />
        </MenuItem>
        
        <MenuItem onClick={() => { onSettingsClick(); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="设置" />
        </MenuItem>
        

        
        <MenuItem onClick={() => { onKeyboardShortcutsClick(); handleMenuClose(); }}>
          <ListItemIcon>
            <KeyboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="键盘快捷键" />
        </MenuItem>
      </Menu>
    </>
  );
}