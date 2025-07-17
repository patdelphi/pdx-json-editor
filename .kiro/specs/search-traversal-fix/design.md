# Design Document: Search Traversal Fix

## Overview

The search traversal functionality in the JSON Editor application is currently not working properly. Users are unable to navigate through search results using the previous and next buttons. This design document outlines the approach to fix this issue, ensuring that users can efficiently navigate through search matches in their JSON documents.

## Current Implementation Analysis

After analyzing the current implementation, we've identified the following issues:

1. The `handleFindNext` and `handleFindPrevious` functions in `App.tsx` have logic issues that prevent proper navigation through search results.
2. The Monaco editor's selection and decoration handling in these functions is not correctly updating the visual state.
3. The current implementation attempts to create new decorations for all search results on each navigation, which is inefficient.

## Architecture

The search functionality is split between two main components:

1. **App.tsx**: Contains the core search logic, including:
   - `handleSearch`: Performs the search and stores results
   - `handleFindNext`: Navigates to the next result
   - `handleFindPrevious`: Navigates to the previous result
   - Decoration management for highlighting search results

2. **SearchPanel.tsx**: Provides the UI for search functionality, including:
   - Search input and options
   - Navigation buttons
   - Result counter display

The fix will focus on correcting the navigation logic in `App.tsx` while maintaining the existing component structure.

## Components and Interfaces

### App Component

The `App` component will be modified to fix the search traversal functionality:

```typescript
// Key state variables
const [searchResults, setSearchResults] = useState<any[]>([]);
const [currentResultIndex, setCurrentResultIndex] = useState(0);
const [decorationIds, setDecorationIds] = useState<string[]>([]);

// Fixed navigation functions
const handleFindNext = () => {
  // Logic to navigate to next result
};

const handleFindPrevious = () => {
  // Logic to navigate to previous result
};
```

### SearchPanel Component

The `SearchPanel` component will remain largely unchanged, as it already has the correct UI elements and event handlers:

```typescript
interface SearchPanelProps {
  // Existing props
  onFindNext: () => void;
  onFindPrevious: () => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
}
```

## Data Models

The existing data models will be maintained:

```typescript
interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}
```

## Implementation Details

### Search Result Navigation

The core issue is in the navigation logic. We'll implement a more robust approach:

1. **Navigation Logic**:
   - Properly calculate the next/previous index with wrapping
   - Ensure the index is always valid within the search results array bounds
   - Update the current result index state

2. **Visual Feedback**:
   - Apply distinct highlighting to the current result
   - Ensure the editor scrolls to make the current result visible
   - Update all decorations efficiently

### Decoration Management

We'll optimize the decoration handling:

1. Create a helper function to update decorations that can be reused by both navigation functions
2. Ensure decorations are properly applied to all search results with special styling for the current result
3. Use Monaco editor's decoration API more efficiently

## Error Handling

1. Add validation to ensure search results exist before attempting navigation
2. Handle edge cases such as empty search results or invalid indices
3. Ensure the editor and Monaco instances are available before performing operations

## Testing Strategy

1. **Manual Testing**:
   - Test navigation through search results using buttons
   - Test navigation using keyboard shortcuts
   - Test edge cases (first/last result, empty results)
   - Test with various JSON document sizes

2. **Automated Testing** (if applicable):
   - Unit tests for navigation logic
   - Integration tests for search functionality

## Implementation Plan

1. Fix the `handleFindNext` and `handleFindPrevious` functions in `App.tsx`
2. Create a helper function for updating decorations to avoid code duplication
3. Ensure proper index calculation with wrapping behavior
4. Verify that the editor scrolls to the current result
5. Test the implementation thoroughly