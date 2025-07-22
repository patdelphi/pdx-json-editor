/**
 * 性能测试脚本
 * 用于测试应用在不同场景下的性能表现
 */

import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 测试不同大小的JSON数据 - 减少大型测试数据，避免内存问题
const testSizes = [100, 1000];
const largeSizes = process.env.RUN_LARGE_TESTS ? [10000] : [];

// 性能测试
async function runPerformanceTests() {
  console.log('启动性能测试...');
  
  try {
    // 启动浏览器
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });
    
    // 创建上下文
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    // 创建页面
    const page = await context.newPage();
    
    // 启用性能指标收集
    try {
      await page.coverage.startJSCoverage();
    } catch (error) {
      console.warn('无法启用JS覆盖率收集:', error.message);
    }
    
    // 导航到应用
    console.log('测量初始加载时间...');
    const startTime = Date.now();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 });
    const loadTime = Date.now() - startTime;
    console.log(`初始加载时间: ${loadTime}ms`);
    
    // 等待编辑器加载
    await page.waitForSelector('.monaco-editor', { timeout: 30000 });
    
    // 创建性能报告对象
    const report = {
      timestamp: new Date().toISOString(),
      initialLoadTime: loadTime,
      tests: [],
      coverage: null
    };
    
    // 测试不同大小的JSON数据处理性能
    const allSizes = [...testSizes, ...largeSizes];
    for (const size of allSizes) {
      console.log(`\n测试${size}项的JSON性能...`);
      
      const testResult = {
        size,
        setContentTime: null,
        formatTime: null,
        compressTime: null,
        searchTime: null,
        diffTime: null,
        memoryUsage: null
      };
      
      try {
        // 生成JSON数据
        console.log(`- 生成${size}项的JSON数据...`);
        const content = generateLargeJson(size);
        
        // 设置JSON内容
        console.log(`- 设置${size}项的JSON内容...`);
        const setContentStart = Date.now();
        await page.evaluate((json) => {
          window.pdxJsonEditor.setContent(json);
        }, content);
        testResult.setContentTime = Date.now() - setContentStart;
        console.log(`  设置内容时间: ${testResult.setContentTime}ms`);
        
        // 等待内容加载
        await page.waitForTimeout(500);
        
        // 测量格式化性能
        console.log(`- 测量格式化${size}项的JSON性能...`);
        const formatStart = Date.now();
        await page.evaluate(() => {
          window.pdxJsonEditor.formatJson();
        });
        testResult.formatTime = Date.now() - formatStart;
        console.log(`  格式化时间: ${testResult.formatTime}ms`);
        
        // 等待格式化完成
        await page.waitForTimeout(500);
        
        // 测量压缩性能
        console.log(`- 测量压缩${size}项的JSON性能...`);
        const compressStart = Date.now();
        await page.evaluate(() => {
          window.pdxJsonEditor.compressJson();
        });
        testResult.compressTime = Date.now() - compressStart;
        console.log(`  压缩时间: ${testResult.compressTime}ms`);
        
        // 等待压缩完成
        await page.waitForTimeout(500);
        
        // 测量搜索性能
        console.log(`- 测量搜索${size}项的JSON性能...`);
        await page.evaluate(() => {
          window.pdxJsonEditor.formatJson();
        });
        
        // 等待格式化完成
        await page.waitForTimeout(500);
        
        try {
          await page.locator('button[aria-label="搜索 (Ctrl+F)"]').click();
          await page.waitForSelector('text=搜索和替换', { timeout: 5000 });
          
          const searchStart = Date.now();
          await page.locator('input[placeholder="搜索"]').fill('Item');
          testResult.searchTime = Date.now() - searchStart;
          console.log(`  搜索时间: ${testResult.searchTime}ms`);
          
          // 关闭搜索面板
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        } catch (error) {
          console.warn(`  搜索功能测试失败: ${error.message}`);
        }
        
        // 测量差异对比性能
        console.log(`- 测量差异对比${size}项的JSON性能...`);
        try {
          await page.evaluate((json) => {
            window.pdxJsonEditor.saveOriginalContent(json);
            const modified = JSON.parse(json);
            if (modified.items && modified.items.length > 0) {
              modified.items[0].name = 'Modified Item';
            }
            window.pdxJsonEditor.setContent(JSON.stringify(modified, null, 2));
          }, content);
          
          // 等待内容更新
          await page.waitForTimeout(500);
          
          const diffStart = Date.now();
          await page.getByText('差异对比').click();
          await page.waitForSelector('text=差异对比', { timeout: 10000 });
          testResult.diffTime = Date.now() - diffStart;
          console.log(`  差异对比时间: ${testResult.diffTime}ms`);
          
          // 关闭差异对比视图
          await page.locator('button[aria-label="关闭"]').click();
          await page.waitForTimeout(500);
        } catch (error) {
          console.warn(`  差异对比功能测试失败: ${error.message}`);
        }
        
        // 收集性能指标
        try {
          const metrics = await page.evaluate(() => {
            const performance = window.performance;
            return {
              memory: performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : null,
              timing: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : null,
              entries: performance.getEntriesByType ? performance.getEntriesByType('resource').map(entry => ({
                name: entry.name,
                duration: entry.duration
              })) : []
            };
          });
          
          testResult.memoryUsage = metrics.memory;
          console.log(`- 内存使用: ${metrics.memory ? metrics.memory.toFixed(2) + ' MB' : '不可用'}`);
          if (metrics.timing) {
            console.log(`- 页面加载时间: ${metrics.timing}ms`);
          }
        } catch (error) {
          console.warn(`  性能指标收集失败: ${error.message}`);
        }
      } catch (error) {
        console.error(`测试${size}项的JSON性能失败:`, error);
        testResult.error = error.message;
      }
      
      // 添加测试结果到报告
      report.tests.push(testResult);
      
      // 清理内存
      await page.evaluate(() => {
        window.pdxJsonEditor.setContent('{}');
        if (window.gc) window.gc();
      });
      
      // 等待垃圾回收
      await page.waitForTimeout(1000);
    }
    
    // 停止性能指标收集
    try {
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
      
      const coveragePercentage = (usedBytes / totalBytes * 100).toFixed(2);
      console.log(`\n代码覆盖率: ${coveragePercentage}%`);
      
      report.coverage = {
        total: totalBytes,
        used: usedBytes,
        percentage: coveragePercentage
      };
    } catch (error) {
      console.warn('无法收集JS覆盖率:', error.message);
    }
    
    // 保存性能报告
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n性能报告已保存到: ${reportPath}`);
    
    // 关闭浏览器
    await browser.close();
    
    return report;
  } catch (error) {
    console.error('性能测试失败:', error);
    process.exit(1);
  }
}

// 运行性能测试
runPerformanceTests().catch(error => {
  console.error('性能测试脚本执行失败:', error);
  process.exit(1);
});