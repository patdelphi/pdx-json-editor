export interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

export class SearchService {
  /**
   * Search for text in content
   * @param content The content to search in
   * @param query The search query
   * @param options Search options
   * @returns Array of search results
   */
  static search(
    content: string,
    query: string,
    options: SearchOptions
  ): SearchResult[] {
    if (!query.trim() || !content) {
      return [];
    }

    const results: SearchResult[] = [];
    const lines = content.split('\n');

    try {
      const searchRegex = this.createSearchRegex(query, options);

      lines.forEach((line, lineIndex) => {
        let match;
        const regex = new RegExp(searchRegex.source, searchRegex.flags + 'g');

        while ((match = regex.exec(line)) !== null) {
          results.push({
            line: lineIndex + 1, // 1-based line numbers
            column: match.index + 1, // 1-based column numbers
            length: match[0].length,
            text: match[0],
          });

          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      });
    } catch (error) {
      console.error('Search error:', error);
      // Return empty results for invalid regex
      return [];
    }

    return results;
  }

  /**
   * Replace text in content
   * @param content The content to replace in
   * @param searchQuery The search query
   * @param replaceText The replacement text
   * @param options Search options
   * @param replaceAll Whether to replace all occurrences
   * @returns Object with new content and number of replacements
   */
  static replace(
    content: string,
    searchQuery: string,
    replaceText: string,
    options: SearchOptions,
    replaceAll: boolean = false
  ): { content: string; replacements: number } {
    if (!searchQuery.trim() || !content) {
      return { content, replacements: 0 };
    }

    try {
      const searchRegex = this.createSearchRegex(searchQuery, options);
      const flags = searchRegex.flags + (replaceAll ? 'g' : '');
      const regex = new RegExp(searchRegex.source, flags);

      let replacements = 0;
      const newContent = content.replace(regex, (match) => {
        replacements++;
        return replaceAll || replacements === 1 ? replaceText : match;
      });

      return { content: newContent, replacements };
    } catch (error) {
      console.error('Replace error:', error);
      return { content, replacements: 0 };
    }
  }

  /**
   * Replace text at specific position
   * @param content The content to replace in
   * @param line Line number (1-based)
   * @param column Column number (1-based)
   * @param length Length of text to replace
   * @param replaceText The replacement text
   * @returns New content with replacement
   */
  static replaceAt(
    content: string,
    line: number,
    column: number,
    length: number,
    replaceText: string
  ): string {
    const lines = content.split('\n');

    if (line < 1 || line > lines.length) {
      return content;
    }

    const targetLine = lines[line - 1];
    const startIndex = column - 1;
    const endIndex = startIndex + length;

    if (startIndex < 0 || startIndex > targetLine.length) {
      return content;
    }

    const newLine =
      targetLine.substring(0, startIndex) +
      replaceText +
      targetLine.substring(endIndex);

    lines[line - 1] = newLine;
    return lines.join('\n');
  }

  /**
   * Create regex for search based on options
   * @param query The search query
   * @param options Search options
   * @returns RegExp object
   */
  private static createSearchRegex(
    query: string,
    options: SearchOptions
  ): RegExp {
    let pattern = query;
    const flags = options.caseSensitive ? '' : 'i';

    if (!options.useRegex) {
      // Escape special regex characters
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    return new RegExp(pattern, flags);
  }

  /**
   * Validate regex pattern
   * @param pattern The regex pattern to validate
   * @returns True if valid, false otherwise
   */
  static isValidRegex(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Escape special regex characters
   * @param text The text to escape
   * @returns Escaped text
   */
  static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get line and column from character index
   * @param content The content
   * @param index Character index
   * @returns Line and column numbers (1-based)
   */
  static getLineColumnFromIndex(
    content: string,
    index: number
  ): { line: number; column: number } {
    const beforeIndex = content.substring(0, index);
    const lines = beforeIndex.split('\n');

    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  /**
   * Get character index from line and column
   * @param content The content
   * @param line Line number (1-based)
   * @param column Column number (1-based)
   * @returns Character index
   */
  static getIndexFromLineColumn(
    content: string,
    line: number,
    column: number
  ): number {
    const lines = content.split('\n');

    if (line < 1 || line > lines.length) {
      return -1;
    }

    let index = 0;
    for (let i = 0; i < line - 1; i++) {
      index += lines[i].length + 1; // +1 for newline character
    }

    index += Math.max(0, Math.min(column - 1, lines[line - 1].length));
    return index;
  }
}
