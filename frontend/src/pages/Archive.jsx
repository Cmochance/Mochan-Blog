import { Link } from 'react-router-dom';
import LoadMore from '../components/LoadMore.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { usePagedPosts } from '../hooks/usePagedPosts.js';
import { formatDate } from '../lib/date.js';

export default function Archive() {
  const { posts, loading, error, hasMore, setSearch, loadMore } = usePagedPosts({
    pageSize: 12
  });

  const grouped = posts.reduce((acc, post) => {
    const year = post.date ? new Date(post.date).getFullYear() : '未知年份';
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <section className="archive-page">
      <h1 className="section-title">
        <span className="title-decoration">〖</span>
        文章归档
        <span className="title-decoration">〗</span>
      </h1>
      <SearchBar onSearch={setSearch} placeholder="搜索标题或内容..." />

      {error ? (
        <div className="error-state">
          <p style={{ textAlign: 'center', color: 'var(--ink-light)' }}>归档加载失败，请稍后再试...</p>
        </div>
      ) : null}

      {loading && posts.length === 0 ? (
        <div className="loading">
          <div className="ink-drop"></div>
          <span>整理书卷中...</span>
        </div>
      ) : null}

      {!loading && posts.length === 0 ? (
        <div className="empty-state">
          <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontFamily: 'var(--font-display)' }}>
            暂无归档内容
          </p>
        </div>
      ) : null}

      {years.map((year) => (
        <div key={year}>
          <h2 className="archive-year">{year}</h2>
          <ul className="archive-list">
            {grouped[year].map((post) => (
              <li className="archive-item" key={post.slug}>
                <span className="archive-item-date">{formatDate(post.date, 'short')}</span>
                <Link to={`/post/${post.slug}`} className="archive-item-title">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
    </section>
  );
}
