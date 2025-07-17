# PDX JSON Editor 部署指南

本文档提供了部署 PDX JSON Editor 应用程序的详细说明。

## 构建应用程序

### 前提条件

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 构建步骤

1. 安装依赖项：

```bash
npm install
```

2. 构建生产版本：

```bash
npm run build
```

构建完成后，生产文件将位于 `dist` 目录中。

## 部署选项

### 选项 1：静态网站托管

PDX JSON Editor 是一个纯前端应用程序，可以部署到任何静态网站托管服务上。

#### Netlify

1. 创建一个 Netlify 账户并登录
2. 点击 "New site from Git"
3. 选择您的 Git 提供商并授权 Netlify
4. 选择包含 PDX JSON Editor 的仓库
5. 构建设置：
   - 构建命令：`npm run build`
   - 发布目录：`dist`
6. 点击 "Deploy site"

#### Vercel

1. 创建一个 Vercel 账户并登录
2. 点击 "New Project"
3. 导入您的 Git 仓库
4. 构建设置：
   - 框架预设：Vite
   - 构建命令：`npm run build`
   - 输出目录：`dist`
5. 点击 "Deploy"

#### GitHub Pages

1. 在 `package.json` 中添加以下脚本：

```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

2. 安装 gh-pages 包：

```bash
npm install --save-dev gh-pages
```

3. 构建并部署：

```bash
npm run build
npm run deploy
```

### 选项 2：Docker 部署

您可以使用 Docker 容器化应用程序并部署到支持 Docker 的平台上。

1. 创建 Dockerfile：

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 创建 nginx.conf：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # 支持 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 不缓存 HTML 和 Service Worker
    location ~* \.(html|sw\.js)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

3. 构建 Docker 镜像：

```bash
docker build -t pdx-json-editor .
```

4. 运行 Docker 容器：

```bash
docker run -p 8080:80 pdx-json-editor
```

应用程序将在 http://localhost:8080 上可用。

### 选项 3：传统 Web 服务器

您也可以将应用程序部署到传统的 Web 服务器上，如 Apache 或 Nginx。

#### Nginx

1. 将构建文件复制到 Nginx 服务器：

```bash
cp -r dist/* /var/www/html/
```

2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 不缓存 HTML 和 Service Worker
    location ~* \.(html|sw\.js)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

#### Apache

1. 将构建文件复制到 Apache 服务器：

```bash
cp -r dist/* /var/www/html/
```

2. 创建或修改 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 缓存控制
<IfModule mod_expires.c>
  ExpiresActive On
  
  # 静态资源缓存 30 天
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  
  # HTML 和 Service Worker 不缓存
  ExpiresByType text/html "access plus 0 seconds"
  <FilesMatch "sw\.js$">
    ExpiresDefault "access plus 0 seconds"
    Header set Cache-Control "no-store, no-cache, must-revalidate"
  </FilesMatch>
</IfModule>
```

## 环境变量配置

PDX JSON Editor 支持以下环境变量：

- `VITE_APP_TITLE`: 应用程序标题
- `VITE_API_URL`: API URL（如果将来添加后端服务）

您可以通过创建 `.env.production` 文件来设置这些变量：

```
VITE_APP_TITLE=PDX JSON Editor
VITE_API_URL=https://api.example.com
```

## PWA 支持

PDX JSON Editor 包含 PWA（渐进式 Web 应用程序）支持，允许用户将其安装到设备上并离线使用。确保您的 Web 服务器正确提供 `manifest.json` 和 Service Worker 文件。

## 性能优化

应用程序已经进行了以下性能优化：

- 代码分割和懒加载
- 资源压缩和最小化
- 缓存策略
- 预加载关键资源

## 故障排除

如果您在部署过程中遇到问题，请检查以下事项：

1. 确保所有依赖项都已正确安装
2. 验证构建过程是否成功完成，没有错误
3. 检查 Web 服务器配置是否正确
4. 确保服务器上的文件权限设置正确

如需进一步帮助，请提交 GitHub issue。