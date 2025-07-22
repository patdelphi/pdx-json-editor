/**
 * GitHub Pages 部署脚本
 */

import { publish } from 'gh-pages';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 构建目录
const distPath = path.join(__dirname, 'dist');

// 确保dist目录存在
if (!fs.existsSync(distPath)) {
  console.error('错误: dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建.nojekyll文件，防止GitHub Pages忽略下划线开头的文件
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');

// 如果不存在index.html，创建一个简单的重定向
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('创建index.html重定向...');
  fs.writeFileSync(
    path.join(distPath, 'index.html'),
    `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>PDX JSON Editor</title>
    <script>
      window.location.href = './index.html';
    </script>
  </head>
  <body>
    <p>重定向到 <a href="./index.html">PDX JSON Editor</a>...</p>
  </body>
</html>`
  );
}

// 部署选项
const options = {
  branch: 'gh-pages',
  repo: 'https://github.com/patdelphi/pdx-json-editor.git',
  message: '自动部署: %s',
  user: {
    name: 'GitHub Actions',
    email: 'actions@github.com'
  }
};

// 部署到GitHub Pages
console.log('正在部署到GitHub Pages...');
publish(distPath, options, (err) => {
  if (err) {
    console.error('部署失败:', err);
    process.exit(1);
  } else {
    console.log('部署成功!');
  }
});