import { h } from 'preact';
import { Box, Typography } from '@mui/material';
import packageInfo from '../../package.json';

/**
 * 显示应用版本信息的组件
 */
export function VersionInfo() {
  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 8, 
      right: 8, 
      opacity: 0.7,
      zIndex: 1000
    }}>
      <Typography variant="caption" color="textSecondary">
        v{packageInfo.version}
      </Typography>
    </Box>
  );
}