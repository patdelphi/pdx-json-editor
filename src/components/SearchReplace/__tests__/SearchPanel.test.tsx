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
    { line: 2, column: 10, length: 4, text: 'test' }
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

    expect(screen.queryByText('Find')).not.toBeInTheDocument();
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

    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
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

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: false,
        useRegex: false,
        wholeWord: false
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

    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Replace with...')).not.toBeInTheDocument();

    const toggleButton = screen.getByTitle('Toggle replace mode');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Find & Replace')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Replace with...')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
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

    const closeButton = screen.getByTitle('Close search panel');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
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
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Toggle case sensitive
    const caseSensitiveButton = screen.getByTitle('Match case');
    fireEvent.click(caseSensitiveButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: false
      });
    });

    // Toggle whole word
    const wholeWordButton = screen.getByTitle('Match whole word');
    fireEvent.click(wholeWordButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: false,
        wholeWord: true
      });
    });

    // Toggle regex
    const regexButton = screen.getByTitle('Use regular expression');
    fireEvent.click(regexButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        useRegex: true,
        wholeWord: true
      });
    });
  });

  it('should display search results count', () => {
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

    // Add search text to show results
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('1 of 2 results')).toBeInTheDocument();
  });

  it('should show no results message', () => {
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

    // Add search text to show results
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'notfound' } });

    expect(screen.getByText('No results found')).toBeInTheDocument();
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

    const nextButton = screen.getByTitle('Find next (Enter)');
    const prevButton = screen.getByTitle('Find previous (Shift+Enter)');

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

    const searchInput = screen.getByPlaceholderText('Search...');

    // Test Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(mockOnFindNext).toHaveBeenCalled();

    // Test Shift+Enter
    fireEvent.keyDown(searchInput, { key: 'Enter', shiftKey: true });
    expect(mockOnFindPrevious).toHaveBeenCalled();

    // Test Escape key
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
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
    const toggleButton = screen.getByTitle('Toggle replace mode');
    fireEvent.click(toggleButton);

    // Add search and replace text
    const searchInput = screen.getByPlaceholderText('Search...');
    const replaceInput = screen.getByPlaceholderText('Replace with...');
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(replaceInput, { target: { value: 'replacement' } });

    // Test replace
    const replaceButton = screen.getByTitle('Replace current match');
    fireEvent.click(replaceButton);
    
    expect(mockOnReplace).toHaveBeenCalledWith('test', 'replacement', {
      caseSensitive: false,
      useRegex: false,
      wholeWord: false
    });

    // Test replace all
    const replaceAllButton = screen.getByTitle('Replace all matches');
    fireEvent.click(replaceAllButton);
    
    expect(mockOnReplaceAll).toHaveBeenCalledWith('test', 'replacement', {
      caseSensitive: false,
      useRegex: false,
      wholeWord: false
    });
  });

  it('should disable buttons when no results', () => {
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

    const nextButton = screen.getByTitle('Find next (Enter)');
    const prevButton = screen.getByTitle('Find previous (Shift+Enter)');

    expect(nextButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it('should apply dark theme styles', () => {
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
    expect(panel).toHaveClass('bg-gray-800', 'border-gray-700', 'text-gray-100');
  });
});