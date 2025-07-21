/**
 * 文件服务测试
 */

import { 
  isJsonFile, 
  isLargeFile, 
  formatFileSize, 
  getBaseName, 
  getExtension, 
  ensureJsonExtension,
  createNewFile
} from '../fileService';

// 模拟File对象
const createMockFile = (name, size) => ({
  name,
  size,
  lastModified: Date.now()
});

describe('fileService', () => {
  describe('isJsonFile', () => {
    test('应正确识别JSON文件', () => {
      expect(isJsonFile(createMockFile('test.json', 100))).toBe(true);
      expect(isJsonFile(createMockFile('test.JSON', 100))).toBe(true);
      expect(isJsonFile(createMockFile('test.txt', 100))).toBe(false);
      expect(isJsonFile(createMockFile('test', 100))).toBe(false);
      expect(isJsonFile(null)).toBe(false);
    });
  });
  
  describe('isLargeFile', () => {
    test('应正确识别大文件', () => {
      const sizeLimit = 1000;
      
      expect(isLargeFile(createMockFile('test.json', 1500), sizeLimit)).toBe(true);
      expect(isLargeFile(createMockFile('test.json', 500), sizeLimit)).toBe(false);
      expect(isLargeFile(1500, sizeLimit)).toBe(true);
      expect(isLargeFile(500, sizeLimit)).toBe(false);
      expect(isLargeFile(null)).toBe(false);
    });
  });
  
  describe('formatFileSize', () => {
    test('应正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500.00 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });
  });
  
  describe('getBaseName', () => {
    test('应正确提取基本名称', () => {
      expect(getBaseName('test.json')).toBe('test');
      expect(getBaseName('test')).toBe('test');
      expect(getBaseName('test.file.json')).toBe('test.file');
      expect(getBaseName('')).toBe('');
      expect(getBaseName(null)).toBe('');
    });
  });
  
  describe('getExtension', () => {
    test('应正确提取扩展名', () => {
      expect(getExtension('test.json')).toBe('.json');
      expect(getExtension('test')).toBe('');
      expect(getExtension('test.file.json')).toBe('.json');
      expect(getExtension('')).toBe('');
      expect(getExtension(null)).toBe('');
    });
  });
  
  describe('ensureJsonExtension', () => {
    test('应确保文件名有.json扩展名', () => {
      expect(ensureJsonExtension('test')).toBe('test.json');
      expect(ensureJsonExtension('test.json')).toBe('test.json');
      expect(ensureJsonExtension('test.JSON')).toBe('test.JSON');
      expect(ensureJsonExtension('test.txt')).toBe('test.txt.json');
      expect(ensureJsonExtension('')).toBe('untitled.json');
      expect(ensureJsonExtension(null)).toBe('untitled.json');
    });
  });
  
  describe('createNewFile', () => {
    test('应创建新文件信息对象', () => {
      const file = createNewFile('test.json', '{"test": true}');
      
      expect(file.name).toBe('test.json');
      expect(file.content).toBe('{"test": true}');
      expect(file.size).toBeGreaterThan(0);
      expect(file.lastModified instanceof Date).toBe(true);
    });
    
    test('应使用默认空内容', () => {
      const file = createNewFile('test.json');
      
      expect(file.name).toBe('test.json');
      expect(file.content).toBe('');
      expect(file.size).toBe(0);
    });
  });
});