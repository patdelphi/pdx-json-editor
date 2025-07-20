import { useState } from 'preact/hooks';
import { 
  Box, 
  Paper, 
  InputBase, 
  IconButton, 
  Divider, 
  Typography,
  FormControlLabel,
  Checkbox,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FindReplaceIcon from '@mui/icons-material/FindReplace';

export function SearchPanel({ open, onClose }) {
  const [showReplace, setShowReplace] = useState(false);
  
  if (!open) return null;
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 1000,
        width: '300px',
        maxWidth: '90%',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            搜索
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 1 }}>
          <InputBase
            placeholder="查找..."
            fullWidth
            size="small"
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              fontSize: '0.875rem'
            }}
          />
          <IconButton size="small" sx={{ ml: 1 }}>
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {showReplace && (
          <Box sx={{ display: 'flex', mb: 1 }}>
            <InputBase
              placeholder="替换为..."
              fullWidth
              size="small"
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.875rem'
              }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <FormControlLabel 
            control={<Checkbox size="small" />} 
            label="区分大小写" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
          <FormControlLabel 
            control={<Checkbox size="small" />} 
            label="全字匹配" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
          <FormControlLabel 
            control={<Checkbox size="small" />} 
            label="正则表达式" 
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            startIcon={<FindReplaceIcon />}
            onClick={() => setShowReplace(!showReplace)}
          >
            {showReplace ? '隐藏替换' : '显示替换'}
          </Button>
          
          {showReplace && (
            <Box>
              <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                替换
              </Button>
              <Button size="small" variant="contained">
                全部替换
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}