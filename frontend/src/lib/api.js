import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { getSupabaseClients } from './supabase.js';

const PUBLIC_NOVEL_SLUG = (import.meta.env.VITE_PUBLIC_NOVEL_SLUG || 'jishi-xiu').trim();

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

function normalizeTags(rawTags) {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return [];
}

function normalizeDate(row) {
  return row.source_updated_at || row.source_created_at || row.updated_at || row.created_at;
}

function mapPostSummary(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || createExcerpt(row.content_markdown),
    tags: normalizeTags(row.tags),
    date: normalizeDate(row)
  };
}

function applyNovelFilter(query) {
  if (!PUBLIC_NOVEL_SLUG) return query;
  return query.eq('novel_slug', PUBLIC_NOVEL_SLUG);
}

async function fetchFallbackNovelSlug(supabase) {
  const { data } = await requireData(
    supabase.from('blog_public_novels').select('slug').order('created_at', { ascending: true }).limit(1).maybeSingle(),
    '加载文章列表失败'
  );

  return String(data?.slug || '').trim();
}

function buildSearchFilter(search) {
  const value = String(search || '').trim();
  if (!value) return '';

  // PostgREST `or` syntax; comma is condition separator so strip it from user input.
  const safe = value.replace(/,/g, ' ').replace(/[%]/g, '');
  return `title.ilike.%${safe}%,content_markdown.ilike.%${safe}%,excerpt.ilike.%${safe}%`;
}

async function requireData(result, fallbackMessage) {
  const { data, error, count } = result;
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
  return { data, count };
}

function isRetryableClientError(error) {
  const message = String(error?.message || '');
  return (
    /Failed to fetch/i.test(message) ||
    /NetworkError/i.test(message) ||
    /fetch failed/i.test(message)
  );
}

async function withSupabaseFallback(execute, fallbackMessage) {
  const clients = getSupabaseClients();
  let lastError = null;

  for (let i = 0; i < clients.length; i += 1) {
    const client = clients[i];
    try {
      return await execute(client);
    } catch (error) {
      lastError = error;
      const canRetry = i < clients.length - 1 && isRetryableClientError(error);
      if (!canRetry) {
        throw error;
      }
    }
  }

  throw lastError || new Error(fallbackMessage);
}

export async function fetchPosts({ page = 1, pageSize = 6, search = '' } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 6, 1), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const searchFilter = buildSearchFilter(search);

  const { data, count } = await withSupabaseFallback(async (supabase) => {
    const runQuery = async (novelSlug) => {
      let query = supabase
        .from('blog_public_posts')
        .select(
          'slug,title,excerpt,tags,content_markdown,source_created_at,source_updated_at,created_at,updated_at,chapter_number,novel_slug',
          { count: 'exact' }
        )
        .order('chapter_number', { ascending: false })
        .order('source_updated_at', { ascending: false, nullsFirst: false })
        .range(from, to);

      if (novelSlug) {
        query = query.eq('novel_slug', novelSlug);
      }

      if (searchFilter) {
        query = query.or(searchFilter);
      }

      return requireData(query, '加载文章列表失败');
    };

    const primary = await runQuery(PUBLIC_NOVEL_SLUG);
    const hasPrimaryItems = Array.isArray(primary.data) && primary.data.length > 0;
    const shouldFallback =
      !hasPrimaryItems && safePage === 1 && !searchFilter && Boolean(PUBLIC_NOVEL_SLUG);

    if (!shouldFallback) {
      return primary;
    }

    const fallbackSlug = await fetchFallbackNovelSlug(supabase);
    if (!fallbackSlug || fallbackSlug === PUBLIC_NOVEL_SLUG) {
      return primary;
    }

    const fallback = await runQuery(fallbackSlug);
    if (Array.isArray(fallback.data) && fallback.data.length > 0) {
      console.warn(
        `[blog] No posts for novel_slug "${PUBLIC_NOVEL_SLUG}". Falling back to "${fallbackSlug}".`
      );
      return fallback;
    }

    return primary;
  }, '加载文章列表失败');

  const items = (data || []).map(mapPostSummary);

  return {
    items,
    total: count || 0,
    page: safePage,
    pageSize: safePageSize
  };
}

export async function fetchPost(slug) {
  const { data } = await withSupabaseFallback(async (supabase) => {
    const buildQuery = () =>
      supabase
        .from('blog_public_posts')
        .select(
          'slug,title,tags,content_markdown,source_created_at,source_updated_at,created_at,updated_at,chapter_number,novel_slug'
        )
        .eq('slug', slug)
        .limit(1)
        .maybeSingle();

    const primary = await requireData(applyNovelFilter(buildQuery()), '加载文章详情失败');
    if (primary.data || !PUBLIC_NOVEL_SLUG) {
      return primary;
    }

    // If novel slug changed, keep article page reachable by globally unique slug.
    const fallback = await requireData(buildQuery(), '加载文章详情失败');
    if (fallback.data) {
      console.warn(
        `[blog] Post "${slug}" not found under novel_slug "${PUBLIC_NOVEL_SLUG}", fetched without novel filter.`
      );
      return fallback;
    }

    return primary;
  }, '加载文章详情失败');

  if (!data) {
    throw new Error('文章不存在');
  }

  return {
    slug: data.slug,
    title: data.title,
    date: normalizeDate(data),
    tags: normalizeTags(data.tags),
    contentHtml: renderMarkdown(data.content_markdown)
  };
}
