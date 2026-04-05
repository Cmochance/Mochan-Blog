const modules = import.meta.glob('../../posts/*.post.js', {
  eager: true,
  import: 'default'
});

function normalizePost(post, sourcePath) {
  if (!post || typeof post !== 'object') {
    throw new Error(`Invalid post module: ${sourcePath}`);
  }

  const slug = String(post.slug || '').trim();
  const title = String(post.title || '').trim();
  const date = String(post.date || '').trim();
  const contentMarkdown = String(post.contentMarkdown || '').trim();

  if (!slug || !title || !date || !contentMarkdown) {
    throw new Error(`Post is missing required fields: ${sourcePath}`);
  }

  return {
    ...post,
    slug,
    title,
    date,
    excerpt: post.excerpt ? String(post.excerpt).trim() : '',
    tags: Array.isArray(post.tags)
      ? post.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    contentMarkdown
  };
}

const loadedPosts = Object.entries(modules)
  .map(([sourcePath, post]) => normalizePost(post, sourcePath))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const duplicateSlugs = loadedPosts.reduce((duplicates, post, index) => {
  const duplicated = loadedPosts.findIndex((candidate) => candidate.slug === post.slug) !== index;
  if (duplicated && !duplicates.includes(post.slug)) {
    duplicates.push(post.slug);
  }
  return duplicates;
}, []);

if (duplicateSlugs.length > 0) {
  throw new Error(`Duplicate post slug(s): ${duplicateSlugs.join(', ')}`);
}

export const posts = loadedPosts;
