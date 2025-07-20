import { AppBar, Toolbar, Typography, IconButton, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';

export function Header({ darkMode, toggleDarkMode, onMenuClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          PDX JSON 编辑器
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <Button 
            startIcon={<CreateNewFolderIcon />} 
            size="small" 
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            新建
          </Button>
          <Button 
            startIcon={<FolderOpenIcon />} 
            size="small" 
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            打开
          </Button>
          <Button 
            startIcon={<SaveIcon />} 
            size="small" 
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            保存
          </Button>
        </Box>
        
        <IconButton onClick={toggleDarkMode} color="inherit">
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}