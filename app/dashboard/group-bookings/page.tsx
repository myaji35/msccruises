'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Users,
  Ship,
  Calendar,
  DollarSign,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface GroupBooking {
  id: string;
  cruiseId: string;
  groupName?: string;
  numCabins: number;
  totalPassengers: number;
  discountPercentage: number;
  baseTotal: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'partial' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  groupLeaderEmail?: string;
  groupLeaderPhone?: string;
  createdAt: string;
  bookings?: any[];
}

function GroupBookingsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    fetchGroupBookings();
  }, []);

  const fetchGroupBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/group-bookings');

      if (!response.ok) {
        throw new Error('Failed to fetch group bookings');
      }

      const data = await response.json();
      setGroupBookings(data.data || []);

      // Auto-select if ID in URL
      const id = searchParams.get('id');
      if (id && data.data) {
        const booking = data.data.find((b: GroupBooking) => b.id === id);
        if (booking) {
          setSelectedBooking(booking);
        }
      }
    } catch (error) {
      console.error('Error fetching group bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      partial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      partial: AlertCircle,
      cancelled: XCircle,
    };

    const labels = {
      pending: '대기 중',
      confirmed: '확정',
      partial: '부분 확정',
      cancelled: '취소됨',
    };

    const Icon = icons[status as keyof typeof icons] || Clock;
    const style = styles[status as keyof typeof styles] || styles.pending;
    const label = labels[status as keyof typeof labels] || status;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: '결제 대기',
      partial: '부분 결제',
      paid: '결제 완료',
      refunded: '환불 완료',
    };

    const style = styles[status as keyof typeof styles] || styles.pending;
    const label = labels[status as keyof typeof labels] || status;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <Users className="inline w-8 h-8 mr-2" />
                그룹 예약 관리
              </h1>
              <p className="text-gray-600">그룹 예약 현황을 확인하고 관리하세요</p>
            </div>
            <button
              onClick={() => router.push('/booking/group')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              새 그룹 예약
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">그룹 예약이 성공적으로 생성되었습니다!</p>
              <p className="text-green-700 text-sm">영업팀이 확인 후 연락드리겠습니다.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : groupBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              그룹 예약이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              3개 이상의 객실을 예약하고 특별 할인을 받으세요
            </p>
            <button
              onClick={() => router.push('/booking/group')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              그룹 예약 시작하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking List */}
            <div className="lg:col-span-2 space-y-4">
              {groupBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`
                    bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all
                    hover:shadow-md
                    ${selectedBooking?.id === booking.id ? 'ring-2 ring-blue-600' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {booking.groupName || `그룹 예약 #${booking.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">객실 수</p>
                      <p className="font-semibold text-gray-900">{booking.numCabins}개</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">승객 수</p>
                      <p className="font-semibold text-gray-900">{booking.totalPassengers}명</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">총 금액</p>
                      <p className="font-semibold text-blue-600">
                        ${booking.finalTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {booking.discountPercentage > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        그룹 할인 {(booking.discountPercentage * 100).toFixed(0)}% 적용
                        (-${booking.discountAmount.toLocaleString()})
                      </span>
                    </div>
                  )}

                  <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                    자세히 보기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Booking Detail Sidebar */}
            <div className="lg:col-span-1">
              {selectedBooking ? (
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                  <h3 className="text-xl font-bold mb-4">예약 상세</h3>

                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">상태</p>
                      <div className="flex gap-2">
                        {getStatusBadge(selectedBooking.status)}
                        {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                      </div>
                    </div>

                    {/* Group Name */}
                    {selectedBooking.groupName && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">그룹 이름</p>
                        <p className="font-semibold">{selectedBooking.groupName}</p>
                      </div>
                    )}

                    {/* Contact */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">연락처</p>
                      <p className="text-sm">{selectedBooking.groupLeaderEmail}</p>
                      {selectedBooking.groupLeaderPhone && (
                        <p className="text-sm text-gray-500">{selectedBooking.groupLeaderPhone}</p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">기본 요금</span>
                          <span className="font-semibold">
                            ${selectedBooking.baseTotal.toLocaleString()}
                          </span>
                        </div>
                        {selectedBooking.discountPercentage > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>
                              그룹 할인 ({(selectedBooking.discountPercentage * 100).toFixed(0)}%)
                            </span>
                            <span className="font-semibold">
                              -${selectedBooking.discountAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>총 금액</span>
                          <span className="text-blue-600">
                            ${selectedBooking.finalTotal.toLocaleString()} {selectedBooking.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cabins */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">객실 정보</p>
                      <div className="space-y-1 text-sm">
                        <p>객실 수: <span className="font-semibold">{selectedBooking.numCabins}개</span></p>
                        <p>총 승객: <span className="font-semibold">{selectedBooking.totalPassengers}명</span></p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t pt-4 space-y-2">
                      <button
                        onClick={() => router.push(`/booking/group?edit=${selectedBooking.id}`)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        상세 보기
                      </button>
                      {selectedBooking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (confirm('정말 이 그룹 예약을 취소하시겠습니까?')) {
                              // TODO: Implement cancel API
                              alert('취소 기능은 향후 구현 예정입니다.');
                            }
                          }}
                          className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          예약 취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    그룹 예약을 선택하면 상세 정보가 표시됩니다
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroupBookingsDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <GroupBookingsDashboardContent />
    </Suspense>
  );
}
