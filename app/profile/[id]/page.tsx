'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, User, Post, getCookie } from '@/lib/api';
import { DiamondAvatar } from '@/components/PostCard';
import PostCard from '@/components/PostCard';

const POSTS_PER_PAGE = 5;

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const myId = getCookie('userId');
  const isOwnProfile = myId === id;

  useEffect(() => {
    setLoading(true);
    setVisibleCount(POSTS_PER_PAGE);
    api.users
      .profile(id)
      .then((data) => {
        setUser(data.user);
        const sorted = [...data.posts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sorted);
        if (data.user.seguidores && myId) {
          setFollowing(data.user.seguidores.includes(myId));
        }
      })
      .catch(() => setError('No se encontró el perfil'))
      .finally(() => setLoading(false));
  }, [id, myId]);

  async function handleFollow() {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await api.users.follow(id);
      setFollowing(res.siguiendo);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              seguidores: res.siguiendo
                ? [...(prev.seguidores ?? []), myId]
                : (prev.seguidores ?? []).filter((s) => s !== myId),
            }
          : prev
      );
    } catch {
    } finally {
      setFollowLoading(false);
    }
  }

  function handlePostUpdate(updated: Post) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-500 mt-10">Cargando...</p>;
  if (error || !user) return <p className="max-w-2xl mx-auto px-4 py-6 text-center text-red-500 mt-10">{error || 'Error'}</p>;

  const seguidores = user.seguidores?.length ?? 0;
  const siguiendo = user.siguiendo?.length ?? 0;
  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-4">
          <DiamondAvatar initial={user.username[0]} />
          <div className="flex-1">
            <p className="font-bold text-base">{user.username}</p>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>{seguidores} seguidor{seguidores !== 1 ? 'es' : ''}</span>
              <span>{siguiendo} siguiendo</span>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex justify-end mt-3">
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors border disabled:opacity-50 ${
                following
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-blue-500 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {followLoading ? '...' : following === true ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {visiblePosts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 mt-8">Este usuario no tiene posts.</p>
      )}

      {visibleCount < posts.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((v) => v + POSTS_PER_PAGE)}
            className="border border-gray-300 rounded-md px-6 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            Cargas más
          </button>
        </div>
      )}
    </div>
  );
}
