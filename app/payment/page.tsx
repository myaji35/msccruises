'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import StripeCardForm from '@/components/payment/StripeCardForm';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState(0);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'tosspay' | 'stripe'>('tosspay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  useEffect(() => {
    const bid = searchParams.get('bookingId');
    const amt = searchParams.get('amount');

    if (!bid || !amt) {
      router.push('/');
      return;
    }

    setBookingId(bid);
    setAmount(parseFloat(amt));
    fetchBooking(bid);
  }, []);

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/bookings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    }
  };

  const handleTossPayPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize payment
      const response = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          currency: 'USD',
          paymentMethod: 'tosspay',
          customerEmail: session?.user?.email,
          customerName: session?.user?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Load TossPay SDK
      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      const tossPayments = await loadTossPayments(data.data.metadata.clientKey);

      // Request payment
      await tossPayments.requestPayment('카드', {
        amount: data.data.metadata.amount,
        orderId: data.data.metadata.orderId,
        orderName: data.data.metadata.orderName,
        customerName: data.data.metadata.customerName,
        customerEmail: data.data.metadata.customerEmail,
        successUrl: data.data.metadata.successUrl,
        failUrl: data.data.metadata.failUrl,
      });
    } catch (error: any) {
      console.error('TossPay payment error:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize payment
      const response = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          currency: 'USD',
          paymentMethod: 'stripe',
          customerEmail: session?.user?.email,
          customerName: session?.user?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Load Stripe.js and show custom form
      const stripe = loadStripe(data.data.metadata.publishableKey);
      setStripePromise(stripe);
      setStripeClientSecret(data.data.metadata.clientSecret);
      setShowStripeForm(true);
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    router.push(`/payment/success?bookingId=${bookingId}&paymentIntentId=${paymentIntentId}`);
  };

  const handleStripeError = (errorMessage: string) => {
    setError(errorMessage);
    setShowStripeForm(false);
  };

  const handlePayment = () => {
    if (paymentMethod === 'tosspay') {
      handleTossPayPayment();
    } else {
      handleStripePayment();
    }
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <CreditCard className="inline w-8 h-8 mr-2" />
            결제
          </h1>
          <p className="text-gray-600">안전한 결제를 진행합니다</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">오류</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              {!showStripeForm ? (
                <>
                  <h2 className="text-xl font-bold mb-6">결제 수단 선택</h2>

                  <div className="space-y-4 mb-6">
                {/* TossPay Option */}
                <label className={`
                  relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${paymentMethod === 'tosspay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="tosspay"
                    checked={paymentMethod === 'tosspay'}
                    onChange={(e) => setPaymentMethod('tosspay')}
                    className="sr-only"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <img
                        src="/tosspay-logo.png"
                        alt="TossPay"
                        className="h-8"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <p className="font-semibold">토스페이</p>
                        <p className="text-sm text-gray-600">간편 결제 (한국)</p>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'tosspay' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </label>

                {/* Stripe Option */}
                <label className={`
                  relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${paymentMethod === 'stripe' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod('stripe')}
                    className="sr-only"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <img
                        src="/stripe-logo.png"
                        alt="Stripe"
                        className="h-8"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <p className="font-semibold">Stripe</p>
                        <p className="text-sm text-gray-600">신용카드 (글로벌)</p>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'stripe' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </label>
              </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          처리 중...
                        </span>
                      ) : (
                        `${amount.toLocaleString()} USD 결제하기`
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-6">
                      <button
                        onClick={() => setShowStripeForm(false)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        ← 뒤로
                      </button>
                      <h2 className="text-xl font-bold">카드 정보 입력</h2>
                    </div>

                    {stripePromise && stripeClientSecret && (
                      <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                        <StripeCardForm
                          clientSecret={stripeClientSecret}
                          amount={amount}
                          bookingId={bookingId}
                          onSuccess={handleStripeSuccess}
                          onError={handleStripeError}
                        />
                      </Elements>
                    )}
                  </>
                )}
            </div>

            {/* Security Notice */}
            {!showStripeForm && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">안전한 결제</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• SSL/TLS 암호화 통신</li>
                      <li>• PCI-DSS Level 1 준수</li>
                      <li>• 카드 정보는 저장되지 않습니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">주문 요약</h3>

              {booking && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">크루즈</p>
                    <p className="font-semibold">{booking.cruiseName}</p>
                    <p className="text-sm text-gray-500">{booking.shipName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">예약 번호</p>
                    <p className="font-semibold text-sm">{booking.bookingNumber || bookingId.slice(0, 12)}</p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 금액</span>
                      <span className="text-blue-600">${amount.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
