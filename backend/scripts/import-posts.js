try {
  require('dotenv').config();
} catch (error) {
  // dotenv optional
}

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { createClient } = require('@libsql/client');
const { createExcerpt } = require('../src/utils/posts');

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error('TURSO_DATABASE_URL is required');
  process.exit(1);
}

const authToken = process.env.TURSO_AUTH_TOKEN || '';
const db = createClient({ url, authToken });

const postsDir = path.join(__dirname, '../../database/seed/posts');

if (!fs.existsSync(postsDir)) {
  console.log('No seed posts folder found.');
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'));

if (files.length === 0) {
  console.log('No markdown posts to import.');
  process.exit(0);
}

const toIso = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
};

(async () => {
  for (const file of files) {
    const filepath = path.join(postsDir, file);
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(raw);

    const slug = path.basename(file, '.md');
    const title = data.title || slug;
    const tags = Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === 'string'
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];
    const createdAt = data.date ? toIso(data.date) : new Date().toISOString();
    const excerpt = data.excerpt || createExcerpt(content);

    await db.execute({
      sql: `INSERT OR IGNORE INTO posts (slug, title, content_markdown, excerpt, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      args: [slug, title, content, excerpt, JSON.stringify(tags), createdAt, createdAt]
    });

    console.log(`Imported ${slug}`);
  }

  console.log('Import complete.');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
