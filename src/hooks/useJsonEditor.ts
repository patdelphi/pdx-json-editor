// JSON Editor hook
import { useState, useCallback } from 'react';
import type { JsonError } from '../types/editor.types';
import { JsonService } from '../services/jsonService';
import { ValidationService } from '../services/validationService';

const useJsonEditor = (initialContent: string = '') => {
  const [content, setContent] = useState(initialContent);
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);

    // Validate JSON
    const validationErrors = ValidationService.validateJson(newContent);
    setErrors(validationErrors);
  }, []);

  const formatJson = useCallback(() => {
    try {
      const formatted = JsonService.format(content);
      setContent(formatted);
      setIsDirty(true);
    } catch (error) {
      console.error('Format error:', error);
    }
  }, [content]);

  const minifyJson = useCallback(() => {
    try {
      const minified = JsonService.minify(content);
      setContent(minified);
      setIsDirty(true);
    } catch (error) {
      console.error('Minify error:', error);
    }
  }, [content]);

  const validateJson = useCallback(() => {
    const validationErrors = ValidationService.validateJson(content);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [content]);

  const resetDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    content,
    errors,
    isDirty,
    isValid: errors.length === 0,
    updateContent,
    formatJson,
    minifyJson,
    validateJson,
    resetDirty,
  };
};

export default useJsonEditor;
