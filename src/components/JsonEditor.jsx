import { useRef, useEffect } from 'preact/hooks';
import { Box, Paper } from '@mui/material';

export function JsonEditor() {
  const editorRef = useRef(null);

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%', 
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* 这里是 Monaco Editor 的占位符 */}
        <Box 
          ref={editorRef}
          sx={{ 
            flexGrow: 1, 
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: 2,
            overflow: 'auto',
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
            color: theme => theme.palette.mode === 'dark' ? '#D4D4D4' : '#000000',
            '& pre': {
              margin: 0,
              fontFamily: 'inherit'
            }
          }}
        >
          <pre>{`{
  "name": "PDX JSON Editor",
  "version": "1.0.0",
  "description": "A lightweight JSON editor with Monaco Editor",
  "features": [
    "Syntax highlighting",
    "Error validation",
    "Formatting",
    "Search and replace",
    "File operations"
  ],
  "settings": {
    "theme": "light",
    "indentation": 2,
    "wordWrap": true
  }
}`}</pre>
        </Box>
      </Paper>
    </Box>
  );
}