import { useState, useEffect } from 'preact/hooks';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Typography,
  Box,
  Switch
} from '@mui/material';
import BrightnessMediumIcon from '@mui/icons-material/BrightnessMedium';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';
import { useTheme } from '../theme/ThemeContext';

/**
 * 主题选择器组件
 * 提供主题切换功能
 */
export function ThemeSelector() {
  const { themeId, setThemeId, toggleTheme, setThemeMode, availableThemes } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followSystem, setFollowSystem] = useState(false);
  
  // 从本地存储加载主题模式
  useEffect(() => {
    const themeMode = localStorage.getItem('pdx-json-editor-theme-mode');
    setFollowSystem(themeMode === 'system');
  }, []);
  
  // 打开菜单
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 关闭菜单
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // 切换主题
  const handleToggleTheme = () => {
    toggleTheme();
    handleClose();
  };
  
  // 打开主题设置对话框
  const handleOpenSettings = () => {
    setDialogOpen(true);
    handleClose();
  };
  
  // 关闭主题设置对话框
  const handleCloseSettings = () => {
    setDialogOpen(false);
  };
  
  // 选择主题
  const handleThemeChange = (event) => {
    setThemeId(event.target.value);
    
    // 如果手动选择主题，则关闭跟随系统
    if (followSystem) {
      setFollowSystem(false);
      setThemeMode('manual');
    }
  };
  
  // 切换跟随系统
  const handleFollowSystemChange = (event) => {
    const newValue = event.target.checked;
    setFollowSystem(newValue);
    
    // 设置主题模式
    setThemeMode(newValue ? 'system' : 'manual');
  };
  
  // 获取主题图标
  const getThemeIcon = (id) => {
    switch (id) {
      case 'light':
        return <LightModeIcon />;
      case 'dark':
        return <DarkModeIcon />;
      case 'highContrast':
        return <ContrastIcon />;
      case 'soft':
        return <PaletteIcon />;
      default:
        return <BrightnessMediumIcon />;
    }
  };
  
  return (
    <>
      <Tooltip title="主题设置">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-controls="theme-menu"
          aria-haspopup="true"
        >
          {getThemeIcon(themeId)}
        </IconButton>
      </Tooltip>
      
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleToggleTheme}>
          <ListItemIcon>
            {themeId === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText primary={themeId === 'light' ? '切换到深色模式' : '切换到浅色模式'} />
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleFollowSystemChange({ target: { checked: !followSystem } });
          handleClose();
        }}>
          <ListItemIcon>
            <ComputerIcon />
          </ListItemIcon>
          <ListItemText primary={followSystem ? '停止跟随系统' : '跟随系统主题'} />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleOpenSettings}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="主题设置" />
        </MenuItem>
      </Menu>
      
      <Dialog open={dialogOpen} onClose={handleCloseSettings}>
        <DialogTitle>主题设置</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={followSystem}
                  onChange={handleFollowSystemChange}
                  color="primary"
                />
              }
              label="跟随系统主题"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              启用后，主题将自动跟随系统设置变化
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <FormControl component="fieldset" disabled={followSystem}>
            <FormLabel component="legend">选择主题</FormLabel>
            <RadioGroup
              aria-label="theme"
              name="theme"
              value={themeId}
              onChange={handleThemeChange}
            >
              {Object.values(availableThemes).map((theme) => (
                <FormControlLabel
                  key={theme.id}
                  value={theme.id}
                  control={<Radio />}
                  label={theme.name}
                />
              ))}
            </RadioGroup>
            {followSystem && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                跟随系统主题已启用，手动选择主题将被覆盖
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}