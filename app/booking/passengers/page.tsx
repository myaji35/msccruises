'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/booking-store';
import ProgressIndicator from '@/components/booking/ProgressIndicator';
import PriceSummary from '@/components/booking/PriceSummary';
import { User, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PassengerInfo } from '@/types/booking.types';

export default function PassengersPage() {
  const router = useRouter();
  const {
    passengers,
    addPassenger,
    updatePassenger,
    removePassenger,
    selectedCruise,
    selectedCabin,
    numCabins,
    setCurrentStep,
    goToNextStep
  } = useBookingStore();

  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  useEffect(() => {
    setCurrentStep(4); // 4단계: 승객 정보

    // 최소 1명의 승객 필요
    if (passengers.length === 0) {
      addPassenger(createEmptyPassenger());
    }
  }, []);

  const createEmptyPassenger = (): PassengerInfo => ({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'KR',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: '',
  });

  const validatePassenger = (passenger: PassengerInfo, index: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passenger.firstName.trim()) {
      newErrors.firstName = '이름을 입력해주세요';
    }

    if (!passenger.lastName.trim()) {
      newErrors.lastName = '성을 입력해주세요';
    }

    if (!passenger.dateOfBirth) {
      newErrors.dateOfBirth = '생년월일을 선택해주세요';
    } else {
      // 나이 제한 체크 (0-120세)
      const birthDate = new Date(passenger.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        newErrors.dateOfBirth = '유효한 생년월일을 입력해주세요';
      }
    }

    if (!passenger.passportNumber.trim()) {
      newErrors.passportNumber = '여권 번호를 입력해주세요';
    }

    if (!passenger.passportExpiry) {
      newErrors.passportExpiry = '여권 만료일을 선택해주세요';
    } else {
      // 여권 만료일이 출발일보다 6개월 이상 남아있어야 함
      const expiryDate = new Date(passenger.passportExpiry);
      const departureDate = selectedCruise?.departureDate
        ? new Date(selectedCruise.departureDate)
        : new Date();
      const sixMonthsAfter = new Date(departureDate);
      sixMonthsAfter.setMonth(sixMonthsAfter.getMonth() + 6);

      if (expiryDate < sixMonthsAfter) {
        newErrors.passportExpiry = '여권 유효기간이 출발일로부터 6개월 이상 남아있어야 합니다';
      }
    }

    if (index === 0) { // 대표 승객만 연락처 필수
      if (!passenger.email.trim()) {
        newErrors.email = '이메일을 입력해주세요';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        newErrors.email = '유효한 이메일 주소를 입력해주세요';
      }

      if (!passenger.phone.trim()) {
        newErrors.phone = '전화번호를 입력해주세요';
      } else if (!/^[0-9\-+() ]+$/.test(passenger.phone)) {
        newErrors.phone = '유효한 전화번호를 입력해주세요';
      }
    }

    setErrors((prev) => ({
      ...prev,
      [index]: newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassenger = { ...passengers[index], [field]: value };
    updatePassenger(index, updatedPassenger);

    // 입력 시 해당 필드 에러 제거
    if (errors[index]?.[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index][field];
        return newErrors;
      });
    }
  };

  const handleAddPassenger = () => {
    addPassenger(createEmptyPassenger());
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1) {
      removePassenger(index);
      // 에러도 제거
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const handleContinue = () => {
    // 모든 승객 정보 검증
    let allValid = true;
    passengers.forEach((passenger, index) => {
      const isValid = validatePassenger(passenger, index);
      if (!isValid) allValid = false;
    });

    if (allValid) {
      router.push('/booking/checkout');
      goToNextStep();
    } else {
      // 첫 번째 에러로 스크롤
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleBack = () => {
    router.push('/booking/extras');
  };

  const maxPassengers = numCabins * 4; // 객실당 최대 4명

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProgressIndicator currentStep={4} onStepClick={() => {}} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 승객 정보 입력 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">승객 정보</h2>
                <div className="text-sm text-gray-600">
                  {passengers.length} / {maxPassengers}명
                </div>
              </div>

              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 relative"
                    data-error={errors[index] && Object.keys(errors[index]).length > 0}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">
                          승객 {index + 1}
                          {index === 0 && (
                            <span className="ml-2 text-sm text-blue-600">(대표 승객)</span>
                          )}
                        </h3>
                      </div>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => handleRemovePassenger(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 이름 (한글/영문) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          이름 (First Name) *
                        </label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => handleUpdatePassenger(index, 'firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[index]?.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="길동 / Gildong"
                        />
                        {errors[index]?.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors[index].firstName}</p>
                        )}
                      </div>

                      {/* 성 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          성 (Last Name) *
                        </label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => handleUpdatePassenger(index, 'lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[index]?.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="홍 / Hong"
                        />
                        {errors[index]?.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors[index].lastName}</p>
                        )}
                      </div>

                      {/* 생년월일 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          생년월일 *
                        </label>
                        <input
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) => handleUpdatePassenger(index, 'dateOfBirth', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[index]?.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[index]?.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-600">{errors[index].dateOfBirth}</p>
                        )}
                      </div>

                      {/* 국적 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          국적 *
                        </label>
                        <select
                          value={passenger.nationality}
                          onChange={(e) => handleUpdatePassenger(index, 'nationality', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="KR">대한민국 (South Korea)</option>
                          <option value="US">미국 (United States)</option>
                          <option value="JP">일본 (Japan)</option>
                          <option value="CN">중국 (China)</option>
                          <option value="GB">영국 (United Kingdom)</option>
                          <option value="OTHER">기타 (Other)</option>
                        </select>
                      </div>

                      {/* 여권 번호 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          여권 번호 *
                        </label>
                        <input
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) =>
                            handleUpdatePassenger(index, 'passportNumber', e.target.value.toUpperCase())
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase ${
                            errors[index]?.passportNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="M12345678"
                        />
                        {errors[index]?.passportNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors[index].passportNumber}</p>
                        )}
                      </div>

                      {/* 여권 만료일 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          여권 만료일 *
                        </label>
                        <input
                          type="date"
                          value={passenger.passportExpiry}
                          onChange={(e) => handleUpdatePassenger(index, 'passportExpiry', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[index]?.passportExpiry ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[index]?.passportExpiry && (
                          <p className="mt-1 text-sm text-red-600">{errors[index].passportExpiry}</p>
                        )}
                      </div>

                      {/* 대표 승객만 연락처 */}
                      {index === 0 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              이메일 *
                            </label>
                            <input
                              type="email"
                              value={passenger.email}
                              onChange={(e) => handleUpdatePassenger(index, 'email', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors[index]?.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="example@email.com"
                            />
                            {errors[index]?.email && (
                              <p className="mt-1 text-sm text-red-600">{errors[index].email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              전화번호 *
                            </label>
                            <input
                              type="tel"
                              value={passenger.phone}
                              onChange={(e) => handleUpdatePassenger(index, 'phone', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors[index]?.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="+82-10-1234-5678"
                            />
                            {errors[index]?.phone && (
                              <p className="mt-1 text-sm text-red-600">{errors[index].phone}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* 여권 안내 */}
                    {index === 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">여권 유효기간 안내</p>
                          <p className="mt-1">
                            출발일 기준 여권 유효기간이 6개월 이상 남아있어야 합니다.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 승객 추가 버튼 */}
              {passengers.length < maxPassengers && (
                <button
                  onClick={handleAddPassenger}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  승객 추가 (최대 {maxPassengers}명)
                </button>
              )}

              {/* 네비게이션 버튼 */}
              <div className="mt-8 flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  이전 단계
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  결제하기
                </Button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 가격 요약 */}
          <div className="lg:col-span-1">
            <PriceSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
