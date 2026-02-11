import { createClient } from '@supabase/supabase-js';

const DEFAULT_NOVEL_SLUG = (process.env.VITE_PUBLIC_NOVEL_SLUG || 'jishi-xiu').trim();

function parseIntInRange(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function createExcerpt(markdown) {
  const text = String(markdown || '')
    .replace(/[#*`>\-\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  return text.length <= 150 ? text : `${text.slice(0, 150)}...`;
}

function normalizeDate(row) {
  return row.source_updated_at || row.source_created_at || row.updated_at || row.created_at;
}

function normalizeTags(rawTags) {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return [];
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

function buildSearchFilter(search) {
  const value = String(search || '').trim();
  if (!value) return '';
  const safe = value.replace(/,/g, ' ').replace(/[%]/g, '');
  return `title.ilike.%${safe}%,content_markdown.ilike.%${safe}%,excerpt.ilike.%${safe}%`;
}

function getSupabaseClient() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = String(process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables on Vercel runtime');
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function runPostsQuery({ supabase, novelSlug, searchFilter, from, to }) {
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

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message || '加载文章列表失败');
  }

  return { data: data || [], count: count || 0 };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const page = parseIntInRange(req.query.page, 1, 1, 100000);
    const pageSize = parseIntInRange(req.query.pageSize, 6, 1, 50);
    const search = String(req.query.search || '');
    const configuredNovelSlug = String(req.query.novelSlug || DEFAULT_NOVEL_SLUG).trim();
    const searchFilter = buildSearchFilter(search);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseClient();
    const primary = await runPostsQuery({
      supabase,
      novelSlug: configuredNovelSlug,
      searchFilter,
      from,
      to
    });

    let usedNovelSlug = configuredNovelSlug;
    let result = primary;

    const shouldFallback =
      configuredNovelSlug && page === 1 && !searchFilter && (primary.data?.length || 0) === 0;

    if (shouldFallback) {
      const { data: publicNovel, error: novelError } = await supabase
        .from('blog_public_novels')
        .select('slug')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!novelError) {
        const fallbackSlug = String(publicNovel?.slug || '').trim();
        if (fallbackSlug && fallbackSlug !== configuredNovelSlug) {
          const fallback = await runPostsQuery({
            supabase,
            novelSlug: fallbackSlug,
            searchFilter,
            from,
            to
          });

          if ((fallback.data?.length || 0) > 0) {
            usedNovelSlug = fallbackSlug;
            result = fallback;
          }
        }
      }
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json({
      items: result.data.map(mapPostSummary),
      total: result.count || 0,
      page,
      pageSize,
      novelSlug: usedNovelSlug
    });
  } catch (error) {
    res.status(500).json({
      error: String(error?.message || '加载文章列表失败')
    });
  }
}
