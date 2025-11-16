'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookingId, setBookingId] = useState('');
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bid = searchParams.get('bookingId');
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!bid) {
      router.push('/');
      return;
    }

    setBookingId(bid);

    // If TossPay callback (has paymentKey), confirm payment
    if (paymentKey && orderId && amount) {
      confirmTossPayPayment(paymentKey, orderId, parseInt(amount));
    } else {
      // Stripe or already confirmed
      setConfirming(false);
    }
  }, []);

  const confirmTossPayPayment = async (paymentKey: string, orderId: string, amount: number) => {
    try {
      const response = await fetch('/api/v1/payments/tosspay/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment confirmation failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment confirmation failed');
      }

      setConfirming(false);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      setError(error.message || '결제 확인 중 오류가 발생했습니다.');
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">결제를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            결제 확인 실패
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            내 예약 확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            결제가 완료되었습니다!
          </h1>
          <p className="text-xl text-gray-600">
            예약이 확정되었습니다
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center pb-6 border-b">
            <p className="text-sm text-gray-600 mb-2">예약 번호</p>
            <p className="text-2xl font-bold text-blue-600">
              {bookingId.slice(0, 12).toUpperCase()}
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">결제 완료</p>
                <p className="text-gray-600">결제가 성공적으로 처리되었습니다</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">이메일 발송</p>
                <p className="text-gray-600">예약 확인서가 이메일로 발송되었습니다</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">예약 확정</p>
                <p className="text-gray-600">MSC Cruises에서 예약이 확정되었습니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href={`/booking/confirmation?bookingId=${bookingId}`}
            className="block w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
          >
            예약 상세 보기
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button
            onClick={() => window.print()}
            className="w-full px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            영수증 다운로드
          </button>

          <Link
            href="/dashboard/bookings"
            className="block text-center py-3 text-blue-600 hover:text-blue-700 font-medium"
          >
            내 예약 목록 보기
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">다음 단계</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>이메일로 발송된 예약 확인서를 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              <span>출발 30일 전까지 여권 및 비자를 준비하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>출발 7일 전부터 온라인 체크인이 가능합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>즐거운 크루즈 여행 되세요!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
