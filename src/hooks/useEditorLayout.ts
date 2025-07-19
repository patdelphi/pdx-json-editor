import { useEffect, useCallback, useState } from 'react';
import * as monaco from 'monaco-editor';

/**
 * 编辑器布局Hook
 * @param editorRef 编辑器引用
 */
export function useEditorLayout(
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    if (editorRef.current) {
      // 延迟布局更新，确保DOM已经更新
      setTimeout(() => {
        editorRef.current?.layout();
      }, 0);
    }
  }, [editorRef]);

  // 监听窗口大小变化
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 监听编辑器容器大小变化
  useEffect(() => {
    if (!editorRef.current) return;

    // 使用ResizeObserver监听容器大小变化
    const editorElement = editorRef.current.getDomNode();
    if (!editorElement) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    resizeObserver.observe(editorElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editorRef.current]);

  // 强制更新布局
  const forceLayout = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [editorRef]);

  return {
    dimensions,
    forceLayout,
  };
}

export default useEditorLayout;