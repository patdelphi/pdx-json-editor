import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolbarSearchPanel from '../ToolbarSearchPanel';

describe('ToolbarSearchPanel', () => {
  const mockSearch = jest.fn();
  const mockReplace = jest.fn();
  const mockReplaceAll = jest.fn();
  const mockFindNext = jest.fn();
  const mockFindPrevious = jest.fn();
  const mockClose = jest.fn();

  const defaultProps = {
    isVisible: true,
    onClose: mockClose,
    onSearch: mockSearch,
    onReplace: mockReplace,
    onReplaceAll: mockReplaceAll,
    onFindNext: mockFindNext,
    onFindPrevious: mockFindPrevious,
    searchResults: [],
    currentResultIndex: 0,
    theme: 'light' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<ToolbarSearchPanel {...defaultProps} isVisible={false} />);
    expect(screen.queryByPlaceholderText('搜索...')).not.toBeVisible();
  });

  it('calls onSearch when input changes', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('搜索...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockSearch).toHaveBeenCalledWith('test', expect.any(Object));
  });

  it('toggles search options when option buttons are clicked', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    
    // Find the case sensitive button (Aa)
    const caseButton = screen.getByTitle('区分大小写');
    fireEvent.click(caseButton);
    
    // Verify that onSearch was called with updated options
    expect(mockSearch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      caseSensitive: true
    }));
  });

  it('shows replace section when replace button is clicked', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    
    // Initially replace section should not be visible
    expect(screen.queryByPlaceholderText('替换为...')).not.toBeInTheDocument();
    
    // Click the replace toggle button
    const replaceButton = screen.getByTitle('显示替换');
    fireEvent.click(replaceButton);
    
    // Now replace section should be visible
    expect(screen.getByPlaceholderText('替换为...')).toBeInTheDocument();
  });

  it('calls onFindNext when Enter is pressed', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('搜索...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockFindNext).toHaveBeenCalled();
  });

  it('calls onFindPrevious when Shift+Enter is pressed', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('搜索...');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(mockFindPrevious).toHaveBeenCalled();
  });

  it('calls onReplace when replace button is clicked', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    
    // Enter search text
    const searchInput = screen.getByPlaceholderText('搜索...');
    fireEvent.change(searchInput, { target: { value: 'search text' } });
    
    // Show replace section
    const replaceButton = screen.getByTitle('显示替换');
    fireEvent.click(replaceButton);
    
    // Enter replace text
    const replaceInput = screen.getByPlaceholderText('替换为...');
    fireEvent.change(replaceInput, { target: { value: 'replace text' } });
    
    // Click replace button
    const doReplaceButton = screen.getByTitle('替换当前');
    fireEvent.click(doReplaceButton);
    
    // Verify replace was called with correct parameters
    expect(mockReplace).toHaveBeenCalledWith(
      'search text',
      'replace text',
      expect.any(Object)
    );
  });

  it('calls onReplaceAll when replace all button is clicked', () => {
    render(<ToolbarSearchPanel {...defaultProps} />);
    
    // Enter search text
    const searchInput = screen.getByPlaceholderText('搜索...');
    fireEvent.change(searchInput, { target: { value: 'search text' } });
    
    // Show replace section
    const replaceButton = screen.getByTitle('显示替换');
    fireEvent.click(replaceButton);
    
    // Enter replace text
    const replaceInput = screen.getByPlaceholderText('替换为...');
    fireEvent.change(replaceInput, { target: { value: 'replace text' } });
    
    // Click replace all button
    const doReplaceAllButton = screen.getByTitle('全部替换');
    fireEvent.click(doReplaceAllButton);
    
    // Verify replaceAll was called with correct parameters
    expect(mockReplaceAll).toHaveBeenCalledWith(
      'search text',
      'replace text',
      expect.any(Object)
    );
  });
});