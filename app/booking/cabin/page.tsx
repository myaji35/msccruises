'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/booking-store';
import ProgressIndicator from '@/components/booking/ProgressIndicator';
import PriceSummary from '@/components/booking/PriceSummary';
import { Bed, Users, Eye, Waves, Crown, Check, ChevronRight } from 'lucide-react';
import type { CabinOption } from '@/types/booking.types';

// Icon mapping for categories
const ICON_MAP: Record<string, any> = {
  inside: Bed,
  oceanview: Eye,
  balcony: Waves,
  suite: Crown,
};

// Color mapping for categories
const COLOR_MAP: Record<string, string> = {
  inside: 'blue',
  oceanview: 'indigo',
  balcony: 'purple',
  suite: 'amber',
};

export default function CabinSelectionPage() {
  const router = useRouter();
  const {
    selectedCruise,
    selectCabin,
    setNumCabins,
    numCabins,
    setCurrentStep,
    goToNextStep,
  } = useBookingStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cabinCategories, setCabinCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Fetch cabin categories from DB
  useEffect(() => {
    const fetchCabinCategories = async () => {
      try {
        const response = await fetch('/api/cabin-categories');
        const data = await response.json();
        setCabinCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch cabin categories:', error);
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCabinCategories();
  }, []);

  useEffect(() => {
    setCurrentStep(2);

    // Redirect to search if no cruise selected
    if (!selectedCruise) {
      router.push('/booking/search');
    }
  }, [selectedCruise]);

  const handleSelectCabin = (category: any) => {
    if (!selectedCruise) return;

    setLoading(true);

    const cabinOption: CabinOption = {
      id: category.id,
      name: category.name,
      category: category.code,
      description: category.description || '',
      price: selectedCruise.startingPrice * category.priceMultiplier,
      features: category.features || [],
      available: true, // Mock availability
      deckNumber: undefined,
    };

    selectCabin(cabinOption);

    setTimeout(() => {
      setLoading(false);
      goToNextStep();
      router.push('/booking/extras');
    }, 500);
  };

  const handleStepClick = (step: number) => {
    if (step === 1) {
      router.push('/booking/search');
    } else if (step === 2) {
      return; // Already on step 2
    }
    // Can't navigate forward without selecting a cabin
  };

  const handleNumCabinsChange = (num: number) => {
    if (num >= 1 && num <= 10) {
      setNumCabins(num);
    }
  };

  if (!selectedCruise) {
    return null; // Will redirect
  }

  if (fetchingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">객실 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator currentStep={2} onStepClick={handleStepClick} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                객실 선택
              </h1>
              <p className="text-gray-600">
                원하시는 객실 등급을 선택해주세요
              </p>
            </div>

            {/* Number of Cabins */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Users className="inline w-4 h-4 mr-1" />
                예약 객실 수
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNumCabinsChange(numCabins - 1)}
                  disabled={numCabins <= 1}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {numCabins}
                </span>
                <button
                  onClick={() => handleNumCabinsChange(numCabins + 1)}
                  disabled={numCabins >= 10}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  +
                </button>
                <span className="text-gray-600 ml-2">
                  {numCabins === 1 ? '객실' : '객실'}
                </span>
              </div>

              {numCabins >= 3 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <Check className="inline w-4 h-4 mr-1" />
                    <strong>그룹 할인 적용!</strong> {numCabins >= 11 ? '15%' : numCabins >= 6 ? '10%' : '5%'} 할인이 자동 적용됩니다
                  </p>
                </div>
              )}

              {numCabins >= 16 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    16개 이상의 객실 예약은 전문 영업팀과 상담이 필요합니다.
                    예약 진행 시 영업팀이 연락드립니다.
                  </p>
                </div>
              )}
            </div>

            {/* Cabin Categories */}
            <div className="space-y-4">
              {cabinCategories.map((cabin) => {
                const price = selectedCruise.startingPrice * cabin.priceMultiplier;
                const totalPrice = price * numCabins;
                const isSelected = selectedCategory === cabin.id;
                const Icon = ICON_MAP[cabin.code] || Bed;
                const color = COLOR_MAP[cabin.code] || 'blue';

                return (
                  <div
                    key={cabin.id}
                    onClick={() => setSelectedCategory(cabin.id)}
                    className={`
                      bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                      border-2 ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent'}
                    `}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-${color}-100`}>
                            <Icon className={`w-6 h-6 text-${color}-600`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {cabin.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {cabin.description}
                            </p>

                            <ul className="space-y-1">
                              {cabin.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">1인 기준</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${price.toLocaleString()}
                          </p>
                          {numCabins > 1 && (
                            <p className="text-sm text-gray-500 mt-1">
                              총 ${totalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCabin(cabin);
                        }}
                        disabled={loading}
                        className={`
                          w-full py-3 rounded-lg font-semibold transition-colors
                          ${isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {loading && isSelected ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            처리 중...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            이 객실 선택
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={() => router.push('/booking/search')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← 항해 다시 선택
              </button>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <PriceSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
