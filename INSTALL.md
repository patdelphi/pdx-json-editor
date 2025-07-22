# 安装说明

## 系统要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本
- 现代浏览器（Chrome 60+、Firefox 60+、Safari 12+、Edge 79+）

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
```## 最新变
更

### 2023-07-21 更新

项目进行了以下重要更新：

1. **界面简化**：移除了侧边栏和最近文件功能，使界面更加简洁
2. **错误修复**：修复了过渡组件中的错误
3. **性能优化**：改进了应用性能和内存使用

### 已知问题

- 在某些移动设备上，触摸手势可能不够灵敏
- 超大文件（>10MB）可能会导致性能问题
- GitHub Actions 自动部署可能需要额外的权限配置

## 部署指南

构建完成后，您可以将 `dist` 目录中的文件部署到任何静态文件服务器上。例如：

### 部署到 GitHub Pages

使用 gh-pages 工具可以轻松部署到 GitHub Pages：

```bash
# 安装 gh-pages 工具
npm install --save-dev gh-pages

# 构建项目
npm run build

# 部署到 GitHub Pages
npx gh-pages -d dist
```

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