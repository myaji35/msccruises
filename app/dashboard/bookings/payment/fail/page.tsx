"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const message = searchParams.get("message");

    setErrorCode(code || "UNKNOWN_ERROR");
    setErrorMessage(message || "결제 처리 중 오류가 발생했습니다.");
  }, [searchParams]);

  const getErrorExplanation = (code: string) => {
    const explanations: { [key: string]: string } = {
      PAY_PROCESS_CANCELED: "사용자가 결제를 취소했습니다.",
      PAY_PROCESS_ABORTED: "결제가 중단되었습니다.",
      REJECT_CARD_PAYMENT: "카드 결제가 거부되었습니다. 카드사에 문의하세요.",
      EXCEED_MAX_CARD_DAILY_LIMIT: "일일 결제 한도를 초과했습니다.",
      INVALID_CARD_EXPIRATION: "카드 유효기간이 만료되었습니다.",
      INVALID_STOPPED_CARD: "정지된 카드입니다.",
      BELOW_MINIMUM_AMOUNT: "최소 결제 금액 미만입니다.",
      INVALID_API_REQUEST: "잘못된 요청입니다.",
      NOT_AVAILABLE_PAYMENT: "결제가 불가능한 상태입니다.",
      UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
    };

    return explanations[code] || explanations.UNKNOWN_ERROR;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            결제에 실패했습니다
          </h1>
          <p className="text-gray-600">
            결제 처리 중 문제가 발생했습니다.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4">오류 정보</h2>

          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">오류 코드</p>
              <p className="font-semibold text-red-800">{errorCode}</p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">오류 메시지</p>
              <p className="font-semibold text-orange-800">{errorMessage}</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">설명</p>
              <p className="text-yellow-900">{getErrorExplanation(errorCode)}</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">문제 해결 방법</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>카드 정보를 다시 확인해주세요 (카드번호, 유효기간, CVC)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>카드 한도 및 잔액을 확인해주세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>다른 결제 수단을 이용해보세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>문제가 지속되면 카드사에 문의해주세요</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            className="w-full bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            다시 시도하기
          </Button>
          <Link href="/dashboard/my-bookings">
            <Button
              variant="outline"
              className="w-full border-gray-400 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              예약 목록으로
            </Button>
          </Link>
        </div>

        {/* Customer Support */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-[#003366] mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            고객 지원
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            결제 문제가 계속 발생하시나요? 고객센터로 문의해주세요.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">이메일</p>
              <p className="text-sm font-semibold text-gray-800">support@msccruises.com</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">전화</p>
              <p className="text-sm font-semibold text-gray-800">1588-1234</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              영업시간: 평일 09:00 - 18:00 (주말 및 공휴일 휴무)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentFailContent />
    </Suspense>
  );
}
