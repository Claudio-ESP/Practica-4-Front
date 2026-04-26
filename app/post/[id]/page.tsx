'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Post, getCookie } from '@/lib/api';
import { DiamondAvatar } from '@/components/PostCard';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [retweetLoading, setRetweetLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = getCookie('userId');

  useEffect(() => {
    api.posts
      .get(id)
      .then(setPost)
      .catch(() => setError('No se encontró el post'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLike() {
    if (!post || likeLoading) return;
    setLikeLoading(true);
    try {
      const updated = await api.posts.like(post._id);
      setPost(updated);
    } catch {
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleRetweet() {
    if (!post || retweetLoading) return;
    setRetweetLoading(true);
    try {
      const updated = await api.posts.retweet(post._id);
      setPost(updated);
    } catch {
    } finally {
      setRetweetLoading(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!post || !comentario.trim()) return;
    setSending(true);
    try {
      const updated = await api.posts.comment(post._id, comentario.trim());
      setPost(updated);
      setComentario('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comentar');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-500 mt-10">Cargando...</p>;
  if (error || !post) return <p className="max-w-2xl mx-auto px-4 py-6 text-center text-red-500 mt-10">{error || 'Error'}</p>;

  const hasLiked = userId ? post.likes.includes(userId) : false;
  const hasRetweeted = userId ? post.retweets.some((r) => r.usuario === userId) : false;
  const initial = post.autor?.username?.[0] ?? '?';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Link href={`/profile/${post.autor._id}`}>
            <DiamondAvatar initial={initial} />
          </Link>
          <div className="flex-1">
            <Link href={`/profile/${post.autor._id}`} className="font-semibold text-sm hover:underline">
              {post.autor.username}
            </Link>
            <p className="text-sm mt-1 break-words">{post.contenido}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-4 pt-3 flex gap-6 text-sm text-gray-500">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${hasLiked ? 'text-red-500' : ''}`}
          >
            <span>{hasLiked ? '♥' : '♡'}</span>
            <span>{post.likes.length}</span>
          </button>
          <button
            onClick={handleRetweet}
            disabled={retweetLoading}
            className={`flex items-center gap-1 hover:text-green-600 transition-colors ${hasRetweeted ? 'text-green-600' : ''}`}
          >
            <span>RT</span>
            <span>{post.retweets.length} Retweet</span>
          </button>
          <span>{post.comentarios.length} comentario</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-6" />

      <form onSubmit={handleComment} className="mb-6">
        <input
          type="text"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tu comentario..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={sending || !comentario.trim()}
            className="border border-gray-300 rounded-md px-5 py-1.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {post.comentarios.map((c, i) => (
          <div key={c._id}>
            <div className="flex gap-3 py-2">
              <DiamondAvatar initial={c.autor?.username?.[0] ?? '?'} />
              <div className="flex-1">
                <span className="font-semibold text-sm">{c.autor.username}</span>
                <p className="text-sm mt-0.5 break-words">{c.contenido}</p>
              </div>
            </div>
            {i < post.comentarios.length - 1 && (
              <div className="border-b border-dotted border-gray-300 mt-2" />
            )}
          </div>
        ))}
        {post.comentarios.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Sin comentarios todavía.</p>
        )}
      </div>
    </div>
  );
}
