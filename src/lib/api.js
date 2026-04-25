import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { comparePosts, posts } from '../content/posts.js';

marked.setOptions({
  gfm: true,
  breaks: true
});

function createExcerpt(markdown) {
  const text = String(markdown || '')
    .replace(/[#*`>\-\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  return text.length <= 150 ? text : `${text.slice(0, 150)}...`;
}

function renderMarkdown(markdown) {
  const html = marked.parse(String(markdown || ''));
  return DOMPurify.sanitize(html);
}

function mapPostSummary(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || createExcerpt(post.contentMarkdown),
    tags: Array.isArray(post.tags) ? post.tags : [],
    date: post.date
  };
}

const allPosts = [...posts]
  .map((post) => ({
    ...post,
    excerpt: post.excerpt || createExcerpt(post.contentMarkdown),
    tags: Array.isArray(post.tags) ? post.tags : []
  }))
  .sort(comparePosts);

export async function fetchPosts({ page = 1, pageSize = 6, search = '' } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 6, 1), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const keyword = String(search || '').trim().toLowerCase();
  const filteredPosts = keyword
    ? allPosts.filter((post) =>
        [post.title, post.excerpt, post.contentMarkdown, ...(post.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      )
    : allPosts;
  const items = filteredPosts.slice(from, to + 1).map(mapPostSummary);

  return {
    items,
    total: filteredPosts.length,
    page: safePage,
    pageSize: safePageSize
  };
}

export async function fetchPost(slug) {
  const post = allPosts.find((item) => item.slug === slug);
  if (!post) {
    throw new Error('文章不存在');
  }

  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    contentHtml: renderMarkdown(post.contentMarkdown),
    comments: post.comments
  };
}
