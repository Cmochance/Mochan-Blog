# 部署指南（静态前端 + Supabase）

本文档对应当前方案：`Mochan-Blog` 仅部署前端，数据直接读取 `MochanAI_Letters` 的 Supabase 数据库公开投影表。

## 0. 前提

- 你已有可用的 `MochanAI_Letters` Supabase 数据库。
- 已在 `MochanAI_Letters` 执行迁移：
  - `/Users/alysechen/alysechen/github/MochanAI_Letters/letters-backend/drizzle/migrations/0006_blog_public_posts.sql`

## 1. 在 Letters 数据库开启公开小说

在 Supabase SQL Editor 执行：

```sql
INSERT INTO blog_public_novels (novel_id, slug, title)
SELECT id, 'jishi-xiu', title
FROM novels
WHERE title = '几时休'
LIMIT 1
ON CONFLICT (novel_id) DO NOTHING;
```

验证是否成功：

```sql
SELECT novel_id, slug, title, created_at
FROM blog_public_novels
WHERE slug = 'jishi-xiu';

SELECT chapter_id, slug, title, chapter_number, source_updated_at
FROM blog_public_posts
WHERE novel_slug = 'jishi-xiu'
ORDER BY chapter_number DESC
LIMIT 20;
```

## 2. 本地验证前端

```bash
cd frontend
cp .env.example .env.local
```

填写：

- `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<anon-key>`
- `VITE_PUBLIC_NOVEL_SLUG=jishi-xiu`

运行：

```bash
npm install
npm run dev
```

## 3. 部署到 Vercel

1. 新建 Vercel Project，Root Directory 选择 `frontend`。
2. 设置环境变量（与 `.env.local` 相同）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PUBLIC_NOVEL_SLUG`
3. 部署完成后访问站点验证。

## 4. 同步机制说明

- 章节新增/修改：`chapters` 触发器自动 upsert 到 `blog_public_posts`
- 章节删除：自动从 `blog_public_posts` 删除
- 白名单移除：从 `blog_public_novels` 删除后，会自动清空该小说的公开文章

因此不再需要 `Mochan-Blog/backend` 的发布/同步逻辑。
