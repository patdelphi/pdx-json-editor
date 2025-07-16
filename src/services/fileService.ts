// File operations service
import type { FileInfo } from '../types/editor.types';

export class FileService {
  static async readFile(file: File): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve({
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
          content,
        });
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  static downloadFile(content: string, filename: string = 'data.json'): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static validateFileType(file: File): boolean {
    const validTypes = ['application/json', 'text/plain'];
    const validExtensions = ['.json', '.txt'];

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  }
}
