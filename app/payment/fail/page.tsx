'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookingId, setBookingId] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const bid = searchParams.get('bookingId');
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    if (bid) setBookingId(bid);
    if (code) setErrorCode(code);
    if (message) setErrorMessage(decodeURIComponent(message));
  }, []);

  const handleRetryPayment = () => {
    if (bookingId) {
      router.push(`/payment?bookingId=${bookingId}&amount=0`); // Amount should be fetched
    } else {
      router.push('/dashboard/bookings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            결제에 실패했습니다
          </h1>
          <p className="text-xl text-gray-600">
            결제 처리 중 문제가 발생했습니다
          </p>
        </div>

        {/* Error Details */}
        {(errorCode || errorMessage) && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">오류 정보</h3>

            {errorCode && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">오류 코드</p>
                <p className="font-semibold text-red-600">{errorCode}</p>
              </div>
            )}

            {errorMessage && (
              <div>
                <p className="text-sm text-gray-600">오류 메시지</p>
                <p className="text-gray-900">{errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Common Causes */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">일반적인 원인</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>카드 잔액 부족</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>카드 유효기간 만료</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>잘못된 카드 정보 입력</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>일일 한도 초과</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span>해외 결제 차단 설정</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRetryPayment}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            다시 시도하기
          </button>

          <Link
            href="/dashboard/bookings"
            className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            내 예약으로 돌아가기
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">도움이 필요하신가요?</h3>
          <p className="text-sm text-gray-700 mb-4">
            결제 문제가 계속되면 고객센터로 문의해주세요.
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>전화:</strong> 1588-1234
            </p>
            <p>
              <strong>이메일:</strong> support@msccruises.com
            </p>
            <p>
              <strong>운영시간:</strong> 평일 09:00 - 18:00
            </p>
          </div>
        </div>

        {/* Booking Info */}
        {bookingId && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>예약 번호: <span className="font-semibold">{bookingId.slice(0, 12).toUpperCase()}</span></p>
            <p className="mt-1">예약은 유지되며, 결제만 완료하면 확정됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
