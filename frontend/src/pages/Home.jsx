import { useNavigate } from 'react-router-dom';
import LoadMore from '../components/LoadMore.jsx';
import PostCard from '../components/PostCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { usePagedPosts } from '../hooks/usePagedPosts.js';

export default function Home() {
  const navigate = useNavigate();
  const { posts, loading, error, hasMore, setSearch, loadMore } = usePagedPosts({
    pageSize: 6
  });

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="brush-stroke">墨</span>
            <span className="brush-stroke" style={{ animationDelay: '0.3s' }}>
              韵
            </span>
            <span className="brush-stroke" style={{ animationDelay: '0.6s' }}>
              流
            </span>
            <span className="brush-stroke" style={{ animationDelay: '0.9s' }}>
              芳
            </span>
          </h1>
          <p className="hero-subtitle">落笔成墨，心随意走</p>
          <div className="hero-decoration">
            <svg className="bamboo" viewBox="0 0 100 200">
              <path d="M50 200 Q48 150 50 100 Q52 50 50 0" stroke="currentColor" fill="none" strokeWidth="3" />
              <path d="M50 160 Q30 140 20 150" stroke="currentColor" fill="none" strokeWidth="2" />
              <path d="M50 100 Q70 80 80 90" stroke="currentColor" fill="none" strokeWidth="2" />
              <path d="M50 50 Q30 30 15 40" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      <section className="posts-section">
        <h2 className="section-title">
          <span className="title-decoration">〖</span>
          近期文章
          <span className="title-decoration">〗</span>
        </h2>
        <SearchBar onSearch={setSearch} placeholder="搜索标题或内容..." />

        {error ? (
          <div className="error-state">
            <p style={{ textAlign: 'center', color: 'var(--ink-light)' }}>
              墨迹晕染失败，请稍后再试...
            </p>
          </div>
        ) : null}

        {loading && posts.length === 0 ? (
          <div className="loading">
            <div className="ink-drop"></div>
            <span>墨迹渲染中...</span>
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="empty-state">
            <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontFamily: 'var(--font-display)' }}>
              暂无文章，执笔待书...
            </p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                index={index}
                onClick={() => navigate(`/post/${post.slug}`)}
              />
            ))}
          </div>
        )}

        <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
      </section>
    </>
  );
}
