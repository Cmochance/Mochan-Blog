import { useCallback, useEffect, useState } from 'react';
import { fetchPosts } from '../lib/api.js';

export function usePagedPosts({ pageSize = 6 } = {}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (nextPage, nextSearch, replace) => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchPosts({
          page: nextPage,
          pageSize,
          search: nextSearch
        });

        const items = Array.isArray(data.items) ? data.items : [];
        setTotal(data.total || 0);
        setPage(nextPage);
        setPosts((prev) => (replace ? items : [...prev, ...items]));
      } catch (err) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    load(1, search, true);
  }, [search, load]);

  const loadMore = () => {
    if (loading) return;
    load(page + 1, search, false);
  };

  const refresh = () => load(1, search, true);

  return {
    posts,
    total,
    loading,
    error,
    search,
    setSearch,
    hasMore: posts.length < total,
    loadMore,
    refresh
  };
}
