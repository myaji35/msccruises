'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBookingStore } from '@/store/booking-store';
import ProgressIndicator from '@/components/booking/ProgressIndicator';
import PriceSummary from '@/components/booking/PriceSummary';
import { User, Mail, Phone, Globe, Calendar, CreditCard, Lock, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { PassengerInfo } from '@/types/booking.types';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    selectedCruise,
    selectedCabin,
    numCabins,
    passengers,
    addPassenger,
    updatePassenger,
    removePassenger,
    setCurrentStep,
    totalPrice,
    resetBooking,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    setCurrentStep(4);

    // Redirect if previous steps incomplete
    if (!selectedCruise || !selectedCabin) {
      router.push('/booking/search');
      return;
    }

    // Initialize passengers if empty
    if (passengers.length === 0) {
      const initialPassenger: PassengerInfo = {
        firstName: session?.user?.name?.split(' ')[0] || '',
        lastName: session?.user?.name?.split(' ')[1] || '',
        dateOfBirth: new Date(1990, 0, 1),
        passportNumber: '',
        nationality: 'South Korea',
        email: session?.user?.email || '',
        phone: '',
        isPrimary: true,
      };
      addPassenger(initialPassenger);
    }
  }, [selectedCruise, selectedCabin, session]);

  const handleAddPassenger = () => {
    const newPassenger: PassengerInfo = {
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(1990, 0, 1),
      passportNumber: '',
      nationality: 'South Korea',
      email: '',
      phone: '',
      isPrimary: false,
    };
    addPassenger(newPassenger);
  };

  const handleUpdatePassenger = (index: number, field: keyof PassengerInfo, value: any) => {
    const updated = { ...passengers[index], [field]: value };
    updatePassenger(index, updated);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1 && !passengers[index].isPrimary) {
      removePassenger(index);
    }
  };

  const validateForm = (): boolean => {
    // Check if at least one passenger
    if (passengers.length === 0) {
      setError('최소 1명의 승객 정보가 필요합니다.');
      return false;
    }

    // Validate each passenger
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName) {
        setError(`승객 ${i + 1}: 이름을 입력해주세요.`);
        return false;
      }
      if (!p.nationality) {
        setError(`승객 ${i + 1}: 국적을 선택해주세요.`);
        return false;
      }
      if (p.isPrimary && !p.email) {
        setError('대표 승객의 이메일을 입력해주세요.');
        return false;
      }
    }

    // Check terms agreement
    if (!agreeTerms) {
      setError('이용약관에 동의해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!session?.user) {
      router.push(`/login?callbackUrl=/booking/checkout`);
      return;
    }

    setLoading(true);

    try {
      // Create booking via API
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cruiseId: selectedCruise?.id,
          cruiseName: selectedCruise?.name,
          shipName: selectedCruise?.shipName,
          departureDate: selectedCruise?.departureDate,
          returnDate: selectedCruise?.returnDate,
          departurePort: selectedCruise?.departurePort,
          cabinCategory: selectedCabin?.category,
          totalPrice: totalPrice,
          passengers: passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
            passportNumber: p.passportNumber || '',
            nationality: p.nationality,
            isPrimary: p.isPrimary,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const data = await response.json();
      const bookingId = data.data?.id;

      // Clear booking store
      resetBooking();

      // Redirect to payment page (Story 006 will implement actual payment)
      router.push(`/booking/confirmation?bookingId=${bookingId}`);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || '예약 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step: number) => {
    if (step === 1) {
      router.push('/booking/search');
    } else if (step === 2) {
      router.push('/booking/cabin');
    } else if (step === 3) {
      router.push('/booking/extras');
    } else if (step === 4) {
      return; // Already on step 4
    }
  };

  if (!selectedCruise || !selectedCabin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator currentStep={4} onStepClick={handleStepClick} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                승객 정보 및 결제
              </h1>
              <p className="text-gray-600">
                예약을 완료하기 위해 승객 정보를 입력해주세요
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">오류</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Passenger Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    <User className="inline w-5 h-5 mr-2" />
                    승객 정보
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddPassenger}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    승객 추가
                  </button>
                </div>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="pb-6 border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          승객 {index + 1}
                          {passenger.isPrimary && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              대표
                            </span>
                          )}
                        </h3>
                        {!passenger.isPrimary && passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            이름 (First Name) *
                          </label>
                          <input
                            type="text"
                            required
                            value={passenger.firstName}
                            onChange={(e) =>
                              handleUpdatePassenger(index, 'firstName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            성 (Last Name) *
                          </label>
                          <input
                            type="text"
                            required
                            value={passenger.lastName}
                            onChange={(e) =>
                              handleUpdatePassenger(index, 'lastName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            생년월일 *
                          </label>
                          <input
                            type="date"
                            required
                            value={passenger.dateOfBirth instanceof Date
                              ? passenger.dateOfBirth.toISOString().split('T')[0]
                              : ''}
                            onChange={(e) =>
                              handleUpdatePassenger(index, 'dateOfBirth', new Date(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Passport Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            여권 번호
                          </label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) =>
                              handleUpdatePassenger(index, 'passportNumber', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="M12345678"
                          />
                        </div>

                        {/* Nationality */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Globe className="inline w-4 h-4 mr-1" />
                            국적 *
                          </label>
                          <select
                            required
                            value={passenger.nationality}
                            onChange={(e) =>
                              handleUpdatePassenger(index, 'nationality', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="South Korea">대한민국</option>
                            <option value="USA">미국</option>
                            <option value="Japan">일본</option>
                            <option value="China">중국</option>
                            <option value="Canada">캐나다</option>
                            <option value="UK">영국</option>
                          </select>
                        </div>

                        {/* Email (Primary passenger only) */}
                        {passenger.isPrimary && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Mail className="inline w-4 h-4 mr-1" />
                              이메일 *
                            </label>
                            <input
                              type="email"
                              required
                              value={passenger.email || ''}
                              onChange={(e) =>
                                handleUpdatePassenger(index, 'email', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="john@example.com"
                            />
                          </div>
                        )}

                        {/* Phone (Primary passenger only) */}
                        {passenger.isPrimary && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Phone className="inline w-4 h-4 mr-1" />
                              연락처
                            </label>
                            <input
                              type="tel"
                              value={passenger.phone || ''}
                              onChange={(e) =>
                                handleUpdatePassenger(index, 'phone', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="+82 10-1234-5678"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <CreditCard className="inline w-5 h-5 mr-2" />
                  결제 정보
                </h2>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">데모 버전 안내</p>
                      <p>
                        현재는 데모 버전으로, 실제 결제는 진행되지 않습니다.
                        <br />
                        실제 결제 통합은 Story 006에서 TossPay/Stripe를 통해 구현됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>결제 통합 예정</p>
                  <p className="text-sm">(TossPay / Stripe)</p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-1">
                      이용약관 및 개인정보처리방침에 동의합니다 *
                    </p>
                    <p className="text-gray-600">
                      예약 진행 시{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        이용약관
                      </a>{' '}
                      및{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        개인정보처리방침
                      </a>
                      에 동의하는 것으로 간주됩니다.
                    </p>
                  </div>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/booking/extras')}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  이전: 추가 옵션
                </button>
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="flex-1 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      처리 중...
                    </span>
                  ) : (
                    `예약 완료 (${totalPrice.toLocaleString()} USD)`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <PriceSummary />

            {/* Security Notice */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">안전한 결제</p>
                  <p className="text-xs text-gray-600">
                    모든 결제 정보는 PCI-DSS 표준에 따라 암호화되어 안전하게 처리됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
