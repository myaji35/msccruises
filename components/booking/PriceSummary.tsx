'use client';

import React, { useState } from 'react';
import { useBookingStore } from '@/store/booking-store';
import { Tag, Check, X, Loader2 } from 'lucide-react';

export default function PriceSummary() {
  const {
    selectedCruise,
    selectedCabin,
    numCabins,
    extras,
    extrasTotal,
    basePrice,
    promoCode,
    promoDiscount,
    totalPrice,
    setPromoCode,
    setPromoDiscount,
  } = useBookingStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  const cabinTotal = basePrice * numCabins;
  const subtotal = cabinTotal + extrasTotal;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setPromoStatus('validating');
    setPromoMessage('');

    try {
      // Story 002 프로모션 검증 API 호출
      const response = await fetch('/api/v1/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.toUpperCase(),
          cruiseId: selectedCruise?.id,
          cabinCategory: selectedCabin?.category,
          currentPrice: subtotal,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setPromoStatus('valid');
        setPromoCode(promoInput.toUpperCase());
        setPromoDiscount(data.discountAmount);
        setPromoMessage(`${data.discountAmount.toLocaleString()}원 할인 적용됨`);
      } else {
        setPromoStatus('invalid');
        setPromoMessage(data.error || '유효하지 않은 프로모션 코드입니다');
      }
    } catch (error) {
      setPromoStatus('invalid');
      setPromoMessage('프로모션 코드 검증 중 오류가 발생했습니다');
    }
  };

  const handleRemovePromo = () => {
    setPromoInput('');
    setPromoCode('');
    setPromoDiscount(0);
    setPromoStatus('idle');
    setPromoMessage('');
  };

  if (!selectedCruise) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-bold mb-4">예약 요약</h3>

      {/* Cruise Info */}
      <div className="border-b pb-4 mb-4">
        <h4 className="font-semibold text-gray-900">{selectedCruise.name}</h4>
        <p className="text-sm text-gray-500">{selectedCruise.shipName}</p>
        <p className="text-sm text-gray-500 mt-1">
          {selectedCruise.durationDays}일 / {selectedCruise.departurePort}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(selectedCruise.departureDate).toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* Cabin Info */}
      {selectedCabin && (
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="font-medium text-gray-900">{selectedCabin.name}</h5>
              <p className="text-sm text-gray-500">
                {selectedCabin.category.toUpperCase()}
              </p>
              {numCabins > 1 && (
                <p className="text-xs text-gray-400 mt-1">{numCabins}개 객실</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${basePrice.toLocaleString()}
              </p>
              {numCabins > 1 && (
                <p className="text-xs text-gray-500">× {numCabins}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <div className="border-b pb-4 mb-4">
          <h5 className="font-medium text-gray-900 mb-2">추가 옵션</h5>
          {extras.map((extra) => {
            const extraPrice = extra.perDay && selectedCruise
              ? extra.price * extra.quantity * selectedCruise.durationDays
              : extra.price * extra.quantity;

            return (
              <div key={extra.id} className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{extra.name}</p>
                  {extra.quantity > 1 && (
                    <p className="text-xs text-gray-400">
                      {extra.quantity}개
                      {extra.perDay && ` × ${selectedCruise.durationDays}일`}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${extraPrice.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Promo Code Input */}
      <div className="border-b pb-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">프로모션 코드</label>
        {!promoCode ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="코드 입력"
                disabled={promoStatus === 'validating'}
              />
            </div>
            <button
              onClick={handleApplyPromo}
              disabled={!promoInput.trim() || promoStatus === 'validating'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {promoStatus === 'validating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  확인중
                </>
              ) : (
                '적용'
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{promoCode}</span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="p-1 hover:bg-green-100 rounded transition"
            >
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}
        {promoMessage && (
          <p className={`mt-2 text-sm ${promoStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
            {promoMessage}
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2">
        {/* Cabin Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">객실 요금</span>
          <span className="font-medium">${cabinTotal.toLocaleString()}</span>
        </div>

        {/* Extras Subtotal */}
        {extrasTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">추가 옵션</span>
            <span className="font-medium">${extrasTotal.toLocaleString()}</span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-600">소계</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>

        {/* Promo Discount */}
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>
              할인 ({promoCode})
            </span>
            <span className="font-medium">-${promoDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-lg font-bold border-t-2 pt-3 mt-3">
          <span>총 금액</span>
          <span className="text-blue-600">${totalPrice.toLocaleString()}</span>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          * 세금 및 항만 요금은 체크아웃 시 추가됩니다
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">무료 취소</p>
            <p className="text-xs mt-1">
              출발 30일 전까지 무료 취소 가능
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
