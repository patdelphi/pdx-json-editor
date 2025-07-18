import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileService } from '../fileService';

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  },
});

// Mock URL
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

// Mock Blob
Object.defineProperty(global, 'Blob', {
  value: class MockBlob {
    constructor(
      public content: any[],
      public options: any
    ) {}
  },
});

// Mock FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  result: string | null = null;

  readAsText(file: File) {
    // Simulate async file reading
    setTimeout(() => {
      if (file.name.includes('error')) {
        this.onerror?.({ target: this });
      } else {
        this.result = `Content of ${file.name}`;
        this.onload?.({ target: { result: this.result } });
      }
    }, 0);
  }
}

Object.defineProperty(global, 'FileReader', {
  value: MockFileReader,
});

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    });
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('readFile', () => {
    it('should read a valid file successfully', async () => {
      const mockFile = new File(['{"test": "content"}'], 'test.json', {
        type: 'application/json',
        lastModified: Date.now(),
      });

      const result = await FileService.readFile(mockFile);

      expect(result).toMatchObject({
        name: 'test.json',
        size: mockFile.size,
        lastModified: expect.any(Date),
        content: 'Content of test.json',
      });
    });

    it('should handle different file types', async () => {
      const jsonFile = new File(['{}'], 'data.json', {
        type: 'application/json',
      });
      const txtFile = new File(['text'], 'data.txt', { type: 'text/plain' });

      const jsonResult = await FileService.readFile(jsonFile);
      const txtResult = await FileService.readFile(txtFile);

      expect(jsonResult.name).toBe('data.json');
      expect(txtResult.name).toBe('data.txt');
    });

    it('should preserve file metadata', async () => {
      const lastModified = Date.now() - 1000;
      const mockFile = new File(['content'], 'metadata.json', {
        type: 'application/json',
        lastModified,
      });

      const result = await FileService.readFile(mockFile);

      expect(result.name).toBe('metadata.json');
      expect(result.size).toBe(mockFile.size);
      expect(result.lastModified.getTime()).toBe(lastModified);
    });

    it('should handle file read errors', async () => {
      const errorFile = new File(['content'], 'error-file.json', {
        type: 'application/json',
      });

      await expect(FileService.readFile(errorFile)).rejects.toThrow(
        'Failed to read file'
      );
    });

    it('should handle empty files', async () => {
      const emptyFile = new File([''], 'empty.json', {
        type: 'application/json',
      });

      const result = await FileService.readFile(emptyFile);

      expect(result.name).toBe('empty.json');
      expect(result.size).toBe(0);
    });

    it('should handle large files', async () => {
      const largeContent = 'x'.repeat(10000);
      const largeFile = new File([largeContent], 'large.json', {
        type: 'application/json',
      });

      const result = await FileService.readFile(largeFile);

      expect(result.name).toBe('large.json');
      expect(result.size).toBe(largeContent.length);
    });

    it('should handle files with special characters in name', async () => {
      const specialFile = new File(['content'], 'special-file_name (1).json', {
        type: 'application/json',
      });

      const result = await FileService.readFile(specialFile);

      expect(result.name).toBe('special-file_name (1).json');
    });

    it('should handle files with unicode content', async () => {
      const unicodeFile = new File(
        ['{"emoji": "🚀", "chinese": "测试"}'],
        'unicode.json',
        {
          type: 'application/json',
        }
      );

      const result = await FileService.readFile(unicodeFile);

      expect(result.name).toBe('unicode.json');
      expect(result.content).toBe('Content of unicode.json');
    });
  });

  describe('downloadFile', () => {
    it('should download file with default filename', () => {
      const content = '{"test": "data"}';

      FileService.downloadFile(content);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Object));
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('should download file with custom filename', () => {
      const content = '{"test": "data"}';
      const filename = 'custom.json';

      FileService.downloadFile(content, filename);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should create blob with correct content and type', () => {
      const content = '{"test": "data"}';
      const filename = 'test.json';

      FileService.downloadFile(content, filename);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          content: [content],
          options: { type: 'application/json' },
        })
      );
    });

    it('should handle empty content', () => {
      const content = '';
      const filename = 'empty.json';

      FileService.downloadFile(content, filename);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          content: [''],
          options: { type: 'application/json' },
        })
      );
    });

    it('should handle large content', () => {
      const content = '{"data": "' + 'x'.repeat(10000) + '"}';
      const filename = 'large.json';

      FileService.downloadFile(content, filename);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          content: [content],
          options: { type: 'application/json' },
        })
      );
    });

    it('should handle special characters in content', () => {
      const content = '{"text": "Hello\\nWorld\\t\\"Test\\"", "emoji": "🚀"}';
      const filename = 'special.json';

      FileService.downloadFile(content, filename);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          content: [content],
          options: { type: 'application/json' },
        })
      );
    });

    it('should clean up DOM elements and URLs', () => {
      const content = '{"test": "data"}';

      FileService.downloadFile(content);

      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });

  describe('validateFileType', () => {
    it('should accept JSON files by MIME type', () => {
      const jsonFile = new File(['{}'], 'test.json', {
        type: 'application/json',
      });

      const result = FileService.validateFileType(jsonFile);

      expect(result).toBe(true);
    });

    it('should accept text files by MIME type', () => {
      const textFile = new File(['text'], 'test.txt', {
        type: 'text/plain',
      });

      const result = FileService.validateFileType(textFile);

      expect(result).toBe(true);
    });

    it('should accept JSON files by extension', () => {
      const jsonFile = new File(['{}'], 'test.json', {
        type: '', // Empty MIME type
      });

      const result = FileService.validateFileType(jsonFile);

      expect(result).toBe(true);
    });

    it('should accept TXT files by extension', () => {
      const txtFile = new File(['text'], 'test.txt', {
        type: '', // Empty MIME type
      });

      const result = FileService.validateFileType(txtFile);

      expect(result).toBe(true);
    });

    it('should accept files with uppercase extensions', () => {
      const upperCaseFile = new File(['{}'], 'TEST.JSON', {
        type: '',
      });

      const result = FileService.validateFileType(upperCaseFile);

      expect(result).toBe(true);
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['content'], 'test.exe', {
        type: 'application/octet-stream',
      });

      const result = FileService.validateFileType(invalidFile);

      expect(result).toBe(false);
    });

    it('should reject files with invalid extensions', () => {
      const invalidExtFile = new File(['content'], 'test.pdf', {
        type: '',
      });

      const result = FileService.validateFileType(invalidExtFile);

      expect(result).toBe(false);
    });

    it('should handle files without extensions', () => {
      const noExtFile = new File(['content'], 'filename', {
        type: 'application/json',
      });

      const result = FileService.validateFileType(noExtFile);

      expect(result).toBe(true); // Should pass due to MIME type
    });

    it('should handle files with multiple dots in name', () => {
      const multiDotFile = new File(['{}'], 'my.backup.data.json', {
        type: '',
      });

      const result = FileService.validateFileType(multiDotFile);

      expect(result).toBe(true);
    });

    it('should handle edge case with dot at end', () => {
      const dotEndFile = new File(['content'], 'filename.', {
        type: 'text/plain',
      });

      const result = FileService.validateFileType(dotEndFile);

      expect(result).toBe(true); // Should pass due to MIME type
    });

    it('should be case insensitive for extensions', () => {
      const mixedCaseFile = new File(['{}'], 'test.Json', {
        type: '',
      });

      const result = FileService.validateFileType(mixedCaseFile);

      expect(result).toBe(true);
    });

    it('should handle files with complex names', () => {
      const complexNameFile = new File(
        ['{}'],
        'my-file_name (1) [backup].json',
        {
          type: '',
        }
      );

      const result = FileService.validateFileType(complexNameFile);

      expect(result).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null or undefined file gracefully', () => {
      // This would be a TypeScript error, but testing runtime behavior
      expect(() => FileService.validateFileType(null as any)).not.toThrow();
      expect(() =>
        FileService.validateFileType(undefined as any)
      ).not.toThrow();
    });

    it('should handle file with empty name', () => {
      const emptyNameFile = new File(['content'], '', {
        type: 'application/json',
      });

      const result = FileService.validateFileType(emptyNameFile);

      expect(result).toBe(true); // Should pass due to MIME type
    });

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(255) + '.json';
      const longNameFile = new File(['{}'], longName, {
        type: '',
      });

      const result = FileService.validateFileType(longNameFile);

      expect(result).toBe(true);
    });

    it('should handle files with special characters in names', () => {
      const specialCharsFile = new File(['{}'], 'файл-测试-🚀.json', {
        type: '',
      });

      const result = FileService.validateFileType(specialCharsFile);

      expect(result).toBe(true);
    });
  });
});
