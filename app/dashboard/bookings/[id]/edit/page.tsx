"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

interface Passenger {
  name: string;
  age: number;
  nationality: string;
}

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // TODO: Fetch booking details from API
    // For now, using mock data
    setTimeout(() => {
      setPassengers([
        { name: "홍길동", age: 35, nationality: "대한민국" },
        { name: "김영희", age: 32, nationality: "대한민국" },
      ]);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string | number) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert("변경사항이 없습니다.");
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Call API to update booking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("예약 정보가 수정되었습니다.");
      router.push(`/dashboard/bookings/${params.id}`);
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = confirm(
        "변경사항이 저장되지 않았습니다.\n정말로 나가시겠습니까?"
      );
      if (!confirmLeave) return;
    }
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>뒤로가기</span>
            </button>
            <h1 className="text-xl font-bold text-[#003366]">예약 수정</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Warning Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-1">수정 가능 항목 안내</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 탑승객 정보(이름, 나이, 국적)만 수정 가능합니다</li>
                <li>• 크루즈 일정, 객실 변경은 고객센터로 문의해주세요</li>
                <li>• 출발 7일 이내 예약은 수정이 제한될 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Passengers Edit Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#003366] mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            탑승객 정보 수정
          </h2>

          <div className="space-y-4">
            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-[#003366]">
                    탑승객 {index + 1}
                  </h3>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      대표 탑승객
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) =>
                        handlePassengerChange(index, "name", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      나이 *
                    </label>
                    <input
                      type="number"
                      value={passenger.age}
                      onChange={(e) =>
                        handlePassengerChange(index, "age", parseInt(e.target.value))
                      }
                      min="0"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      국적 *
                    </label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) =>
                        handlePassengerChange(index, "nationality", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex-1 bg-[#003366] hover:bg-[#002244] text-white py-6 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                변경사항 저장
              </>
            )}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-gray-400 text-gray-700 hover:bg-gray-50 py-6 text-lg font-bold"
          >
            <X className="w-5 h-5 mr-2" />
            취소
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 도움말</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 여권 정보와 동일하게 입력해주세요</li>
            <li>• 이름 철자가 정확한지 다시 한번 확인해주세요</li>
            <li>• 문의사항: 1588-1234 또는 support@msccruises.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
