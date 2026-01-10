const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// 唯一管理员账号
const ADMIN_USER = {
  username: 'mochance@chen',
  password: 'cmc543826'
};

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 会话配置
app.use(session({
  secret: 'mochan-ink-blog-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // 生产环境设为 true (HTTPS)
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// ========== 认证相关 API ==========

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    req.session.isLoggedIn = true;
    req.session.user = username;
    res.json({ success: true, message: '登录成功' });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

// 登出
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: '登出失败' });
    } else {
      res.json({ success: true, message: '已登出' });
    }
  });
});

// 检查登录状态
app.get('/api/auth/status', (req, res) => {
  res.json({ 
    isLoggedIn: !!req.session.isLoggedIn,
    user: req.session.user || null
  });
});

// ========== 文章相关 API ==========

// 获取所有文章列表
app.get('/api/posts', (req, res) => {
  const postsDir = path.join(__dirname, '../posts');
  
  if (!fs.existsSync(postsDir)) {
    return res.json([]);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(filename => {
    const filepath = path.join(postsDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const { data, content: body } = matter(content);
    
    return {
      slug: filename.replace('.md', ''),
      title: data.title || '无题',
      date: data.date || '',
      excerpt: data.excerpt || body.slice(0, 150) + '...',
      tags: data.tags || [],
      cover: data.cover || null
    };
  });

  // 按日期排序
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(posts);
});

// 获取单篇文章
app.get('/api/posts/:slug', (req, res) => {
  const { slug } = req.params;
  const filepath = path.join(__dirname, '../posts', `${slug}.md`);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: '文章不存在' });
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const { data, content: body } = matter(content);
  
  res.json({
    slug,
    title: data.title || '无题',
    date: data.date || '',
    tags: data.tags || [],
    content: marked(body)
  });
});

// 创建新文章（需要登录）
app.post('/api/posts', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  const { title, content, tags } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: '标题和内容不能为空' });
  }

  const postsDir = path.join(__dirname, '../posts');
  
  // 确保目录存在
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 生成文件名（使用时间戳和标题）
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const slug = `${dateStr}-${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').slice(0, 50)}`;
  const filename = `${slug}.md`;
  const filepath = path.join(postsDir, filename);

  // 生成摘要
  const excerpt = content.replace(/[#*`>\-\[\]]/g, '').slice(0, 150) + '...';

  // 构建 frontmatter
  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
  const frontmatter = `---
title: ${title}
date: ${dateStr}
tags: [${tagsArray.join(', ')}]
excerpt: ${excerpt}
---

${content}`;

  try {
    fs.writeFileSync(filepath, frontmatter, 'utf-8');
    res.json({ 
      success: true, 
      message: '文章发布成功',
      slug: slug
    });
  } catch (error) {
    console.error('保存文章失败:', error);
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

// 删除文章（需要登录）
app.delete('/api/posts/:slug', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  const { slug } = req.params;
  const filepath = path.join(__dirname, '../posts', `${slug}.md`);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ success: false, message: '文章不存在' });
  }

  try {
    fs.unlinkSync(filepath);
    res.json({ success: true, message: '文章已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🎋 墨韵流芳博客已启动: http://localhost:${PORT}`);
});
