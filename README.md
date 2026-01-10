# 墨韵流芳 | Mochan Blog

> 一个水墨风格的个人博客系统

![水墨风博客](https://img.shields.io/badge/style-水墨风-black)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Node.js](https://img.shields.io/badge/node-20+-green)

## ✨ 特色

- 🎨 **水墨画风格** - 动态生成的山水背景，宣纸纹理效果
- 📝 **Markdown 支持** - 使用 Markdown 撰写文章
- 🚀 **Docker 部署** - 一键启动，开箱即用
- 🎭 **SPA 体验** - 流畅的页面切换动画
- 📱 **响应式设计** - 完美适配各种设备

## 🏃 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 克隆项目
git clone https://github.com/your-username/mochan-blog.git
cd mochan-blog

# 启动服务
docker-compose up -d

# 访问 http://localhost
```

### 方式二：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📁 项目结构

```
mochan-blog/
├── public/              # 静态资源
│   ├── css/
│   │   └── style.css    # 水墨风格样式
│   └── js/
│       ├── app.js       # 应用主逻辑
│       └── ink-background.js  # 水墨背景生成
├── server/
│   └── app.js           # Express 服务器
├── posts/               # Markdown 文章目录
│   └── *.md
├── nginx/               # Nginx 配置
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 📝 撰写文章

在 `posts/` 目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2024-01-15
tags: [标签1, 标签2]
excerpt: 文章摘要...
---

# 正文内容

这里是 Markdown 格式的正文...
```

## 🎨 设计理念

**「墨韵流芳」** - 以传统水墨画为灵感，追求：

- **留白** - 给予读者思考的空间
- **意境** - 每个细节都有其存在的意义
- **韵律** - 流畅的动画和交互体验

### 色彩体系

| 名称 | 色值 | 用途 |
|------|------|------|
| 墨色 | `#1a1a1a` | 主要文字 |
| 宣纸 | `#f5f1e8` | 背景色 |
| 朱砂 | `#c23a2b` | 强调点缀 |
| 淡墨 | `#6b6b6b` | 次要文字 |

## 🔧 配置

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3000` | 服务端口 |
| `NODE_ENV` | `development` | 运行环境 |

### Nginx 配置

生产环境建议使用 Nginx 反向代理，配置文件位于 `nginx/nginx.conf`。

## 📜 开源协议

MIT License

---

*「水墨丹青，意在笔先」*
