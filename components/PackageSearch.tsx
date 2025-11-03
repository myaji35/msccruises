"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plane, Ship, MapPin, Calendar, Users } from "lucide-react";
import { KOREAN_AIRPORTS } from "@/types/flight.types";

interface PackageSearchProps {
  onSearch: (params: any) => void;
  isLoading?: boolean;
}

export function PackageSearch({ onSearch, isLoading = false }: PackageSearchProps) {
  const [searchParams, setSearchParams] = useState({
    departure_airport: "ICN",
    cruise_destination: "",
    cruise_departure_date: "",
    cruise_duration: "",
    passengers: 2,
    cabin_class: "economy" as const,
    max_stops: undefined as number | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto -mt-20 relative z-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-[#003366]">
          <Ship className="w-6 h-6" />
          <span className="text-xl font-bold">크루즈</span>
        </div>
        <span className="text-2xl text-[#FFD700]">+</span>
        <div className="flex items-center gap-2 text-[#003366]">
          <Plane className="w-6 h-6" />
          <span className="text-xl font-bold">항공권</span>
        </div>
        <span className="ml-2 text-sm bg-[#FFD700] text-[#003366] px-3 py-1 rounded-full font-semibold">
          패키지 할인 최대 10%
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Flight Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Departure Airport */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Plane className="w-4 h-4" />
              출발 공항
            </label>
            <select
              value={searchParams.departure_airport}
              onChange={(e) =>
                setSearchParams({ ...searchParams, departure_airport: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              {KOREAN_AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code})
                </option>
              ))}
            </select>
          </div>

          {/* Cabin Class */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Plane className="w-4 h-4" />
              항공 좌석 등급
            </label>
            <select
              value={searchParams.cabin_class}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  cabin_class: e.target.value as "economy" | "premium_economy" | "business" | "first",
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="economy">이코노미</option>
              <option value="premium_economy">프리미엄 이코노미</option>
              <option value="business">비즈니스</option>
              <option value="first">일등석</option>
            </select>
          </div>

          {/* Max Stops */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Plane className="w-4 h-4" />
              경유 횟수
            </label>
            <select
              value={searchParams.max_stops ?? ""}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  max_stops: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">상관없음</option>
              <option value="0">직항만</option>
              <option value="1">1회 경유까지</option>
              <option value="2">2회 경유까지</option>
            </select>
          </div>
        </div>

        {/* Row 2: Cruise Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Cruise Destination */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              크루즈 목적지
            </label>
            <select
              value={searchParams.cruise_destination}
              onChange={(e) =>
                setSearchParams({ ...searchParams, cruise_destination: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="Caribbean">카리브해</option>
              <option value="Mediterranean">지중해</option>
              <option value="Northern Europe">북유럽</option>
              <option value="Alaska">알래스카</option>
              <option value="Asia">아시아</option>
            </select>
          </div>

          {/* Departure Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              출발 날짜
            </label>
            <input
              type="date"
              value={searchParams.cruise_departure_date}
              onChange={(e) =>
                setSearchParams({ ...searchParams, cruise_departure_date: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Ship className="w-4 h-4" />
              크루즈 기간
            </label>
            <select
              value={searchParams.cruise_duration}
              onChange={(e) =>
                setSearchParams({ ...searchParams, cruise_duration: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="3-5">3-5일</option>
              <option value="6-9">6-9일</option>
              <option value="10-14">10-14일</option>
              <option value="15+">15일 이상</option>
            </select>
          </div>

          {/* Passengers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              인원
            </label>
            <select
              value={searchParams.passengers}
              onChange={(e) =>
                setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="1">1명</option>
              <option value="2">2명</option>
              <option value="3">3명</option>
              <option value="4">4명</option>
              <option value="5">5명+</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="bg-[#003366] hover:bg-[#002244] text-white px-12 py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                패키지 검색 중...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                통합 패키지 검색
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 text-center">
          💡 <strong>스마트 패키지:</strong> 크루즈 출발 1일 전 도착, 귀국 1일 후 출발 항공편을
          자동으로 검색해드립니다.
        </p>
      </div>
    </div>
  );
}
