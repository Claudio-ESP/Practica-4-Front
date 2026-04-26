'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Post } from '@/lib/api';
import PostCard from '@/components/PostCard';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contenido, setContenido] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const loadPage = useCallback(async (p: number, append = false) => {
    try {
      const data = await api.home(p);
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setTotalPages(data.totalPaginas);
      setPage(data.pagina);
    } catch {
      setError('Error al cargar el timeline');
    }
  }, []);

  useEffect(() => {
    loadPage(1).finally(() => setLoading(false));
  }, [loadPage]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim()) return;
    setPosting(true);
    try {
      await api.posts.create(contenido.trim());
      setContenido('');
      await loadPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setPosting(false);
    }
  }

  async function handleLoadMore() {
    if (page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    await loadPage(page + 1, true);
    setLoadingMore(false);
  }

  function handlePostUpdate(updated: Post) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <form onSubmit={handlePost} className="mb-6">
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe aqui tu post"
          maxLength={280}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={posting || !contenido.trim()}
            className="bg-white border border-gray-300 rounded-md px-5 py-1.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {posting ? 'Publicando...' : 'Postear'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No hay posts todavía.</p>
      )}

      {page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="border border-gray-300 rounded-md px-6 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Cargando...' : 'Cargas más'}
          </button>
        </div>
      )}
    </div>
  );
}
