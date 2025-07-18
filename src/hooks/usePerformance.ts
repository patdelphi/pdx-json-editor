import { useState, useCallback, useRef, useEffect } from 'react';

interface PerformanceMetrics {
  contentSize: number;
  isLargeFile: boolean;
  validationTime: number;
  renderTime: number;
}

interface UsePerformanceOptions {
  largeFileThreshold?: number; // bytes
  debounceDelay?: number; // ms
  enableMetrics?: boolean;
}

const usePerformance = (options: UsePerformanceOptions = {}) => {
  const {
    largeFileThreshold = 1024 * 1024, // 1MB
    debounceDelay = 300,
    enableMetrics = import.meta.env.DEV,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    contentSize: 0,
    isLargeFile: false,
    validationTime: 0,
    renderTime: 0,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const performanceTimerRef = useRef<number | null>(null);

  // Debounced function executor
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(
      func: T,
      delay: number = debounceDelay
    ): ((...args: Parameters<T>) => void) => {
      return (...args: Parameters<T>) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          func(...args);
        }, delay);
      };
    },
    [debounceDelay]
  );

  // Performance measurement utilities
  const startPerformanceTimer = useCallback(
    (label: string) => {
      if (enableMetrics) {
        performanceTimerRef.current = performance.now();
        console.time(label);
      }
    },
    [enableMetrics]
  );

  const endPerformanceTimer = useCallback(
    (label: string, updateMetric?: keyof PerformanceMetrics) => {
      if (enableMetrics && performanceTimerRef.current) {
        const duration = performance.now() - performanceTimerRef.current;
        console.timeEnd(label);

        if (updateMetric) {
          setMetrics((prev) => ({
            ...prev,
            [updateMetric]: duration,
          }));
        }

        return duration;
      }
      return 0;
    },
    [enableMetrics]
  );

  // Content size analysis
  const analyzeContent = useCallback(
    (content: string) => {
      const size = new Blob([content]).size;
      const isLarge = size > largeFileThreshold;

      setMetrics((prev) => ({
        ...prev,
        contentSize: size,
        isLargeFile: isLarge,
      }));

      return {
        size,
        isLarge,
        shouldOptimize: isLarge,
      };
    },
    [largeFileThreshold]
  );

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  // Optimization recommendations
  const getOptimizationRecommendations = useCallback(
    (content: string) => {
      const analysis = analyzeContent(content);
      const recommendations: string[] = [];

      if (analysis.isLarge) {
        recommendations.push(
          'Consider enabling virtual scrolling for large files'
        );
        recommendations.push('Disable minimap for better performance');
        recommendations.push('Increase debounce delay for validation');
      }

      if (analysis.size > 5 * 1024 * 1024) {
        // 5MB
        recommendations.push(
          'File is very large - consider splitting into smaller files'
        );
        recommendations.push('Disable real-time validation');
      }

      const memory = getMemoryUsage();
      if (memory && memory.used > memory.limit * 0.8) {
        recommendations.push(
          'High memory usage detected - consider refreshing the page'
        );
      }

      return recommendations;
    },
    [analyzeContent, getMemoryUsage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    metrics,
    debounce,
    startPerformanceTimer,
    endPerformanceTimer,
    analyzeContent,
    getMemoryUsage,
    getOptimizationRecommendations,
  };
};

export default usePerformance;
