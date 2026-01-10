function normalizeTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function parseTags(raw) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function slugify(title) {
  const normalized = String(title || '').trim().toLowerCase();
  if (!normalized) {
    return `post-${Date.now()}`;
  }

  const slug = normalized
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return slug || `post-${Date.now()}`;
}

function createExcerpt(markdown) {
  const text = String(markdown || '')
    .replace(/[#*`>\-\[\]\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  return `${text.slice(0, 150)}...`;
}

async function ensureUniqueSlug(db, base) {
  let slug = base;
  let counter = 1;

  while (true) {
    const result = await db.execute({
      sql: 'SELECT 1 FROM posts WHERE slug = ? LIMIT 1',
      args: [slug]
    });

    if (!result.rows || result.rows.length === 0) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}

module.exports = {
  normalizeTags,
  parseTags,
  slugify,
  createExcerpt,
  ensureUniqueSlug
};
