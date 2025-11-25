"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Ship, Plane } from "lucide-react";

interface PackageSearchProps {
  onSearch: (params: any) => void;
  isLoading?: boolean;
}

type SearchMode = "package" | "cruise" | "flight";

export function PackageSearch({ onSearch, isLoading = false }: PackageSearchProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("package");

  const [searchParams, setSearchParams] = useState({
    // 항공편 관련
    departure_airport: "ICN",
    flight_class: "economy",

    // 크루즈 관련
    cabin_type: "inside",
    cruise_destination: "all",
    cruise_departure_date: "",
    cruise_duration: "all",

    // 공통
    price_range: "all",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ ...searchParams, searchMode });
  };

  const handleChange = (name: string, value: string) => {
    setSearchParams({ ...searchParams, [name]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-6xl mx-auto -mt-20 relative z-20">
      {/* 탭 메뉴 */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setSearchMode("package")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            searchMode === "package"
              ? "bg-[#003366] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Ship className="w-5 h-5" />
          크루즈
          <span className="text-xl mx-1">+</span>
          <Plane className="w-5 h-5" />
          항공권
          {searchMode === "package" && (
            <span className="ml-2 bg-yellow-400 text-[#003366] text-xs px-2 py-1 rounded-full font-bold">
              패키지 할인 최대 10%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSearchMode("cruise")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            searchMode === "cruise"
              ? "bg-[#003366] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Ship className="w-5 h-5" />
          크루즈만
        </button>

        <button
          type="button"
          onClick={() => setSearchMode("flight")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            searchMode === "flight"
              ? "bg-[#003366] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Plane className="w-5 h-5" />
          항공권만
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 패키지 검색 (크루즈 + 항공권) */}
        {searchMode === "package" && (
          <>
            {/* 첫 번째 줄: 항공편 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Plane className="w-4 h-4" />
                  출발 공항
                </label>
                <select
                  value={searchParams.departure_airport}
                  onChange={(e) => handleChange("departure_airport", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="ICN">인천국제공항 (ICN)</option>
                  <option value="GMP">김포국제공항 (GMP)</option>
                  <option value="PUS">김해국제공항 (PUS)</option>
                  <option value="CJU">제주국제공항 (CJU)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Plane className="w-4 h-4" />
                  항공 좌석 등급
                </label>
                <select
                  value={searchParams.flight_class}
                  onChange={(e) => handleChange("flight_class", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="economy">이코노미</option>
                  <option value="premium_economy">프리미엄 이코노미</option>
                  <option value="business">비즈니스</option>
                  <option value="first">퍼스트</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Ship className="w-4 h-4" />
                  객실 횟수
                </label>
                <select
                  value={searchParams.cabin_type}
                  onChange={(e) => handleChange("cabin_type", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="inside">실내 객실</option>
                  <option value="oceanview">오션뷰</option>
                  <option value="balcony">발코니</option>
                  <option value="suite">스위트</option>
                </select>
              </div>
            </div>

            {/* 두 번째 줄: 크루즈 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Ship className="w-4 h-4" />
                  크루즈 목적지
                </label>
                <select
                  value={searchParams.cruise_destination}
                  onChange={(e) => handleChange("cruise_destination", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="all">전체</option>
                  <option value="mediterranean">지중해</option>
                  <option value="caribbean">카리브해</option>
                  <option value="asia">아시아</option>
                  <option value="northern_europe">북유럽</option>
                  <option value="alaska">알래스카</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  출발 날짜
                </label>
                <input
                  type="date"
                  value={searchParams.cruise_departure_date}
                  onChange={(e) => handleChange("cruise_departure_date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                  placeholder="연도. 월. 일."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  크루즈 기간
                </label>
                <select
                  value={searchParams.cruise_duration}
                  onChange={(e) => handleChange("cruise_duration", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="all">전체</option>
                  <option value="3-5">3-5일</option>
                  <option value="6-9">6-9일</option>
                  <option value="10-14">10-14일</option>
                  <option value="15+">15일 이상</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  💰 금액 범위
                </label>
                <select
                  value={searchParams.price_range}
                  onChange={(e) => handleChange("price_range", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
                >
                  <option value="all">전체 금액</option>
                  <option value="0-1000">$1,000 이하</option>
                  <option value="1000-2000">$1,000 - $2,000</option>
                  <option value="2000-3000">$2,000 - $3,000</option>
                  <option value="3000-5000">$3,000 - $5,000</option>
                  <option value="5000-999999">$5,000 이상</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* 크루즈만 검색 */}
        {searchMode === "cruise" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Ship className="w-4 h-4" />
                크루즈 목적지
              </label>
              <select
                value={searchParams.cruise_destination}
                onChange={(e) => handleChange("cruise_destination", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="all">전체</option>
                <option value="mediterranean">지중해</option>
                <option value="caribbean">카리브해</option>
                <option value="asia">아시아</option>
                <option value="northern_europe">북유럽</option>
                <option value="alaska">알래스카</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                출발 날짜
              </label>
              <input
                type="date"
                value={searchParams.cruise_departure_date}
                onChange={(e) => handleChange("cruise_departure_date", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                크루즈 기간
              </label>
              <select
                value={searchParams.cruise_duration}
                onChange={(e) => handleChange("cruise_duration", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="all">전체</option>
                <option value="3-5">3-5일</option>
                <option value="6-9">6-9일</option>
                <option value="10-14">10-14일</option>
                <option value="15+">15일 이상</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                객실 타입
              </label>
              <select
                value={searchParams.cabin_type}
                onChange={(e) => handleChange("cabin_type", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="inside">실내 객실</option>
                <option value="oceanview">오션뷰</option>
                <option value="balcony">발코니</option>
                <option value="suite">스위트</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                💰 금액 범위
              </label>
              <select
                value={searchParams.price_range}
                onChange={(e) => handleChange("price_range", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="all">전체 금액</option>
                <option value="0-1000">$1,000 이하</option>
                <option value="1000-2000">$1,000 - $2,000</option>
                <option value="2000-3000">$2,000 - $3,000</option>
                <option value="3000-5000">$3,000 - $5,000</option>
                <option value="5000-999999">$5,000 이상</option>
              </select>
            </div>
          </div>
        )}

        {/* 항공권만 검색 */}
        {searchMode === "flight" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Plane className="w-4 h-4" />
                출발 공항
              </label>
              <select
                value={searchParams.departure_airport}
                onChange={(e) => handleChange("departure_airport", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="ICN">인천국제공항 (ICN)</option>
                <option value="GMP">김포국제공항 (GMP)</option>
                <option value="PUS">김해국제공항 (PUS)</option>
                <option value="CJU">제주국제공항 (CJU)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                도착 공항
              </label>
              <input
                type="text"
                placeholder="목적지 입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                출발일
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                좌석 등급
              </label>
              <select
                value={searchParams.flight_class}
                onChange={(e) => handleChange("flight_class", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="economy">이코노미</option>
                <option value="premium_economy">프리미엄 이코노미</option>
                <option value="business">비즈니스</option>
                <option value="first">퍼스트</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                💰 금액 범위
              </label>
              <select
                value={searchParams.price_range}
                onChange={(e) => handleChange("price_range", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50"
              >
                <option value="all">전체 금액</option>
                <option value="0-1000">$1,000 이하</option>
                <option value="1000-2000">$1,000 - $2,000</option>
                <option value="2000-3000">$2,000 - $3,000</option>
                <option value="3000-5000">$3,000 - $5,000</option>
                <option value="5000-999999">$5,000 이상</option>
              </select>
            </div>
          </div>
        )}

        {/* 검색 버튼 */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#003366] hover:bg-[#002244] text-white px-12 py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                검색 중...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                {searchMode === "package" && "통합 패키지 검색"}
                {searchMode === "cruise" && "크루즈 검색"}
                {searchMode === "flight" && "항공권 검색"}
              </>
            )}
          </Button>
        </div>

        {/* 패키지 안내 메시지 */}
        {searchMode === "package" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>스마트 패키지:</strong> 크루즈 출발 1일 전 도착, 귀국 1일 후 출발 항공편을 자동으로 검색해드립니다.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
