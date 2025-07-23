/**
 * FileDropZone组件测试
 */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { FileDropZone } from '../FileDropZone';
import * as fileService from '../../services/fileService';

// 模拟fileService
jest.mock('../../services/fileService', () => ({
  isJsonFile: jest.fn()
}));

describe('FileDropZone', () => {
  const mockOnFileDrop = jest.fn();
  const mockOnError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应处理JSON文件拖放', () => {
    // 模拟isJsonFile返回true
    fileService.isJsonFile.mockReturnValue(true);
    
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
      />
    );
    
    // 创建模拟的拖放事件
    const dropEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: {
        files: [
          new File(['{}'], 'test.json', { type: 'application/json' })
        ],
        clearData: jest.fn()
      }
    };
    
    // 触发拖放事件
    const dropZone = document.querySelector('[data-testid="file-drop-zone"]');
    fireEvent.drop(dropZone, dropEvent);
    
    // 检查是否调用了onFileDrop
    expect(mockOnFileDrop).toHaveBeenCalledTimes(1);
    expect(mockOnFileDrop).toHaveBeenCalledWith(dropEvent.dataTransfer.files[0]);
    expect(mockOnError).not.toHaveBeenCalled();
  });
  
  test('应拒绝非JSON文件', () => {
    // 模拟isJsonFile返回false
    fileService.isJsonFile.mockReturnValue(false);
    
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
      />
    );
    
    // 创建模拟的拖放事件
    const dropEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: {
        files: [
          new File(['text content'], 'test.txt', { type: 'text/plain' })
        ],
        clearData: jest.fn()
      }
    };
    
    // 触发拖放事件
    const dropZone = document.querySelector('[data-testid="file-drop-zone"]');
    fireEvent.drop(dropZone, dropEvent);
    
    // 检查是否调用了onError
    expect(mockOnFileDrop).not.toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError.mock.calls[0][0].message).toContain('不支持的文件类型');
  });
  
  test('拖放区域应在拖动时显示', () => {
    render(
      <FileDropZone
        onFileDrop={mockOnFileDrop}
        onError={mockOnError}
      />
    );
    
    const dropZone = document.querySelector('[data-testid="file-drop-zone"]');
    
    // 初始状态应为隐藏
    expect(dropZone).toHaveStyle('display: none');
    
    // 触发拖入事件
    fireEvent.dragEnter(dropZone);
    
    // 应显示拖放区域
    expect(dropZone).toHaveStyle('display: flex');
    
    // 触发拖离事件
    fireEvent.dragLeave(dropZone);
    
    // 应隐藏拖放区域
    expect(dropZone).toHaveStyle('display: none');
  });
});