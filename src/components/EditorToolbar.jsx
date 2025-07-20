import { Box, Button, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CompressIcon from '@mui/icons-material/Compress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export function EditorToolbar({ onSearchClick, onSettingsClick, onDiffViewerClick }) {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        overflowX: 'auto',
        gap: 1
      }}
    >
      <Tooltip title="撤销">
        <IconButton size="small">
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="重做">
        <IconButton size="small">
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      
      <Tooltip title="剪切">
        <IconButton size="small">
          <ContentCutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="复制">
        <IconButton size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="粘贴">
        <IconButton size="small">
          <ContentPasteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      
      <Tooltip title="格式化 JSON">
        <Button 
          startIcon={<FormatAlignLeftIcon />} 
          size="small" 
          variant="outlined"
          sx={{ minWidth: 'auto' }}
        >
          格式化
        </Button>
      </Tooltip>
      
      <Tooltip title="压缩 JSON">
        <Button 
          startIcon={<CompressIcon />} 
          size="small" 
          variant="outlined"
          sx={{ minWidth: 'auto' }}
        >
          压缩
        </Button>
      </Tooltip>
      
      <Tooltip title="验证 JSON">
        <Button 
          startIcon={<CheckCircleOutlineIcon />} 
          size="small" 
          variant="outlined"
          sx={{ minWidth: 'auto' }}
        >
          验证
        </Button>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      
      <Tooltip title="差异对比">
        <IconButton size="small" onClick={onDiffViewerClick}>
          <CompareArrowsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="搜索">
        <IconButton size="small" onClick={onSearchClick}>
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Tooltip title="设置">
        <IconButton size="small" onClick={onSettingsClick}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}