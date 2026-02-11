# 墨韵流芳 | Mochan Blog

> 水墨风格静态博客前端，直接读取 `MochanAI_Letters` 的公开章节数据（仅展示指定小说）。

## 当前架构

- `frontend/`: React + Vite 静态站点（唯一需要部署的模块）
- `backend/`: 旧版 API（已不再依赖，可保留作历史参考）
- 数据源: Supabase 公共只读表 `blog_public_posts`（位于 `MochanAI_Letters` 数据库）

## 功能特性

- 水墨视觉风格与响应式布局
- 章节列表/归档/详情阅读
- Markdown 渲染（前端安全清洗）
- 仅展示白名单小说（默认 slug: `jishi-xiu`）

## 快速开始

### 1) 配置环境变量

复制并填写：`frontend/.env.example`

```bash
cd frontend
cp .env.example .env.local
```

必填项：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_NOVEL_SLUG`（默认 `jishi-xiu`）

### 2) 本地运行

```bash
cd frontend
npm install
npm run dev
```

默认访问：[http://localhost:5173](http://localhost:5173)

## 与 MochanAI_Letters 对接

你需要先在 `MochanAI_Letters` 数据库执行迁移：

- `/Users/alysechen/alysechen/github/MochanAI_Letters/letters-backend/drizzle/migrations/0006_blog_public_posts.sql`

该迁移会创建：

- `blog_public_novels`：公开小说白名单
- `blog_public_posts`：博客读取投影表
- 触发器：章节新增/修改/删除自动同步
- RLS：仅开放只读查询给 `anon/authenticated`

然后将小说「几时休」加入白名单：

```sql
INSERT INTO blog_public_novels (novel_id, slug, title)
SELECT id, 'jishi-xiu', title
FROM novels
WHERE title = '几时休'
LIMIT 1
ON CONFLICT (novel_id) DO NOTHING;
```

## 部署

推荐部署 `frontend/` 到 Vercel（静态站点）。

- Build Command: `npm run build`
- Output Directory: `dist`
- 环境变量使用上文 `VITE_*`

详细步骤见：`deployment.md`
