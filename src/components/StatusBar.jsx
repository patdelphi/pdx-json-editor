import { Box, Typography, Chip, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function StatusBar() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '4px 16px',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        minHeight: '28px'
      }}
    >
      <Chip
        icon={<CheckCircleIcon fontSize="small" />}
        label="JSON 有效"
        size="small"
        color="success"
        variant="outlined"
        sx={{ height: 24, fontSize: '0.75rem' }}
      />
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Typography variant="caption" sx={{ mx: 2 }}>
        行: 1, 列: 1
      </Typography>
      
      <Typography variant="caption">
        大小: 256 字节
      </Typography>
    </Box>
  );
}