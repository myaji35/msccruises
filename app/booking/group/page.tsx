'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Users,
  Plus,
  Trash2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Ship,
  Calendar,
  Bed,
  DollarSign,
  Info,
} from 'lucide-react';

interface CabinBooking {
  cabinCategory: 'inside' | 'oceanview' | 'balcony' | 'suite';
  numPassengers: number;
  passengers?: PassengerData[];
}

interface PassengerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  nationality: string;
}

interface Cruise {
  id: string;
  name: string;
  shipName: string;
  departurePort: string;
  durationDays: number;
  startingPrice: number;
}

const CABIN_CATEGORIES = [
  { value: 'inside', label: '내부 객실', multiplier: 1.0 },
  { value: 'oceanview', label: '오션뷰', multiplier: 1.3 },
  { value: 'balcony', label: '발코니', multiplier: 1.6 },
  { value: 'suite', label: '스위트', multiplier: 2.5 },
];

export default function GroupBookingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [selectedCruiseId, setSelectedCruiseId] = useState('');
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupLeaderEmail, setGroupLeaderEmail] = useState(session?.user?.email || '');
  const [groupLeaderPhone, setGroupLeaderPhone] = useState('');
  const [cabins, setCabins] = useState<CabinBooking[]>([
    { cabinCategory: 'inside', numPassengers: 2 },
    { cabinCategory: 'inside', numPassengers: 2 },
    { cabinCategory: 'inside', numPassengers: 2 },
  ]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCruises();
  }, []);

  useEffect(() => {
    if (selectedCruiseId) {
      const cruise = cruises.find((c) => c.id === selectedCruiseId);
      setSelectedCruise(cruise || null);
    }
  }, [selectedCruiseId, cruises]);

  const fetchCruises = async () => {
    try {
      const response = await fetch('/api/admin/cruises');
      if (!response.ok) throw new Error('Failed to fetch cruises');
      const data = await response.json();
      setCruises(data.cruises || []);
    } catch (err) {
      console.error('Error fetching cruises:', err);
    }
  };

  const handleAddCabin = () => {
    setCabins([...cabins, { cabinCategory: 'inside', numPassengers: 2 }]);
  };

  const handleRemoveCabin = (index: number) => {
    if (cabins.length > 1) {
      setCabins(cabins.filter((_, i) => i !== index));
    }
  };

  const handleUpdateCabin = (index: number, field: keyof CabinBooking, value: any) => {
    const updated = [...cabins];
    updated[index] = { ...updated[index], [field]: value };
    setCabins(updated);
  };

  const calculateDiscount = (): number => {
    const numCabins = cabins.length;
    if (numCabins >= 16) return 0; // Sales team contact
    if (numCabins >= 11) return 0.15; // 15%
    if (numCabins >= 6) return 0.1; // 10%
    if (numCabins >= 3) return 0.05; // 5%
    return 0;
  };

  const calculatePricing = () => {
    if (!selectedCruise) {
      return { baseTotal: 0, discountAmount: 0, finalTotal: 0, discountPercentage: 0 };
    }

    let baseTotal = 0;
    cabins.forEach((cabin) => {
      const category = CABIN_CATEGORIES.find((c) => c.value === cabin.cabinCategory);
      const cabinPrice = selectedCruise.startingPrice * (category?.multiplier || 1.0);
      baseTotal += cabinPrice;
    });

    const discountPercentage = calculateDiscount();
    const discountAmount = baseTotal * discountPercentage;
    const finalTotal = baseTotal - discountAmount;

    return { baseTotal, discountAmount, finalTotal, discountPercentage };
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',');

        // Parse CSV (simple implementation)
        // Expected format: firstName,lastName,dateOfBirth,passportNumber,nationality,cabinCategory
        const parsedCabins: CabinBooking[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length < 5) continue;

          const passenger: PassengerData = {
            firstName: values[0]?.trim() || '',
            lastName: values[1]?.trim() || '',
            dateOfBirth: values[2]?.trim() || '',
            passportNumber: values[3]?.trim() || '',
            nationality: values[4]?.trim() || 'South Korea',
          };

          const cabinCategory = (values[5]?.trim() || 'inside') as CabinBooking['cabinCategory'];

          // Group passengers by cabin
          const existingCabin = parsedCabins.find(
            (c) => c.cabinCategory === cabinCategory && c.passengers && c.passengers.length < 4
          );

          if (existingCabin && existingCabin.passengers) {
            existingCabin.passengers.push(passenger);
            existingCabin.numPassengers = existingCabin.passengers.length;
          } else {
            parsedCabins.push({
              cabinCategory,
              numPassengers: 1,
              passengers: [passenger],
            });
          }
        }

        if (parsedCabins.length > 0) {
          setCabins(parsedCabins);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (err) {
        console.error('CSV parsing error:', err);
        setError('CSV 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const csv = [
      'firstName,lastName,dateOfBirth,passportNumber,nationality,cabinCategory',
      'John,Doe,1990-01-01,M12345678,USA,inside',
      'Jane,Smith,1985-05-15,M87654321,UK,inside',
      'Mike,Johnson,1992-03-20,M11223344,Canada,oceanview',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group_booking_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateForm = (): boolean => {
    if (!selectedCruiseId) {
      setError('크루즈를 선택해주세요.');
      return false;
    }

    if (cabins.length < 3) {
      setError('그룹 예약은 최소 3개 객실이 필요합니다.');
      return false;
    }

    if (!groupLeaderEmail) {
      setError('대표자 이메일을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!session?.user) {
      router.push('/login?callbackUrl=/booking/group');
      return;
    }

    setLoading(true);

    try {
      const pricing = calculatePricing();

      const response = await fetch('/api/v1/group-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cruiseId: selectedCruiseId,
          groupName: groupName || undefined,
          groupLeaderEmail,
          groupLeaderPhone: groupLeaderPhone || undefined,
          cabins: cabins.map((cabin) => ({
            cabinCategory: cabin.cabinCategory,
            numPassengers: cabin.numPassengers,
            passengers: cabin.passengers,
          })),
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create group booking');
      }

      const data = await response.json();

      // Redirect to confirmation or dashboard
      router.push(`/dashboard/group-bookings?id=${data.data.id}&success=true`);
    } catch (err: any) {
      console.error('Group booking error:', err);
      setError(err.message || '그룹 예약 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const pricing = calculatePricing();
  const totalPassengers = cabins.reduce((sum, cabin) => sum + cabin.numPassengers, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Users className="inline w-8 h-8 mr-2" />
            그룹 예약
          </h1>
          <p className="text-gray-600">3개 이상의 객실을 한 번에 예약하고 할인 혜택을 받으세요</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">오류</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">CSV 파일이 성공적으로 업로드되었습니다!</p>
                </div>
              )}

              {/* Cruise Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                  <Ship className="inline w-5 h-5 mr-2" />
                  크루즈 선택
                </h2>
                <select
                  required
                  value={selectedCruiseId}
                  onChange={(e) => setSelectedCruiseId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">크루즈를 선택하세요</option>
                  {cruises.map((cruise) => (
                    <option key={cruise.id} value={cruise.id}>
                      {cruise.name} - {cruise.shipName} ({cruise.durationDays}일)
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">그룹 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      그룹 이름 (선택사항)
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="예: Smith 가족 크루즈"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        대표자 이메일 *
                      </label>
                      <input
                        type="email"
                        required
                        value={groupLeaderEmail}
                        onChange={(e) => setGroupLeaderEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        대표자 연락처
                      </label>
                      <input
                        type="tel"
                        value={groupLeaderPhone}
                        onChange={(e) => setGroupLeaderPhone(e.target.value)}
                        placeholder="+82 10-1234-5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CSV Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                  <Upload className="inline w-5 h-5 mr-2" />
                  대량 업로드 (선택사항)
                </h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    CSV 파일을 업로드하여 여러 승객 정보를 한 번에 입력할 수 있습니다.
                  </p>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="px-4 py-3 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg hover:bg-blue-100 transition-colors text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          CSV 파일 선택
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">템플릿 다운로드</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cabin List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    <Bed className="inline w-5 h-5 mr-2" />
                    객실 목록 ({cabins.length}개)
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddCabin}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    객실 추가
                  </button>
                </div>

                {cabins.length < 3 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      그룹 예약은 최소 3개 객실이 필요합니다.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {cabins.map((cabin, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold">객실 {index + 1}</h3>
                        {cabins.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCabin(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            객실 등급
                          </label>
                          <select
                            value={cabin.cabinCategory}
                            onChange={(e) =>
                              handleUpdateCabin(index, 'cabinCategory', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {CABIN_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            승객 수
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="4"
                            value={cabin.numPassengers}
                            onChange={(e) =>
                              handleUpdateCabin(index, 'numPassengers', parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">추가 요청사항</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="특별한 요청사항이 있으시면 입력해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || cabins.length < 3}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </span>
                ) : (
                  `그룹 예약 신청 (${pricing.finalTotal.toLocaleString()} USD)`
                )}
              </button>
            </form>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">
                <DollarSign className="inline w-5 h-5 mr-1" />
                예약 요약
              </h3>

              {selectedCruise && (
                <div className="mb-6 pb-6 border-b">
                  <p className="font-semibold text-gray-900">{selectedCruise.name}</p>
                  <p className="text-sm text-gray-600">{selectedCruise.shipName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCruise.durationDays}일 | {selectedCruise.departurePort}
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">객실 수</span>
                  <span className="font-semibold">{cabins.length}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 승객 수</span>
                  <span className="font-semibold">{totalPassengers}명</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">기본 요금</span>
                  <span className="font-semibold">${pricing.baseTotal.toLocaleString()}</span>
                </div>
                {pricing.discountPercentage > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>그룹 할인 ({(pricing.discountPercentage * 100).toFixed(0)}%)</span>
                    <span className="font-semibold">-${pricing.discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold border-t-2 pt-4">
                <span>총 금액</span>
                <span className="text-blue-600">${pricing.finalTotal.toLocaleString()}</span>
              </div>

              {cabins.length >= 16 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Info className="inline w-4 h-4 mr-1" />
                    16개 이상의 객실 예약은 전문 영업팀이 연락드립니다.
                  </p>
                </div>
              )}

              {pricing.discountPercentage > 0 && cabins.length < 16 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    <CheckCircle className="inline w-4 h-4 mr-1" />
                    그룹 할인 적용!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    ${pricing.discountAmount.toLocaleString()} 절약
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
