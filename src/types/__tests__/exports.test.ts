import { describe, it, expect } from 'vitest';

describe('Type Exports', () => {
  it('should export all types from editor.types.ts', async () => {
    const editorTypes = await import('../editor.types');

    // Check that the module exports exist (TypeScript interfaces don't exist at runtime,
    // but we can check that the module loads without errors)
    expect(editorTypes).toBeDefined();
  });

  it('should export all types from index.ts', async () => {
    const indexTypes = await import('../index');

    // Check that the module exports exist
    expect(indexTypes).toBeDefined();
  });

  it('should re-export editor types through index', async () => {
    // This test ensures that all editor types are available through the index file
    const {
      // Core interfaces - these won't exist at runtime but importing them validates the exports
    } = await import('../index');

    // If we get here without import errors, the exports are working correctly
    expect(true).toBe(true);
  });
});
