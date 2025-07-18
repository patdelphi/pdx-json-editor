// Monaco Editor 配置工具

/**
 * 配置 Monaco Editor 的全局设置
 * 这个函数应该在应用启动时调用
 */
export function configureMonacoEditor() {
  // 确保 window.monaco 存在
  if (typeof window !== 'undefined' && window.monaco) {
    // 设置全局默认选项
    window.monaco.editor.EditorOptions.minimap = {
      defaultValue: {
        enabled: true,
        maxColumn: 120,
        renderCharacters: true,
        showSlider: 'always',
        scale: 1,
        side: 'right'
      }
    };
    
    console.log('Monaco Editor global configuration applied');
  } else {
    console.warn('Monaco Editor not available for global configuration');
  }
}

/**
 * 强制启用 Monaco Editor 的缩略图
 * @param editor Monaco Editor 实例
 */
export function forceEnableMinimap(editor: any) {
  if (!editor) return;
  
  try {
    // 应用缩略图设置
    editor.updateOptions({
      minimap: {
        enabled: true,
        maxColumn: 120,
        renderCharacters: true,
        showSlider: 'always',
        scale: 1,
        side: 'right'
      }
    });
    
    // 强制刷新布局
    editor.layout();
    
    // 尝试直接操作 DOM
    const editorElement = editor.getDomNode();
    if (editorElement) {
      const minimapElement = editorElement.querySelector('.minimap');
      if (minimapElement) {
        (minimapElement as HTMLElement).style.display = 'block';
        (minimapElement as HTMLElement).style.visibility = 'visible';
        (minimapElement as HTMLElement).style.opacity = '1';
        (minimapElement as HTMLElement).style.width = '64px';
      }
    }
    
    console.log('Minimap forcefully enabled');
  } catch (error) {
    console.error('Error forcing minimap:', error);
  }
}