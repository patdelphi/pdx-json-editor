/**
 * JSON Schema Hook
 * 提供JSON Schema管理和应用功能
 */

import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { 
  getAllSchemas, 
  configureJsonSchema, 
  detectSchema,
  addUserSchema,
  deleteUserSchema,
  updateUserSchema
} from '../services/schemaService';
import PersistenceService from '../services/persistenceService';
import errorService from '../services/errorService';

/**
 * 使用JSON Schema的Hook
 * @param {Object} monaco - Monaco实例
 * @param {string} jsonContent - JSON内容
 * @returns {{
 *   schemas: Object[],
 *   selectedSchemaId: string|null,
 *   setSelectedSchemaId: (id: string|null) => void,
 *   addSchema: (schema: Object) => void,
 *   deleteSchema: (id: string) => void,
 *   updateSchema: (id: string, schema: Object) => void,
 *   autoDetectSchema: () => string|null
 * }} - JSON Schema相关状态和方法
 */
export const useJsonSchema = (monaco, jsonContent) => {
  const [schemas, setSchemas] = useState([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState(null);
  // 添加一个引用来跟踪最新的Schema ID
  const latestSchemaIdRef = useRef(selectedSchemaId);
  
  // 加载所有可用的Schema
  useEffect(() => {
    // 先加载内置Schema
    const builtInSchemas = getAllSchemas();
    
    // 尝试从本地存储加载用户Schema
    try {
      const savedSchemas = PersistenceService.loadSchemas();
      if (savedSchemas && Array.isArray(savedSchemas)) {
        // 合并内置Schema和用户Schema，确保没有重复
        const userSchemas = savedSchemas.filter(
          schema => !builtInSchemas.some(s => s.id === schema.id)
        );
        
        setSchemas([...builtInSchemas, ...userSchemas]);
        return;
      }
    } catch (error) {
      errorService.handleError(error);
    }
    
    // 如果没有保存的Schema或加载失败，使用内置Schema
    setSchemas(builtInSchemas);
  }, []);
  
  // 当选择的Schema ID变化时，配置Monaco编辑器
  useEffect(() => {
    // 更新引用以跟踪最新的Schema ID
    latestSchemaIdRef.current = selectedSchemaId;
    
    if (monaco) {
      configureJsonSchema(monaco, selectedSchemaId);
    }
  }, [monaco, selectedSchemaId]);
  
  // 添加新的Schema
  const addSchema = useCallback((schema) => {
    addUserSchema(schema);
    const allSchemas = [...getAllSchemas()];
    setSchemas(allSchemas);
    
    // 保存到本地存储
    try {
      // 只保存用户自定义的Schema
      const userSchemas = allSchemas.filter(s => !s.predefined);
      PersistenceService.saveSchemas(userSchemas);
    } catch (error) {
      errorService.handleError(error);
    }
    
    return schema;
  }, []);
  
  // 删除Schema
  const deleteSchema = useCallback((id) => {
    // 只能删除用户自定义的Schema
    const schema = schemas.find(s => s.id === id);
    if (schema && !schema.predefined) {
      deleteUserSchema(id);
      const allSchemas = [...getAllSchemas()];
      setSchemas(allSchemas);
      
      // 如果删除的是当前选中的Schema，清除选择
      if (selectedSchemaId === id) {
        setSelectedSchemaId(null);
      }
      
      // 保存到本地存储
      try {
        // 只保存用户自定义的Schema
        const userSchemas = allSchemas.filter(s => !s.predefined);
        PersistenceService.saveSchemas(userSchemas);
      } catch (error) {
        errorService.handleError(error);
      }
    }
  }, [schemas, selectedSchemaId]);
  
  // 更新Schema
  const updateSchema = useCallback((id, updatedSchema) => {
    // 只能更新用户自定义的Schema
    const schema = schemas.find(s => s.id === id);
    if (schema && !schema.predefined) {
      updateUserSchema(id, updatedSchema);
      const allSchemas = [...getAllSchemas()];
      setSchemas(allSchemas);
      
      // 保存到本地存储
      try {
        // 只保存用户自定义的Schema
        const userSchemas = allSchemas.filter(s => !s.predefined);
        PersistenceService.saveSchemas(userSchemas);
      } catch (error) {
        errorService.handleError(error);
      }
    }
  }, [schemas]);
  
  // 自动检测Schema
  const autoDetectSchema = useCallback(() => {
    if (!jsonContent) return null;
    
    const detectedSchemaId = detectSchema(jsonContent);
    if (detectedSchemaId) {
      setSelectedSchemaId(detectedSchemaId);
    }
    
    return detectedSchemaId;
  }, [jsonContent]);
  
  return {
    schemas,
    selectedSchemaId,
    setSelectedSchemaId,
    addSchema,
    deleteSchema,
    updateSchema,
    autoDetectSchema
  };
};