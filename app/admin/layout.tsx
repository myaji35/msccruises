'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('admin_authenticated');

    // If on /admin page itself, allow through (it handles its own auth)
    if (pathname === '/admin') {
      setIsLoading(false);
      return;
    }

    // For other admin pages, check authentication
    if (auth !== 'true') {
      router.push('/admin');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [pathname, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Allow /admin page to render
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // For other pages, only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
