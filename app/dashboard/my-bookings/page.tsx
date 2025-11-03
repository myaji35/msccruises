"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Ship,
  Calendar,
  MapPin,
  Users,
  Star,
  LogOut,
  Home,
  CreditCard,
  Plane,
  Award,
  FileText,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import type { User, Booking, BookingHistory } from "@/types/auth.types";

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.user_type === "partner") {
      // Redirect partners to partner dashboard
      router.push("/dashboard/partner");
      return;
    }

    setUser(currentUser);

    // Load booking history
    authService.getBookingHistory(currentUser.id).then((history) => {
      setBookingHistory(history);
      setIsLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  if (isLoading || !user || !bookingHistory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366]"></div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    const labels = {
      confirmed: "확정",
      pending: "대기중",
      cancelled: "취소됨",
      completed: "완료",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      classic: "bg-gray-100 text-gray-800",
      silver: "bg-slate-200 text-slate-800",
      gold: "bg-yellow-100 text-yellow-800",
      black: "bg-black text-white",
    };
    const labels = {
      classic: "클래식",
      silver: "실버",
      gold: "골드",
      black: "블랙",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[tier as keyof typeof styles]}`}>
        {labels[tier as keyof typeof labels]}
      </span>
    );
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
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-[#003366] to-[#004080] rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">안녕하세요, {user.name}님!</h1>
              <p className="text-blue-200 mb-4">{user.email}</p>

              {/* Voyagers Club Info */}
              {user.voyagers_club && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 inline-block">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-[#FFD700]" />
                    <span className="font-semibold text-lg">MSC Voyagers Club</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm text-blue-200">멤버십</div>
                      {getTierBadge(user.voyagers_club.tier)}
                    </div>
                    <div className="border-l border-white/30 pl-4">
                      <div className="text-sm text-blue-200">포인트</div>
                      <div className="text-2xl font-bold text-[#FFD700]">
                        {user.voyagers_club.points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">총 누적 결제금액</div>
              <div className="text-3xl font-bold text-[#FFD700]">
                {formatPrice(bookingHistory.total_spent)}
              </div>
              <div className="text-sm text-blue-200 mt-2">
                총 예약 {bookingHistory.bookings.length}건
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/packages"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#FFD700] p-4 rounded-full">
                <Ship className="w-8 h-8 text-[#003366]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#003366]">새 예약</h3>
                <p className="text-sm text-gray-600">패키지 검색하기</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#003366]">포인트 사용</h3>
                <p className="text-sm text-gray-600">
                  {user.voyagers_club?.points.toLocaleString()} P 보유
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#003366]">여행 서류</h3>
                <p className="text-sm text-gray-600">e티켓, 여권 관리</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#003366] mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            예약 내역
          </h2>

          {bookingHistory.bookings.length === 0 ? (
            <div className="text-center py-12">
              <Ship className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">예약 내역이 없습니다</h3>
              <p className="text-gray-500 mb-6">지금 바로 크루즈 여행을 시작해보세요!</p>
              <Link href="/packages">
                <Button className="bg-[#003366] hover:bg-[#002244]">패키지 검색하기</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookingHistory.bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} formatPrice={formatPrice} formatDate={formatDate} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  formatPrice,
  formatDate,
  getStatusBadge,
}: {
  booking: Booking;
  formatPrice: (price: number, currency?: string) => string;
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#003366]">{booking.cruise_name}</h3>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Ship className="w-4 h-4" />
            <span>{booking.ship_name}</span>
            <span className="mx-2">•</span>
            <span>예약번호: {booking.booking_number}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#003366]">
            {formatPrice(booking.total_price, booking.currency)}
          </div>
          <div className="text-sm text-gray-500">
            {booking.payment_status === "paid" ? "✅ 결제완료" : "⏳ 결제대기"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">출발항</div>
            <div className="font-medium">{booking.departure_port}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">여행 기간</div>
            <div className="font-medium">
              {formatDate(booking.departure_date)} ~ {formatDate(booking.return_date)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Users className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">인원 / 객실</div>
            <div className="font-medium">
              {booking.passengers.length}명 / {booking.cabin_category}
              {booking.cabin_number && ` (${booking.cabin_number})`}
            </div>
          </div>
        </div>
      </div>

      {/* Package Info */}
      {booking.package_info && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
            <Plane className="w-4 h-4" />
            <span>패키지 상품 (항공권 포함)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <span className="text-blue-600">가는 편:</span> {booking.package_info.outbound_flight}
            </div>
            <div>
              <span className="text-blue-600">오는 편:</span> {booking.package_info.return_flight}
            </div>
          </div>
          <div className="text-sm text-green-600 font-semibold mt-2">
            💰 패키지 할인: -{formatPrice(booking.package_info.package_discount)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          예약 상세
        </Button>
        {booking.status === "confirmed" && (
          <>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              결제 영수증
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              여행 준비
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
