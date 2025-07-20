import { Box, Paper, Typography, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export function DiffViewer({ original, modified, onClose }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'background.default',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1">差异对比</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '50%',
            p: 1,
            overflow: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" display="block" gutterBottom>
            原始
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#F8F9FA',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              height: 'calc(100% - 30px)',
            }}
          >
            {original || '{\n  "example": "original content"\n}'}
          </Paper>
        </Box>
        
        <Box
          sx={{
            width: '50%',
            p: 1,
            overflow: 'auto',
          }}
        >
          <Typography variant="caption" display="block" gutterBottom>
            修改后
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#F8F9FA',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              height: 'calc(100% - 30px)',
            }}
          >
            {modified || '{\n  "example": "modified content"\n}'}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}