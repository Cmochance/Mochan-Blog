import { createClient } from '@supabase/supabase-js';

const DEFAULT_NOVEL_SLUG = (process.env.VITE_PUBLIC_NOVEL_SLUG || 'jishi-xiu').trim();

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

async function queryPost({ supabase, slug, novelSlug }) {
  let query = supabase
    .from('blog_public_posts')
    .select(
      'slug,title,tags,content_markdown,source_created_at,source_updated_at,created_at,updated_at,chapter_number,novel_slug'
    )
    .eq('slug', slug)
    .limit(1);

  if (novelSlug) {
    query = query.eq('novel_slug', novelSlug);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(error.message || '加载文章详情失败');
  }
  return data || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const slug = String(req.query.slug || '').trim();
    if (!slug) {
      res.status(400).json({ error: 'slug is required' });
      return;
    }

    const configuredNovelSlug = String(req.query.novelSlug || DEFAULT_NOVEL_SLUG).trim();
    const supabase = getSupabaseClient();

    let row = await queryPost({
      supabase,
      slug,
      novelSlug: configuredNovelSlug
    });

    let usedNovelSlug = configuredNovelSlug;

    if (!row && configuredNovelSlug) {
      row = await queryPost({
        supabase,
        slug,
        novelSlug: ''
      });
      if (row) {
        usedNovelSlug = String(row.novel_slug || '').trim();
      }
    }

    if (!row) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json({
      slug: row.slug,
      title: row.title,
      date: normalizeDate(row),
      tags: normalizeTags(row.tags),
      contentMarkdown: row.content_markdown,
      novelSlug: usedNovelSlug || String(row.novel_slug || '').trim()
    });
  } catch (error) {
    res.status(500).json({
      error: String(error?.message || '加载文章详情失败')
    });
  }
}
