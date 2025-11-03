"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageSearch } from "@/components/PackageSearch";
import { PackageResults } from "@/components/PackageResults";
import { packageService } from "@/services/package.service";
import type { CruiseFlightPackage, PackageSearchParams } from "@/types/flight.types";
import { Ship, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PackagesPage() {
  const [packages, setPackages] = useState<CruiseFlightPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: PackageSearchParams) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await packageService.searchPackages(params);
      setPackages(results);
    } catch (error) {
      console.error("Package search failed:", error);
      alert("패키지 검색에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPackage = (pkg: CruiseFlightPackage) => {
    // TODO: Navigate to booking page
    console.log("Selected package:", pkg);
    alert(`${pkg.cruise.name} 패키지가 선택되었습니다.\n예약 페이지로 이동합니다.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#FFD700] flex items-center gap-2">
            <Ship className="w-8 h-8" />
            MSC CRUISES
          </Link>
          <ul className="hidden md:flex gap-6">
            <li>
              <Link href="/#cruises" className="hover:text-[#FFD700] transition-colors">
                크루즈
              </Link>
            </li>
            <li>
              <Link href="/packages" className="text-[#FFD700] font-semibold">
                패키지 검색
              </Link>
            </li>
            <li>
              <Link href="/#schedule" className="hover:text-[#FFD700] transition-colors">
                출발일정
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#FFD700] transition-colors">
                로그인
              </Link>
            </li>
          </ul>
          <Link href="/">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              메인으로
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] bg-[#003366]">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920"
          alt="Cruise and Flight Package"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              크루즈 + 항공 통합 패키지
            </h1>
            <p className="text-xl md:text-2xl text-gray-200">
              한 번의 검색으로 크루즈와 항공권을 함께 예약하세요
            </p>
            <div className="mt-4 inline-block bg-[#FFD700] text-[#003366] px-6 py-2 rounded-full font-bold text-lg">
              패키지 할인 최대 10% 적용
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="container mx-auto px-4">
        <PackageSearch onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-12">
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003366] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">최적의 패키지를 찾고 있습니다...</p>
            <p className="text-sm text-gray-500 mt-2">
              크루즈 일정과 항공편을 조합하는 중입니다
            </p>
          </div>
        )}

        {!isLoading && hasSearched && (
          <PackageResults packages={packages} onSelectPackage={handleSelectPackage} />
        )}

        {!hasSearched && (
          <div className="text-center py-16">
            <Ship className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              원하는 조건을 선택하고 검색해보세요
            </h3>
            <p className="text-gray-500">
              크루즈 여행과 항공권을 한 번에 비교하고 예약할 수 있습니다
            </p>
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#003366]">
            통합 패키지 예약의 장점
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#FFD700] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">최대 10% 할인</h3>
              <p className="text-gray-600">
                크루즈와 항공권을 함께 예약하면 패키지 할인 혜택을 받을 수 있습니다
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#FFD700] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">간편한 예약</h3>
              <p className="text-gray-600">
                한 번의 검색으로 크루즈와 항공편을 동시에 비교하고 예약할 수 있습니다
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#FFD700] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">추가 혜택</h3>
              <p className="text-gray-600">
                무료 공항 픽업, 사전 체크인 등 패키지 고객만의 특별 혜택을 제공합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#FFD700]">MSC Cruises</h3>
              <p className="text-gray-300 text-sm">
                세계 최고의 크루즈 여행을 경험하세요
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">크루즈</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/#cruises" className="hover:text-[#FFD700]">
                    전체 크루즈
                  </Link>
                </li>
                <li>
                  <Link href="/packages" className="hover:text-[#FFD700]">
                    패키지 상품
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>자주 묻는 질문</li>
                <li>예약 조회</li>
                <li>1:1 문의</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">연락처</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📞 1588-0000</li>
                <li>📧 info@msccruises.kr</li>
                <li>🕐 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 MSC Cruises Korea. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
