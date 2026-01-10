# 部署指南 (Vercel + Turso)

## 结构说明

- `frontend/` React 前端 (Vite)
- `backend/` Node API (Vercel Serverless)
- `database/` Turso 数据库初始化

## 1. 创建 Turso 数据库

1. 安装 Turso CLI 并登录。
2. 创建数据库 (示例名称):
   ```bash
   turso db create mochan-blog
   ```
3. 生成访问令牌:
   ```bash
   turso db tokens create mochan-blog
   ```
4. 记录数据库地址与 token，稍后用于环境变量。

## 2. 初始化数据库结构

```bash
turso db shell mochan-blog < database/migrations/001_init.sql
```

如果你使用 Turso Web Console，也可以在 SQL Editor 中粘贴 `database/migrations/001_init.sql` 执行。

## 3. (可选) 导入旧文章

将旧的 Markdown 文件放入 `database/seed/posts/`，然后执行:

```bash
cd backend
npm install
node scripts/import-posts.js
```

## 4. 部署后端到 Vercel

1. 新建 Vercel Project，Root Directory 选择 `backend`。
2. 配置环境变量:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CORS_ORIGIN` (前端域名，如 `https://your-frontend.vercel.app`)
3. 部署完成后记录后端地址，例如:
   `https://your-backend.vercel.app/api`

## 5. 部署前端到 Vercel

1. 新建 Vercel Project，Root Directory 选择 `frontend`。
2. 配置环境变量:
   - `VITE_API_BASE_URL=https://your-backend.vercel.app/api`
3. 部署完成后打开前端地址验证。

## 6. 验证与管理

- 公共页面仅展示内容，无登录入口。
- 管理入口: `https://your-frontend.vercel.app/admin`
- 使用管理员账号登录后可发布/删除文章。

## 本地开发 (可选)

前端:
```bash
cd frontend
npm install
npm run dev
```

后端:
```bash
cd backend
npm install
node src/server.js
```

`.env` 参考 `backend/.env.example`。
