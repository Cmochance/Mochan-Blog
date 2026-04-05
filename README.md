# 墨韵流芳 | Mochan Blog

> 水墨风格的静态博客站点，文章内容随项目一同构建发布。

## 当前架构

- 根目录：React + Vite 静态站点
- `src/content/posts.js`：本地静态文章数据
- 构建产物：`dist/`

## 功能特性

- 水墨视觉风格与响应式布局
- 文章列表/归档/详情阅读
- Markdown 渲染（前端安全清洗）
- GitHub Pages 友好的静态路由

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 本地运行

```bash
npm run dev
```

默认访问：[http://localhost:5173](http://localhost:5173)

### 3) 构建静态文件

```bash
npm run build
```

构建完成后，直接部署 `dist/` 即可。
