'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/booking-store';
import ProgressIndicator from '@/components/booking/ProgressIndicator';
import PriceSummary from '@/components/booking/PriceSummary';
import { Utensils, Map, Sparkles, Wifi, Wine, Plus, Minus, Trash2 } from 'lucide-react';
import type { Extra } from '@/types/booking.types';

const ICON_MAP: { [key: string]: React.ElementType } = {
  Utensils,
  Wine,
  Wifi,
  Map,
  Sparkles,
};

// Category icon mapping
const CATEGORY_ICON_MAP: Record<string, string> = {
  dining: 'Utensils',
  beverage: 'Wine',
  wifi: 'Wifi',
  'shore-excursion': 'Map',
  spa: 'Sparkles',
};

export default function ExtrasPage() {
  const router = useRouter();
  const {
    selectedCruise,
    selectedCabin,
    extras,
    addExtra,
    removeExtra,
    updateExtraQuantity,
    setCurrentStep,
    goToNextStep,
  } = useBookingStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableExtras, setAvailableExtras] = useState<any[]>([]);
  const [fetchingExtras, setFetchingExtras] = useState(true);

  // Fetch extras from DB
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await fetch('/api/cruise-extras');
        const data = await response.json();
        setAvailableExtras(data.extras || []);
      } catch (error) {
        console.error('Failed to fetch extras:', error);
      } finally {
        setFetchingExtras(false);
      }
    };

    fetchExtras();
  }, []);

  useEffect(() => {
    setCurrentStep(3);

    // Redirect if no cruise or cabin selected
    if (!selectedCruise || !selectedCabin) {
      router.push('/booking/search');
    }
  }, [selectedCruise, selectedCabin]);

  const handleAddExtra = (dbExtra: any) => {
    const icon = CATEGORY_ICON_MAP[dbExtra.category] || 'Utensils';
    const extra: Extra = {
      id: dbExtra.id,
      name: dbExtra.name,
      description: dbExtra.description || '',
      price: dbExtra.price,
      category: dbExtra.category,
      icon,
      perDay: false, // Can be added to DB schema later
      quantity: 1,
    };
    addExtra(extra);
  };

  const handleUpdateQuantity = (extraId: string, delta: number) => {
    const currentExtra = extras.find((e) => e.id === extraId);
    if (!currentExtra) return;

    const newQuantity = currentExtra.quantity + delta;
    if (newQuantity <= 0) {
      removeExtra(extraId);
    } else {
      updateExtraQuantity(extraId, newQuantity);
    }
  };

  const handleContinue = () => {
    goToNextStep();
    router.push('/booking/checkout');
  };

  const handleSkip = () => {
    goToNextStep();
    router.push('/booking/checkout');
  };

  const handleStepClick = (step: number) => {
    if (step === 1) {
      router.push('/booking/search');
    } else if (step === 2) {
      router.push('/booking/cabin');
    } else if (step === 3) {
      return; // Already on step 3
    }
  };

  const categories = [
    { id: 'all', name: '전체', count: availableExtras.length },
    { id: 'dining', name: '다이닝', count: availableExtras.filter((e) => e.category === 'dining').length },
    { id: 'beverage', name: '음료', count: availableExtras.filter((e) => e.category === 'beverage').length },
    { id: 'shore-excursion', name: '투어', count: availableExtras.filter((e) => e.category === 'shore-excursion').length },
    { id: 'spa', name: '스파', count: availableExtras.filter((e) => e.category === 'spa').length },
    { id: 'wifi', name: '인터넷', count: availableExtras.filter((e) => e.category === 'wifi').length },
  ];

  if (fetchingExtras) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">부가상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const filteredExtras = selectedCategory === 'all'
    ? availableExtras
    : availableExtras.filter((e) => e.category === selectedCategory);

  const isExtraAdded = (extraId: string) => {
    return extras.some((e) => e.id === extraId);
  };

  const getExtraQuantity = (extraId: string) => {
    return extras.find((e) => e.id === extraId)?.quantity || 0;
  };

  const calculateExtraPrice = (extra: Extra) => {
    if (extra.perDay && selectedCruise) {
      return extra.price * selectedCruise.durationDays;
    }
    return extra.price;
  };

  if (!selectedCruise || !selectedCabin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator currentStep={3} onStepClick={handleStepClick} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                추가 옵션 선택
              </h1>
              <p className="text-gray-600">
                크루즈 경험을 더욱 특별하게 만들어줄 옵션을 선택하세요 (선택사항)
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-4 py-2 rounded-full font-medium transition-colors
                    ${selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Extras List */}
            <div className="space-y-4 mb-8">
              {filteredExtras.map((extra) => {
                const iconName = CATEGORY_ICON_MAP[extra.category] || 'Utensils';
                const Icon = ICON_MAP[iconName] || Utensils;
                const added = isExtraAdded(extra.id);
                const quantity = getExtraQuantity(extra.id);
                const price = extra.price; // Use price from DB

                return (
                  <div
                    key={extra.id}
                    className={`
                      bg-white rounded-lg shadow-sm p-6 transition-all
                      ${added ? 'ring-2 ring-blue-600' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-blue-100">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {extra.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {extra.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-lg font-bold text-blue-600">
                              ${price.toLocaleString()}
                              {extra.perDay && (
                                <span className="text-sm text-gray-500 font-normal ml-1">
                                  (${extra.price}/일 × {selectedCruise.durationDays}일)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {!added ? (
                          <button
                            onClick={() => handleAddExtra(extra)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            추가
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(extra.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(extra.id, 1)}
                              className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeExtra(extra.id)}
                              className="ml-2 p-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/booking/cabin')}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                이전: 객실 선택
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                다음: 결제
              </button>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <PriceSummary />

            {/* Selected Extras Summary */}
            {extras.length > 0 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  선택한 옵션 ({extras.length}개)
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {extras.map((extra) => (
                    <li key={extra.id} className="flex justify-between">
                      <span>
                        {extra.name} × {extra.quantity}
                      </span>
                      <span className="font-semibold">
                        ${(calculateExtraPrice(extra) * extra.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
