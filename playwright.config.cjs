/**
 * Playwright配置文件
 * @see https://playwright.dev/docs/test-configuration
 */

// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './e2e',
  timeout: 60 * 1000, // 增加超时时间到60秒
  expect: {
    timeout: 10000 // 增加断言超时时间
  },
  fullyParallel: false, // 串行执行测试，避免资源竞争
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 本地也进行一次重试
  workers: process.env.CI ? 1 : 1, // 限制并行工作进程数量
  reporter: [
    ['html'],
    ['list'] // 添加列表报告器，方便在控制台查看结果
  ],
  use: {
    actionTimeout: 15000, // 增加操作超时时间
    navigationTimeout: 30000, // 增加导航超时时间
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure', // 保留失败测试的跟踪
    video: 'retain-on-failure', // 保留失败测试的视频
    screenshot: 'only-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        }
      },
    },
    // 仅在非CI环境下运行其他浏览器测试
    ...(!process.env.CI ? [
      {
        name: 'firefox',
        use: {
          browserName: 'firefox',
          viewport: { width: 1280, height: 720 }
        },
      },
      {
        name: 'webkit',
        use: {
          browserName: 'webkit',
          viewport: { width: 1280, height: 720 }
        },
      }
    ] : []),
    // 仅在非CI环境下运行移动设备测试
    ...(!process.env.CI ? [
      {
        name: 'Mobile Chrome',
        use: {
          browserName: 'chromium',
          ...devices['Pixel 5'],
        },
      },
      {
        name: 'Mobile Safari',
        use: {
          browserName: 'webkit',
          ...devices['iPhone 12'],
        },
      }
    ] : [])
  ],
  
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120 * 1000, // 增加服务器启动超时时间
    reuseExistingServer: !process.env.CI,
  },
};

module.exports = config;