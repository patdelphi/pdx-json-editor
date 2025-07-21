/**
 * useJsonSchema Hook测试
 */

import { renderHook, act } from '@testing-library/preact-hooks';
import { useJsonSchema } from '../useJsonSchema';
import * as schemaService from '../../services/schemaService';

// 模拟schemaService
jest.mock('../../services/schemaService', () => ({
  getAllSchemas: jest.fn(),
  configureJsonSchema: jest.fn(),
  detectSchema: jest.fn(),
  addUserSchema: jest.fn(),
  deleteUserSchema: jest.fn(),
  updateUserSchema: jest.fn()
}));

describe('useJsonSchema', () => {
  const mockMonaco = {};
  const mockJsonContent = '{"name": "test"}';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟getAllSchemas返回值
    schemaService.getAllSchemas.mockReturnValue([
      { id: 'schema1', name: 'Schema 1', predefined: true },
      { id: 'schema2', name: 'Schema 2', predefined: true },
      { id: 'user-schema', name: 'User Schema', predefined: false }
    ]);
  });
  
  test('应加载所有可用的Schema', () => {
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    expect(schemaService.getAllSchemas).toHaveBeenCalled();
    expect(result.current.schemas.length).toBe(3);
  });
  
  test('设置selectedSchemaId应配置Monaco编辑器', () => {
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    act(() => {
      result.current.setSelectedSchemaId('schema1');
    });
    
    expect(schemaService.configureJsonSchema).toHaveBeenCalledWith(mockMonaco, 'schema1');
    expect(result.current.selectedSchemaId).toBe('schema1');
  });
  
  test('addSchema应调用schemaService.addUserSchema', () => {
    schemaService.addUserSchema.mockReturnValue([{ id: 'new-schema', name: 'New Schema' }]);
    
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    const newSchema = { name: 'New Schema', uri: 'http://example.com/schema.json' };
    
    act(() => {
      result.current.addSchema(newSchema);
    });
    
    expect(schemaService.addUserSchema).toHaveBeenCalledWith(newSchema);
    expect(schemaService.getAllSchemas).toHaveBeenCalled();
  });
  
  test('deleteSchema应调用schemaService.deleteUserSchema', () => {
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    act(() => {
      result.current.deleteSchema('user-schema');
    });
    
    expect(schemaService.deleteUserSchema).toHaveBeenCalledWith('user-schema');
    expect(schemaService.getAllSchemas).toHaveBeenCalled();
  });
  
  test('updateSchema应调用schemaService.updateUserSchema', () => {
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    const updatedSchema = { name: 'Updated Schema' };
    
    act(() => {
      result.current.updateSchema('user-schema', updatedSchema);
    });
    
    expect(schemaService.updateUserSchema).toHaveBeenCalledWith('user-schema', updatedSchema);
    expect(schemaService.getAllSchemas).toHaveBeenCalled();
  });
  
  test('autoDetectSchema应调用schemaService.detectSchema并设置selectedSchemaId', () => {
    schemaService.detectSchema.mockReturnValue('schema1');
    
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    let detectedSchema;
    act(() => {
      detectedSchema = result.current.autoDetectSchema();
    });
    
    expect(schemaService.detectSchema).toHaveBeenCalledWith(mockJsonContent);
    expect(detectedSchema).toBe('schema1');
    expect(result.current.selectedSchemaId).toBe('schema1');
  });
  
  test('autoDetectSchema在未检测到Schema时应返回null', () => {
    schemaService.detectSchema.mockReturnValue(null);
    
    const { result } = renderHook(() => useJsonSchema(mockMonaco, mockJsonContent));
    
    let detectedSchema;
    act(() => {
      detectedSchema = result.current.autoDetectSchema();
    });
    
    expect(schemaService.detectSchema).toHaveBeenCalledWith(mockJsonContent);
    expect(detectedSchema).toBeNull();
    expect(result.current.selectedSchemaId).toBeNull();
  });
});