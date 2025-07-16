// JSON processing service
import type { JsonError } from '../types/editor.types';

export class JsonService {
  static parse(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`JSON Parse Error: ${(error as Error).message}`);
    }
  }

  static stringify(obj: any, indentSize: number = 2): string {
    try {
      return JSON.stringify(obj, null, indentSize);
    } catch (error) {
      throw new Error(`JSON Stringify Error: ${(error as Error).message}`);
    }
  }

  static validate(jsonString: string): JsonError[] {
    try {
      JSON.parse(jsonString);
      return [];
    } catch (error) {
      const err = error as Error;
      return [
        {
          line: 1,
          column: 1,
          message: err.message,
          severity: 'error' as const,
        },
      ];
    }
  }

  static format(jsonString: string, indentSize: number = 2): string {
    const parsed = this.parse(jsonString);
    return this.stringify(parsed, indentSize);
  }

  static minify(jsonString: string): string {
    const parsed = this.parse(jsonString);
    return JSON.stringify(parsed);
  }
}
