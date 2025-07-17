// Error handling service
import type { JsonError } from '../types/editor.types';

export enum ErrorType {
  JSON_PARSE = 'JSON_PARSE',
  FILE_READ = 'FILE_READ',
  FILE_WRITE = 'FILE_WRITE',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
  stack?: string;
}

export class ErrorService {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  static handleJsonError(error: SyntaxError): JsonError[] {
    const appError: AppError = {
      type: ErrorType.JSON_PARSE,
      message: error.message,
      timestamp: new Date(),
      stack: error.stack
    };

    this.logError(appError);

    // Parse JSON error to extract line and column information
    const match = error.message.match(/at position (\d+)/);
    const position = match ? parseInt(match[1], 10) : 0;

    return [{
      line: 1, // TODO: Calculate actual line from position
      column: position,
      message: error.message,
      severity: 'error' as const
    }];
  }

  static handleFileError(error: Error, operation: 'read' | 'write' = 'read'): string {
    const errorType = operation === 'read' ? ErrorType.FILE_READ : ErrorType.FILE_WRITE;
    const appError: AppError = {
      type: errorType,
      message: error.message,
      timestamp: new Date(),
      stack: error.stack
    };

    this.logError(appError);

    // Return user-friendly error message
    switch (errorType) {
      case ErrorType.FILE_READ:
        return 'Failed to read the file. Please make sure the file is valid and try again.';
      case ErrorType.FILE_WRITE:
        return 'Failed to save the file. Please check your permissions and try again.';
      default:
        return 'An error occurred while processing the file.';
    }
  }

  static handleValidationError(errors: JsonError[]): string {
    const appError: AppError = {
      type: ErrorType.VALIDATION,
      message: `JSON validation failed with ${errors.length} error(s)`,
      details: errors.map(e => `Line ${e.line}, Column ${e.column}: ${e.message}`).join('\n'),
      timestamp: new Date()
    };

    this.logError(appError);

    if (errors.length === 1) {
      return `Validation error: ${errors[0].message}`;
    }
    return `JSON has ${errors.length} validation errors. Check the editor for details.`;
  }

  static handleAppError(error: Error): string {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      message: error.message,
      timestamp: new Date(),
      stack: error.stack
    };

    this.logError(appError);

    // Return generic user-friendly message
    return 'An unexpected error occurred. Please try again or refresh the page.';
  }

  static handleNetworkError(error: Error): string {
    const appError: AppError = {
      type: ErrorType.NETWORK,
      message: error.message,
      timestamp: new Date(),
      stack: error.stack
    };

    this.logError(appError);

    return 'Network error occurred. Please check your connection and try again.';
  }

  private static logError(error: AppError): void {
    // Add to error log
    this.errorLog.unshift(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${error.type}] ${error.message}`, error);
    }

    // TODO: Send to external logging service in production
    // if (process.env.NODE_ENV === 'production') {
    //   this.sendToLoggingService(error);
    // }
  }

  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static getErrorStats(): { [key in ErrorType]: number } {
    const stats = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as { [key in ErrorType]: number });

    this.errorLog.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }

  // TODO: Implement external logging service integration
  // private static async sendToLoggingService(error: AppError): Promise<void> {
  //   try {
  //     await fetch('/api/errors', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(error)
  //     });
  //   } catch (e) {
  //     console.error('Failed to send error to logging service:', e);
  //   }
  // }
}