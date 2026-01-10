const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../utils/auth');
const { renderMarkdown } = require('../utils/markdown');
const {
  normalizeTags,
  parseTags,
  createExcerpt,
  slugify,
  ensureUniqueSlug
} = require('../utils/posts');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 6, 1), 50);
    const offset = (page - 1) * pageSize;
    const search = String(req.query.q || '').trim();

    const where = search
      ? 'WHERE title LIKE ? OR content_markdown LIKE ? OR tags LIKE ?'
      : '';
    const like = `%${search}%`;
    const args = search ? [like, like, like] : [];

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM posts ${where}`,
      args
    });

    const total = countResult.rows[0]?.count || 0;

    const postsResult = await db.execute({
      sql: `SELECT slug, title, excerpt, tags, created_at FROM posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, pageSize, offset]
    });

    const items = postsResult.rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      tags: parseTags(row.tags),
      date: row.created_at
    }));

    res.json({ items, total, page, pageSize });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const db = getDb();
    const { slug } = req.params;

    const result = await db.execute({
      sql: 'SELECT slug, title, content_markdown, tags, created_at FROM posts WHERE slug = ? LIMIT 1',
      args: [slug]
    });

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: '文章不存在' });
    }

    res.json({
      slug: row.slug,
      title: row.title,
      date: row.created_at,
      tags: parseTags(row.tags),
      contentHtml: renderMarkdown(row.content_markdown)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const db = getDb();
    const { title, content, tags } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }

    const now = new Date().toISOString();
    const baseSlug = `${now.split('T')[0]}-${slugify(title)}`;
    const slug = await ensureUniqueSlug(db, baseSlug);
    const tagList = normalizeTags(tags);
    const excerpt = createExcerpt(content);

    await db.execute({
      sql: `INSERT INTO posts (slug, title, content_markdown, excerpt, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      args: [slug, title, content, excerpt, JSON.stringify(tagList), now, now]
    });

    res.json({ success: true, slug });
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug', requireAuth, async (req, res, next) => {
  try {
    const db = getDb();
    const { slug } = req.params;

    const result = await db.execute({
      sql: 'DELETE FROM posts WHERE slug = ?',
      args: [slug]
    });

    if (!result.rowsAffected) {
      return res.status(404).json({ message: '文章不存在' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
