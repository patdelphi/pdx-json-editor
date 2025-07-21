import { useState, useEffect } from 'preact/hooks';
import { Box, Drawer, IconButton, Fab, useTheme, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useBreakpoint, useTouchDevice } from '../hooks/useResponsive';
import { Header } from '../components/Header';
import { MobileHeader } from '../components/MobileHeader';
import { ariaAttributes, createMain, createComplementary } from '../utils/accessibilityUtils';

/**
 * 响应式布局组件
 * 根据屏幕尺寸调整布局
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.header - 头部组件
 * @param {React.ReactNode} props.sidebar - 侧边栏组件
 * @param {React.ReactNode} props.content - 主要内容组件
 * @param {boolean} props.isDirty - 是否有未保存的更改
 * @param {Function} props.onSave - 保存按钮点击处理函数
 */
export function ResponsiveLayout({ header, sidebar, content, isDirty, onSave }) {
  const { isMobile, isTablet } = useBreakpoint();
  const isTouch = useTouchDevice();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  
  // 处理抽屉切换
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // 关闭抽屉
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };
  
  // 在移动设备上，当用户点击内容区域时关闭抽屉
  const handleContentClick = () => {
    if (isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  };
  
  // 抽屉宽度
  const drawerWidth = isMobile ? '85%' : isTablet ? 240 : 280;
  
  // 创建ARIA属性
  const mainAttrs = createMain();
  const sidebarAttrs = createComplementary('侧边栏');
  
  return (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      role="application"
      aria-label="PDX JSON编辑器应用程序"
    >
      {/* 头部 */}
      <Box>
        {isMobile ? (
          // 如果是移动设备，使用MobileHeader
          header.type === Header ? (
            <MobileHeader
              onMenuClick={handleDrawerToggle}
              onNewFile={header.props.onNewFile}
              onOpenFile={header.props.onOpenFile}
              onSaveFile={header.props.onSaveFile}
              onSaveAsFile={header.props.onSaveAsFile}
              onErrorClick={header.props.onErrorClick}
              currentFileName={header.props.currentFileName}
              isDirty={header.props.isDirty}
            />
          ) : (
            header
          )
        ) : (
          // 否则使用原始头部
          header
        )}
      </Box>
      
      {/* 主要内容区域 */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* 侧边栏 - 已移除 */}
        {sidebar && (
          <Drawer
            variant={isMobile || isTablet ? 'temporary' : 'permanent'}
            open={isMobile || isTablet ? drawerOpen : true}
            onClose={handleDrawerClose}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            {...sidebarAttrs}
          >
            {/* 移动端关闭按钮 */}
            {(isMobile || isTablet) && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton 
                  onClick={handleDrawerClose}
                  aria-label="关闭侧边栏"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
            
            {/* 侧边栏内容 */}
            {sidebar}
          </Drawer>
        )}
        
        {/* 主要内容 */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            position: 'relative'
          }}
          onClick={handleContentClick}
          {...mainAttrs}
        >
          {content}
          
          {/* 移动端菜单按钮 - 已移除 */}
          {sidebar && (isMobile || isTablet) && !drawerOpen && (
            <Fab
              color="primary"
              aria-label="打开侧边栏"
              aria-haspopup="true"
              aria-expanded="false"
              size="small"
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 1000
              }}
            >
              <MenuIcon />
            </Fab>
          )}
          
          {/* 移动端保存按钮 */}
          {isTouch && isDirty && (
            <Tooltip title="保存">
              <Fab
                color="secondary"
                aria-label="保存文件"
                onClick={onSave}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  zIndex: 1000
                }}
              >
                <SaveIcon />
              </Fab>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}