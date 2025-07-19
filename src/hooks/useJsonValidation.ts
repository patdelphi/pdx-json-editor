import { useState, useCallback } from 'preact/hooks';
import type { JsonError } from '../types/editor.types';

export function useJsonValidation() {
  const [errors, setErrors] = useState<JsonError[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((content: string): JsonError[] => {
    if (!content.trim()) {
      const emptyResult: JsonError[] = [];
      setErrors(emptyResult);
      setIsValid(true);
      return emptyResult;
    }

    try {
      JSON.parse(content);
      const validResult: JsonError[] = [];
      setErrors(validResult);
      setIsValid(true);
      return validResult;
    } catch (error) {
      const jsonError = error as SyntaxError;
      const errorList = parseJsonError(jsonError, content);
      setErrors(errorList);
      setIsValid(errorList.length === 0);
      return errorList;
    }
  }, []);

  const parseJsonError = (error: SyntaxError, content: string): JsonError[] => {
    const message = error.message;
    
    // Try to extract position from error message
    const positionMatch = message.match(/at position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const { line, column } = getLineAndColumn(content, position);
      
      return [{
        line,
        column,
        message: message.replace(/at position \d+/, '').trim(),
        severity: 'error'
      }];
    }

    // Try to extract line number from error message
    const lineMatch = message.match(/line (\d+)/);
    if (lineMatch) {
      const line = parseInt(lineMatch[1], 10);
      
      return [{
        line,
        column: 1,
        message: message,
        severity: 'error'
      }];
    }

    // Fallback: return error without specific position
    return [{
      line: 1,
      column: 1,
      message: message,
      severity: 'error'
    }];
  };

  const getLineAndColumn = (content: string, position: number): { line: number; column: number } => {
    const lines = content.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    return { line, column };
  };

  return {
    errors,
    isValid,
    validate
  };
}