import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

interface Route {
  path: string;
  component: () => ComponentChildren;
}

interface RouterProps {
  routes: Route[];
  fallback?: () => ComponentChildren;
}

export function Router({ routes, fallback }: RouterProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function for future use
  // const navigate = (path: string) => {
  //   window.history.pushState({}, '', path);
  //   setCurrentPath(path);
  // };

  // Simple route matching - exact match for now
  const currentRoute = routes.find(route => route.path === currentPath);
  
  if (currentRoute) {
    return currentRoute.component();
  }

  if (fallback) {
    return fallback();
  }

  // Default fallback
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}

// Navigation helper
export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}