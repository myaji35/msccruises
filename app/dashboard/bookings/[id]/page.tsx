"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Ship,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Download,
  Edit,
  X,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { generateETicket } from "@/lib/pdf/generateETicket";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  cruise: {
    name: string;
    shipName: string;
    departurePort: string;
    destinations: string;
    durationDays: number;
  };
  departureDate: string;
  returnDate: string;
  passengers: Array<{
    name: string;
    age: number;
    nationality: string;
  }>;
  cabinType: string;
  cabinNumber: string;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch booking details from API
    // For now, using mock data
    setTimeout(() => {
      setBooking({
        id: params.id as string,
        bookingNumber: `MSC-${String(params.id).toUpperCase()}-2025`,
        status: "confirmed",
        cruise: {
          name: "지중해 크루즈",
          shipName: "MSC Bellissima",
          departurePort: "바르셀로나",
          destinations: "로마, 나폴리, 팔레르모",
          durationDays: 7,
        },
        departureDate: "2025-06-15",
        returnDate: "2025-06-22",
        passengers: [
          { name: "홍길동", age: 35, nationality: "대한민국" },
          { name: "김영희", age: 32, nationality: "대한민국" },
        ],
        cabinType: "Balcony",
        cabinNumber: "A-1234",
        totalPrice: 2500,
        currency: "USD",
        paymentStatus: "paid",
        createdAt: "2025-01-15T10:30:00Z",
      });
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const handleDownloadTicket = async () => {
    if (!booking) return;

    try {
      await generateETicket({
        bookingNumber: booking.bookingNumber,
        passengerName: booking.passengers[0]?.name || "Guest",
        cruiseName: booking.cruise.name,
        shipName: booking.cruise.shipName,
        departurePort: booking.cruise.departurePort,
        departureDate: booking.departureDate,
        returnDate: booking.returnDate,
        cabinType: booking.cabinType,
        cabinNumber: booking.cabinNumber,
        passengers: booking.passengers,
      });
    } catch (error) {
      console.error("E-ticket generation failed:", error);
      alert("E-ticket 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmCancel = confirm(
      "정말로 이 예약을 취소하시겠습니까?\n\n취소 수수료가 부과될 수 있습니다."
    );

    if (!confirmCancel) return;

    const reason = prompt("취소 사유를 입력해주세요 (선택사항):");

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason || "사용자 요청" }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `예약이 취소되었습니다.\n\n환불률: ${data.refundPercentage}%\n취소 수수료: ${data.cancellationFee}%\n\n환불은 3-5 영업일 내에 처리됩니다.`
        );
        router.push("/dashboard/my-bookings");
      } else {
        alert(`취소 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("예약 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">예약을 찾을 수 없습니다</h2>
          <Link href="/dashboard/my-bookings">
            <Button>예약 목록으로 돌아가기</Button>
          </Link>
        </div>
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
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800 border-green-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
    };
    const labels = {
      confirmed: "✓ 예약 확정",
      pending: "⏳ 대기중",
      cancelled: "✗ 취소됨",
      completed: "✓ 완료",
    };
    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/my-bookings">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                예약 목록
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#003366]">예약 상세</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Booking Number & Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">예약 번호</p>
              <p className="text-2xl font-bold text-[#003366]">{booking.bookingNumber}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>예약일: {formatDate(booking.createdAt)}</span>
            <span>•</span>
            <span className={`font-semibold ${booking.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
              {booking.paymentStatus === "paid" ? "결제 완료" : "결제 대기"}
            </span>
          </div>
        </div>

        {/* Cruise Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <Ship className="w-6 h-6" />
            크루즈 정보
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">크루즈명</p>
              <p className="font-semibold text-lg">{booking.cruise.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">선박</p>
              <p className="font-semibold text-lg">{booking.cruise.shipName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                출발 항구
              </p>
              <p className="font-semibold">{booking.cruise.departurePort}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">여행 기간</p>
              <p className="font-semibold">{booking.cruise.durationDays}일 {booking.cruise.durationDays - 1}박</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">방문 도시</p>
              <p className="font-semibold">{booking.cruise.destinations}</p>
            </div>
          </div>
        </div>

        {/* Travel Dates */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            여행 일정
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">출발일</p>
              <p className="text-xl font-bold text-[#003366]">{formatDate(booking.departureDate)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">도착일</p>
              <p className="text-xl font-bold text-[#003366]">{formatDate(booking.returnDate)}</p>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            탑승객 정보
          </h2>
          <div className="space-y-3">
            {booking.passengers.map((passenger, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{passenger.name}</p>
                    <p className="text-sm text-gray-600">
                      {passenger.age}세 • {passenger.nationality}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    탑승객 {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cabin Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4">객실 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">객실 타입</p>
              <p className="font-semibold text-lg">{booking.cabinType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">객실 번호</p>
              <p className="font-semibold text-lg">{booking.cabinNumber}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            결제 정보
          </h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">총 금액</span>
              <span className="text-2xl font-bold text-[#003366]">
                {formatPrice(booking.totalPrice, booking.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">결제 상태</span>
              <span className={`font-semibold ${booking.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                {booking.paymentStatus === "paid" ? "결제 완료 ✓" : "결제 대기"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section - Show if payment is pending */}
        {booking.paymentStatus === "pending" && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-orange-900 mb-2">결제 대기중</h2>
                <p className="text-sm text-orange-700">
                  예약을 완료하려면 결제를 진행해주세요.
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-orange-600" />
            </div>
            <Link href={`/dashboard/bookings/payment?bookingId=${booking.id}`}>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-bold">
                결제하기 (₩{(booking.totalPrice * 1320).toLocaleString()})
              </Button>
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4">예약 관리</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={handleDownloadTicket}
              disabled={booking.paymentStatus !== "paid"}
              className="bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              E-Ticket 다운로드
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              이메일 전송
            </Button>
            {booking.status === "confirmed" && (
              <>
                <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    예약 수정
                  </Button>
                </Link>
                <Button
                  onClick={handleCancelBooking}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  예약 취소
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">📋 중요 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>출발 48시간 전까지 온라인 체크인을 완료해주세요</li>
            <li>여권 유효기간이 6개월 이상 남아있는지 확인하세요</li>
            <li>E-ticket은 출발 당일 필수로 지참하셔야 합니다</li>
            <li>예약 취소 시 취소 수수료가 발생할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
