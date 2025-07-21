/**
 * 触摸手势示例组件
 */

import { useState, useRef } from 'preact/hooks';
import { Box, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { useSwipe, usePinch, useLongPress, useDoubleTap, useRotate } from '../hooks/useGestures';
import { useTouchDevice } from '../hooks/useResponsive';

/**
 * 触摸手势示例组件
 */
export function TouchGestureExample() {
  const isTouch = useTouchDevice();
  const [message, setMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('#f0f0f0');
  
  // 显示消息
  const showMessage = (msg) => {
    setMessage(msg);
    setAlertOpen(true);
  };
  
  // 关闭提示
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  // 滑动手势
  const { handleTouchStart: handleSwipeTouchStart, handleTouchEnd: handleSwipeTouchEnd } = useSwipe({
    threshold: 50,
    onSwipeLeft: ({ distance, isQuick }) => {
      showMessage(`向左滑动 ${distance.toFixed(0)}px ${isQuick ? '(快速)' : ''}`);
      setPosition(prev => ({ ...prev, x: prev.x - 20 }));
    },
    onSwipeRight: ({ distance, isQuick }) => {
      showMessage(`向右滑动 ${distance.toFixed(0)}px ${isQuick ? '(快速)' : ''}`);
      setPosition(prev => ({ ...prev, x: prev.x + 20 }));
    },
    onSwipeUp: ({ distance, isQuick }) => {
      showMessage(`向上滑动 ${distance.toFixed(0)}px ${isQuick ? '(快速)' : ''}`);
      setPosition(prev => ({ ...prev, y: prev.y - 20 }));
    },
    onSwipeDown: ({ distance, isQuick }) => {
      showMessage(`向下滑动 ${distance.toFixed(0)}px ${isQuick ? '(快速)' : ''}`);
      setPosition(prev => ({ ...prev, y: prev.y + 20 }));
    }
  });
  
  // 捏合手势
  const { 
    handleTouchStart: handlePinchTouchStart, 
    handleTouchMove: handlePinchTouchMove,
    handleTouchEnd: handlePinchTouchEnd
  } = usePinch({
    threshold: 10,
    onPinchIn: ({ distance }) => {
      showMessage(`捏合 ${distance.toFixed(0)}px`);
      setScale(prev => Math.max(0.5, prev - 0.05));
    },
    onPinchOut: ({ distance }) => {
      showMessage(`展开 ${distance.toFixed(0)}px`);
      setScale(prev => Math.min(2, prev + 0.05));
    }
  });
  
  // 长按手势
  const { 
    handleTouchStart: handleLongPressTouchStart,
    handleTouchMove: handleLongPressTouchMove,
    handleTouchEnd: handleLongPressTouchEnd,
    isLongPress
  } = useLongPress({
    delay: 500,
    onLongPress: () => {
      showMessage('长按');
      setBgColor(getRandomColor());
    }
  });
  
  // 双击手势
  const { handleTouchEnd: handleDoubleTapTouchEnd } = useDoubleTap({
    delay: 300,
    onDoubleTap: () => {
      showMessage('双击');
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setBgColor('#f0f0f0');
    }
  });
  
  // 旋转手势
  const { 
    handleTouchStart: handleRotateTouchStart,
    handleTouchMove: handleRotateTouchMove,
    handleTouchEnd: handleRotateTouchEnd
  } = useRotate({
    threshold: 5,
    onRotate: ({ rotation: rot }) => {
      showMessage(`旋转 ${rot.toFixed(1)}°`);
      setRotation(prev => prev + rot);
    }
  });
  
  // 合并触摸事件处理函数
  const handleTouchStart = (e) => {
    handleSwipeTouchStart(e);
    handlePinchTouchStart(e);
    handleLongPressTouchStart(e);
    handleRotateTouchStart(e);
  };
  
  const handleTouchMove = (e) => {
    handlePinchTouchMove(e);
    handleLongPressTouchMove(e);
    handleRotateTouchMove(e);
  };
  
  const handleTouchEnd = (e) => {
    handleSwipeTouchEnd(e);
    handlePinchTouchEnd(e);
    handleLongPressTouchEnd(e);
    handleDoubleTapTouchEnd(e);
    handleRotateTouchEnd(e);
  };
  
  // 生成随机颜色
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      {!isTouch && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          此示例需要在触摸设备上查看
        </Typography>
      )}
      
      <Paper
        elevation={3}
        sx={{
          width: 200,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isLongPress ? '#ff9800' : bgColor,
          transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
          transition: 'background-color 0.3s',
          touchAction: 'none', // 防止浏览器默认触摸行为
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Typography variant="body1">
          {isTouch ? '触摸区域' : '非触摸设备'}
        </Typography>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          支持的手势:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 滑动: 上/下/左/右移动方块<br />
          • 捏合/展开: 缩小/放大方块<br />
          • 长按: 改变方块颜色<br />
          • 双击: 重置方块状态<br />
          • 双指旋转: 旋转方块
        </Typography>
      </Box>
      
      <Snackbar
        open={alertOpen}
        autoHideDuration={2000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}