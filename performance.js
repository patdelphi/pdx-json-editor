/**
 * 性能测试脚本
 * 用于测试应用在不同场景下的性能表现
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// 生成大型JSON数据
const generateLargeJson = (size) => {
  const data = {
    items: []
  };
  
  for (let i = 0; i < size; i++) {
    data.items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is item ${i}`,
      value: Math.random(),
      tags: ['tag1', 'tag2', 'tag3'],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: i % 2 === 0 ? 'active' : 'inactive'
      }
    });
  }
  
  return JSON.stringify(data, null, 2);
};

// 测试不同大小的JSON数据
const testSizes = [100, 1000, 10000, 50000];

// 性能测试
async function runPerformanceTests() {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: true
  });
  
  // 创建上下文
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  // 创建页面
  const page = await context.newPage();
  
  // 启用性能指标收集
  await page.coverage.startJSCoverage();
  
  // 导航到应用
  console.log('测量初始加载时间...');
  const startTime = Date.now();
  await page.goto('http://localhost:5173');
  const loadTime = Date.now() - startTime;
  console.log(`初始加载时间: ${loadTime}ms`);
  
  // 等待编辑器加载
  await page.waitForSelector('.monaco-editor');
  
  // 测试不同大小的JSON数据处理性能
  for (const size of testSizes) {
    console.log(`\n测试${size}项的JSON性能...`);
    
    // 生成大型JSON数据
    const content = generateLargeJson(size);
    
    // 设置JSON内容
    console.log(`- 设置${size}项的JSON内容...`);
    const setContentStart = Date.now();
    await page.evaluate((json) => {
      window.pdxJsonEditor.setContent(json);
    }, content);
    const setContentTime = Date.now() - setContentStart;
    console.log(`  设置内容时间: ${setContentTime}ms`);
    
    // 测量格式化性能
    console.log(`- 测量格式化${size}项的JSON性能...`);
    const formatStart = Date.now();
    await page.evaluate(() => {
      window.pdxJsonEditor.formatJson();
    });
    const formatTime = Date.now() - formatStart;
    console.log(`  格式化时间: ${formatTime}ms`);
    
    // 测量压缩性能
    console.log(`- 测量压缩${size}项的JSON性能...`);
    const compressStart = Date.now();
    await page.evaluate(() => {
      window.pdxJsonEditor.compressJson();
    });
    const compressTime = Date.now() - compressStart;
    console.log(`  压缩时间: ${compressTime}ms`);
    
    // 测量搜索性能
    console.log(`- 测量搜索${size}项的JSON性能...`);
    await page.evaluate(() => {
      window.pdxJsonEditor.formatJson();
    });
    await page.locator('button[aria-label="搜索 (Ctrl+F)"]').click();
    await page.waitForSelector('text=搜索和替换');
    const searchStart = Date.now();
    await page.locator('input[placeholder="搜索"]').fill('Item');
    const searchTime = Date.now() - searchStart;
    console.log(`  搜索时间: ${searchTime}ms`);
    await page.keyboard.press('Escape');
    
    // 测量差异对比性能
    console.log(`- 测量差异对比${size}项的JSON性能...`);
    await page.evaluate((json) => {
      window.pdxJsonEditor.saveOriginalContent(json);
      const modified = JSON.parse(json);
      modified.items[0].name = 'Modified Item';
      window.pdxJsonEditor.setContent(JSON.stringify(modified, null, 2));
    }, content);
    const diffStart = Date.now();
    await page.getByText('差异对比').click();
    await page.waitForSelector('text=差异对比');
    const diffTime = Date.now() - diffStart;
    console.log(`  差异对比时间: ${diffTime}ms`);
    await page.locator('button[aria-label="关闭"]').click();
    
    // 收集性能指标
    const metrics = await page.evaluate(() => {
      const performance = window.performance;
      return {
        memory: performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : null,
        timing: performance.timing.loadEventEnd - performance.timing.navigationStart,
        entries: performance.getEntriesByType('resource').map(entry => ({
          name: entry.name,
          duration: entry.duration
        }))
      };
    });
    
    console.log(`- 内存使用: ${metrics.memory ? metrics.memory.toFixed(2) + ' MB' : '不可用'}`);
    console.log(`- 页面加载时间: ${metrics.timing}ms`);
  }
  
  // 停止性能指标收集
  const jsCoverage = await page.coverage.stopJSCoverage();
  
  // 计算代码覆盖率
  let totalBytes = 0;
  let usedBytes = 0;
  for (const entry of jsCoverage) {
    totalBytes += entry.text.length;
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start;
    }
  }
  
  console.log(`\n代码覆盖率: ${(usedBytes / totalBytes * 100).toFixed(2)}%`);
  
  // 生成性能报告
  const report = {
    initialLoadTime: loadTime,
    tests: testSizes.map(size => ({
      size,
      setContentTime: null,
      formatTime: null,
      compressTime: null,
      searchTime: null,
      diffTime: null
    })),
    coverage: {
      total: totalBytes,
      used: usedBytes,
      percentage: (usedBytes / totalBytes * 100).toFixed(2)
    }
  };
  
  // 保存性能报告
  fs.writeFileSync(
    path.join(__dirname, 'performance-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // 关闭浏览器
  await browser.close();
}

// 运行性能测试
runPerformanceTests().catch(error => {
  console.error('性能测试失败:', error);
  process.exit(1);
});