// 这是一个简单的测试文件，用于验证EditorToolbar组件的功能
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { EditorToolbar } from '../EditorToolbar';

describe('EditorToolbar', () => {
  beforeEach(() => {
    // 模拟全局pdxJsonEditor对象
    window.pdxJsonEditor = {
      formatJson: jest.fn(),
      compressJson: jest.fn(),
      tryFixJson: jest.fn()
    };
  });
  
  afterEach(() => {
    delete window.pdxJsonEditor;
  });
  
  it('should render all buttons', () => {
    const { getByText } = render(h(EditorToolbar, {}));
    
    expect(getByText('格式化')).toBeDefined();
    expect(getByText('压缩')).toBeDefined();
    expect(getByText('修复')).toBeDefined();
  });
  
  it('should call formatJson when format button is clicked', () => {
    const { getByText } = render(h(EditorToolbar, {}));
    
    fireEvent.click(getByText('格式化'));
    expect(window.pdxJsonEditor.formatJson).toHaveBeenCalled();
  });
  
  it('should call compressJson when compress button is clicked', () => {
    const { getByText } = render(h(EditorToolbar, {}));
    
    fireEvent.click(getByText('压缩'));
    expect(window.pdxJsonEditor.compressJson).toHaveBeenCalled();
  });
  
  it('should call tryFixJson when fix button is clicked', () => {
    const { getByText } = render(h(EditorToolbar, {}));
    
    fireEvent.click(getByText('修复'));
    expect(window.pdxJsonEditor.tryFixJson).toHaveBeenCalled();
  });
  
  it('should call onSearchClick when search button is clicked', () => {
    const onSearchClick = jest.fn();
    const { getByTitle } = render(h(EditorToolbar, { onSearchClick }));
    
    fireEvent.click(getByTitle('搜索 (Ctrl+F)'));
    expect(onSearchClick).toHaveBeenCalled();
  });
});