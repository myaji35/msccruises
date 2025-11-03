"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "@/components/PackageSearch";
import { PackageResults } from "@/components/PackageResults";
import { useState } from "react";
import { packageService } from "@/services/package.service";
import type { CruiseFlightPackage, PackageSearchParams } from "@/types/flight.types";
import { Ship, Phone, Mail, Building, Award, CheckCircle } from "lucide-react";

export default function PartnerSubpage() {
  const params = useParams();
  const slug = params.slug as string;

  const [packages, setPackages] = useState<CruiseFlightPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock partner data - in production, fetch from API based on slug
  const partnerInfo = {
    slug,
    company_name: slug === "seoul-cruise" ? "서울크루즈여행사" : "파트너 여행사",
    representative_name: "홍길동",
    phone: "02-1234-5678",
    email: "contact@example.com",
    address: "서울시 강남구 테헤란로 123",
    description: "20년 전통의 크루즈 전문 여행사입니다. 고객 만족을 최우선으로 생각합니다.",
    benefits: [
      "전문 상담사의 1:1 맞춤 상담",
      "그룹 예약 시 추가 할인 혜택",
      "출발 전 안내 서비스",
      "24시간 긴급 지원",
    ],
  };

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
    alert(
      `${partnerInfo.company_name}를 통한 예약입니다.\n\n` +
        `크루즈: ${pkg.cruise.name}\n` +
        `총 금액: $${pkg.pricing.total_price.toLocaleString()}\n\n` +
        `상담원이 연락드립니다.\n` +
        `연락처: ${partnerInfo.phone}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Partner Branding */}
      <header className="bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Ship className="w-10 h-10 text-[#FFD700]" />
              <div>
                <div className="text-sm text-blue-200">MSC Cruises 공식 파트너</div>
                <h1 className="text-3xl font-bold">{partnerInfo.company_name}</h1>
              </div>
            </div>
            <Link href="/">
              <Button variant="secondary" size="sm">
                MSC 메인 사이트
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Partner Info Banner */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-[#003366] mb-4">회사 소개</h2>
              <p className="text-gray-700 mb-6">{partnerInfo.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Building className="w-5 h-5 text-[#003366]" />
                  <span>{partnerInfo.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-[#003366]" />
                  <a href={`tel:${partnerInfo.phone}`} className="hover:text-[#003366]">
                    {partnerInfo.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-[#003366]" />
                  <a href={`mailto:${partnerInfo.email}`} className="hover:text-[#003366]">
                    {partnerInfo.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-[#003366] mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#FFD700]" />
                특별 혜택
              </h3>
              <ul className="space-y-3">
                {partnerInfo.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              크루즈 + 항공 통합 패키지
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-4">
              {partnerInfo.company_name}에서 특별한 가격으로 만나보세요
            </p>
            <div className="inline-block bg-[#FFD700] text-[#003366] px-6 py-2 rounded-full font-bold text-lg">
              회원사 전용 추가 할인 적용
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
              {partnerInfo.company_name}를 통해 특별한 혜택으로 예약하실 수 있습니다
            </p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-[#003366] to-[#004080] py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">전문 상담이 필요하신가요?</h2>
          <p className="text-xl text-blue-200 mb-8">
            경험 많은 크루즈 전문가가 맞춤 상담을 도와드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${partnerInfo.phone}`}>
              <Button size="lg" className="bg-[#FFD700] text-[#003366] hover:bg-[#E5C200]">
                <Phone className="w-5 h-5 mr-2" />
                전화 상담 {partnerInfo.phone}
              </Button>
            </a>
            <a href={`mailto:${partnerInfo.email}`}>
              <Button size="lg" variant="secondary">
                <Mail className="w-5 h-5 mr-2" />
                이메일 문의
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#FFD700]">
                {partnerInfo.company_name}
              </h3>
              <p className="text-gray-300 text-sm mb-2">{partnerInfo.description}</p>
              <p className="text-gray-400 text-xs">대표: {partnerInfo.representative_name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-2">
                본 페이지는 MSC Cruises 공식 파트너 전용 페이지입니다
              </div>
              <Link href="/" className="text-[#FFD700] hover:underline text-sm">
                MSC Cruises 메인 사이트 →
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
            © 2025 {partnerInfo.company_name} · MSC Cruises Korea Official Partner
          </div>
        </div>
      </footer>
    </div>
  );
}
