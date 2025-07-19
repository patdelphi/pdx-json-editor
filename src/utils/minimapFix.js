/**
 * 这个文件包含修复Monaco编辑器缩略图的辅助函数
 */

/**
 * 强制显示Monaco编辑器的缩略图
 * 这个函数会在DOM中查找所有Monaco编辑器实例并确保它们的缩略图可见
 */
export function forceShowMinimap() {
  // 等待DOM完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyMinimapFix);
  } else {
    applyMinimapFix();
  }
  
  // 监听窗口大小变化，重新应用修复
  window.addEventListener('resize', applyMinimapFix);
  
  // 监听Monaco编辑器加载完成事件
  window.addEventListener('monaco-ready', applyMinimapFix);
}

/**
 * 应用缩略图修复
 */
function applyMinimapFix() {
  // 延迟执行，确保编辑器已完全渲染
  setTimeout(() => {
    // 查找所有Monaco编辑器实例
    const editorElements = document.querySelectorAll('.monaco-editor');
    
    editorElements.forEach(editorElement => {
      // 查找缩略图容器
      const minimapElement = editorElement.querySelector('.minimap');
      
      if (minimapElement) {
        // 强制显示缩略图
        minimapElement.style.display = 'block';
        minimapElement.style.visibility = 'visible';
        minimapElement.style.opacity = '1';
        minimapElement.style.width = '64px';
        minimapElement.style.zIndex = '10';
        
        // 查找并显示缩略图内容层
        const decorationsLayer = minimapElement.querySelector('.minimap-decorations-layer');
        const tokensLayer = minimapElement.querySelector('.minimap-tokens-layer');
        
        if (decorationsLayer) {
          decorationsLayer.style.display = 'block';
          decorationsLayer.style.visibility = 'visible';
        }
        
        if (tokensLayer) {
          tokensLayer.style.display = 'block';
          tokensLayer.style.visibility = 'visible';
        }
        
        console.log('Minimap fix applied to editor');
      }
    });
  }, 500);
}

// 自动应用修复
forceShowMinimap();