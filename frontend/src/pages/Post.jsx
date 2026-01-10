import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPost } from '../lib/api.js';
import { formatDate } from '../lib/date.js';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    fetchPost(slug)
      .then((data) => {
        if (!mounted) return;
        setPost(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('not-found');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="loading">
        <div className="ink-drop"></div>
        <span>展卷中...</span>
      </div>
    );
  }

  if (!post || error) {
    return (
      <section style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            color: 'var(--ink-wash)',
            marginBottom: '1rem'
          }}
        >
          四〇四
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-light)',
            marginBottom: '2rem'
          }}
        >
          此处空无一物，如未着墨的宣纸
        </p>
        <Link to="/" className="back-btn">
          ← 返回首页
        </Link>
      </section>
    );
  }

  return (
    <article className="article-page">
      <Link to="/" className="back-btn">
        ← 返回
      </Link>

      <header className="article-header">
        <h1 className="article-title">{post.title}</h1>
        <div className="article-meta">
          <time>{formatDate(post.date)}</time>
          {post.tags && post.tags.length > 0 ? (
            <>
              <span> · </span>
              <span>{post.tags.join('、')}</span>
            </>
          ) : null}
        </div>
      </header>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
