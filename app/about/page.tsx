"use client";

import { Ship, Award, Users, Globe, Heart, Anchor, MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Header - Consistent with main page */}
      <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="cursor-pointer hover:opacity-80 transition">
              <Image
                src="/msc-logo.svg"
                alt="MSC Cruises"
                width={180}
                height={54}
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <ul className="hidden md:flex gap-6">
              <li><Link href="/" className="hover:text-[#FFD700] transition">홈</Link></li>
              <li><Link href="/#cruises" className="hover:text-[#FFD700] transition">크루즈</Link></li>
              <li><Link href="/packages" className="hover:text-[#FFD700] transition">패키지 검색</Link></li>
              <li><Link href="/about" className="text-[#FFD700] font-semibold">회사소개</Link></li>
            </ul>
            <Link href="/login">
              <Button variant="secondary" size="sm">로그인</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#003366] to-[#0055AA] text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/cruise-pattern.svg')] bg-repeat"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">회사소개</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              MSC Cruises와 함께하는 특별한 크루즈 여행
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full">
                <Ship className="w-5 h-5" />
                <span className="font-semibold">최신 선박</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">전 세계 항로</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#003366] mb-4">MSC Cruises 소개</h2>
              <div className="w-24 h-1 bg-[#FFD700] mx-auto"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                MSC Cruises는 세계 최대의 개인 소유 크루즈 회사로, 1970년 설립 이래
                지속적으로 성장하며 현재 전 세계에서 가장 혁신적이고 현대적인 크루즈 라인 중 하나입니다.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                우리는 최신 선박, 월드클래스 다이닝, 브로드웨이 수준의 엔터테인먼트를 통해
                잊지 못할 크루즈 경험을 제공합니다. 지중해, 카리브해, 북유럽, 아시아 등
                전 세계 200개 이상의 항구로 여행할 수 있습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                가족 여행객부터 럭셔리를 추구하는 여행객까지, 모든 고객에게
                완벽한 크루즈 경험을 선사하기 위해 최선을 다하고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#003366] mb-4">왜 MSC Cruises인가?</h2>
            <div className="w-24 h-1 bg-[#FFD700] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Ship className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">최신 선박</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                최첨단 기술과 혁신적인 디자인을 갖춘 현대적인 크루즈 선박으로
                최상의 편안함을 제공합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Award className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">월드클래스 서비스</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                미슐랭 스타 셰프의 요리부터 프리미엄 엔터테인먼트까지,
                최고 수준의 서비스를 경험하세요.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Users className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">가족 친화적</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                어린이 클럽부터 청소년 프로그램까지, 온 가족이 함께 즐길 수 있는
                다양한 시설과 프로그램을 제공합니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Globe className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">전 세계 항로</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                지중해, 카리브해, 북유럽, 아시아 등 전 세계 200개 이상의
                목적지로 여행할 수 있습니다.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Heart className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">환경 친화적</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                친환경 기술과 지속 가능한 운영으로 바다와 환경을
                보호하는 데 앞장서고 있습니다.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="text-[#003366] mb-4 flex justify-center">
                <Anchor className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-[#003366] mb-3 text-center">50년 전통</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                1970년부터 축적된 크루즈 운영 노하우와 전문성으로
                안전하고 완벽한 여행을 약속합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Vision */}
              <div className="bg-gradient-to-br from-[#003366] to-[#0055AA] p-10 rounded-2xl text-white shadow-xl">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">비전</h3>
                </div>
                <p className="text-lg leading-relaxed text-blue-50">
                  세계 최고의 크루즈 브랜드로서, 모든 고객에게
                  잊지 못할 여행 경험과 감동을 선사하여
                  인생에서 가장 소중한 추억을 만들어 드립니다.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-10 rounded-2xl text-[#003366] shadow-xl">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">미션</h3>
                </div>
                <p className="text-lg leading-relaxed">
                  최상의 서비스, 혁신적인 선박 디자인,
                  지속 가능한 운영을 통해 고객 만족을 실현하고,
                  크루즈 산업의 선두주자로서 업계를 선도합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#003366] mb-4">제공 서비스</h2>
            <div className="w-24 h-1 bg-[#FFD700] mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">크루즈 예약</h3>
              <p className="text-gray-600">
                전 세계 항로의 크루즈 상품 검색 및 실시간 예약 서비스
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">맞춤 패키지</h3>
              <p className="text-gray-600">
                항공권, 호텔, 투어가 포함된 올인원 크루즈 패키지
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">그룹 예약</h3>
              <p className="text-gray-600">
                단체 여행객을 위한 특별 할인 및 맞춤 서비스
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">VIP 서비스</h3>
              <p className="text-gray-600">
                MSC Yacht Club 및 프리미엄 고객을 위한 전담 서비스
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">여행 컨설팅</h3>
              <p className="text-gray-600">
                전문 상담사의 1:1 맞춤 여행 설계 및 상담
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003366]">
              <h3 className="text-xl font-bold text-[#003366] mb-2">사후 관리</h3>
              <p className="text-gray-600">
                예약 후 변경, 취소 및 여행 중 24시간 고객 지원
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#003366] mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-[#FFD700] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">궁금하신 사항이 있으시면 언제든지 연락주세요</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Phone */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-[#003366] mb-2">전화 문의</h3>
                <p className="text-gray-600">02-1234-5678</p>
                <p className="text-sm text-gray-500 mt-1">평일 9:00 - 18:00</p>
              </div>

              {/* Email */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-[#003366] mb-2">이메일</h3>
                <p className="text-gray-600">info@msccruises.kr</p>
                <p className="text-sm text-gray-500 mt-1">24시간 접수 가능</p>
              </div>

              {/* Location */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-[#003366] mb-2">오시는 길</h3>
                <p className="text-gray-600 text-sm">서울특별시 강남구</p>
                <p className="text-sm text-gray-500 mt-1">지하철 2호선 강남역</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-r from-[#003366] to-[#0055AA] text-white p-8 rounded-xl">
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-4">영업 시간</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold mb-2">평일 (월-금)</p>
                      <p className="text-blue-100">오전 9:00 - 오후 6:00</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">주말 및 공휴일</p>
                      <p className="text-blue-100">오전 10:00 - 오후 5:00</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-100 mt-4">
                    ※ 점심시간: 오후 12:00 - 1:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#003366] to-[#0055AA] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 크루즈 여행을 시작하세요</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            전 세계 200개 이상의 항구에서 펼쳐지는 특별한 경험이 기다립니다
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/#cruises">
              <Button size="lg" className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] text-lg px-8">
                크루즈 보러가기
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 text-lg px-8">
                패키지 검색
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-[#FFD700] font-bold text-lg mb-4">MSC Cruises</h3>
              <p className="text-sm">세계 최고의 크루즈 여행 경험</p>
            </div>
            <div>
              <h3 className="text-[#FFD700] font-bold text-lg mb-4">빠른 링크</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-[#FFD700]">홈</Link></li>
                <li><Link href="/#cruises" className="hover:text-[#FFD700]">크루즈</Link></li>
                <li><Link href="/packages" className="hover:text-[#FFD700]">패키지</Link></li>
                <li><Link href="/about" className="hover:text-[#FFD700]">회사소개</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[#FFD700] font-bold text-lg mb-4">고객 지원</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#FFD700]">FAQ</a></li>
                <li><a href="#" className="hover:text-[#FFD700]">예약 관리</a></li>
                <li><a href="#" className="hover:text-[#FFD700]">취소 정책</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[#FFD700] font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  02-1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@msccruises.kr
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-sm">
            <p>&copy; 2025 MSC Cruises. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
