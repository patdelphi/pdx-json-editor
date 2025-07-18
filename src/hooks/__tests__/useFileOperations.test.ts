import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useFileOperations from '../useFileOperations';

// Mock FileService
vi.mock('../../services/fileService', () => {
  const mockReadFile = vi.fn();
  const mockDownloadFile = vi.fn();
  const mockValidateFileType = vi.fn();

  return {
    FileService: {
      readFile: mockReadFile,
      downloadFile: mockDownloadFile,
      validateFileType: mockValidateFileType,
    },
    mockReadFile,
    mockDownloadFile,
    mockValidateFileType,
  };
});

describe('useFileOperations', () => {
  let mockReadFile: any;
  let mockDownloadFile: any;
  let mockValidateFileType: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mocks = await import('../../services/fileService');
    mockReadFile = (mocks as any).mockReadFile;
    mockDownloadFile = (mocks as any).mockDownloadFile;
    mockValidateFileType = (mocks as any).mockValidateFileType;
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFileOperations());

    expect(result.current.currentFile).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should open a valid file successfully', async () => {
    const mockFile = new File(['{"test": "content"}'], 'test.json', {
      type: 'application/json',
    });
    const mockFileInfo = {
      name: 'test.json',
      size: 100,
      lastModified: new Date(),
      content: '{"test": "content"}',
    };

    mockValidateFileType.mockReturnValue(true);
    mockReadFile.mockResolvedValue(mockFileInfo);

    const { result } = renderHook(() => useFileOperations());

    let fileInfo: any;
    await act(async () => {
      fileInfo = await result.current.openFile(mockFile);
    });

    expect(mockValidateFileType).toHaveBeenCalledWith(mockFile);
    expect(mockReadFile).toHaveBeenCalledWith(mockFile);
    expect(result.current.currentFile).toEqual(mockFileInfo);
    expect(result.current.isLoading).toBe(false);
    expect(fileInfo).toEqual(mockFileInfo);
  });

  it('should handle invalid file type', async () => {
    const mockFile = new File(['content'], 'test.exe', {
      type: 'application/octet-stream',
    });

    mockValidateFileType.mockReturnValue(false);

    const { result } = renderHook(() => useFileOperations());

    let fileInfo: any;
    await act(async () => {
      fileInfo = await result.current.openFile(mockFile);
    });

    expect(mockValidateFileType).toHaveBeenCalledWith(mockFile);
    expect(mockReadFile).not.toHaveBeenCalled();
    expect(result.current.currentFile).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(fileInfo).toBeNull();
  });

  it('should handle file read errors', async () => {
    const mockFile = new File(['{"test": "content"}'], 'test.json', {
      type: 'application/json',
    });

    mockValidateFileType.mockReturnValue(true);
    mockReadFile.mockRejectedValue(new Error('Read error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useFileOperations());

    let fileInfo: any;
    await act(async () => {
      fileInfo = await result.current.openFile(mockFile);
    });

    expect(result.current.currentFile).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(fileInfo).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error opening file:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should save file with current filename', async () => {
    const mockFileInfo = {
      name: 'current.json',
      size: 100,
      lastModified: new Date(),
      content: '{"current": "content"}',
    };

    mockValidateFileType.mockReturnValue(true);
    mockReadFile.mockResolvedValue(mockFileInfo);

    const mockFile = new File(['{"current": "content"}'], 'current.json', {
      type: 'application/json',
    });

    const { result } = renderHook(() => useFileOperations());

    // First open a file to set currentFile
    await act(async () => {
      await result.current.openFile(mockFile);
    });

    const content = '{"new": "content"}';
    let success: boolean;

    act(() => {
      success = result.current.saveFile(content);
    });

    expect(mockDownloadFile).toHaveBeenCalledWith(content, 'current.json');
    expect(success!).toBe(true);
  });

  it('should save file with custom filename', () => {
    const { result } = renderHook(() => useFileOperations());

    const content = '{"test": "content"}';
    const filename = 'custom.json';
    let success: boolean;

    act(() => {
      success = result.current.saveFile(content, filename);
    });

    expect(mockDownloadFile).toHaveBeenCalledWith(content, filename);
    expect(success!).toBe(true);
  });

  it('should save file with default filename when no current file', () => {
    const { result } = renderHook(() => useFileOperations());

    const content = '{"test": "content"}';
    let success: boolean;

    act(() => {
      success = result.current.saveFile(content);
    });

    expect(mockDownloadFile).toHaveBeenCalledWith(content, 'untitled.json');
    expect(success!).toBe(true);
  });

  it('should handle save errors', () => {
    mockDownloadFile.mockImplementation(() => {
      throw new Error('Save error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useFileOperations());

    let success: boolean;
    act(() => {
      success = result.current.saveFile('{"test": "content"}');
    });

    expect(success!).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error saving file:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should create new file', async () => {
    const mockFileInfo = {
      name: 'test.json',
      size: 100,
      lastModified: new Date(),
      content: '{"test": "content"}',
    };

    mockValidateFileType.mockReturnValue(true);
    mockReadFile.mockResolvedValue(mockFileInfo);

    const mockFile = new File(['{"test": "content"}'], 'test.json', {
      type: 'application/json',
    });

    const { result } = renderHook(() => useFileOperations());

    // First open a file to set currentFile
    await act(async () => {
      await result.current.openFile(mockFile);
    });

    expect(result.current.currentFile).toEqual(mockFileInfo);

    // Then create new file
    act(() => {
      result.current.newFile();
    });

    expect(result.current.currentFile).toBeNull();
  });

  it('should handle file drop', async () => {
    const mockFile = new File(['{"test": "content"}'], 'dropped.json', {
      type: 'application/json',
    });
    const mockFileInfo = {
      name: 'dropped.json',
      size: 100,
      lastModified: new Date(),
      content: '{"test": "content"}',
    };

    mockValidateFileType.mockReturnValue(true);
    mockReadFile.mockResolvedValue(mockFileInfo);

    const { result } = renderHook(() => useFileOperations());

    let fileInfo: any;
    await act(async () => {
      fileInfo = await result.current.handleFileDrop(mockFile);
    });

    expect(fileInfo).toEqual(mockFileInfo);
    expect(result.current.currentFile).toEqual(mockFileInfo);
  });

  it('should maintain function stability across re-renders', () => {
    const { result, rerender } = renderHook(() => useFileOperations());

    const initialOpenFile = result.current.openFile;
    const initialSaveFile = result.current.saveFile;
    const initialNewFile = result.current.newFile;

    rerender();

    expect(result.current.openFile).toBe(initialOpenFile);
    expect(result.current.saveFile).toBe(initialSaveFile);
    expect(result.current.newFile).toBe(initialNewFile);
  });
});
