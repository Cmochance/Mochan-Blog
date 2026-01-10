/**
 * 墨韵流芳 - 博客应用主逻辑
 */

class MochanBlog {
  constructor() {
    this.app = document.getElementById('app');
    this.currentPath = window.location.pathname;
    this.isLoggedIn = false;
    this.editorExpanded = true;
    
    this.init();
  }

  async init() {
    // 检查登录状态
    await this.checkAuthStatus();
    
    // 初始化路由
    this.setupRouter();
    
    // 设置登录表单
    this.setupLoginForm();
    
    // 加载当前页面
    this.handleRoute(this.currentPath);
    
    // 添加页面切换动画
    this.setupTransitions();
  }

  /**
   * 检查登录状态
   */
  async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      this.isLoggedIn = data.isLoggedIn;
      this.updateAuthUI();
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  }

  /**
   * 更新认证相关UI
   */
  updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const editorPanel = document.getElementById('editor-panel');
    
    if (this.isLoggedIn) {
      // 印章添加登录状态样式（微妙的光晕效果）
      authBtn.classList.add('logged-in');
      editorPanel.style.display = 'block';
      // 添加入场动画
      setTimeout(() => {
        editorPanel.classList.add('visible');
      }, 100);
    } else {
      authBtn.classList.remove('logged-in');
      editorPanel.style.display = 'none';
      editorPanel.classList.remove('visible');
    }
  }

  /**
   * 处理登录/登出按钮点击
   */
  handleAuthClick() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this.openLoginModal();
    }
  }

  /**
   * 打开登录模态框
   */
  openLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.add('active');
    document.getElementById('login-username').focus();
  }

  /**
   * 关闭登录模态框
   */
  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.remove('active');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').textContent = '';
  }

  /**
   * 设置登录表单
   */
  setupLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.login();
    });

    // 点击模态框外部关闭
    const modal = document.getElementById('login-modal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeLoginModal();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeLoginModal();
      }
    });
  }

  /**
   * 登录
   */
  async login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.isLoggedIn = true;
        this.updateAuthUI();
        this.closeLoginModal();
        this.showMessage('editor-message', '欢迎回来，执笔人', 'success');
      } else {
        errorEl.textContent = data.message || '登录失败';
      }
    } catch (error) {
      errorEl.textContent = '网络错误，请稍后重试';
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
      this.isLoggedIn = false;
      this.updateAuthUI();
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  /**
   * 切换编辑器展开/收起
   */
  toggleEditor() {
    const content = document.getElementById('editor-content');
    const icon = document.getElementById('editor-toggle-icon');
    
    this.editorExpanded = !this.editorExpanded;
    
    if (this.editorExpanded) {
      content.style.display = 'block';
      icon.textContent = '▼';
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
    }
  }

  /**
   * 清空编辑器
   */
  clearEditor() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-tags').value = '';
    document.getElementById('post-content').value = '';
    this.showMessage('editor-message', '已清空', 'info');
  }

  /**
   * 发布文章
   */
  async publishPost() {
    const title = document.getElementById('post-title').value.trim();
    const tags = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title) {
      this.showMessage('editor-message', '请输入标题', 'error');
      return;
    }
    
    if (!content) {
      this.showMessage('editor-message', '请输入内容', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, tags, content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showMessage('editor-message', '文章发布成功！墨迹已成', 'success');
        this.clearEditor();
        
        // 如果在首页，刷新文章列表
        if (this.currentPath === '/') {
          setTimeout(() => this.loadPosts(), 500);
        }
      } else {
        this.showMessage('editor-message', data.message || '发布失败', 'error');
      }
    } catch (error) {
      this.showMessage('editor-message', '网络错误，请稍后重试', 'error');
    }
  }

  /**
   * 显示消息
   */
  showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `editor-message ${type}`;
    
    setTimeout(() => {
      el.textContent = '';
      el.className = 'editor-message';
    }, 3000);
  }

  /**
   * 设置路由监听
   */
  setupRouter() {
    // 拦截所有带 data-link 的链接点击
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        this.navigate(href);
      }
    });

    // 监听浏览器前进后退
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
  }

  /**
   * 导航到指定路径
   */
  navigate(path) {
    if (path !== this.currentPath) {
      history.pushState(null, '', path);
      this.currentPath = path;
      this.handleRoute(path);
      this.updateActiveNav(path);
    }
  }

  /**
   * 更新导航高亮
   */
  updateActiveNav(path) {
    document.querySelectorAll('.nav-link:not(.auth-btn)').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path.startsWith('/post/') && href === '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * 处理路由
   */
  async handleRoute(path) {
    // 页面切换动画
    this.app.style.opacity = '0';
    this.app.style.transform = 'translateY(20px)';
    
    await new Promise(r => setTimeout(r, 200));

    if (path === '/') {
      await this.renderHome();
    } else if (path === '/archive') {
      await this.renderArchive();
    } else if (path === '/about') {
      this.renderAbout();
    } else if (path.startsWith('/post/')) {
      const slug = path.replace('/post/', '');
      await this.renderPost(slug);
    } else {
      this.renderNotFound();
    }

    // 恢复显示
    this.app.style.opacity = '1';
    this.app.style.transform = 'translateY(0)';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    this.updateActiveNav(path);
  }

  /**
   * 设置页面切换动画
   */
  setupTransitions() {
    this.app.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }

  /**
   * 渲染首页
   */
  async renderHome() {
    this.app.innerHTML = `
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="brush-stroke">墨</span>
            <span class="brush-stroke" style="animation-delay: 0.3s">韵</span>
            <span class="brush-stroke" style="animation-delay: 0.6s">流</span>
            <span class="brush-stroke" style="animation-delay: 0.9s">芳</span>
          </h1>
          <p class="hero-subtitle">落笔成墨，心随意走</p>
          <div class="hero-decoration">
            <svg class="bamboo" viewBox="0 0 100 200">
              <path d="M50 200 Q48 150 50 100 Q52 50 50 0" stroke="currentColor" fill="none" stroke-width="3"/>
              <path d="M50 160 Q30 140 20 150" stroke="currentColor" fill="none" stroke-width="2"/>
              <path d="M50 100 Q70 80 80 90" stroke="currentColor" fill="none" stroke-width="2"/>
              <path d="M50 50 Q30 30 15 40" stroke="currentColor" fill="none" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </section>

      <section class="posts-section">
        <h2 class="section-title">
          <span class="title-decoration">〖</span>
          近期文章
          <span class="title-decoration">〗</span>
        </h2>
        <div id="posts-list" class="posts-list">
          <div class="loading">
            <div class="ink-drop"></div>
            <span>墨迹渲染中...</span>
          </div>
        </div>
      </section>
    `;

    await this.loadPosts();
  }

  /**
   * 加载文章列表
   */
  async loadPosts() {
    const container = document.getElementById('posts-list');
    
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <p style="text-align: center; color: var(--ink-light); font-family: var(--font-display);">
              暂无文章，执笔待书...
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = posts.map((post, index) => `
        <article class="post-card" onclick="blog.navigate('/post/${post.slug}')" style="animation-delay: ${index * 0.1}s">
          <time class="post-date">${this.formatDate(post.date)}</time>
          <h3 class="post-title">${post.title}</h3>
          <p class="post-excerpt">${post.excerpt}</p>
          ${post.tags.length > 0 ? `
            <div class="post-tags">
              ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          ${this.isLoggedIn ? `
            <button class="post-delete-btn" onclick="event.stopPropagation(); blog.deletePost('${post.slug}')">删除</button>
          ` : ''}
        </article>
      `).join('');

      // 添加入场动画
      container.querySelectorAll('.post-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });

    } catch (error) {
      console.error('加载文章失败:', error);
      container.innerHTML = `
        <div class="error-state">
          <p style="text-align: center; color: var(--ink-light);">
            墨迹晕染失败，请稍后再试...
          </p>
        </div>
      `;
    }
  }

  /**
   * 删除文章
   */
  async deletePost(slug) {
    if (!confirm('确定要删除这篇文章吗？墨迹一去不复返...')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 刷新文章列表
        this.loadPosts();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (error) {
      alert('网络错误');
    }
  }

  /**
   * 渲染文章详情
   */
  async renderPost(slug) {
    this.app.innerHTML = `
      <div class="loading">
        <div class="ink-drop"></div>
        <span>展卷中...</span>
      </div>
    `;

    try {
      const response = await fetch(`/api/posts/${slug}`);
      
      if (!response.ok) {
        this.renderNotFound();
        return;
      }

      const post = await response.json();

      this.app.innerHTML = `
        <article class="article-page">
          <a href="/" class="back-btn" data-link>
            ← 返回
          </a>
          
          <header class="article-header">
            <h1 class="article-title">${post.title}</h1>
            <div class="article-meta">
              <time>${this.formatDate(post.date)}</time>
              ${post.tags.length > 0 ? `
                <span> · </span>
                <span>${post.tags.join('、')}</span>
              ` : ''}
            </div>
          </header>
          
          <div class="article-content">
            ${post.content}
          </div>
        </article>
      `;

    } catch (error) {
      console.error('加载文章失败:', error);
      this.renderNotFound();
    }
  }

  /**
   * 渲染归档页面
   */
  async renderArchive() {
    this.app.innerHTML = `
      <div class="loading">
        <div class="ink-drop"></div>
        <span>整理书卷中...</span>
      </div>
    `;

    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();

      // 按年份分组
      const grouped = {};
      posts.forEach(post => {
        const year = new Date(post.date).getFullYear() || '未知年份';
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(post);
      });

      const years = Object.keys(grouped).sort((a, b) => b - a);

      this.app.innerHTML = `
        <section class="archive-page">
          <h1 class="section-title">
            <span class="title-decoration">〖</span>
            文章归档
            <span class="title-decoration">〗</span>
          </h1>
          
          ${years.map(year => `
            <h2 class="archive-year">${year}</h2>
            <ul class="archive-list">
              ${grouped[year].map(post => `
                <li class="archive-item">
                  <span class="archive-item-date">${this.formatDate(post.date, 'short')}</span>
                  <a href="/post/${post.slug}" class="archive-item-title" data-link>${post.title}</a>
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </section>
      `;

    } catch (error) {
      console.error('加载归档失败:', error);
    }
  }

  /**
   * 渲染关于页面
   */
  renderAbout() {
    this.app.innerHTML = `
      <section class="about-page">
        <div class="about-avatar"></div>
        <div class="about-content">
          <h1>关于此处</h1>
          <p>
            这是一个以水墨为意境的个人博客，
            如同古人执笔挥毫，在宣纸上留下思绪的痕迹。
          </p>
          <p>
            在这个数字时代，我希望用传统的美学来承载现代的思想。
            每一篇文章都是墨迹晕染后的心路历程，
            或关于技术，或关于生活，或只是一些随想。
          </p>
          <p>
            「山高水长，墨韵流芳」
          </p>
          <p style="margin-top: 2rem; color: var(--ink-wash); font-size: 0.9rem;">
            —— 以笔为友，以墨为伴
          </p>
        </div>
      </section>
    `;
  }

  /**
   * 渲染404页面
   */
  renderNotFound() {
    this.app.innerHTML = `
      <section style="text-align: center; padding: 4rem 0;">
        <h1 style="font-family: var(--font-display); font-size: 4rem; color: var(--ink-wash); margin-bottom: 1rem;">
          四〇四
        </h1>
        <p style="font-family: var(--font-display); color: var(--ink-light); margin-bottom: 2rem;">
          此处空无一物，如未着墨的宣纸
        </p>
        <a href="/" class="back-btn" data-link>
          ← 返回首页
        </a>
      </section>
    `;
  }

  /**
   * 格式化日期
   */
  formatDate(dateStr, format = 'full') {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (format === 'short') {
      return `${month}-${day}`;
    }
    
    return `${year}年${month}月${day}日`;
  }
}

// 初始化应用
const blog = new MochanBlog();
