const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'mochan_admin_token';

function buildUrl(path, params = {}) {
  const trimmed = path.replace(/^\/+/, '');
  const url = new URL(`${API_BASE_URL}/${trimmed}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { params, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.headers || {}) };

  if (fetchOptions.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || '请求失败');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function login(username, password) {
  const data = await request('auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (data.token) {
    setToken(data.token);
  }

  return data;
}

export async function authStatus() {
  return request('auth/status', { method: 'GET' });
}

export async function fetchPosts({ page = 1, pageSize = 6, search = '' } = {}) {
  return request('posts', {
    method: 'GET',
    params: { page, pageSize, q: search }
  });
}

export async function fetchPost(slug) {
  return request(`posts/${slug}`, { method: 'GET' });
}

export async function createPost({ title, content, tags }) {
  return request('posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, tags })
  });
}

export async function deletePost(slug) {
  return request(`posts/${slug}`, { method: 'DELETE' });
}
