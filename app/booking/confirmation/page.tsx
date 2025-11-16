'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, Calendar, Ship, User, Download, ArrowRight } from 'lucide-react';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push('/');
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            예약이 완료되었습니다!
          </h1>
          <p className="text-xl text-gray-600">
            확인 이메일이 발송되었습니다
          </p>
        </div>

        {/* Booking Number */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center pb-6 border-b">
            <p className="text-sm text-gray-600 mb-2">예약 번호</p>
            <p className="text-3xl font-bold text-blue-600">
              {booking?.bookingNumber || bookingId}
            </p>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="pt-6 space-y-6">
              {/* Cruise Info */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Ship className="w-4 h-4" />
                  <span className="font-medium">크루즈 정보</span>
                </div>
                <div className="pl-6">
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.cruiseName}
                  </p>
                  <p className="text-gray-600">{booking.shipName}</p>
                </div>
              </div>

              {/* Date */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">출발 일정</span>
                </div>
                <div className="pl-6">
                  <p className="text-gray-900">
                    {booking.departureDate
                      ? new Date(booking.departureDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    출발지: {booking.departurePort}
                  </p>
                </div>
              </div>

              {/* Cabin */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">객실 정보</span>
                </div>
                <div className="pl-6">
                  <p className="text-gray-900">
                    {booking.cabinCategory?.toUpperCase()}
                    {booking.cabinNumber && ` - ${booking.cabinNumber}`}
                  </p>
                  {booking.passengers && (
                    <p className="text-sm text-gray-600">
                      승객 {booking.passengers.length}명
                    </p>
                  )}
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    총 금액
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${booking.totalPrice?.toLocaleString()} {booking.currency}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  결제 상태:{' '}
                  <span className={`font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {booking.paymentStatus === 'paid' ? '결제 완료' : '결제 대기'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              예약 확인서 다운로드
            </button>
            <Link
              href="/dashboard/bookings"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              내 예약 보기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <Link
            href="/"
            className="block text-center py-3 text-blue-600 hover:text-blue-700 font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">다음 단계</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">확인 이메일 확인</p>
                <p className="text-sm text-gray-600">
                  예약 상세 정보와 여행 준비 사항이 이메일로 발송되었습니다.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">출발 30일 전</p>
                <p className="text-sm text-gray-600">
                  여권 및 비자 요구사항을 확인하세요.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Ship className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">출발 7일 전</p>
                <p className="text-sm text-gray-600">
                  온라인 체크인이 가능합니다.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            문의사항이 있으신가요?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              고객센터
            </a>
            로 연락주세요.
          </p>
          <p className="mt-1">
            전화: 1588-1234 | 이메일: support@msccruises.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
