'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Ship,
  Share2,
  Settings,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Trello,
  Image as ImageIcon,
  Tag,
  History,
  BarChart3
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeCruises: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalBookings: data.bookingStats?.totalBookings || 0,
          totalRevenue: data.bookingStats?.totalRevenue || 0,
          activeCruises: data.cruiseStats?.activeCruises || 0,
          totalUsers: data.userStats?.totalUsers || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const storedPassword = localStorage.getItem('admin_password') || 'admin123';

    if (password === storedPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
      loadStats();
    } else {
      setError('패스워드가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">MSC Cruises 관리자 패널</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                패스워드
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="패스워드를 입력하세요"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              로그인
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>기본 패스워드: admin123</p>
            <p className="mt-1">설정에서 패스워드를 변경할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">MSC Cruises 관리자 패널</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 예약</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 수익</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">활성 크루즈</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCruises}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Ship className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 회원</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/cruises">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <Ship className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">크루즈 관리</h3>
                  <p className="text-sm text-gray-600">크루즈 추가, 수정, 삭제</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/sns/accounts">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <Share2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">SNS 계정 관리</h3>
                  <p className="text-sm text-gray-600">소셜 미디어 계정 연동</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/kanban">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-4 rounded-lg">
                  <Trello className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kanban 보드</h3>
                  <p className="text-sm text-gray-600">프로젝트 작업 관리</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/landing-images">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-4 rounded-lg">
                  <ImageIcon className="w-8 h-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">랜딩 이미지</h3>
                  <p className="text-sm text-gray-600">메인 페이지 캐러셀 이미지</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/pricing-rules">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">가격 규칙</h3>
                  <p className="text-sm text-gray-600">동적 가격 책정 규칙 관리</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/promotions">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <Tag className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">프로모션 코드</h3>
                  <p className="text-sm text-gray-600">할인 코드 생성 및 관리</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/price-history">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-teal-100 p-4 rounded-lg">
                  <History className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">가격 변동 이력</h3>
                  <p className="text-sm text-gray-600">가격 변경 추적 및 분석</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">설정</h3>
                  <p className="text-sm text-gray-600">패스워드 변경 및 설정</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
