/**
 * PDX JSON编辑器端到端测试
 */

const { test, expect } = require('@playwright/test');

// 测试数据
const validJson = JSON.stringify({
  name: 'PDX JSON Editor',
  version: '1.0.0',
  description: 'A lightweight JSON editor with Monaco Editor',
  features: [
    'Syntax highlighting',
    'Error validation',
    'Formatting',
    'Search and replace',
    'File operations'
  ]
}, null, 2);

const invalidJson = `{
  "name": "PDX JSON Editor",
  "version": "1.0.0",
  "description": "A lightweight JSON editor with Monaco Editor",
  "features": [
    "Syntax highlighting",
    "Error validation",
    "Formatting",
    "Search and replace",
    "File operations"
  ],
}`;

test.describe('PDX JSON编辑器', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用
    await page.goto('/');
    
    // 等待编辑器加载
    await page.waitForSelector('.monaco-editor');
  });
  
  test('应能正确加载应用', async ({ page }) => {
    // 验证标题
    const title = await page.title();
    expect(title).toContain('PDX JSON Editor');
    
    // 验证编辑器是否存在
    const editor = await page.locator('.monaco-editor');
    expect(await editor.isVisible()).toBeTruthy();
    
    // 验证工具栏是否存在
    const formatButton = await page.getByText('格式化');
    expect(await formatButton.isVisible()).toBeTruthy();
  });
  
  test('应能格式化JSON', async ({ page }) => {
    // 清空编辑器
    await page.evaluate(() => {
      window.pdxJsonEditor.setContent('{"name":"PDX JSON Editor","version":"1.0.0"}');
    });
    
    // 点击格式化按钮
    await page.getByText('格式化').click();
    
    // 获取格式化后的内容
    const content = await page.evaluate(() => window.pdxJsonEditor.getCurrentContent());
    
    // 验证内容是否格式化
    expect(content).toContain('\n  "name"');
    expect(content).toContain('\n  "version"');
  });
  
  test('应能压缩JSON', async ({ page }) => {
    // 设置格式化的JSON
    await page.evaluate((json) => {
      window.pdxJsonEditor.setContent(json);
    }, validJson);
    
    // 点击压缩按钮
    await page.getByText('压缩').click();
    
    // 获取压缩后的内容
    const content = await page.evaluate(() => window.pdxJsonEditor.getCurrentContent());
    
    // 验证内容是否压缩
    expect(content).not.toContain('\n');
    expect(content).toContain('{"name":"PDX JSON Editor"');
  });
  
  test('应能验证JSON语法', async ({ page }) => {
    // 设置无效的JSON
    await page.evaluate((json) => {
      window.pdxJsonEditor.setContent(json);
    }, invalidJson);
    
    // 等待错误标记出现
    await page.waitForSelector('.monaco-editor .squiggly-error');
    
    // 验证状态栏是否显示错误
    const statusBar = await page.locator('.MuiBox-root').filter({ hasText: '错误:' });
    expect(await statusBar.isVisible()).toBeTruthy();
  });
  
  test('应能搜索和替换', async ({ page }) => {
    // 设置JSON内容
    await page.evaluate((json) => {
      window.pdxJsonEditor.setContent(json);
    }, validJson);
    
    // 点击搜索按钮
    await page.locator('button[aria-label="搜索 (Ctrl+F)"]').click();
    
    // 等待搜索面板出现
    await page.waitForSelector('text=搜索和替换');
    
    // 输入搜索内容
    await page.locator('input[placeholder="搜索"]').fill('Syntax');
    
    // 验证搜索结果
    const matchCount = await page.locator('text=/\\d+ 个匹配项/');
    expect(await matchCount.isVisible()).toBeTruthy();
    
    // 输入替换内容
    await page.locator('input[placeholder="替换"]').fill('Code');
    
    // 点击替换按钮
    await page.getByText('替换').click();
    
    // 获取替换后的内容
    const content = await page.evaluate(() => window.pdxJsonEditor.getCurrentContent());
    
    // 验证内容是否替换
    expect(content).toContain('Code highlighting');
  });
  
  test('应能打开差异对比视图', async ({ page }) => {
    // 设置JSON内容
    await page.evaluate((json) => {
      window.pdxJsonEditor.setContent(json);
      window.pdxJsonEditor.saveOriginalContent(json);
    }, validJson);
    
    // 修改内容
    await page.evaluate(() => {
      const content = window.pdxJsonEditor.getCurrentContent();
      const modified = content.replace('Syntax highlighting', 'Code highlighting');
      window.pdxJsonEditor.setContent(modified);
    });
    
    // 点击差异对比按钮
    await page.getByText('差异对比').click();
    
    // 等待差异对比视图出现
    await page.waitForSelector('text=差异对比');
    
    // 验证差异对比视图是否显示
    const diffViewer = await page.locator('text=差异对比');
    expect(await diffViewer.isVisible()).toBeTruthy();
    
    // 关闭差异对比视图
    await page.locator('button[aria-label="关闭"]').click();
    
    // 验证差异对比视图是否关闭
    expect(await page.locator('text=差异对比').count()).toBe(0);
  });
  
  test('应能切换主题', async ({ page }) => {
    // 点击设置按钮
    await page.locator('button[aria-label="设置"]').click();
    
    // 等待设置对话框出现
    await page.waitForSelector('text=编辑器设置');
    
    // 切换到主题选项卡
    await page.getByText('主题').click();
    
    // 选择深色主题
    await page.getByText('深色主题').click();
    
    // 关闭设置对话框
    await page.getByText('关闭').click();
    
    // 验证主题是否切换
    const isDarkTheme = await page.evaluate(() => {
      return document.body.classList.contains('MuiBox-root-dark');
    });
    
    expect(isDarkTheme).toBeTruthy();
  });
  
  test('应能处理大文件警告', async ({ page }) => {
    // 模拟大文件
    const largeJson = JSON.stringify({
      data: Array(50000).fill({ key: 'value' })
    });
    
    // 设置大文件
    await page.evaluate((json) => {
      // 模拟文件大小检测
      const blob = new Blob([json], { type: 'application/json' });
      const file = new File([blob], 'large.json', { type: 'application/json' });
      Object.defineProperty(file, 'size', { value: 5000000 }); // 5MB
      
      // 触发大文件警告
      if (window.pdxJsonEditor.handleLargeFile) {
        window.pdxJsonEditor.handleLargeFile(file);
      }
    }, largeJson);
    
    // 等待大文件警告对话框出现
    await page.waitForSelector('text=大文件警告');
    
    // 验证大文件警告对话框是否显示
    const warningDialog = await page.locator('text=大文件警告');
    expect(await warningDialog.isVisible()).toBeTruthy();
    
    // 点击继续按钮
    await page.getByText('继续加载').click();
    
    // 验证大文件警告对话框是否关闭
    expect(await page.locator('text=大文件警告').count()).toBe(0);
  });
  
  test('应能显示键盘快捷键帮助', async ({ page }) => {
    // 按下问号键
    await page.keyboard.press('?');
    
    // 等待键盘快捷键对话框出现
    await page.waitForSelector('text=键盘快捷键');
    
    // 验证键盘快捷键对话框是否显示
    const helpDialog = await page.locator('text=键盘快捷键');
    expect(await helpDialog.isVisible()).toBeTruthy();
    
    // 关闭键盘快捷键对话框
    await page.getByText('关闭').click();
    
    // 验证键盘快捷键对话框是否关闭
    expect(await page.locator('text=键盘快捷键').count()).toBe(0);
  });
});