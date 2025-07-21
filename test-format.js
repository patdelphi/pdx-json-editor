// 测试格式化、压缩和修复功能
console.log('测试格式化、压缩和修复功能');

// 导入jsonService
import { formatJson, compressJson, tryFixJson } from './src/services/jsonService.js';

// 测试数据
const unformatted = '{"name":"test","value":123}';
const invalid = '{name:"test"}';

// 测试格式化
try {
  console.log('格式化前:', unformatted);
  const formatted = formatJson(unformatted, 2);
  console.log('格式化后:', formatted);
} catch (error) {
  console.error('格式化失败:', error);
}

// 测试压缩
try {
  const formatted = '{\n  "name": "test",\n  "value": 123\n}';
  console.log('压缩前:', formatted);
  const compressed = compressJson(formatted);
  console.log('压缩后:', compressed);
} catch (error) {
  console.error('压缩失败:', error);
}

// 测试修复
try {
  console.log('修复前:', invalid);
  const fixed = tryFixJson(invalid);
  console.log('修复后:', fixed);
} catch (error) {
  console.error('修复失败:', error);
}