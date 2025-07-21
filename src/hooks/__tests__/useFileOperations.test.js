/**
 * useFileOperations Hook测试
 */

import { renderHook, act } from '@testing-library/preact-hooks';
import { useFileOperations } from '../useFileOperations';
import * as fileService from '../../services/fileService';

// 模拟fileService
jest.mock('../../services/fileService', () => ({
  readFile: jest.fn(),
  saveFile: jest.fn(),
  createNewFile: jest.fn(),
  isJsonFile: jest.fn(),
  isLargeFile: jest.fn(),
  ensureJsonExtension: jest.fn(filename => filename)
}));

describe('useFileOperations', () => {
  const mockOnContentChange = jest.fn();
  const mockOnError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟window.confirm
    global.confirm = jest.fn(() => true);
    
    // 模拟createNewFile返回值
    fileService.createNewFile.mockReturnValue({
      name: 'untitled.json',
      content: '{}',
      size: 2,
      lastModified: new Date()
    });
  });
  
  test('初始状态应为空', () => {
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    expect(result.current.currentFile).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
  
  test('openFile应加载文件内容', async () => {
    // 模拟文件检查
    fileService.isJsonFile.mockReturnValue(true);
    fileService.isLargeFile.mockReturnValue(false);
    
    // 模拟文件读取
    const mockFileInfo = {
      name: 'test.json',
      content: '{"test": true}',
      size: 14,
      lastModified: new Date()
    };
    fileService.readFile.mockResolvedValue(mockFileInfo);
    
    const { result, waitForNextUpdate } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    const mockFile = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
    
    act(() => {
      result.current.openFile(mockFile);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(fileService.readFile).toHaveBeenCalledWith(mockFile);
    expect(result.current.currentFile).toEqual(mockFileInfo);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mockOnContentChange).toHaveBeenCalledWith(mockFileInfo.content);
  });
  
  test('openFile应拒绝非JSON文件', async () => {
    // 模拟文件检查
    fileService.isJsonFile.mockReturnValue(false);
    
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    const mockFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
    
    act(() => {
      result.current.openFile(mockFile);
    });
    
    expect(fileService.readFile).not.toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalled();
    expect(mockOnError.mock.calls[0][0].message).toContain('只能打开JSON文件');
  });
  
  test('openFile应提示大文件警告', async () => {
    // 模拟文件检查
    fileService.isJsonFile.mockReturnValue(true);
    fileService.isLargeFile.mockReturnValue(true);
    
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    const mockFile = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
    
    act(() => {
      result.current.openFile(mockFile);
    });
    
    expect(global.confirm).toHaveBeenCalled();
    expect(fileService.readFile).toHaveBeenCalled();
  });
  
  test('createNew应创建新文件', () => {
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    act(() => {
      result.current.createNew();
    });
    
    expect(fileService.createNewFile).toHaveBeenCalledWith('untitled.json', '{}');
    expect(result.current.currentFile).toEqual({
      name: 'untitled.json',
      content: '{}',
      size: 2,
      lastModified: expect.any(Date)
    });
    expect(result.current.isDirty).toBe(false);
    expect(mockOnContentChange).toHaveBeenCalledWith('{}');
  });
  
  test('createNew应在有未保存更改时提示确认', () => {
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    // 先创建一个文件
    act(() => {
      result.current.createNew();
    });
    
    // 修改内容使其变为未保存状态
    act(() => {
      result.current.setContent('{"modified": true}');
    });
    
    expect(result.current.isDirty).toBe(true);
    
    // 再次创建新文件
    act(() => {
      result.current.createNew();
    });
    
    expect(global.confirm).toHaveBeenCalled();
    expect(fileService.createNewFile).toHaveBeenCalledTimes(2);
  });
  
  test('setContent应更新内容并设置isDirty', () => {
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    // 先创建一个文件
    act(() => {
      result.current.createNew();
    });
    
    // 修改内容
    act(() => {
      result.current.setContent('{"modified": true}');
    });
    
    expect(result.current.currentFile.content).toBe('{"modified": true}');
    expect(result.current.isDirty).toBe(true);
  });
  
  test('saveCurrentFile应保存当前文件', async () => {
    fileService.saveFile.mockResolvedValue();
    
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    // 先创建一个文件
    act(() => {
      result.current.createNew();
    });
    
    // 修改内容
    act(() => {
      result.current.setContent('{"modified": true}');
    });
    
    expect(result.current.isDirty).toBe(true);
    
    // 保存文件
    await act(async () => {
      await result.current.saveCurrentFile();
    });
    
    expect(fileService.saveFile).toHaveBeenCalledWith('{"modified": true}', 'untitled.json');
    expect(result.current.isDirty).toBe(false);
  });
  
  test('saveAs应另存为新文件名', async () => {
    fileService.saveFile.mockResolvedValue();
    
    const { result } = renderHook(() => useFileOperations({
      onContentChange: mockOnContentChange,
      onError: mockOnError
    }));
    
    // 先创建一个文件
    act(() => {
      result.current.createNew();
    });
    
    // 另存为
    await act(async () => {
      await result.current.saveAs('new-file.json');
    });
    
    expect(fileService.saveFile).toHaveBeenCalledWith('{}', 'new-file.json');
    expect(result.current.currentFile.name).toBe('new-file.json');
    expect(result.current.isDirty).toBe(false);
  });
});