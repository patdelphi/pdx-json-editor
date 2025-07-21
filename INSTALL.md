# 安装说明

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
```