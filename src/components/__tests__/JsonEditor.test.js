// 这是一个简单的测试文件，用于验证Monaco Editor是否正确集成
// 实际项目中应该使用Jest或其他测试框架进行更完整的测试

import { h } from 'preact';
import { render } from '@testing-library/preact';
import { JsonEditor } from '../JsonEditor';

// 模拟Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, onMount }) => {
      return h('div', { 
        'data-testid': 'monaco-editor',
        'data-value': value
      });
    }
  };
});

describe('JsonEditor', () => {
  it('should render Monaco Editor', () => {
    const { getByTestId } = render(h(JsonEditor, { darkMode: false }));
    const editorElement = getByTestId('monaco-editor');
    expect(editorElement).toBeDefined();
  });
});