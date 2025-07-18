import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { configureMonacoEditor } from './utils/monacoConfig';

// 尝试在应用启动时配置 Monaco Editor
try {
  // 监听 monaco 加载完成事件
  window.addEventListener('monaco-ready', () => {
    configureMonacoEditor();
    console.log('Monaco Editor configured on ready event');
  });
  
  // 如果 monaco 已经加载，直接配置
  if (window.monaco) {
    configureMonacoEditor();
    console.log('Monaco Editor configured immediately');
  }
} catch (error) {
  console.error('Failed to configure Monaco Editor:', error);
}

// 使用懒加载导入 App 组件
const App = lazy(() => import('./App.tsx'));

// 创建加载中组件
const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-700 dark:text-gray-300">加载中...</p>
    </div>
  </div>
);

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);
