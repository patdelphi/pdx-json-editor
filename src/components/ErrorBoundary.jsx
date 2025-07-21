/**
 * 错误边界组件
 * 捕获子组件中的错误并显示友好的错误界面
 */

import { Component } from 'preact';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import errorService, { ErrorSeverity } from '../services/errorService';

/**
 * 错误边界组件
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下次渲染时显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({ errorInfo });
    
    // 使用错误服务处理错误
    errorService.handleError(error);
    
    // 调用onError回调（如果有）
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  // 重置错误状态
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    });
    
    // 调用onReset回调（如果有）
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // 强制重新渲染子组件
    if (this.props.children) {
      try {
        // 使用forceUpdate确保子组件重新渲染
        this.forceUpdate();
      } catch (e) {
        console.error('重置组件状态失败:', e);
      }
    }
  };
  
  // 重新加载页面
  handleReload = () => {
    window.location.reload();
  };
  
  // 切换显示详细信息
  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { fallback, children } = this.props;
    
    // 如果没有错误，正常渲染子组件
    if (!hasError) {
      return children;
    }
    
    // 如果提供了自定义的fallback，使用它
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback(error, errorInfo, this.handleReset)
        : fallback;
    }
    
    // 默认错误UI
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5" component="h2">
              出现了一个错误
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error?.message || '应用程序遇到了一个未知错误'}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
            >
              重试
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
            >
              刷新页面
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'left' }}>
            <Button
              startIcon={<BugReportIcon />}
              size="small"
              onClick={this.toggleDetails}
              sx={{ mb: 1 }}
            >
              {showDetails ? '隐藏详细信息' : '显示详细信息'}
            </Button>
            
            {showDetails && errorInfo && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'background.default',
                  overflowX: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {error && error.toString()}
                  <br />
                  {errorInfo.componentStack}
                </Typography>
              </Paper>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}