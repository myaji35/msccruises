'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Ship,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Check,
  Anchor,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface Cruise {
  id: string;
  name: string;
  shipName: string;
  description?: string;
  departurePort: string;
  destinations: string[];
  durationDays: number;
  startingPrice: number;
  currency: string;
  imageUrl?: string;
  featured?: boolean;
}

const MAX_COMPARE = 3;

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [selectedCruises, setSelectedCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCruises();

    // Load selected cruise IDs from URL
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    if (ids.length > 0) {
      loadSelectedCruises(ids);
    }
  }, []);

  const fetchCruises = async () => {
    try {
      const response = await fetch('/api/admin/cruises');
      if (!response.ok) throw new Error('Failed to fetch cruises');
      const data = await response.json();

      const cruiseData: Cruise[] = data.cruises.map((c: any) => ({
        id: c.id,
        name: c.name,
        shipName: c.shipName,
        description: c.description,
        departurePort: c.departurePort,
        destinations: Array.isArray(c.destinations) ? c.destinations : JSON.parse(c.destinations || '[]'),
        durationDays: c.durationDays,
        startingPrice: c.startingPrice,
        currency: c.currency || 'USD',
        imageUrl: c.media?.[0]?.url,
        featured: c.featured,
      }));

      setCruises(cruiseData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cruises:', error);
      setLoading(false);
    }
  };

  const loadSelectedCruises = (ids: string[]) => {
    // Will be populated after cruises are fetched
    setTimeout(() => {
      const selected = cruises.filter((c) => ids.includes(c.id)).slice(0, MAX_COMPARE);
      setSelectedCruises(selected);
    }, 100);
  };

  const handleAddCruise = (cruise: Cruise) => {
    if (selectedCruises.length >= MAX_COMPARE) {
      alert(`최대 ${MAX_COMPARE}개까지 비교할 수 있습니다.`);
      return;
    }

    if (selectedCruises.some((c) => c.id === cruise.id)) {
      alert('이미 추가된 크루즈입니다.');
      return;
    }

    const updated = [...selectedCruises, cruise];
    setSelectedCruises(updated);
    updateURL(updated);
  };

  const handleRemoveCruise = (cruiseId: string) => {
    const updated = selectedCruises.filter((c) => c.id !== cruiseId);
    setSelectedCruises(updated);
    updateURL(updated);
  };

  const updateURL = (cruises: Cruise[]) => {
    const ids = cruises.map((c) => c.id).join(',');
    router.push(`/compare${ids ? `?ids=${ids}` : ''}`);
  };

  const handleBookCruise = (cruiseId: string) => {
    router.push(`/booking/search?preselect=${cruiseId}`);
  };

  const comparisonRows = [
    {
      title: '기본 정보',
      icon: Ship,
      items: [
        { label: '크루즈 이름', key: 'name' },
        { label: '선박 이름', key: 'shipName' },
        { label: '출발지', key: 'departurePort' },
        { label: '기간', key: 'durationDays', format: (val: number) => `${val}일` },
      ],
    },
    {
      title: '가격',
      icon: DollarSign,
      items: [
        { label: '시작 가격', key: 'startingPrice', format: (val: number) => `$${val.toLocaleString()}` },
      ],
    },
    {
      title: '목적지',
      icon: MapPin,
      items: [
        {
          label: '주요 기항지',
          key: 'destinations',
          format: (val: string[]) => val.slice(0, 3).join(', ') + (val.length > 3 ? ` +${val.length - 3}` : '')
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            크루즈 비교
          </h1>
          <p className="text-gray-600">
            최대 {MAX_COMPARE}개의 크루즈를 비교하여 완벽한 여행을 선택하세요
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Comparison Table */}
        {selectedCruises.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left bg-gray-50 w-48">
                      <span className="text-sm font-semibold text-gray-700">항목</span>
                    </th>
                    {selectedCruises.map((cruise) => (
                      <th key={cruise.id} className="p-4 bg-gray-50 min-w-[280px]">
                        <div className="relative">
                          <button
                            onClick={() => handleRemoveCruise(cruise.id)}
                            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="pr-6">
                            {cruise.imageUrl && (
                              <img
                                src={cruise.imageUrl}
                                alt={cruise.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-cruise.jpg';
                                }}
                              />
                            )}
                            <h3 className="font-bold text-gray-900 text-left">{cruise.name}</h3>
                            <p className="text-sm text-gray-600 text-left">{cruise.shipName}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                    {selectedCruises.length < MAX_COMPARE && (
                      <th className="p-4 bg-gray-50 min-w-[280px]">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Plus className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">크루즈 추가</p>
                          </div>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((section, sectionIdx) => (
                    <React.Fragment key={sectionIdx}>
                      {/* Section Header */}
                      <tr className="bg-blue-50">
                        <td colSpan={selectedCruises.length + (selectedCruises.length < MAX_COMPARE ? 2 : 1)} className="p-3">
                          <div className="flex items-center gap-2">
                            <section.icon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">{section.title}</span>
                          </div>
                        </td>
                      </tr>
                      {/* Section Items */}
                      {section.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-sm font-medium text-gray-700">
                            {item.label}
                          </td>
                          {selectedCruises.map((cruise) => {
                            const value = (cruise as any)[item.key];
                            const displayValue = item.format ? item.format(value) : value;
                            return (
                              <td key={cruise.id} className="p-4 text-sm text-gray-900">
                                {displayValue}
                              </td>
                            );
                          })}
                          {selectedCruises.length < MAX_COMPARE && (
                            <td className="p-4 bg-gray-50"></td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Action Buttons */}
                  <tr>
                    <td className="p-4 bg-gray-50 font-medium text-gray-700">
                      예약하기
                    </td>
                    {selectedCruises.map((cruise) => (
                      <td key={cruise.id} className="p-4">
                        <button
                          onClick={() => handleBookCruise(cruise.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          선택
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    ))}
                    {selectedCruises.length < MAX_COMPARE && (
                      <td className="p-4 bg-gray-50"></td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-8">
            <Ship className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              비교할 크루즈를 선택하세요
            </h3>
            <p className="text-gray-600">
              아래 목록에서 최대 {MAX_COMPARE}개의 크루즈를 선택하여 비교하세요
            </p>
          </div>
        )}

        {/* Available Cruises */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            사용 가능한 크루즈
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cruises.map((cruise) => {
                const isSelected = selectedCruises.some((c) => c.id === cruise.id);
                const canAdd = selectedCruises.length < MAX_COMPARE && !isSelected;

                return (
                  <div
                    key={cruise.id}
                    className={`
                      bg-white rounded-lg shadow-sm overflow-hidden transition-all
                      ${isSelected ? 'ring-2 ring-blue-600 opacity-75' : 'hover:shadow-md'}
                    `}
                  >
                    {cruise.imageUrl && (
                      <img
                        src={cruise.imageUrl}
                        alt={cruise.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-cruise.jpg';
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {cruise.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{cruise.shipName}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{cruise.departurePort}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{cruise.durationDays}일</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            ${cruise.startingPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <button
                          onClick={() => handleRemoveCruise(cruise.id)}
                          className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          비교 중
                        </button>
                      ) : canAdd ? (
                        <button
                          onClick={() => handleAddCruise(cruise)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          비교 추가
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                        >
                          최대 {MAX_COMPARE}개
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
