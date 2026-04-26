'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCookie, deleteCookie } from '@/lib/api';

export default function Header() {
  const [initial, setInitial] = useState('');
  const [userId, setUserId] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const username = getCookie('username');
    const id = getCookie('userId');
    setInitial(username?.[0]?.toUpperCase() ?? '?');
    setUserId(id);
  }, []);

  if (pathname === '/login') return null;

  function logout() {
    deleteCookie('token');
    deleteCookie('userId');
    deleteCookie('username');
    router.push('/login');
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Nebrija Social
        </Link>
        <div className="flex items-center gap-3">
          {userId && (
            <Link
              href={`/profile/${userId}`}
              className="w-9 h-9 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              {initial}
            </Link>
          )}
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
