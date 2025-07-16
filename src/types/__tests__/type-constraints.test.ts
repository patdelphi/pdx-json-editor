import { describe, it, expect } from 'vitest'
import type {
  EditorState,
  EditorAction,
  EditorSettings,
  JsonError,
  FileInfo,
  Theme,
  IndentSize,
  IndentType,
  ErrorSeverity,
} from '../editor.types'

describe('Type Constraints and Edge Cases', () => {
  describe('Theme constraints', () => {
    it('should only accept valid theme values', () => {
      const validThemes: Theme[] = ['light', 'dark']
      
      validThemes.forEach(theme => {
        const state: Partial<EditorState> = { theme }
        expect(['light', 'dark']).toContain(state.theme)
      })
    })
  })

  describe('IndentSize constraints', () => {
    it('should only accept valid indent sizes', () => {
      const validSizes: IndentSize[] = [2, 4]
      
      validSizes.forEach(size => {
        const settings: Partial<EditorSettings> = { indentSize: size }
        expect([2, 4]).toContain(settings.indentSize)
      })
    })
  })

  describe('IndentType constraints', () => {
    it('should only accept valid indent types', () => {
      const validTypes: IndentType[] = ['spaces', 'tabs']
      
      validTypes.forEach(type => {
        const settings: Partial<EditorSettings> = { indentType: type }
        expect(['spaces', 'tabs']).toContain(settings.indentType)
      })
    })
  })

  describe('ErrorSeverity constraints', () => {
    it('should only accept valid error severities', () => {
      const validSeverities: ErrorSeverity[] = ['error', 'warning']
      
      validSeverities.forEach(severity => {
        const error: JsonError = {
          line: 1,
          column: 1,
          message: 'Test error',
          severity,
        }
        expect(['error', 'warning']).toContain(error.severity)
      })
    })
  })

  describe('EditorAction type discrimination', () => {
    it('should properly discriminate action types', () => {
      const actions: EditorAction[] = [
        { type: 'SET_CONTENT', payload: 'test' },
        { type: 'SET_VALIDATION_ERRORS', payload: [] },
        { type: 'SET_FILE', payload: null },
        { type: 'SET_THEME', payload: 'dark' },
        { type: 'UPDATE_SETTINGS', payload: { indentSize: 4 } },
        { type: 'TOGGLE_SEARCH_PANEL' },
        { type: 'SET_DIRTY', payload: true },
        { type: 'TOGGLE_SETTINGS' },
        { type: 'TOGGLE_SIDEBAR' },
        { type: 'ADD_RECENT_FILE', payload: {
          name: 'test.json',
          size: 100,
          lastModified: new Date(),
          content: '{}',
        }},
      ]

      actions.forEach(action => {
        expect(action.type).toBeDefined()
        
        // Type-specific payload validation
        switch (action.type) {
          case 'SET_CONTENT':
            expect(typeof action.payload).toBe('string')
            break
          case 'SET_VALIDATION_ERRORS':
            expect(Array.isArray(action.payload)).toBe(true)
            break
          case 'SET_FILE':
            expect(action.payload === null || typeof action.payload === 'object').toBe(true)
            break
          case 'SET_THEME':
            expect(['light', 'dark']).toContain(action.payload)
            break
          case 'UPDATE_SETTINGS':
            expect(typeof action.payload).toBe('object')
            break
          case 'SET_DIRTY':
            expect(typeof action.payload).toBe('boolean')
            break
          case 'ADD_RECENT_FILE':
            expect(action.payload).toHaveProperty('name')
            expect(action.payload).toHaveProperty('size')
            expect(action.payload).toHaveProperty('lastModified')
            expect(action.payload).toHaveProperty('content')
            break
          case 'TOGGLE_SEARCH_PANEL':
          case 'TOGGLE_SETTINGS':
          case 'TOGGLE_SIDEBAR':
            expect(action).not.toHaveProperty('payload')
            break
        }
      })
    })
  })

  describe('Complex type interactions', () => {
    it('should handle nested type structures correctly', () => {
      const complexState: EditorState = {
        content: '{"nested": {"object": {"with": "values"}}}',
        isValid: true,
        errors: [
          {
            line: 1,
            column: 15,
            message: 'Potential issue',
            severity: 'warning',
          },
        ],
        isDirty: true,
        currentFile: {
          name: 'complex.json',
          size: 2048,
          lastModified: new Date('2023-12-01T10:30:00Z'),
          content: '{"nested": {"object": {"with": "values"}}}',
        },
        theme: 'dark',
        settings: {
          indentSize: 4,
          indentType: 'spaces',
          wordWrap: true,
          lineNumbers: true,
          minimap: true,
        },
      }

      // Validate the complex structure
      expect(complexState.content).toContain('nested')
      expect(complexState.errors).toHaveLength(1)
      expect(complexState.errors[0].severity).toBe('warning')
      expect(complexState.currentFile?.name).toBe('complex.json')
      expect(complexState.currentFile?.size).toBe(2048)
      expect(complexState.settings.indentSize).toBe(4)
      expect(complexState.settings.indentType).toBe('spaces')
    })

    it('should handle partial updates correctly', () => {
      const partialSettings: Partial<EditorSettings> = {
        indentSize: 2,
        wordWrap: false,
      }

      const updateAction: EditorAction = {
        type: 'UPDATE_SETTINGS',
        payload: partialSettings,
      }

      expect(updateAction.payload.indentSize).toBe(2)
      expect(updateAction.payload.wordWrap).toBe(false)
      expect(updateAction.payload.indentType).toBeUndefined()
      expect(updateAction.payload.lineNumbers).toBeUndefined()
      expect(updateAction.payload.minimap).toBeUndefined()
    })
  })

  describe('File handling edge cases', () => {
    it('should handle empty files correctly', () => {
      const emptyFile: FileInfo = {
        name: 'empty.json',
        size: 0,
        lastModified: new Date(),
        content: '',
      }

      expect(emptyFile.size).toBe(0)
      expect(emptyFile.content).toBe('')
      expect(emptyFile.name).toBe('empty.json')
    })

    it('should handle large files correctly', () => {
      const largeFile: FileInfo = {
        name: 'large.json',
        size: 1024 * 1024, // 1MB
        lastModified: new Date(),
        content: '{"large": "content"}',
      }

      expect(largeFile.size).toBe(1048576)
      expect(largeFile.content).toBe('{"large": "content"}')
    })

    it('should handle files with special characters', () => {
      const specialFile: FileInfo = {
        name: 'special-file_name.json',
        size: 100,
        lastModified: new Date(),
        content: '{"unicode": "测试", "emoji": "🚀", "special": "chars!@#$%"}',
      }

      expect(specialFile.name).toBe('special-file_name.json')
      expect(specialFile.content).toContain('测试')
      expect(specialFile.content).toContain('🚀')
      expect(specialFile.content).toContain('chars!@#$%')
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle multiple errors on same line', () => {
      const errors: JsonError[] = [
        {
          line: 5,
          column: 10,
          message: 'Missing comma',
          severity: 'error',
        },
        {
          line: 5,
          column: 15,
          message: 'Unexpected token',
          severity: 'error',
        },
      ]

      expect(errors).toHaveLength(2)
      expect(errors[0].line).toBe(errors[1].line)
      expect(errors[0].column).not.toBe(errors[1].column)
    })

    it('should handle mixed severity errors', () => {
      const mixedErrors: JsonError[] = [
        {
          line: 1,
          column: 1,
          message: 'Critical error',
          severity: 'error',
        },
        {
          line: 2,
          column: 5,
          message: 'Style warning',
          severity: 'warning',
        },
        {
          line: 3,
          column: 8,
          message: 'Another error',
          severity: 'error',
        },
      ]

      const errorCount = mixedErrors.filter(e => e.severity === 'error').length
      const warningCount = mixedErrors.filter(e => e.severity === 'warning').length

      expect(errorCount).toBe(2)
      expect(warningCount).toBe(1)
    })
  })
})