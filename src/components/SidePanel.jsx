import { useState } from 'preact/hooks';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  Collapse,
  Toolbar
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import SchemaIcon from '@mui/icons-material/Schema';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';

export function SidePanel() {
  const [openRecent, setOpenRecent] = useState(true);
  const [openSchemas, setOpenSchemas] = useState(false);

  const handleRecentClick = () => {
    setOpenRecent(!openRecent);
  };

  const handleSchemasClick = () => {
    setOpenSchemas(!openSchemas);
  };

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton onClick={handleRecentClick}>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="最近文件" />
          {openRecent ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openRecent} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="config.json" 
                secondary="2 分钟前"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="data.json" 
                secondary="昨天"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="settings.json" 
                secondary="上周"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleSchemasClick}>
          <ListItemIcon>
            <SchemaIcon />
          </ListItemIcon>
          <ListItemText primary="JSON Schema" />
          {openSchemas ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSchemas} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <FolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="添加 Schema..." 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );
}