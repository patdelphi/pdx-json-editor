import { Alert, Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export function ErrorDisplay({ errors = [] }) {
  if (errors.length === 0) return null;
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '40px',
        right: '16px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          JSON 验证错误 ({errors.length})
        </Typography>
        
        <List dense disablePadding>
          {errors.map((error, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {error.severity === 'error' ? (
                  <ErrorOutlineIcon color="error" fontSize="small" />
                ) : (
                  <WarningAmberIcon color="warning" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`行 ${error.line}, 列 ${error.column}`}
                secondary={error.message}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}