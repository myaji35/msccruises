"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PaymentInfo {
  bookingId: string;
  cruiseName: string;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get payment info from URL params or sessionStorage
    const bookingId = searchParams.get("bookingId");

    if (bookingId) {
      // TODO: Fetch payment info from API
      // For now using mock data
      setPaymentInfo({
        bookingId,
        cruiseName: "지중해 크루즈",
        totalAmount: 2500,
        currency: "USD",
        customerName: "홍길동",
        customerEmail: "customer@example.com",
      });
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!paymentInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Initialize Toss Payments
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""
      );

      // Generate unique order ID
      const orderId = `MSC-${paymentInfo.bookingId}-${Date.now()}`;
      const orderName = `${paymentInfo.cruiseName} 예약`;

      // Request payment
      await tossPayments.requestPayment("카드", {
        amount: Math.round(paymentInfo.totalAmount * 1320), // Convert USD to KRW
        orderId,
        orderName,
        customerName: paymentInfo.customerName,
        customerEmail: paymentInfo.customerEmail,
        successUrl: `${window.location.origin}/dashboard/bookings/payment/success`,
        failUrl: `${window.location.origin}/dashboard/bookings/payment/fail`,
      });
    } catch (err) {
      console.error("Payment error:", err);
      setError("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            결제 정보를 찾을 수 없습니다
          </h2>
          <Link href="/dashboard/my-bookings">
            <Button>예약 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/my-bookings">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#003366]">결제하기</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            결제 정보
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">예약 번호</span>
              <span className="font-semibold">MSC-{paymentInfo.bookingId}-2025</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">크루즈명</span>
              <span className="font-semibold">{paymentInfo.cruiseName}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">예약자명</span>
              <span className="font-semibold">{paymentInfo.customerName}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">이메일</span>
              <span className="font-semibold text-sm">{paymentInfo.customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-gray-700">결제 금액</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#003366]">
                ${paymentInfo.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                약 ₩{(paymentInfo.totalAmount * 1320).toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * 환율은 결제 시점 기준으로 적용됩니다
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-green-900">안전한 결제</h3>
          </div>
          <p className="text-sm text-green-800">
            토스페이먼츠의 안전한 결제 시스템을 통해 처리됩니다.
            모든 거래는 PCI-DSS 보안 기준을 준수합니다.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-[#003366] hover:bg-[#002244] text-white py-6 text-lg font-bold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              결제 처리 중...
            </div>
          ) : (
            `₩${(paymentInfo.totalAmount * 1320).toLocaleString()} 결제하기`
          )}
        </Button>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            결제 진행 시 <Link href="/terms" className="text-blue-600 underline">이용약관</Link> 및{" "}
            <Link href="/privacy" className="text-blue-600 underline">개인정보처리방침</Link>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
