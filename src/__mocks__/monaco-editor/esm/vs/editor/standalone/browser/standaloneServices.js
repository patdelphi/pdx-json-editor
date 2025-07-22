/**
 * Monaco Editor Standalone Services Mock
 */

export const StandaloneServices = {
  initialize: jest.fn(),
  get: jest.fn(() => ({
    instantiationService: {
      createInstance: jest.fn()
    },
    editorService: {
      openEditor: jest.fn()
    },
    codeEditorService: {
      openCodeEditor: jest.fn()
    }
  }))
};