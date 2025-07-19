import { JsonSchemaConfig } from '../types/editor.types';

/**
 * 通用JSON Schema配置
 */
export const defaultJsonSchema: JsonSchemaConfig = {
  uri: 'http://json-schema.org/draft-07/schema#',
  fileMatch: ['*.json'],
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'JSON',
    description: '通用JSON文档',
    type: 'object',
    additionalProperties: true
  }
};

/**
 * 配置文件JSON Schema
 */
export const configJsonSchema: JsonSchemaConfig = {
  uri: 'http://json-schema.org/config-schema',
  fileMatch: ['*config*.json', '*settings*.json'],
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: '配置文件',
    description: '应用程序配置文件',
    type: 'object',
    properties: {
      version: {
        type: 'string',
        description: '配置文件版本'
      },
      settings: {
        type: 'object',
        description: '应用程序设置',
        properties: {
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'system'],
            description: '应用程序主题'
          },
          language: {
            type: 'string',
            description: '应用程序语言'
          },
          fontSize: {
            type: 'number',
            minimum: 8,
            maximum: 32,
            description: '字体大小'
          },
          indentation: {
            type: 'number',
            enum: [2, 4, 8],
            description: '缩进大小'
          },
          tabSize: {
            type: 'number',
            enum: [2, 4, 8],
            description: '制表符大小'
          },
          wordWrap: {
            type: 'boolean',
            description: '是否启用自动换行'
          }
        }
      },
      features: {
        type: 'object',
        description: '功能配置',
        properties: {
          enabled: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: '启用的功能列表'
          },
          disabled: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: '禁用的功能列表'
          }
        }
      }
    }
  }
};

/**
 * 包配置JSON Schema (package.json)
 */
export const packageJsonSchema: JsonSchemaConfig = {
  uri: 'http://json-schema.org/package-schema',
  fileMatch: ['package.json'],
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Package',
    description: 'NPM包配置文件',
    type: 'object',
    required: ['name', 'version'],
    properties: {
      name: {
        type: 'string',
        description: '包名称'
      },
      version: {
        type: 'string',
        description: '包版本'
      },
      description: {
        type: 'string',
        description: '包描述'
      },
      main: {
        type: 'string',
        description: '主入口文件'
      },
      scripts: {
        type: 'object',
        description: 'NPM脚本',
        additionalProperties: {
          type: 'string'
        }
      },
      dependencies: {
        type: 'object',
        description: '依赖项',
        additionalProperties: {
          type: 'string'
        }
      },
      devDependencies: {
        type: 'object',
        description: '开发依赖项',
        additionalProperties: {
          type: 'string'
        }
      },
      author: {
        oneOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              url: { type: 'string' }
            }
          }
        ],
        description: '作者信息'
      },
      license: {
        type: 'string',
        description: '许可证'
      }
    }
  }
};

/**
 * 获取所有可用的JSON Schema
 */
export function getAllSchemas(): JsonSchemaConfig[] {
  return [
    defaultJsonSchema,
    configJsonSchema,
    packageJsonSchema
  ];
}

/**
 * 根据文件名获取适合的JSON Schema
 * @param filename 文件名
 */
export function getSchemaForFile(filename: string): JsonSchemaConfig | null {
  const schemas = getAllSchemas();
  
  for (const schema of schemas) {
    if (!schema.fileMatch) continue;
    
    for (const pattern of schema.fileMatch) {
      // 简单的通配符匹配
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      if (regex.test(filename)) {
        return schema;
      }
    }
  }
  
  return null;
}

export default {
  getAllSchemas,
  getSchemaForFile,
  defaultJsonSchema,
  configJsonSchema,
  packageJsonSchema
};