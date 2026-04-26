'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getCookie, Post } from '@/lib/api';

function DiamondAvatar({ initial }: { initial: string }) {
  return (
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
      <div
        style={{
          width: 36,
          height: 36,
          border: '2px solid #374151',
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            transform: 'rotate(-45deg)',
            fontWeight: 'bold',
            fontSize: 13,
          }}
        >
          {initial.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onUpdate?: (updated: Post) => void;
}

export default function PostCard({ post: initialPost, onUpdate }: PostCardProps) {
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState<'like' | 'retweet' | null>(null);
  const router = useRouter();

  const userId = getCookie('userId');
  const hasLiked = userId ? post.likes.includes(userId) : false;
  const hasRetweeted = userId ? post.retweets.some((r) => r.usuario === userId) : false;

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading('like');
    try {
      const updated = await api.posts.like(post._id);
      setPost(updated);
      onUpdate?.(updated);
    } catch {
    } finally {
      setLoading(null);
    }
  }

  async function handleRetweet(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading('retweet');
    try {
      const updated = await api.posts.retweet(post._id);
      setPost(updated);
      onUpdate?.(updated);
    } catch {
    } finally {
      setLoading(null);
    }
  }

  const initial = post.autor?.username?.[0] ?? '?';

  return (
    <div
      className="block hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/post/${post._id}`)}
    >
      <div className="flex gap-3 py-4 px-2">
        <Link
          href={`/profile/${post.autor._id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <DiamondAvatar initial={initial} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${post.autor._id}`}
            className="font-semibold text-sm hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.autor.username}
          </Link>
          <p className="text-sm mt-0.5 break-words">{post.contenido}</p>
          <div className="flex gap-5 mt-2 text-sm text-gray-500">
            <button
              onClick={handleLike}
              disabled={loading === 'like'}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${hasLiked ? 'text-red-500' : ''}`}
            >
              <span>{hasLiked ? '♥' : '♡'}</span>
              <span>{post.likes.length}</span>
            </button>
            <button
              onClick={handleRetweet}
              disabled={loading === 'retweet'}
              className={`flex items-center gap-1 hover:text-green-600 transition-colors ${hasRetweeted ? 'text-green-600' : ''}`}
            >
              <span>RT</span>
              <span>{post.retweets.length} Retweet</span>
            </button>
            <span>{post.comentarios.length} comentario</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DiamondAvatar };
