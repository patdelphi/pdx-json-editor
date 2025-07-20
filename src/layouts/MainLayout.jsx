import { useState } from 'preact/hooks';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Header } from '../components/Header';
import { EditorToolbar } from '../components/EditorToolbar';
import { JsonEditor } from '../components/JsonEditor';
import { StatusBar } from '../components/StatusBar';
import { SidePanel } from '../components/SidePanel';

export function MainLayout({ 
  darkMode, 
  toggleDarkMode, 
  onSearchClick,
  onSettingsClick,
  onDiffViewerClick
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onMenuClick={handleDrawerToggle} 
      />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <SidePanel />
        </Drawer>
        
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <EditorToolbar 
            onSearchClick={onSearchClick}
            onSettingsClick={onSettingsClick}
            onDiffViewerClick={onDiffViewerClick}
          />
          <JsonEditor />
          <StatusBar />
        </Box>
      </Box>
    </Box>
  );
}