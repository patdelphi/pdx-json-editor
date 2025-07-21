/**
 * Schema服务测试
 */

import { 
  getAllSchemas, 
  getUserSchemas, 
  addUserSchema, 
  deleteUserSchema, 
  updateUserSchema,
  detectSchema
} from '../schemaService';

// 模拟localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('schemaService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  test('getAllSchemas应返回预定义和用户Schema', () => {
    // 模拟用户Schema
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([
      { id: 'user-schema-1', name: 'Test Schema', uri: 'http://example.com/schema.json' }
    ]));
    
    const schemas = getAllSchemas();
    
    // 应包含预定义Schema和用户Schema
    expect(schemas.length).toBeGreaterThan(1);
    expect(schemas.find(s => s.id === 'user-schema-1')).toBeDefined();
    expect(schemas.find(s => s.id === 'package.json')).toBeDefined();
  });
  
  test('getUserSchemas应返回用户Schema', () => {
    const mockSchemas = [
      { id: 'user-schema-1', name: 'Test Schema 1' },
      { id: 'user-schema-2', name: 'Test Schema 2' }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockSchemas));
    
    const userSchemas = getUserSchemas();
    
    expect(userSchemas).toEqual(mockSchemas);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('pdx-json-editor-schemas');
  });
  
  test('addUserSchema应添加新Schema并返回更新后的列表', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));
    
    const newSchema = {
      name: 'New Schema',
      uri: 'http://example.com/new-schema.json'
    };
    
    const updatedSchemas = addUserSchema(newSchema);
    
    expect(updatedSchemas.length).toBe(1);
    expect(updatedSchemas[0].name).toBe('New Schema');
    expect(updatedSchemas[0].predefined).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  test('deleteUserSchema应删除指定Schema', () => {
    const mockSchemas = [
      { id: 'user-schema-1', name: 'Test Schema 1' },
      { id: 'user-schema-2', name: 'Test Schema 2' }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockSchemas));
    
    const updatedSchemas = deleteUserSchema('user-schema-1');
    
    expect(updatedSchemas.length).toBe(1);
    expect(updatedSchemas[0].id).toBe('user-schema-2');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  test('updateUserSchema应更新指定Schema', () => {
    const mockSchemas = [
      { id: 'user-schema-1', name: 'Test Schema 1', uri: 'http://example.com/1' },
      { id: 'user-schema-2', name: 'Test Schema 2', uri: 'http://example.com/2' }
    ];
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockSchemas));
    
    const updatedSchema = {
      name: 'Updated Schema',
      uri: 'http://example.com/updated'
    };
    
    const updatedSchemas = updateUserSchema('user-schema-1', updatedSchema);
    
    expect(updatedSchemas.length).toBe(2);
    expect(updatedSchemas[0].name).toBe('Updated Schema');
    expect(updatedSchemas[0].uri).toBe('http://example.com/updated');
    expect(updatedSchemas[1].name).toBe('Test Schema 2');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  test('detectSchema应检测匹配的Schema', () => {
    // 测试package.json检测
    const packageJson = JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
      dependencies: {
        'react': '^17.0.0'
      }
    });
    
    expect(detectSchema(packageJson)).toBe('package.json');
    
    // 测试tsconfig.json检测
    const tsconfigJson = JSON.stringify({
      compilerOptions: {
        target: 'es5'
      },
      include: ['src/**/*.ts']
    });
    
    expect(detectSchema(tsconfigJson)).toBe('tsconfig.json');
    
    // 测试无效JSON
    expect(detectSchema('{')).toBeNull();
    
    // 测试无匹配Schema
    const unknownJson = JSON.stringify({
      foo: 'bar'
    });
    
    expect(detectSchema(unknownJson)).toBeNull();
  });
});