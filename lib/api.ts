const API_BASE = 'https://backend-p4-klvc.onrender.com';
export const X_NOMBRE = 'Claudio Murciano';

export interface User {
  _id: string;
  username: string;
  email?: string;
  seguidores?: string[];
  siguiendo?: string[];
}

export interface Comment {
  _id: string;
  contenido: string;
  autor: { _id: string; username: string };
  fecha: string;
}

export interface Post {
  _id: string;
  contenido: string;
  autor: { _id: string; username: string };
  likes: string[];
  retweets: { usuario: string; fecha: string }[];
  comentarios: Comment[];
  createdAt: string;
}

export interface HomeResponse {
  posts: Post[];
  pagina: number;
  totalPaginas: number;
  totalPosts: number;
}

export interface ProfileResponse {
  user: User;
  posts: Post[];
}

export interface FollowResponse {
  siguiendo: boolean;
  user: User;
}

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function setCookie(name: string, value: string, days = 7) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCookie('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-nombre': X_NOMBRE,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  Object.assign(headers, options.headers ?? {});

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data as T;
}

async function authRequest<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      authRequest<{ user: User; token: string }>('/api/auth/login', { email, password }),
    register: (username: string, email: string, password: string) =>
      authRequest<{ user: User; token: string }>('/api/auth/register', { username, email, password }),
  },
  home: (page = 1) => request<HomeResponse>(`/api/home?page=${page}&limit=10`),
  posts: {
    create: (contenido: string) =>
      request<Post>('/api/posts', { method: 'POST', body: JSON.stringify({ contenido }) }),
    get: (id: string) => request<Post>(`/api/posts/${id}`),
    like: (id: string) => request<Post>(`/api/posts/${id}/like`, { method: 'POST' }),
    retweet: (id: string) => request<Post>(`/api/posts/${id}/retweet`, { method: 'POST' }),
    comment: (id: string, contenido: string) =>
      request<Post>(`/api/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ contenido }) }),
  },
  users: {
    me: () => request<ProfileResponse>('/api/users/me'),
    profile: (id: string) => request<ProfileResponse>(`/api/users/${id}/profile`),
    follow: (id: string) => request<FollowResponse>(`/api/users/${id}/follow`, { method: 'POST' }),
  },
};
