'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/booking-store';
import ProgressIndicator from '@/components/booking/ProgressIndicator';
import { Search, Calendar, MapPin, Ship, Filter } from 'lucide-react';
import type { CruiseOption } from '@/types/booking.types';

export default function CruiseSearchPage() {
  const router = useRouter();
  const { selectCruise, setCurrentStep } = useBookingStore();

  const [cruises, setCruises] = useState<CruiseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [destination, setDestination] = useState('');
  const [departureMonth, setDepartureMonth] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    setCurrentStep(1);
    fetchCruises();
  }, []);

  const fetchCruises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cruises');

      if (!response.ok) {
        throw new Error('Failed to fetch cruises');
      }

      const data = await response.json();

      // Transform API data to CruiseOption format
      const cruiseOptions: CruiseOption[] = data.cruises.map((cruise: any) => ({
        id: cruise.id,
        name: cruise.name,
        shipName: cruise.shipName,
        description: cruise.description || '',
        departurePort: cruise.departurePort,
        destinations: Array.isArray(cruise.destinations)
          ? cruise.destinations
          : JSON.parse(cruise.destinations || '[]'),
        durationDays: cruise.durationDays,
        departureDate: cruise.createdAt, // Mock - should come from itinerary
        startingPrice: cruise.startingPrice,
        currency: cruise.currency || 'USD',
        imageUrl: cruise.media?.[0]?.url || '/placeholder-cruise.jpg',
      }));

      setCruises(cruiseOptions);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cruises:', err);
      setError(err.message || 'Failed to load cruises');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCruise = (cruise: CruiseOption) => {
    selectCruise(cruise);
    router.push('/booking/cabin');
  };

  const handleStepClick = (step: number) => {
    if (step === 1) return; // Already on step 1
    // Can't navigate forward without selecting a cruise
  };

  const filteredCruises = cruises.filter((cruise) => {
    if (destination && !cruise.destinations.some((dest: string) =>
      dest.toLowerCase().includes(destination.toLowerCase())
    )) {
      return false;
    }

    if (minPrice && cruise.startingPrice < minPrice) {
      return false;
    }

    if (maxPrice && cruise.startingPrice > maxPrice) {
      return false;
    }

    if (duration) {
      const durationNum = parseInt(duration);
      if (cruise.durationDays !== durationNum) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator currentStep={1} onStepClick={handleStepClick} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold">필터</h3>
              </div>

              <div className="space-y-6">
                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    목적지
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="예: 지중해, 카리브해"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    기간
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">전체</option>
                    <option value="3">3일</option>
                    <option value="4">4일</option>
                    <option value="7">7일</option>
                    <option value="10">10일</option>
                    <option value="14">14일</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    가격 범위
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${minPrice.toLocaleString()}</span>
                      <span>${maxPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setDestination('');
                    setDepartureMonth('');
                    setMinPrice(0);
                    setMaxPrice(10000);
                    setDuration('');
                  }}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* Cruise List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                항해 선택
              </h1>
              <p className="text-gray-600">
                {filteredCruises.length}개의 항해를 찾았습니다
              </p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">크루즈 정보를 불러오는 중...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchCruises}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  다시 시도
                </button>
              </div>
            )}

            {!loading && !error && filteredCruises.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600">
                  필터 조건을 변경해보세요
                </p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {filteredCruises.map((cruise) => (
                  <div
                    key={cruise.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                      {/* Cruise Image */}
                      <div className="md:col-span-1">
                        <div className="relative h-48 md:h-full rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={cruise.imageUrl}
                            alt={cruise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cruise.jpg';
                            }}
                          />
                        </div>
                      </div>

                      {/* Cruise Info */}
                      <div className="md:col-span-2">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {cruise.name}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Ship className="w-4 h-4" />
                              <span className="text-sm">{cruise.shipName}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">부터</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${cruise.startingPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">1인 기준</p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {cruise.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{cruise.departurePort}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{cruise.durationDays}일</span>
                          </div>
                        </div>

                        {cruise.destinations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">주요 기항지:</p>
                            <div className="flex flex-wrap gap-2">
                              {cruise.destinations.slice(0, 5).map((dest: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                >
                                  {dest}
                                </span>
                              ))}
                              {cruise.destinations.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{cruise.destinations.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleSelectCruise(cruise)}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          이 항해 선택
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
