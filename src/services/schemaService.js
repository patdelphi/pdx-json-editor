/**
 * JSON Schema服务
 * 提供JSON Schema加载、管理和验证功能
 */

// 预定义的常用JSON Schema
const PREDEFINED_SCHEMAS = {
  'package.json': {
    uri: 'https://json.schemastore.org/package.json',
    fileMatch: ['package.json'],
    name: 'NPM包配置',
    description: 'NPM包配置文件的JSON Schema'
  },
  'tsconfig.json': {
    uri: 'https://json.schemastore.org/tsconfig.json',
    fileMatch: ['tsconfig.json'],
    name: 'TypeScript配置',
    description: 'TypeScript配置文件的JSON Schema'
  },
  'eslintrc.json': {
    uri: 'https://json.schemastore.org/eslintrc.json',
    fileMatch: ['.eslintrc', '.eslintrc.json'],
    name: 'ESLint配置',
    description: 'ESLint配置文件的JSON Schema'
  },
  'prettierrc.json': {
    uri: 'https://json.schemastore.org/prettierrc.json',
    fileMatch: ['.prettierrc', '.prettierrc.json'],
    name: 'Prettier配置',
    description: 'Prettier配置文件的JSON Schema'
  },
  'swagger.json': {
    uri: 'https://json.schemastore.org/swagger-2.0.json',
    fileMatch: ['swagger.json'],
    name: 'Swagger 2.0',
    description: 'Swagger 2.0 API文档的JSON Schema'
  },
  'openapi.json': {
    uri: 'https://json.schemastore.org/openapi-3.0.json',
    fileMatch: ['openapi.json'],
    name: 'OpenAPI 3.0',
    description: 'OpenAPI 3.0 API文档的JSON Schema'
  },
  'github-workflow': {
    uri: 'https://json.schemastore.org/github-workflow.json',
    fileMatch: ['.github/workflows/*.yml', '.github/workflows/*.yaml'],
    name: 'GitHub工作流',
    description: 'GitHub Actions工作流配置的JSON Schema'
  },
  'docker-compose': {
    uri: 'https://json.schemastore.org/docker-compose.json',
    fileMatch: ['docker-compose.yml', 'docker-compose.yaml'],
    name: 'Docker Compose',
    description: 'Docker Compose配置文件的JSON Schema'
  }
};

// 用户自定义Schema存储
const USER_SCHEMAS_STORAGE_KEY = 'pdx-json-editor-schemas';

/**
 * 获取所有可用的Schema
 * @returns {Object[]} - Schema列表
 */
export const getAllSchemas = () => {
  const predefinedSchemasList = Object.entries(PREDEFINED_SCHEMAS).map(([id, schema]) => ({
    id,
    ...schema,
    predefined: true
  }));
  
  const userSchemas = getUserSchemas();
  
  return [...predefinedSchemasList, ...userSchemas];
};

/**
 * 获取用户自定义Schema
 * @returns {Object[]} - 用户自定义Schema列表
 */
export const getUserSchemas = () => {
  try {
    const storedSchemas = localStorage.getItem(USER_SCHEMAS_STORAGE_KEY);
    return storedSchemas ? JSON.parse(storedSchemas) : [];
  } catch (error) {
    console.error('加载用户Schema失败:', error);
    return [];
  }
};

/**
 * 保存用户自定义Schema
 * @param {Object[]} schemas - 用户自定义Schema列表
 */
export const saveUserSchemas = (schemas) => {
  try {
    localStorage.setItem(USER_SCHEMAS_STORAGE_KEY, JSON.stringify(schemas));
  } catch (error) {
    console.error('保存用户Schema失败:', error);
  }
};

/**
 * 添加用户自定义Schema
 * @param {Object} schema - 用户自定义Schema
 * @returns {Object[]} - 更新后的用户自定义Schema列表
 */
export const addUserSchema = (schema) => {
  const userSchemas = getUserSchemas();
  
  // 生成唯一ID
  const id = `user-schema-${Date.now()}`;
  const newSchema = {
    id,
    ...schema,
    predefined: false
  };
  
  const updatedSchemas = [...userSchemas, newSchema];
  saveUserSchemas(updatedSchemas);
  
  return updatedSchemas;
};

/**
 * 删除用户自定义Schema
 * @param {string} id - Schema ID
 * @returns {Object[]} - 更新后的用户自定义Schema列表
 */
export const deleteUserSchema = (id) => {
  const userSchemas = getUserSchemas();
  const updatedSchemas = userSchemas.filter(schema => schema.id !== id);
  saveUserSchemas(updatedSchemas);
  
  return updatedSchemas;
};

/**
 * 更新用户自定义Schema
 * @param {string} id - Schema ID
 * @param {Object} updatedSchema - 更新后的Schema
 * @returns {Object[]} - 更新后的用户自定义Schema列表
 */
export const updateUserSchema = (id, updatedSchema) => {
  const userSchemas = getUserSchemas();
  const updatedSchemas = userSchemas.map(schema => 
    schema.id === id ? { ...schema, ...updatedSchema } : schema
  );
  saveUserSchemas(updatedSchemas);
  
  return updatedSchemas;
};

/**
 * 配置Monaco编辑器的JSON Schema支持
 * @param {any} monaco - Monaco实例
 * @param {string|null} schemaId - 要应用的Schema ID，如果为null则清除Schema
 */
export const configureJsonSchema = (monaco, schemaId = null) => {
  if (!monaco || !monaco.languages || !monaco.languages.json || !monaco.languages.json.jsonDefaults) {
    console.warn('Monaco JSON language support not available');
    return;
  }
  
  try {
    // 默认诊断选项
    const defaultOptions = {
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true,
      schemaRequest: 'warning'
    };
    
    // 尝试获取当前的诊断选项，如果不可用则使用默认选项
    let currentOptions = defaultOptions;
    try {
      if (typeof monaco.languages.json.jsonDefaults.getDiagnosticsOptions === 'function') {
        currentOptions = monaco.languages.json.jsonDefaults.getDiagnosticsOptions();
      }
    } catch (e) {
      console.warn('Failed to get diagnostics options, using defaults');
    }
    
    if (!schemaId) {
      // 清除Schema
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        ...currentOptions,
        schemas: []
      });
      return;
    }
    
    // 查找指定的Schema
    const allSchemas = getAllSchemas();
    const selectedSchema = allSchemas.find(schema => schema.id === schemaId);
    
    if (!selectedSchema) {
      console.error(`未找到ID为${schemaId}的Schema`);
      return;
    }
    
    // 设置Schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      ...currentOptions,
      validate: true,
      schemas: [
        {
          uri: selectedSchema.uri,
          fileMatch: selectedSchema.fileMatch || ['*'],
          schema: selectedSchema.schema // 如果是内联Schema
        }
      ],
      enableSchemaRequest: true
    });
  } catch (error) {
    console.error('Failed to configure JSON schema:', error);
  }
};

/**
 * 从URL加载JSON Schema
 * @param {string} url - Schema URL
 * @returns {Promise<Object>} - 加载的Schema对象
 */
export const loadSchemaFromUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('加载Schema失败:', error);
    throw error;
  }
};

/**
 * 从文件加载JSON Schema
 * @param {File} file - Schema文件
 * @returns {Promise<Object>} - 加载的Schema对象
 */
export const loadSchemaFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const schema = JSON.parse(event.target.result);
        resolve(schema);
      } catch (error) {
        reject(new Error('无效的JSON Schema文件'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * 检测JSON内容可能匹配的Schema
 * @param {string} jsonContent - JSON内容
 * @returns {string|null} - 匹配的Schema ID，如果没有匹配则返回null
 */
export const detectSchema = (jsonContent) => {
  try {
    const content = JSON.parse(jsonContent);
    const allSchemas = getAllSchemas();
    
    // 检查常见的标识字段
    if (content.name && content.version && content.dependencies) {
      return 'package.json';
    }
    
    if (content.compilerOptions && content.include) {
      return 'tsconfig.json';
    }
    
    if (content.rules && content.extends) {
      return 'eslintrc.json';
    }
    
    if (content.swagger && content.info && content.paths) {
      return 'swagger.json';
    }
    
    if (content.openapi && content.info && content.paths) {
      return 'openapi.json';
    }
    
    // 如果没有匹配到预定义Schema，尝试匹配用户Schema
    for (const schema of allSchemas) {
      if (!schema.predefined && schema.detectPattern) {
        try {
          const pattern = new RegExp(schema.detectPattern);
          if (pattern.test(jsonContent)) {
            return schema.id;
          }
        } catch (e) {
          // 忽略无效的正则表达式
        }
      }
    }
    
    return null;
  } catch (error) {
    // JSON解析失败，无法检测Schema
    return null;
  }
};