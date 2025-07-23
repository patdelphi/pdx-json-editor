import { useState } from 'preact/hooks';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ErrorIcon from '@mui/icons-material/Error';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ThemeSelector } from './ThemeSelector';
import errorService from '../services/errorService';
import { createNavigation, createMenu } from '../utils/accessibilityUtils';

/**
 * 移动端头部组件
 * 提供适合移动设备的头部布局
 * 
 * @param {Object} props - 组件属性
 * @param {Function} props.onMenuClick - 菜单按钮点击处理函数
 * @param {Function} props.onNewFile - 新建按钮点击处理函数
 * @param {Function} props.onOpenFile - 打开按钮点击处理函数
 * @param {Function} props.onSaveFile - 保存按钮点击处理函数
 * @param {Function} props.onSaveAsFile - 另存为按钮点击处理函数
 * @param {string} props.currentFileName - 当前文件名
 * @param {boolean} props.isDirty - 是否有未保存的更改
 */
export function MobileHeader({
  onMenuClick,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSaveAsFile,
  onErrorClick,
  currentFileName,
  isDirty
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // 处理菜单打开
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // 处理菜单关闭
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // 创建导航ARIA属性
  const navAttrs = createNavigation('主导航');
  
  // 创建菜单ARIA属性
  const menuId = 'mobile-menu';
  const { menu, item } = createMenu('文件操作');
  
  return (
    <AppBar position="static" color="default" elevation={1} {...navAttrs}>
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="打开侧边栏"
          aria-haspopup="true"
          aria-expanded="false"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          aria-live="polite"
          role="status"
        >
          {currentFileName || '未命名'}
          {isDirty ? ' *' : ''}
        </Typography>
        
        <Tooltip title="保存">
          <IconButton 
            color="inherit" 
            onClick={onSaveFile}
            disabled={!isDirty}
            aria-label={`保存文件${isDirty ? '（有未保存的更改）' : ''}`}
          >
            <Badge
              color="warning"
              variant="dot"
              invisible={!isDirty}
            >
              <SaveIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* 错误按钮 */}
        {onErrorClick && (
          <Tooltip title="错误历史">
            <IconButton 
              color="inherit" 
              onClick={onErrorClick}
              aria-label={`查看错误历史（${errorService.getErrorHistory().length}个错误）`}
            >
              <Badge badgeContent={errorService.getErrorHistory().length} color="error">
                <ErrorIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        
        <ThemeSelector />
        
        <IconButton 
          color="inherit" 
          onClick={handleMenuOpen}
          aria-label="更多选项"
          aria-haspopup="true"
          aria-expanded={Boolean(menuAnchorEl)}
          aria-controls={menuId}
        >
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          id={menuId}
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          {...menu}
        >
          <MenuItem 
            onClick={() => { onNewFile(); handleMenuClose(); }}
            {...item}
            aria-label="新建文件"
          >
            <ListItemIcon>
              <CreateNewFolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="新建" />
          </MenuItem>
          
          <MenuItem 
            onClick={() => { onOpenFile(); handleMenuClose(); }}
            {...item}
            aria-label="打开文件"
          >
            <ListItemIcon>
              <FolderOpenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="打开" />
          </MenuItem>
          
          <MenuItem 
            onClick={() => { onSaveAsFile(); handleMenuClose(); }}
            {...item}
            aria-label="另存为"
          >
            <ListItemIcon>
              <SaveAsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="另存为" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}