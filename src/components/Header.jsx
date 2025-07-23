import { AppBar, Toolbar, Typography, IconButton, Button, Box, useTheme as useMuiTheme, useMediaQuery, Badge, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import ErrorIcon from '@mui/icons-material/Error';
import { ThemeSelector } from './ThemeSelector';
import errorService from '../services/errorService';
import { ariaAttributes, createNavigation } from '../utils/accessibilityUtils';

export function Header({ 
  onMenuClick,
  onNewFile,
  onOpenFile,
  onSaveFile,
  
  onErrorClick,
  currentFileName,
  isDirty
}) {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 创建导航ARIA属性
  const navAttrs = createNavigation('主导航');
  
  return (
    <AppBar position="static" color="default" elevation={1} {...navAttrs}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="打开侧边栏"
            aria-haspopup="true"
            aria-expanded="false"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 0, mr: 4 }}
          {...ariaAttributes({ role: 'heading', label: 'PDX JSON 编辑器' })}
        >
          PDX JSON 编辑器
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <Button 
            startIcon={<CreateNewFolderIcon />} 
            size="small" 
            variant="outlined"
            onClick={onNewFile}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
            aria-label="新建文件"
          >
            新建
          </Button>
          <Button 
            startIcon={<FolderOpenIcon />} 
            size="small" 
            variant="outlined"
            onClick={onOpenFile}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
            aria-label="打开文件"
          >
            打开
          </Button>
          <Button 
            startIcon={<SaveIcon />} 
            size="small" 
            variant="outlined"
            onClick={onSaveFile}
            disabled={!isDirty}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
            aria-label={`保存文件${isDirty ? '（有未保存的更改）' : ''}`}
          >
            保存{isDirty ? ' *' : ''}
          </Button>
          
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 2, 
              alignSelf: 'center',
              color: isDirty ? 'warning.main' : 'text.secondary',
              display: { xs: 'none', md: 'block' }
            }}
            aria-live="polite"
            role="status"
          >
            {currentFileName || '未命名'}
            {isDirty ? ' (未保存)' : ''}
          </Typography>
        </Box>
        
        {/* 错误按钮 */}
        {onErrorClick && (
          <Tooltip title="错误历史">
            <IconButton 
              color="inherit" 
              onClick={onErrorClick} 
              sx={{ mr: 1 }}
              aria-label={`查看错误历史（${errorService.getErrorHistory().length}个错误）`}
            >
              <Badge badgeContent={errorService.getErrorHistory().length} color="error">
                <ErrorIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        
        <ThemeSelector />
      </Toolbar>
    </AppBar>
  );
}