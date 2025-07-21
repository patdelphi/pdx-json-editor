import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import { useBreakpoint } from '../hooks/useResponsive';
import { ariaAttributes, createStatus } from '../utils/accessibilityUtils';

/**
 * 状态栏组件
 * 显示编辑器状态信息，如验证状态、光标位置等
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.isValid - JSON是否有效
 * @param {Array} props.errors - 错误列表
 * @param {Object} props.cursorPosition - 光标位置 {line, column}
 * @param {number} props.fileSize - 文件大小（字节）
 */
export function StatusBar({ isValid = true, errors = [], cursorPosition = { line: 1, column: 1 }, fileSize = 0 }) {
  // 使用响应式Hook
  const { isMobile } = useBreakpoint();
  // 计算错误和警告数量
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 创建状态ARIA属性
  const statusAttrs = createStatus('编辑器状态');
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '4px 8px' : '4px 16px',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : '#F9FAFB',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}
      {...statusAttrs}
    >
      {/* 左侧：验证状态 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'center' : 'flex-start',
        mb: isMobile ? 0.5 : 0
      }}>
        {isValid ? (
          <Chip
            icon={<CheckCircle fontSize="small" />}
            label={isMobile ? "" : "有效的JSON"}
            size="small"
            color="success"
            variant="outlined"
            aria-label="JSON验证通过"
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {errorCount > 0 && (
              <Tooltip title="错误">
                <Chip
                  icon={<Error fontSize="small" />}
                  label={isMobile ? errorCount : `${errorCount} 错误`}
                  size="small"
                  color="error"
                  variant="outlined"
                  aria-label={`${errorCount}个JSON验证错误`}
                />
              </Tooltip>
            )}
            {warningCount > 0 && (
              <Tooltip title="警告">
                <Chip
                  icon={<Warning fontSize="small" />}
                  label={isMobile ? warningCount : `${warningCount} 警告`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  aria-label={`${warningCount}个JSON验证警告`}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      
      {/* 右侧：光标位置和文件大小 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? 1 : 2,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'space-between' : 'flex-end'
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          aria-label={`光标位置：行 ${cursorPosition.line}, 列 ${cursorPosition.column}`}
        >
          {isMobile ? `${cursorPosition.line}:${cursorPosition.column}` : `行 ${cursorPosition.line}, 列 ${cursorPosition.column}`}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          aria-label={`文件大小：${formatFileSize(fileSize)}`}
        >
          {formatFileSize(fileSize)}
        </Typography>
      </Box>
    </Box>
  );
}