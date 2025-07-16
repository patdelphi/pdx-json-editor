import { describe, it, expect } from 'vitest'
import type {
  Optional,
  RequiredFields,
  EventHandler,
  EventHandlerWithPayload,
  ApiResponse,
  FileOperationResult,
  ValidationResult,
  FormatResult,
  FileInfo,
  JsonError,
} from '../index'

describe('Utility Types', () => {
  describe('Optional<T, K>', () => {
    interface TestInterface {
      required: string
      optional: number
      alsoOptional: boolean
    }

    it('should make specified fields optional', () => {
      type PartialTest = Optional<TestInterface, 'optional' | 'alsoOptional'>

      const validObject: PartialTest = {
        required: 'test',
        // optional and alsoOptional are now optional
      }

      const fullObject: PartialTest = {
        required: 'test',
        optional: 42,
        alsoOptional: true,
      }

      expect(validObject.required).toBe('test')
      expect(fullObject.optional).toBe(42)
      expect(fullObject.alsoOptional).toBe(true)
    })
  })

  describe('RequiredFields<T, K>', () => {
    interface TestInterface {
      field1?: string
      field2?: number
      field3: boolean
    }

    it('should make specified optional fields required', () => {
      type RequiredTest = RequiredFields<TestInterface, 'field1' | 'field2'>

      const validObject: RequiredTest = {
        field1: 'required now',
        field2: 42,
        field3: true,
      }

      expect(validObject.field1).toBe('required now')
      expect(validObject.field2).toBe(42)
      expect(validObject.field3).toBe(true)
    })
  })

  describe('EventHandler<T>', () => {
    it('should define a function that returns T', () => {
      const voidHandler: EventHandler = () => {}
      const stringHandler: EventHandler<string> = () => 'result'
      const numberHandler: EventHandler<number> = () => 42

      expect(typeof voidHandler).toBe('function')
      expect(typeof stringHandler).toBe('function')
      expect(typeof numberHandler).toBe('function')
      expect(stringHandler()).toBe('result')
      expect(numberHandler()).toBe(42)
    })
  })

  describe('EventHandlerWithPayload<P, T>', () => {
    it('should define a function that takes payload P and returns T', () => {
      const stringHandler: EventHandlerWithPayload<string> = (payload: string) => {
        console.log(payload)
      }
      const numberHandler: EventHandlerWithPayload<number, string> = (payload: number) => {
        return payload.toString()
      }

      expect(typeof stringHandler).toBe('function')
      expect(typeof numberHandler).toBe('function')
      expect(numberHandler(42)).toBe('42')
    })
  })

  describe('ApiResponse<T>', () => {
    it('should have correct structure for successful response', () => {
      const successResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBe('test data')
      expect(successResponse.error).toBeUndefined()
    })

    it('should have correct structure for error response', () => {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Something went wrong',
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Something went wrong')
      expect(errorResponse.data).toBeUndefined()
    })

    it('should work with complex data types', () => {
      interface ComplexData {
        id: number
        name: string
        items: string[]
      }

      const complexResponse: ApiResponse<ComplexData> = {
        success: true,
        data: {
          id: 1,
          name: 'Test',
          items: ['item1', 'item2'],
        },
      }

      expect(complexResponse.success).toBe(true)
      expect(complexResponse.data?.id).toBe(1)
      expect(complexResponse.data?.items).toHaveLength(2)
    })
  })

  describe('FileOperationResult', () => {
    it('should have correct structure for successful file operation', () => {
      const fileInfo: FileInfo = {
        name: 'test.json',
        size: 1024,
        lastModified: new Date('2023-01-01'),
        content: '{"test": true}',
      }

      const successResult: FileOperationResult = {
        success: true,
        file: fileInfo,
      }

      expect(successResult.success).toBe(true)
      expect(successResult.file?.name).toBe('test.json')
      expect(successResult.error).toBeUndefined()
    })

    it('should have correct structure for failed file operation', () => {
      const errorResult: FileOperationResult = {
        success: false,
        error: 'File not found',
      }

      expect(errorResult.success).toBe(false)
      expect(errorResult.error).toBe('File not found')
      expect(errorResult.file).toBeUndefined()
    })
  })

  describe('ValidationResult', () => {
    it('should have correct structure for valid JSON', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: [],
      }

      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)
    })

    it('should have correct structure for invalid JSON', () => {
      const errors: JsonError[] = [
        {
          line: 1,
          column: 5,
          message: 'Unexpected token',
          severity: 'error',
        },
        {
          line: 2,
          column: 10,
          message: 'Missing comma',
          severity: 'warning',
        },
      ]

      const invalidResult: ValidationResult = {
        isValid: false,
        errors,
      }

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toHaveLength(2)
      expect(invalidResult.errors[0].message).toBe('Unexpected token')
      expect(invalidResult.errors[1].severity).toBe('warning')
    })
  })

  describe('FormatResult', () => {
    it('should have correct structure for successful formatting', () => {
      const successResult: FormatResult = {
        success: true,
        content: '{\n  "formatted": true\n}',
      }

      expect(successResult.success).toBe(true)
      expect(successResult.content).toContain('formatted')
      expect(successResult.error).toBeUndefined()
    })

    it('should have correct structure for failed formatting', () => {
      const errorResult: FormatResult = {
        success: false,
        error: 'Invalid JSON syntax',
      }

      expect(errorResult.success).toBe(false)
      expect(errorResult.error).toBe('Invalid JSON syntax')
      expect(errorResult.content).toBeUndefined()
    })
  })
})