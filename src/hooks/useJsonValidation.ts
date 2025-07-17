// JSON validation hook with performance optimizations
import { useState, useCallback, useEffect, useRef } from 'react';
import type { JsonError } from '../types/editor.types';
import { ValidationService } from '../services/validationService';
import { debounce } from '../utils/helpers';
import { VALIDATION_SETTINGS } from '../utils/constants';

interface UseJsonValidationOptions {
  enableRealTimeValidation?: boolean;
  largeFileThreshold?: number;
  customDebounceDelay?: number;
}

const useJsonValidation = (content: string, options: UseJsonValidationOptions = {}) => {
  const {
    enableRealTimeValidation = true,
    largeFileThreshold = 1024 * 1024, // 1MB
    customDebounceDelay
  } = options;

  const [errors, setErrors] = useState<JsonError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidatedContent, setLastValidatedContent] = useState('');
  const [validationTime, setValidationTime] = useState(0);
  
  const validationTimerRef = useRef<number | null>(null);

  // Analyze content size and determine optimization strategy
  const analyzeContent = useCallback((jsonContent: string) => {
    const size = new Blob([jsonContent]).size;
    const isLarge = size > largeFileThreshold;
    
    return {
      size,
      isLarge,
      shouldOptimize: isLarge,
      recommendedDebounceDelay: isLarge ? VALIDATION_SETTINGS.DEBOUNCE_DELAY * 2 : VALIDATION_SETTINGS.DEBOUNCE_DELAY
    };
  }, [largeFileThreshold]);

  const validateContent = useCallback((jsonContent: string) => {
    // Skip validation if content hasn't changed
    if (jsonContent === lastValidatedContent) {
      return;
    }

    setIsValidating(true);
    validationTimerRef.current = performance.now();

    try {
      const validationErrors = ValidationService.validateJson(jsonContent);
      setErrors(validationErrors);
      setLastValidatedContent(jsonContent);
      
      // Record validation time for performance monitoring
      const duration = performance.now() - (validationTimerRef.current || 0);
      setValidationTime(duration);
      
      // Log performance in development
      if (import.meta.env.DEV) {
        const analysis = analyzeContent(jsonContent);
        console.log(`JSON Validation: ${duration.toFixed(2)}ms (${analysis.size} bytes, ${analysis.isLarge ? 'large' : 'small'} file)`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrors([{
        line: 1,
        column: 1,
        message: (error as Error).message,
        severity: 'error' as const
      }]);
    } finally {
      setIsValidating(false);
    }
  }, [lastValidatedContent, analyzeContent]);

  // Create debounced validation with dynamic delay based on content size
  const createDebouncedValidate = useCallback((jsonContent: string) => {
    const analysis = analyzeContent(jsonContent);
    const delay = customDebounceDelay || analysis.recommendedDebounceDelay;
    
    return debounce(validateContent, delay);
  }, [validateContent, analyzeContent, customDebounceDelay]);

  const debouncedValidateRef = useRef(createDebouncedValidate(content));

  // Update debounced function when content characteristics change significantly
  useEffect(() => {
    const currentAnalysis = analyzeContent(content);
    const previousAnalysis = analyzeContent(lastValidatedContent);
    
    // Recreate debounced function if file size category changed
    if (currentAnalysis.isLarge !== previousAnalysis.isLarge) {
      debouncedValidateRef.current = createDebouncedValidate(content);
    }
  }, [content, lastValidatedContent, analyzeContent, createDebouncedValidate]);

  useEffect(() => {
    if (!enableRealTimeValidation) {
      return;
    }

    if (content.trim()) {
      debouncedValidateRef.current(content);
    } else {
      setErrors([]);
      setLastValidatedContent('');
    }
  }, [content, enableRealTimeValidation]);

  const validate = useCallback(() => {
    validateContent(content);
    return errors.length === 0;
  }, [content, validateContent, errors.length]);

  const validateImmediate = useCallback(() => {
    validateContent(content);
  }, [content, validateContent]);

  const getErrorSummary = useCallback(() => {
    return ValidationService.getErrorSummary(errors);
  }, [errors]);

  const getPerformanceMetrics = useCallback(() => {
    const analysis = analyzeContent(content);
    return {
      contentSize: analysis.size,
      isLargeFile: analysis.isLarge,
      validationTime,
      lastValidationTime: validationTime,
      recommendedOptimizations: analysis.isLarge ? [
        'Consider disabling real-time validation for large files',
        'Use manual validation instead',
        'Split large JSON into smaller files if possible'
      ] : []
    };
  }, [content, analyzeContent, validationTime]);

  return {
    errors,
    isValidating,
    isValid: errors.length === 0,
    validate,
    validateImmediate,
    getErrorSummary,
    getPerformanceMetrics,
    validationTime
  };
};

export default useJsonValidation;
