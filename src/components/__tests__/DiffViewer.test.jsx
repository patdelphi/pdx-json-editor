/**
 * DiffViewer组件测试
 */

import { h } from 'preact';
import { render, fireEvent, screen } from '@testing-library/preact';
import { DiffViewer } from '../DiffViewer';
import { ThemeContextProvider } from '../../theme/ThemeContext';

// 模拟Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ original, modified, onMount }) => {
      // 模拟编辑器挂载
      if (onMount) {
        setTimeout(() => {
          onMount({
            getOriginalEditor: () => ({
              getValue: () => original,
              getModel: () => ({})
            }),
            getModifiedEditor: () => ({
              getValue: () => modified,
              getModel: () => ({})
            }),
            updateOptions: jest.fn()
          });
        }, 0);
      }
      
      return <div data-testid="mock-diff-editor">
        <div>Original: {original}</div>
        <div>Modified: {modified}</div>
      </div>;
    }
  };
});

// 模拟剪贴板API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

describe('DiffViewer组件', () => {
  const renderWithTheme = (ui) => {
    return render(
      <ThemeContextProvider>
        {ui}
      </ThemeContextProvider>
    );
  };
  
  const original = '{\n  "example": "original content"\n}';
  const modified = '{\n  "example": "modified content"\n}';
  
  test('应正确渲染差异对比组件', () => {
    const onClose = jest.fn();
    
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
        onClose={onClose}
      />
    );
    
    // 检查标题是否存在
    expect(screen.getByText('差异对比')).toBeInTheDocument();
    
    // 检查编辑器是否渲染
    expect(screen.getByTestId('mock-diff-editor')).toBeInTheDocument();
    
    // 检查原始内容和修改后内容是否正确
    expect(screen.getByText(`Original: ${original}`)).toBeInTheDocument();
    expect(screen.getByText(`Modified: ${modified}`)).toBeInTheDocument();
  });
  
  test('应能切换布局', () => {
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
      />
    );
    
    // 找到水平布局按钮并点击
    const horizontalButton = screen.getByLabelText('水平布局');
    fireEvent.click(horizontalButton);
    
    // 再次点击垂直布局按钮
    const verticalButton = screen.getByLabelText('垂直布局');
    fireEvent.click(verticalButton);
  });
  
  test('应能切换内联模式', () => {
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
      />
    );
    
    // 找到内联视图按钮并点击
    const inlineButton = screen.getByLabelText(/内联视图|并排视图/);
    fireEvent.click(inlineButton);
  });
  
  test('应能复制修改后内容', async () => {
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
      />
    );
    
    // 找到复制按钮并点击
    const copyButton = screen.getByLabelText('复制修改后内容');
    fireEvent.click(copyButton);
    
    // 验证剪贴板API是否被调用
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(modified);
  });
  
  test('应能保存修改后内容', () => {
    const onSave = jest.fn();
    
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
        onSave={onSave}
      />
    );
    
    // 找到保存按钮并点击
    const saveButton = screen.getByLabelText('保存修改');
    fireEvent.click(saveButton);
    
    // 验证保存回调是否被调用
    expect(onSave).toHaveBeenCalledWith(modified);
  });
  
  test('应能关闭差异对比视图', () => {
    const onClose = jest.fn();
    
    renderWithTheme(
      <DiffViewer
        original={original}
        modified={modified}
        onClose={onClose}
      />
    );
    
    // 找到关闭按钮并点击
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);
    
    // 验证关闭回调是否被调用
    expect(onClose).toHaveBeenCalled();
  });
});