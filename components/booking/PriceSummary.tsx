'use client';

import React from 'react';
import { useBookingStore } from '@/store/booking-store';

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
  } = useBookingStore();

  const cabinTotal = basePrice * numCabins;
  const subtotal = cabinTotal + extrasTotal;

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
