# 安装说明

## 系统要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- 现代浏览器（Chrome 60+、Firefox 60+、Safari 12+、Edge 79+）
- 不再支持Internet Explorer

## 安装依赖

请运行以下命令安装项目依赖：

```bash
npm install
```

## 开发模式

安装完依赖后，可以运行以下命令启动开发服务器：

```bash
npm run dev
```

## 构建生产版本

要构建生产版本，请运行：

```bash
npm run build
```

## 测试

运行测试：

```bash
npm test
```

运行端到端测试：

```bash
npm run test:e2e
```

运行性能测试：

```bash
npm run test:performance
```

## 注意事项

如果遇到 `file-saver` 依赖问题，请确保已经安装了该依赖：

```bash
npm install file-saver --save
```## 最新变更

### 2025-07-22 更新 (v2.0.0)

项目进行了以下重要更新：

1. **性能优化**：大幅改进了大型JSON文件的处理性能和编辑器渲染速度
2. **用户界面改进**：全新的深色主题支持和优化的工具栏布局
3. **功能增强**：添加了JSON模式验证和键盘快捷键支持
4. **技术升级**：升级到最新的Monaco Editor，使用Preact和Vite提高性能
5. **测试完善**：添加了全面的单元测试、集成测试和性能测试套件

### 已知问题

- 超大文件（>20MB）可能仍会导致性能问题，建议使用性能模式
- 某些复杂的JSON Schema验证可能会影响编辑器响应速度
- 在低端移动设备上，复杂操作可能会有轻微延迟

## 部署指南

构建完成后，您可以将 `dist` 目录中的文件部署到任何静态文件服务器上。例如：

### 部署到 GitHub Pages

项目已配置GitHub Actions自动部署工作流，每次推送到main分支时会自动部署到GitHub Pages。

如果需要手动部署，可以使用以下方法：

```bash
# 安装 gh-pages 工具
npm install --save-dev gh-pages

# 构建项目
npm run build

# 部署到 GitHub Pages
npx gh-pages -d dist
```

或者手动触发GitHub Actions工作流：

1. 访问项目GitHub仓库
2. 点击"Actions"标签
3. 选择"Deploy to GitHub Pages"工作流
4. 点击"Run workflow"按钮

部署完成后，您的应用将可以通过 `https://<username>.github.io/<repository>/` 访问。

### 使用 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 使用 Apache

创建或修改 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## 故障排除

如果您在安装或运行过程中遇到问题，请尝试以下步骤：

1. 清除 npm 缓存：`npm cache clean --force`
2. 删除 node_modules 目录：`rm -rf node_modules`
3. 重新安装依赖：`npm install`
4. 如果问题仍然存在，请检查您的 Node.js 版本是否符合要求