import { useEffect, useState } from 'react';
import LoadMore from '../components/LoadMore.jsx';
import PostCard from '../components/PostCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import {
  authStatus,
  createPost,
  deletePost,
  login,
  logout
} from '../lib/api.js';
import { usePagedPosts } from '../hooks/usePagedPosts.js';

export default function Admin() {
  const [authState, setAuthState] = useState({ status: 'checking', user: null });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [editor, setEditor] = useState({ title: '', tags: '', content: '' });
  const [notice, setNotice] = useState({ type: '', text: '' });

  const {
    posts,
    loading,
    error,
    hasMore,
    setSearch,
    loadMore,
    refresh
  } = usePagedPosts({ pageSize: 6 });

  useEffect(() => {
    let mounted = true;

    authStatus()
      .then((data) => {
        if (!mounted) return;
        if (data.isLoggedIn) {
          setAuthState({ status: 'authed', user: data.user || null });
        } else {
          logout();
          setAuthState({ status: 'guest', user: null });
        }
      })
      .catch(() => {
        if (!mounted) return;
        logout();
        setAuthState({ status: 'guest', user: null });
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notice.text) return undefined;
    const timer = setTimeout(() => setNotice({ type: '', text: '' }), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    try {
      const data = await login(loginForm.username, loginForm.password);
      setAuthState({ status: 'authed', user: data.user || loginForm.username });
      setLoginForm({ username: '', password: '' });
      refresh();
    } catch (error) {
      setLoginError(error.message || '登录失败');
    }
  };

  const handleLogout = () => {
    logout();
    setAuthState({ status: 'guest', user: null });
  };

  const handlePublish = async () => {
    if (!editor.title.trim()) {
      setNotice({ type: 'error', text: '请输入标题' });
      return;
    }

    if (!editor.content.trim()) {
      setNotice({ type: 'error', text: '请输入内容' });
      return;
    }

    try {
      await createPost({
        title: editor.title.trim(),
        tags: editor.tags.trim(),
        content: editor.content.trim()
      });
      setNotice({ type: 'success', text: '文章发布成功！' });
      setEditor({ title: '', tags: '', content: '' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || '发布失败' });
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('确定要删除这篇文章吗？墨迹一去不复返...')) {
      return;
    }

    try {
      await deletePost(slug);
      setNotice({ type: 'success', text: '文章已删除' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || '删除失败' });
    }
  };

  if (authState.status === 'checking') {
    return (
      <div className="loading">
        <div className="ink-drop"></div>
        <span>检验印信...</span>
      </div>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1 className="section-title">
          <span className="title-decoration">〖</span>
          管理页面
          <span className="title-decoration">〗</span>
        </h1>
        {authState.status === 'authed' ? (
          <button className="editor-btn editor-btn-secondary" onClick={handleLogout}>
            登出
          </button>
        ) : null}
      </div>

      {authState.status !== 'authed' ? (
        <div className="admin-login-card">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">笔名</label>
              <input
                type="text"
                className="form-input"
                value={loginForm.username}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, username: event.target.value }))
                }
                placeholder="请输入用户名"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">墨印</label>
              <input
                type="password"
                className="form-input"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="请输入密码"
                required
              />
            </div>
            <div className="form-error">{loginError}</div>
            <button type="submit" className="form-submit">
              落笔
            </button>
          </form>
          <p className="admin-note">管理入口不在公开导航中。</p>
        </div>
      ) : (
        <>
          <div className="editor-panel visible">
            <div className="editor-header">
              <span className="editor-icon">✍</span>
              <span className="editor-title">挥毫泼墨</span>
            </div>
            <div className="editor-content">
              <div className="form-group">
                <input
                  type="text"
                  className="form-input editor-input"
                  placeholder="标题 - 落笔之前，先有其意"
                  value={editor.title}
                  onChange={(event) =>
                    setEditor((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input editor-input"
                  placeholder="标签（用逗号分隔）"
                  value={editor.tags}
                  onChange={(event) =>
                    setEditor((prev) => ({ ...prev, tags: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-input editor-textarea"
                  placeholder="正文 - 支持 Markdown 语法"
                  value={editor.content}
                  onChange={(event) =>
                    setEditor((prev) => ({ ...prev, content: event.target.value }))
                  }
                ></textarea>
              </div>
              <div className="editor-actions">
                <button
                  className="editor-btn editor-btn-secondary"
                  onClick={() => setEditor({ title: '', tags: '', content: '' })}
                  type="button"
                >
                  清空
                </button>
                <button
                  className="editor-btn editor-btn-primary"
                  onClick={handlePublish}
                  type="button"
                >
                  发布文章
                </button>
              </div>
              <div className={`editor-message ${notice.type}`}>{notice.text}</div>
            </div>
          </div>

          <section className="admin-posts">
            <h2 className="section-title">
              <span className="title-decoration">〖</span>
              文章管理
              <span className="title-decoration">〗</span>
            </h2>
            <SearchBar onSearch={setSearch} placeholder="搜索标题、内容或标签..." />

            {error ? (
              <div className="error-state">
                <p style={{ textAlign: 'center', color: 'var(--ink-light)' }}>
                  管理列表加载失败
                </p>
              </div>
            ) : null}

            {loading && posts.length === 0 ? (
              <div className="loading">
                <div className="ink-drop"></div>
                <span>墨迹整理中...</span>
              </div>
            ) : null}

            {!loading && posts.length === 0 ? (
              <div className="empty-state">
                <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontFamily: 'var(--font-display)' }}>
                  暂无文章
                </p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map((post, index) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    actions={(
                      <button
                        className="post-delete-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(post.slug);
                        }}
                        type="button"
                      >
                        删除
                      </button>
                    )}
                  />
                ))}
              </div>
            )}

            <LoadMore hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
          </section>
        </>
      )}
    </section>
  );
}
