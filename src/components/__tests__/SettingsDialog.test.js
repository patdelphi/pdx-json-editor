// 这是一个简单的测试文件，用于验证SettingsDialog组件的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { SettingsDialog } from '../SettingsDialog';

describe('SettingsDialog', () => {
  beforeEach(() => {
    // 模拟localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;
    
    // 模拟全局pdxJsonEditor对象
    window.pdxJsonEditor = {
      applySettings: jest.fn()
    };
  });
  
  afterEach(() => {
    delete window.pdxJsonEditor;
  });
  
  it('should render settings dialog', () => {
    const onClose = jest.fn();
    const { getByText } = render(h(SettingsDialog, { open: true, onClose }));
    
    expect(getByText('编辑器设置')).toBeDefined();
    expect(getByText('缩略图设置')).toBeDefined();
    expect(getByText('编辑器设置')).toBeDefined();
    expect(getByText('主题设置')).toBeDefined();
  });
  
  it('should save settings when save button is clicked', () => {
    const onClose = jest.fn();
    const { getByText } = render(h(SettingsDialog, { open: true, onClose }));
    
    fireEvent.click(getByText('保存'));
    
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(window.pdxJsonEditor.applySettings).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
  
  it('should close dialog when cancel button is clicked', () => {
    const onClose = jest.fn();
    const { getByText } = render(h(SettingsDialog, { open: true, onClose }));
    
    fireEvent.click(getByText('取消'));
    
    expect(onClose).toHaveBeenCalled();
  });
});