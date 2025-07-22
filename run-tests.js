/**
 * 测试运行脚本
 * 用于执行所有测试并生成报告
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建测试结果目录
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 测试结果文件
const testResultsFile = path.join(testResultsDir, 'test-results.json');

// 测试结果
const testResults = {
  timestamp: new Date().toISOString(),
  unitTests: {
    success: false,
    message: '',
    duration: 0
  },
  performanceTests: {
    success: false,
    message: '',
    duration: 0
  },
  e2eTests: {
    success: false,
    message: '',
    duration: 0
  }
};

// 运行单元测试
console.log('运行单元测试...');
try {
  const startTime = Date.now();
  execSync('npm test', { stdio: 'inherit' });
  testResults.unitTests.success = true;
  testResults.unitTests.message = '单元测试通过';
  testResults.unitTests.duration = Date.now() - startTime;
  console.log(`单元测试通过，耗时 ${testResults.unitTests.duration}ms`);
} catch (error) {
  testResults.unitTests.message = `单元测试失败: ${error.message}`;
  console.error('单元测试失败:', error.message);
}

// 运行性能测试
console.log('\n运行性能测试...');
try {
  const startTime = Date.now();
  execSync('npm run test:performance', { stdio: 'inherit' });
  testResults.performanceTests.success = true;
  testResults.performanceTests.message = '性能测试通过';
  testResults.performanceTests.duration = Date.now() - startTime;
  console.log(`性能测试通过，耗时 ${testResults.performanceTests.duration}ms`);
} catch (error) {
  testResults.performanceTests.message = `性能测试失败: ${error.message}`;
  console.error('性能测试失败:', error.message);
}

// 运行E2E测试
console.log('\n运行E2E测试...');
try {
  const startTime = Date.now();
  execSync('npm run test:e2e', { stdio: 'inherit' });
  testResults.e2eTests.success = true;
  testResults.e2eTests.message = 'E2E测试通过';
  testResults.e2eTests.duration = Date.now() - startTime;
  console.log(`E2E测试通过，耗时 ${testResults.e2eTests.duration}ms`);
} catch (error) {
  testResults.e2eTests.message = `E2E测试失败: ${error.message}`;
  console.error('E2E测试失败:', error.message);
}

// 保存测试结果
fs.writeFileSync(testResultsFile, JSON.stringify(testResults, null, 2));
console.log(`\n测试结果已保存到 ${testResultsFile}`);

// 生成测试报告
const testReport = `
# PDX JSON Editor 测试报告

## 测试时间
${new Date().toLocaleString()}

## 测试结果摘要
- 单元测试: ${testResults.unitTests.success ? '✅ 通过' : '❌ 失败'}
- 性能测试: ${testResults.performanceTests.success ? '✅ 通过' : '❌ 失败'}
- E2E测试: ${testResults.e2eTests.success ? '✅ 通过' : '❌ 失败'}

## 详细结果

### 单元测试
- 状态: ${testResults.unitTests.success ? '通过' : '失败'}
- 耗时: ${testResults.unitTests.duration}ms
- 信息: ${testResults.unitTests.message}

### 性能测试
- 状态: ${testResults.performanceTests.success ? '通过' : '失败'}
- 耗时: ${testResults.performanceTests.duration}ms
- 信息: ${testResults.performanceTests.message}

### E2E测试
- 状态: ${testResults.e2eTests.success ? '通过' : '失败'}
- 耗时: ${testResults.e2eTests.duration}ms
- 信息: ${testResults.e2eTests.message}

## 总结
${testResults.unitTests.success && testResults.performanceTests.success && testResults.e2eTests.success
  ? '所有测试通过，项目质量良好。'
  : '部分测试失败，需要进一步修复问题。'}
`;

// 保存测试报告
const testReportFile = path.join(testResultsDir, 'test-report.md');
fs.writeFileSync(testReportFile, testReport);
console.log(`测试报告已生成到 ${testReportFile}`);

// 退出码
process.exit(
  testResults.unitTests.success && testResults.performanceTests.success && testResults.e2eTests.success
    ? 0
    : 1
);