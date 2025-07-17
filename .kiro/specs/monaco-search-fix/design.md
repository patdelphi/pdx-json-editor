# Design Document: Monaco Search Fix

## Overview

The current search and replace functionality in the JSON Editor application has issues with the custom implementation conflicting with Monaco Editor's built-in search features. This design document outlines the approach to fix these issues by leveraging Monaco Editor's native search capabilities, ensuring a more seamless and reliable search experience.

## Current Implementation Analysis

After analyzing the current implementation, we've identified the following issues:

1. The application has a custom search panel (`SearchPanel.tsx`) that conflicts with Monaco Editor's built-in search functionality.
2. The current implementation uses custom state management and decoration handling for search results, which is redundant given Monaco's built-in capabilities.
3. The navigation through search results (`handleFindNext` and `handleFindPrevious`) has issues with synchronization between the custom state and Monaco's internal state.
4. The custom search panel may overlap or conflict with Monaco's native search widget when both are triggered.

## Architecture

The proposed solution will:

1. Replace the custom search panel with Monaco Editor's built-in search widget
2. Modify the search-related functions in `App.tsx` to use Monaco's native search API
3. Update keyboard shortcuts to trigger Monaco's native search functionality
4. Ensure proper integration with the application's UI and theme

### Components and Interfaces

#### App Component

The `App` component will be modified to use Monaco's native search functionality:

```typescript
// Remove or modify these state variables
// const [searchResults, setSearchResults] = useState<any[]>([]);
// const [currentResultIndex, setCurrentResultIndex] = useState(0);
// const [decorationIds, setDecorationIds] = useState<string[]>([]);

// Replace with Monaco's native search functionality
const toggleSearch = () => {
  if (editorRef.current) {
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('keyboard', 'actions.find', {});
    }
  }
};

const toggleReplace = () => {
  if (editorRef.current) {
    const editor = editorRef.current.getEditor();
    if (editor) {
      editor.trigger('keyboard', 'editor.action.startFindReplaceAction', {});
    }
  }
};
```

#### SearchPanel Component

The `SearchPanel` component will be removed or significantly modified:

1. Option 1: Remove the component entirely and rely on Monaco's native search widget
2. Option 2: Modify the component to act as a wrapper/controller for Monaco's native search functionality

For this design, we'll choose Option 1 to fully leverage Monaco's native capabilities.

#### JsonEditor Component

The `JsonEditor` component already has methods for triggering Monaco's search functionality:

```typescript
const find = useCallback(() => {
  if (editorRef.current) {
    editorRef.current.trigger('editor', 'actions.find', {});
  }
}, []);

const replace = useCallback(() => {
  if (editorRef.current) {
    editorRef.current.trigger('editor', 'editor.action.startFindReplaceAction', {});
  }
}, []);
```

These methods will be used directly from the `App` component.

## Implementation Details

### Search Functionality

1. **Triggering Search**:
   - Update the `toggleSearch` function in `App.tsx` to use Monaco's native search widget
   - Update keyboard shortcuts to trigger Monaco's native search functionality
   - Remove custom search panel state and UI

2. **Search Options**:
   - Monaco's native search widget already supports case-sensitive search, regular expression search, and whole word search
   - No additional implementation is needed for these features

3. **Search Result Highlighting**:
   - Monaco's native search functionality already handles highlighting of search results
   - Remove custom decoration handling code

### Replace Functionality

1. **Triggering Replace**:
   - Update the UI to trigger Monaco's native replace functionality
   - Update keyboard shortcuts to trigger Monaco's native replace functionality

2. **Replace Operations**:
   - Monaco's native replace functionality already handles single and batch replace operations
   - Remove custom replace handling code

### UI Integration

1. **Theme Integration**:
   - Monaco's native search widget automatically adapts to the editor's theme
   - No additional styling is needed

2. **Positioning**:
   - Monaco's native search widget is positioned within the editor by default
   - No additional positioning code is needed

## Error Handling

1. **Editor Availability**:
   - Add checks to ensure the editor is available before triggering search functionality
   - Handle cases where the editor or Monaco instances are not available

2. **Search Failures**:
   - Monaco's native search functionality handles search failures gracefully
   - No additional error handling is needed for search operations

## Testing Strategy

1. **Manual Testing**:
   - Test search functionality using Monaco's native search widget
   - Test replace functionality using Monaco's native replace widget
   - Test keyboard shortcuts for search and replace
   - Test search options (case-sensitive, regex, whole word)
   - Test with various JSON document sizes

2. **Integration Testing**:
   - Test the integration of Monaco's search functionality with the application's UI
   - Test the interaction between search functionality and other features

## Implementation Plan

1. Update the `toggleSearch` function in `App.tsx` to use Monaco's native search widget
2. Update the `toggleReplace` function in `App.tsx` to use Monaco's native replace widget
3. Update keyboard shortcuts to trigger Monaco's native search functionality
4. Remove or modify the custom search panel
5. Remove custom search result decoration handling
6. Update the UI to reflect the changes
7. Test the implementation thoroughly