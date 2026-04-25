# 墨韵流芳 | Mochan Blog

> 水墨风格的静态博客站点，文章内容随项目一同构建发布。

## 当前架构

- 根目录：React + Vite 静态站点
- `posts/`：根目录文章目录，每篇文章一个独立文件
- `src/content/posts.js`：文章聚合入口，自动读取 `posts/*.post.js`
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

## 发布文章

1. 复制 `posts/_template.js` 为一个新文件。
2. 将文件名改为 `你的-slug.post.js`，放在 `posts/` 目录下。
3. 按模板填写 `slug`、`title`、`date`、`tags`、`contentMarkdown`，`excerpt` 可选。
4. 文章列表优先按 `date` 倒序排列；同一天发布的文章按文件名主干倒序排列，适合连载章节使用 `YYMMDD-ji-shi-xiu-卷号-章号.post.js` 这样的命名。
5. 本地执行 `npm run dev` 或 `npm run build` 确认无误。
6. 推送到 GitHub 后，Pages 会自动重新部署。
