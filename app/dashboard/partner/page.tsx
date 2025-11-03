"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Ship,
  LogOut,
  Home,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ExternalLink,
  Copy,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import type { User, PartnerStats, PartnerBooking } from "@/types/auth.types";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.user_type !== "partner") {
      // Redirect non-partners to customer dashboard
      router.push("/dashboard/my-bookings");
      return;
    }

    setUser(currentUser);

    // Load partner stats and bookings
    Promise.all([
      authService.getPartnerStats(currentUser.id),
      authService.getPartnerBookings(currentUser.id),
    ]).then(([statsData, bookingsData]) => {
      setStats(statsData);
      setBookings(bookingsData);
      setIsLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  const copySubpageUrl = () => {
    if (user?.partner_info?.subpage_url) {
      const fullUrl = `${window.location.origin}${user.partner_info.subpage_url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366]"></div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const getCommissionRate = () => {
    return (user.partner_info?.commission_rate || 0) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#FFD700] flex items-center gap-2">
            <Ship className="w-8 h-8" />
            MSC CRUISES
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                메인
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Partner Info Card */}
        <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC700] rounded-2xl shadow-xl p-8 mb-8 text-[#003366]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Ship className="w-8 h-8" />
                <h1 className="text-3xl font-bold">{user.partner_info?.company_name}</h1>
              </div>
              <p className="text-lg mb-1">대표: {user.partner_info?.representative_name}</p>
              <p className="text-sm opacity-80">{user.partner_info?.address}</p>

              {/* Status Badge */}
              <div className="mt-4">
                {user.partner_info?.status === "active" ? (
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                    ✓ 승인됨
                  </span>
                ) : user.partner_info?.status === "pending" ? (
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold">
                    ⏳ 승인 대기중
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                    ⚠ 정지됨
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm opacity-80 mb-1">수수료율</div>
              <div className="text-4xl font-bold">{getCommissionRate()}%</div>
            </div>
          </div>

          {/* Subpage URL */}
          <div className="mt-6 bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">전용 서브페이지 URL</div>
                <div className="flex items-center gap-2">
                  <code className="bg-white/30 px-3 py-1 rounded text-sm">
                    {window.location.origin}
                    {user.partner_info?.subpage_url}
                  </code>
                  <Button
                    onClick={copySubpageUrl}
                    size="sm"
                    className="bg-white/30 hover:bg-white/40"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </>
                    )}
                  </Button>
                  <Link href={user.partner_info?.subpage_url || "#"} target="_blank">
                    <Button size="sm" className="bg-white/30 hover:bg-white/40">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      방문
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">총 예약</div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-[#003366]">{stats.total_bookings}</div>
            <div className="text-sm text-gray-500 mt-1">누적 예약 건수</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">총 매출</div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-[#003366]">
              {formatPrice(stats.total_revenue)}
            </div>
            <div className="text-sm text-gray-500 mt-1">누적 매출액</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">총 수수료</div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-[#FFD700]">
              {formatPrice(stats.total_commission)}
            </div>
            <div className="text-sm text-gray-500 mt-1">누적 수수료 수익</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">이번달</div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-[#003366]">{stats.this_month_bookings}</div>
            <div className="text-sm text-green-600 mt-1">
              매출: {formatPrice(stats.this_month_revenue)}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Cruises */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              인기 크루즈 Top 3
            </h2>
            <div className="space-y-4">
              {stats.top_selling_cruises.map((cruise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFD700] text-[#003366] font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{cruise.cruise_name}</div>
                      <div className="text-sm text-gray-600">{cruise.bookings_count}건 예약</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#003366]">
                      {formatPrice(cruise.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              최근 예약 ({bookings.length})
            </h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>아직 예약이 없습니다</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-[#003366]">
                          {booking.cruise_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.customer_name} • {booking.customer_email}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.commission_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : booking.commission_status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.commission_status === "paid"
                          ? "지급완료"
                          : booking.commission_status === "approved"
                          ? "승인됨"
                          : "대기중"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        {formatDate(booking.departure_date)} 출발
                      </div>
                      <div className="font-bold text-green-600">
                        수수료: {formatPrice(booking.commission_amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-3">회원사 지원</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>전담 고객센터:</strong>
              <br />
              📞 1588-9999
            </div>
            <div>
              <strong>이메일 문의:</strong>
              <br />
              📧 partner@msccruises.kr
            </div>
            <div>
              <strong>운영시간:</strong>
              <br />
              🕐 평일 09:00-18:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
