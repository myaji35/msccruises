'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  Ship,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import RefundModal from '@/components/payment/RefundModal';

interface PaymentDetail {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: 'tosspay' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentKey: string;
  orderId: string;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  cruiseId: string;
  cruiseName: string;
  shipName: string;
  departureDate: string;
  returnDate: string;
  cabinCategory: string;
  numPassengers: number;
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && params.id) {
      fetchPayment();
    }
  }, [status, params.id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/payments/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('결제 정보를 찾을 수 없습니다.');
        }
        throw new Error('Failed to fetch payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load payment details');
      }

      setPayment(data.data);
    } catch (err: any) {
      console.error('Error fetching payment:', err);
      setError(err.message || '결제 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-6 h-6 text-blue-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '결제 완료';
      case 'pending':
        return '결제 대기';
      case 'failed':
        return '결제 실패';
      case 'refunded':
        return '환불 완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCabinLabel = (category: string) => {
    const labels: Record<string, string> = {
      inside: '내부 객실',
      oceanview: '오션뷰',
      balcony: '발코니',
      suite: '스위트',
    };
    return labels[category] || category;
  };

  const handleSendReceipt = async () => {
    if (!payment) return;

    setSendingReceipt(true);

    try {
      const response = await fetch(`/api/v1/payments/${payment.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to send receipt');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send receipt');
      }

      alert('영수증이 이메일로 전송되었습니다.');
    } catch (err: any) {
      console.error('Send receipt error:', err);
      alert(err.message || '영수증 전송 중 오류가 발생했습니다.');
    } finally {
      setSendingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/payments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            결제 이력으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/dashboard/payments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            결제 이력으로 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            결제 상세
          </h1>
          <p className="text-gray-600">결제 ID: {payment.id}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${getStatusColor(payment.status)}`}>
          <div className="flex items-center gap-4">
            {getStatusIcon(payment.status)}
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">{getStatusText(payment.status)}</h2>
              <p className="text-sm opacity-90">
                {payment.status === 'completed' && payment.completedAt && `${formatDate(payment.completedAt)}에 완료됨`}
                {payment.status === 'pending' && '결제가 처리 중입니다'}
                {payment.status === 'failed' && '결제가 실패했습니다'}
                {payment.status === 'refunded' && payment.refundedAt && `${formatDate(payment.refundedAt)}에 환불됨`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${payment.amount.toLocaleString()}
              </div>
              <div className="text-sm opacity-90">{payment.currency}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cruise Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Ship className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">크루즈 정보</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">크루즈명</p>
                <p className="font-semibold text-gray-900">{payment.cruiseName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">선박</p>
                <p className="font-semibold text-gray-900">{payment.shipName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">출발일</p>
                <p className="font-semibold text-gray-900">{formatDate(payment.departureDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">귀항일</p>
                <p className="font-semibold text-gray-900">{formatDate(payment.returnDate)}</p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">예약 정보</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">예약 번호</p>
                <p className="font-mono font-semibold text-gray-900 text-sm">{payment.bookingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">객실 등급</p>
                <p className="font-semibold text-gray-900">{getCabinLabel(payment.cabinCategory)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">승객 수</p>
                <p className="font-semibold text-gray-900">{payment.numPassengers}명</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">결제 정보</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">결제 수단</p>
                <p className="font-semibold text-gray-900">
                  {payment.paymentMethod === 'tosspay' ? '토스페이' : 'Stripe'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">결제 요청 시각</p>
                <p className="font-semibold text-gray-900">{formatDate(payment.createdAt)}</p>
              </div>
              {payment.paymentKey && (
                <div>
                  <p className="text-sm text-gray-600">결제 키</p>
                  <p className="font-mono font-semibold text-gray-900 text-xs break-all">
                    {payment.paymentKey}
                  </p>
                </div>
              )}
              {payment.orderId && (
                <div>
                  <p className="text-sm text-gray-600">주문 번호</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm">
                    {payment.orderId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">타임라인</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">결제 요청</p>
                  <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                </div>
              </div>

              {payment.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">결제 완료</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.completedAt)}</p>
                  </div>
                </div>
              )}

              {payment.refundedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">환불 완료</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.refundedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => router.push(`/booking/${payment.bookingId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              예약 상세 보기
            </button>
            {payment.status === 'completed' && (
              <>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  영수증 다운로드
                </button>
                <button
                  onClick={handleSendReceipt}
                  disabled={sendingReceipt}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingReceipt ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    '이메일로 영수증 전송'
                  )}
                </button>
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  환불 요청
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && payment && (
        <RefundModal
          paymentId={payment.id}
          maxAmount={payment.amount}
          currency={payment.currency}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            setShowRefundModal(false);
            fetchPayment(); // Refresh payment data
            alert('환불 요청이 성공적으로 처리되었습니다.');
          }}
        />
      )}
    </div>
  );
}
