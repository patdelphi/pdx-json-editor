// JSON validation hook
import { useState, useCallback, useEffect } from 'react';
import type { JsonError } from '../types/editor.types';
import { ValidationService } from '../services/validationService';
import { debounce } from '../utils/helpers';
import { VALIDATION_SETTINGS } from '../utils/constants';

const useJsonValidation = (content: string) => {
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateContent = useCallback((jsonContent: string) => {
    setIsValidating(true);
    const validationErrors = ValidationService.validateJson(jsonContent);
    setErrors(validationErrors);
    setIsValidating(false);
  }, []);

  const debouncedValidate = useCallback(
    debounce(validateContent, VALIDATION_SETTINGS.DEBOUNCE_DELAY),
    [validateContent]
  );

  useEffect(() => {
    if (content.trim()) {
      debouncedValidate(content);
    } else {
      setErrors([]);
    }
  }, [content, debouncedValidate]);

  const validate = useCallback(() => {
    validateContent(content);
    return errors.length === 0;
  }, [content, validateContent, errors.length]);

  const getErrorSummary = useCallback(() => {
    return ValidationService.getErrorSummary(errors);
  }, [errors]);

  return {
    errors,
    isValidating,
    isValid: errors.length === 0,
    validate,
    getErrorSummary,
  };
};

export default useJsonValidation;
