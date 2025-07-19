import React, { useState, useEffect } from 'react';
import JsonEditor from './JsonEditor';
import type { MonacoEditorProps } from '../../types/editor.types';

/**
 * 响应式编辑器组件
 * 根据屏幕尺寸调整编辑器布局和功能
 */
const ResponsiveEditor = React.forwardRef<any, MonacoEditorProps>((props, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 检测设备类型
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // 初始检测
    checkDeviceType();

    // 监听窗口大小变化
    window.addEventListener('resize', checkDeviceType);
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // 根据设备类型调整编辑器选项
  const getEditorOptions = () => {
    const baseOptions = props.settings;
    
    if (isMobile) {
      // 移动设备优化
      return {
        ...baseOptions,
        minimap: false, // 禁用缩略图
        lineNumbers: false, // 禁用行号
        fontSize: 14, // 增大字体
        wordWrap: true, // 启用自动换行
      };
    } else if (isTablet) {
      // 平板设备优化
      return {
        ...baseOptions,
        minimap: baseOptions.minimap, // 保持用户设置
        lineNumbers: baseOptions.lineNumbers, // 保持用户设置
        fontSize: 14,
        wordWrap: baseOptions.wordWrap, // 保持用户设置
      };
    }
    
    // 桌面设备使用原始设置
    return baseOptions;
  };

  return (
    <div className={`responsive-editor-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <JsonEditor
        {...props}
        ref={ref}
        settings={getEditorOptions()}
      />
      
      {/* 移动设备额外控制 */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          <button
            className={`p-3 rounded-full shadow-lg ${
              props.theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
            }`}
            onClick={() => {
              // 触发搜索
              if (ref && typeof ref !== 'function' && ref.current) {
                ref.current.find();
              }
            }}
          >
            🔍
          </button>
          <button
            className={`p-3 rounded-full shadow-lg ${
              props.theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-600 text-white'
            }`}
            onClick={() => {
              // 触发格式化
              if (ref && typeof ref !== 'function' && ref.current) {
                ref.current.formatDocument();
              }
            }}
          >
            ✨
          </button>
        </div>
      )}
    </div>
  );
});

export default ResponsiveEditor;