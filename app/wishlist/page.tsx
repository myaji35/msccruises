'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Heart,
  Trash2,
  Ship,
  Calendar,
  MapPin,
  DollarSign,
  Bell,
  BellOff,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

interface WishlistItem {
  id: string;
  cruiseId: string;
  addedAt: string;
  notes?: string;
  priceAlert: boolean;
  targetPrice?: number;
  // Populated cruise data
  cruise?: {
    id: string;
    name: string;
    shipName: string;
    departurePort: string;
    durationDays: number;
    startingPrice: number;
    currency: string;
    imageUrl?: string;
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/wishlist');

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();

      // Fetch cruise details for each wishlist item
      const itemsWithCruises = await Promise.all(
        (data.data || []).map(async (item: WishlistItem) => {
          try {
            const cruiseResponse = await fetch(`/api/admin/cruises/${item.cruiseId}`);
            if (cruiseResponse.ok) {
              const cruiseData = await cruiseResponse.json();
              return {
                ...item,
                cruise: {
                  id: cruiseData.cruise.id,
                  name: cruiseData.cruise.name,
                  shipName: cruiseData.cruise.shipName,
                  departurePort: cruiseData.cruise.departurePort,
                  durationDays: cruiseData.cruise.durationDays,
                  startingPrice: cruiseData.cruise.startingPrice,
                  currency: cruiseData.cruise.currency || 'USD',
                  imageUrl: cruiseData.cruise.media?.[0]?.url,
                },
              };
            }
            return item;
          } catch (err) {
            return item;
          }
        })
      );

      setWishlist(itemsWithCruises);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cruiseId: string) => {
    if (!confirm('위시리스트에서 제거하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/wishlist?cruiseId=${cruiseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlist(wishlist.filter((item) => item.cruiseId !== cruiseId));
      setSelectedItems(selectedItems.filter((id) => id !== cruiseId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('제거 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePriceAlert = async (item: WishlistItem) => {
    try {
      // Update via re-adding with updated priceAlert
      const response = await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cruiseId: item.cruiseId,
          notes: item.notes,
          priceAlert: !item.priceAlert,
          targetPrice: item.targetPrice || item.cruise?.startingPrice,
        }),
      });

      if (response.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  };

  const handleToggleSelect = (cruiseId: string) => {
    if (selectedItems.includes(cruiseId)) {
      setSelectedItems(selectedItems.filter((id) => id !== cruiseId));
    } else {
      if (selectedItems.length >= 3) {
        alert('최대 3개까지 선택할 수 있습니다.');
        return;
      }
      setSelectedItems([...selectedItems, cruiseId]);
    }
  };

  const handleCompare = () => {
    if (selectedItems.length < 2) {
      alert('최소 2개의 크루즈를 선택해주세요.');
      return;
    }
    router.push(`/compare?ids=${selectedItems.join(',')}`);
  };

  const handleBook = (cruiseId: string) => {
    router.push(`/booking/search?preselect=${cruiseId}`);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">위시리스트를 사용하려면 로그인해주세요</p>
          <button
            onClick={() => router.push('/login?callbackUrl=/wishlist')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <Heart className="inline w-8 h-8 mr-2 text-red-500" />
                위시리스트
              </h1>
              <p className="text-gray-600">관심 있는 크루즈를 저장하고 가격 알림을 받으세요</p>
            </div>
            {selectedItems.length > 0 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <GitCompare className="w-5 h-5" />
                선택한 항목 비교 ({selectedItems.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              위시리스트가 비어있습니다
            </h3>
            <p className="text-gray-600 mb-6">
              마음에 드는 크루즈를 위시리스트에 추가하고 언제든지 확인하세요
            </p>
            <button
              onClick={() => router.push('/booking/search')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              크루즈 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => {
              const cruise = item.cruise;
              if (!cruise) return null;

              const isSelected = selectedItems.includes(item.cruiseId);

              return (
                <div
                  key={item.id}
                  className={`
                    bg-white rounded-lg shadow-sm overflow-hidden transition-all
                    ${isSelected ? 'ring-2 ring-blue-600' : 'hover:shadow-md'}
                  `}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Checkbox & Image */}
                    <div className="md:col-span-1 relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.cruiseId)}
                        className="absolute top-2 left-2 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 z-10"
                      />
                      <div className="relative h-48 md:h-full rounded-lg overflow-hidden bg-gray-200">
                        {cruise.imageUrl && (
                          <img
                            src={cruise.imageUrl}
                            alt={cruise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cruise.jpg';
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Cruise Info */}
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {cruise.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{cruise.shipName}</p>

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
                          <span className="font-semibold text-blue-600 text-lg">
                            ${cruise.startingPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">{item.notes}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-4">
                        추가일: {new Date(item.addedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                      <button
                        onClick={() => handleBook(cruise.id)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        예약하기
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleTogglePriceAlert(item)}
                        className={`
                          flex-1 px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2
                          ${item.priceAlert
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {item.priceAlert ? (
                          <>
                            <Bell className="w-4 h-4" />
                            알림 ON
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4" />
                            알림 OFF
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRemove(item.cruiseId)}
                        className="px-4 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        제거
                      </button>

                      {item.priceAlert && item.targetPrice && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            목표가: ${item.targetPrice.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison Help */}
        {wishlist.length >= 2 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <GitCompare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">크루즈 비교하기</p>
                <p>체크박스를 선택하여 최대 3개의 크루즈를 비교할 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
