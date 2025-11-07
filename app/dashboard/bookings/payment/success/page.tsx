"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Show confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Get payment data from URL params
    const orderId = searchParams.get("orderId");
    const paymentKey = searchParams.get("paymentKey");
    const amount = searchParams.get("amount");

    if (orderId && paymentKey && amount) {
      // TODO: Verify payment with backend API
      // For now, simulate verification
      setTimeout(() => {
        setPaymentData({
          orderId,
          paymentKey,
          amount: parseInt(amount),
          approvedAt: new Date().toISOString(),
        });
        setIsVerifying(false);
      }, 1500);
    } else {
      setIsVerifying(false);
    }
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">결제 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            결제가 완료되었습니다!
          </h1>
          <p className="text-gray-600">
            MSC Cruises를 선택해주셔서 감사합니다.
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4">결제 정보</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">주문번호</span>
              <span className="font-semibold text-sm">{paymentData.orderId}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-semibold text-lg text-[#003366]">
                ₩{paymentData.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">결제 일시</span>
              <span className="font-semibold">
                {new Date(paymentData.approvedAt).toLocaleString("ko-KR")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">결제 상태</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                결제 완료
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">다음 단계</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>예약 확정 이메일이 곧 발송됩니다</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>E-ticket은 출발 7일 전에 발급됩니다</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>출발 48시간 전까지 온라인 체크인을 완료해주세요</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link href="/dashboard/my-bookings">
            <Button className="w-full bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              예약 확인
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
            onClick={() => alert("영수증 다운로드 기능은 곧 구현됩니다.")}
          >
            <Download className="w-5 h-5" />
            영수증 다운로드
          </Button>
        </div>

        {/* Customer Service */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-[#003366] mb-3">고객 지원</h3>
          <p className="text-sm text-gray-600 mb-3">
            예약과 관련하여 문의사항이 있으시면 언제든지 연락주세요.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span>support@msccruises.com</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="w-4 h-4 flex items-center justify-center">📞</span>
              <span>1588-1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
