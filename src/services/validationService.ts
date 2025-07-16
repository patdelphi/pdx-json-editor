// JSON validation service
import type { JsonError } from '../types/editor.types';

export class ValidationService {
  static validateJson(jsonString: string): JsonError[] {
    if (!jsonString.trim()) {
      return [];
    }

    try {
      JSON.parse(jsonString);
      return [];
    } catch (error) {
      const err = error as Error;
      const match = err.message.match(/at position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;

      // Calculate line and column from position
      const lines = jsonString.substring(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      return [
        {
          line,
          column,
          message: err.message,
          severity: 'error' as const,
        },
      ];
    }
  }

  static validateJsonSchema(jsonString: string, _schema?: any): JsonError[] {
    // Basic validation - can be extended with JSON Schema validation
    const errors = this.validateJson(jsonString);

    if (errors.length > 0) {
      return errors;
    }

    // Additional schema validation would go here
    return [];
  }

  static getErrorSummary(errors: JsonError[]): string {
    if (errors.length === 0) {
      return 'Valid JSON';
    }

    const errorCount = errors.filter((e) => e.severity === 'error').length;
    const warningCount = errors.filter((e) => e.severity === 'warning').length;

    let summary = '';
    if (errorCount > 0) {
      summary += `${errorCount} error${errorCount > 1 ? 's' : ''}`;
    }
    if (warningCount > 0) {
      if (summary) summary += ', ';
      summary += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    }

    return summary;
  }
}
