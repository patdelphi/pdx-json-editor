import React, { useState, useEffect } from 'react';
import { getAllSchemas } from '../../utils/jsonSchemas';
import { JsonSchemaConfig } from '../../types/editor.types';

interface SchemaSelectorProps {
  currentFile: string | null;
  onSchemaSelect: (schema: JsonSchemaConfig) => void;
  theme: 'light' | 'dark';
}

/**
 * JSON Schema选择器组件
 */
const SchemaSelector: React.FC<SchemaSelectorProps> = ({ 
  currentFile, 
  onSchemaSelect,
  theme
}) => {
  const [schemas, setSchemas] = useState<JsonSchemaConfig[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // 加载可用的Schema
  useEffect(() => {
    const availableSchemas = getAllSchemas();
    setSchemas(availableSchemas);
    
    // 如果有当前文件，尝试自动选择合适的Schema
    if (currentFile) {
      for (const schema of availableSchemas) {
        if (!schema.fileMatch) continue;
        
        for (const pattern of schema.fileMatch) {
          const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          
          const regex = new RegExp(`^${regexPattern}$`, 'i');
          if (regex.test(currentFile)) {
            setSelectedSchema(schema.uri);
            break;
          }
        }
      }
    }
  }, [currentFile]);

  // 处理Schema选择
  const handleSchemaSelect = (uri: string) => {
    setSelectedSchema(uri);
    const schema = schemas.find(s => s.uri === uri);
    if (schema) {
      onSchemaSelect(schema);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 text-xs rounded flex items-center ${
          theme === 'dark'
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="选择JSON Schema"
      >
        <span className="mr-1">📋</span>
        <span>Schema: {selectedSchema ? selectedSchema.split('/').pop() : '无'}</span>
        <span className="ml-1">▼</span>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute top-full left-0 mt-1 w-64 rounded shadow-lg z-50 ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div className={`p-2 text-xs font-bold ${theme === 'dark' ? 'text-gray-300 border-b border-gray-700' : 'text-gray-700 border-b border-gray-200'}`}>
            选择JSON Schema
          </div>
          <ul className="max-h-60 overflow-y-auto">
            <li 
              className={`p-2 text-xs cursor-pointer ${
                !selectedSchema 
                  ? (theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800') 
                  : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
              }`}
              onClick={() => handleSchemaSelect('')}
            >
              无 Schema
            </li>
            {schemas.map(schema => (
              <li 
                key={schema.uri}
                className={`p-2 text-xs cursor-pointer ${
                  selectedSchema === schema.uri 
                    ? (theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800') 
                    : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')
                }`}
                onClick={() => handleSchemaSelect(schema.uri)}
              >
                {schema.schema.title || schema.uri.split('/').pop()}
                {schema.fileMatch && (
                  <div className="text-xs opacity-70 mt-1">
                    匹配: {schema.fileMatch.join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchemaSelector;