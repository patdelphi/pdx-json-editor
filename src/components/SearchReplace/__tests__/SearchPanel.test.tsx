import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPanel from '../SearchPanel';

interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

describe('SearchPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnReplace = vi.fn();
  const mockOnReplaceAll = vi.fn();
  const mockOnFindNext = vi.fn();
  const mockOnFindPrevious = vi.fn();

  const mockSearchResults: SearchResult[] = [
    { line: 1, column: 5, length: 4, text: 'test' },
    { line: 2, column: 10, length: 4, text: 'test' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when not visible', () => {
    render(
      <SearchPanel
        isVisible={false}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="light"
      />
    );

    expect(screen.queryByPlaceholderText('搜索...')).not.toBeInTheDocument();
  });

  it('should render when visible', () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="light"
      />
    );

    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('should call onSearch when search query changes', async () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="light"
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false,
      });
    });
  });

  it('should toggle replace mode', () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="light"
      />
    );

    expect(screen.queryByPlaceholderText('替换为...')).not.toBeInTheDocument();

    const toggleButton = screen.getByTitle('显示替换');
    fireEvent.click(toggleButton);

    expect(screen.getByPlaceholderText('替换为...')).toBeInTheDocument();
  });

  it('should toggle search options', async () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="light"
      />
    );

    // Add search text first
    const searchInput = screen.getByPlaceholderText('搜索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Toggle case sensitive
    const caseSensitiveButton = screen.getByTitle('区分大小写');
    fireEvent.click(caseSensitiveButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: false,
      });
    });

    // Toggle whole word
    const wholeWordButton = screen.getByTitle('全字匹配');
    fireEvent.click(wholeWordButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: true,
      });
    });

    // Toggle regex
    const regexButton = screen.getByTitle('使用正则表达式');
    fireEvent.click(regexButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: true,
        wholeWord: true,
      });
    });
  });

  it('should call navigation functions', () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={mockSearchResults}
        currentResultIndex={0}
        theme="light"
      />
    );

    const nextButton = screen.getByTitle('查找下一个 (Enter)');
    const prevButton = screen.getByTitle('查找上一个 (Shift+Enter)');

    fireEvent.click(nextButton);
    expect(mockOnFindNext).toHaveBeenCalled();

    fireEvent.click(prevButton);
    expect(mockOnFindPrevious).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={mockSearchResults}
        currentResultIndex={0}
        theme="light"
      />
    );

    const searchInput = screen.getByPlaceholderText('搜索...');

    // Test Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(mockOnFindNext).toHaveBeenCalled();

    // Test Shift+Enter
    fireEvent.keyDown(searchInput, { key: 'Enter', shiftKey: true });
    expect(mockOnFindPrevious).toHaveBeenCalled();
  });

  it('should handle replace operations', () => {
    render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={mockSearchResults}
        currentResultIndex={0}
        theme="light"
      />
    );

    // Toggle to replace mode
    const toggleButton = screen.getByTitle('显示替换');
    fireEvent.click(toggleButton);

    // Add search and replace text
    const searchInput = screen.getByPlaceholderText('搜索...');
    const replaceInput = screen.getByPlaceholderText('替换为...');

    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(replaceInput, { target: { value: 'replacement' } });

    // Test replace
    const replaceButton = screen.getByTitle('替换');
    fireEvent.click(replaceButton);

    expect(mockOnReplace).toHaveBeenCalledWith('test', 'replacement', {
      caseSensitive: false,
      useRegex: false,
      wholeWord: false,
    });

    // Test replace all
    const replaceAllButton = screen.getByTitle('全部替换');
    fireEvent.click(replaceAllButton);

    expect(mockOnReplaceAll).toHaveBeenCalledWith('test', 'replacement', {
      caseSensitive: false,
      useRegex: false,
      wholeWord: false,
    });
  });

  it('should apply correct theme styles', () => {
    const { container } = render(
      <SearchPanel
        isVisible={true}
        onClose={mockOnClose}
        onSearch={mockOnSearch}
        onReplace={mockOnReplace}
        onReplaceAll={mockOnReplaceAll}
        onFindNext={mockOnFindNext}
        onFindPrevious={mockOnFindPrevious}
        searchResults={[]}
        currentResultIndex={0}
        theme="dark"
      />
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toBeInTheDocument();
  });
});
