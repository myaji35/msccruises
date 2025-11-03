"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ship, Calendar, Users, Star, Plane, User, Settings } from "lucide-react";
import CinematicHero from "@/components/hero/CinematicHero";

interface Cruise {
  id: string;
  name: string;
  shipName: string;
  description: string;
  departurePort: string;
  destinations: string;
  durationDays: number;
  startingPrice: number;
  currency: string;
  featured: boolean;
  media: Array<{
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }>;
}

export default function Home() {
  const [featuredCruises, setFeaturedCruises] = useState<Cruise[]>([]);
  const [loadingCruises, setLoadingCruises] = useState(true);

  useEffect(() => {
    fetchFeaturedCruises();
  }, []);

  const fetchFeaturedCruises = async () => {
    try {
      const response = await fetch("/api/cruises/featured");
      const data = await response.json();
      setFeaturedCruises(data.cruises || []);
    } catch (error) {
      console.error("Failed to fetch featured cruises:", error);
    } finally {
      setLoadingCruises(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-bold text-[#FFD700] cursor-pointer hover:text-[#FFC700] transition">
              🚢 MSC CRUISES
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <ul className="hidden md:flex gap-6">
              <li><a href="#cruises" className="hover:text-[#FFD700] transition">크루즈</a></li>
              <li><Link href="/packages" className="hover:text-[#FFD700] transition flex items-center gap-1">
                <Plane className="w-4 h-4" />
                패키지 검색
              </Link></li>
              <li><a href="#schedule" className="hover:text-[#FFD700] transition">출발일정</a></li>
              <li><a href="#destinations" className="hover:text-[#FFD700] transition">목적지</a></li>
              <li><Link href="/admin/cruises" className="hover:text-[#FFD700] transition flex items-center gap-1">
                <Settings className="w-4 h-4" />
                관리자
              </Link></li>
            </ul>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                로그인
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Cinematic Hero Section with Video Parallax */}
      <CinematicHero />

      {/* Departure Schedule Section (작은별여행사 스타일) */}
      <section id="schedule" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#003366] mb-12">
            ⭐ 출발 일정 및 요금
          </h2>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#003366] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">출발일</th>
                    <th className="px-6 py-4 text-left">귀국일</th>
                    <th className="px-6 py-4 text-left">★크루즈선★</th>
                    <th className="px-6 py-4 text-left">★최소참가비★</th>
                    <th className="px-6 py-4 text-left">모객현황</th>
                    <th className="px-6 py-4 text-center">선택</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#003366]">2025년 12월 15일(월)</td>
                    <td className="px-6 py-4">2025년 12월 22일(월)</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-[#003366]" />
                        <span className="font-semibold">MSC Seaside</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-[#FFD700]">$1,299</span>
                      <span className="text-sm text-gray-500 block">1인 기준</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        출확(現26명)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button className="bg-[#003366] hover:bg-[#004080]">선택</Button>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#003366]">2026년 01월 10일(토)</td>
                    <td className="px-6 py-4">2026년 01월 17일(토)</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-[#003366]" />
                        <span className="font-semibold">MSC Seaside</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-[#FFD700]">$1,399</span>
                      <span className="text-sm text-gray-500 block">1인 기준</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        現12명
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button className="bg-[#003366] hover:bg-[#004080]">선택</Button>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 bg-yellow-50">
                    <td className="px-6 py-4 font-semibold text-[#003366]">
                      2026년 02월 14일(토)
                      <span className="ml-2 inline-block bg-red-500 text-white px-2 py-1 text-xs rounded">발렌타인 특가</span>
                    </td>
                    <td className="px-6 py-4">2026년 02월 21일(토)</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-[#003366]" />
                        <span className="font-semibold">MSC Meraviglia</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm text-gray-400 line-through block">$1,899</span>
                        <span className="text-2xl font-bold text-red-600">$1,699</span>
                        <span className="text-sm text-gray-500 block">1인 기준</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                        집중모객
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700]">선택</Button>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#003366]">2026년 03월 20일(금)</td>
                    <td className="px-6 py-4">2026년 03월 27일(금)</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ship className="w-5 h-5 text-[#003366]" />
                        <span className="font-semibold">MSC Divina</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-[#FFD700]">$2,499</span>
                      <span className="text-sm text-gray-500 block">1인 기준</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        마감(現30명)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button disabled className="bg-gray-300 cursor-not-allowed">마감</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>※ 최소참가비는 내부 캐빈 2인 1실 기준입니다.</p>
            <p>※ 출발 확정(출확)은 최소 인원이 모집된 상태입니다.</p>
          </div>
        </div>
      </section>

      {/* Featured Cruises */}
      <section id="cruises" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#003366] mb-12">
            ⭐ 인기 크루즈
          </h2>

          {loadingCruises ? (
            <div className="text-center py-12">
              <p className="text-gray-600">크루즈를 불러오는 중...</p>
            </div>
          ) : featuredCruises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">등록된 인기 크루즈가 없습니다.</p>
              <p className="text-sm text-gray-500">관리자 페이지에서 크루즈를 등록하고 인기 상품으로 지정해주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCruises.map((cruise) => {
                const primaryMedia = cruise.media.find((m) => m.isPrimary) || cruise.media[0];
                const destinations = cruise.destinations ? JSON.parse(cruise.destinations) : [];
                const destinationsText = destinations.slice(0, 3).join(", ");

                return (
                  <div
                    key={cruise.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gray-200">
                      {primaryMedia ? (
                        primaryMedia.type === "image" ? (
                          <Image
                            src={primaryMedia.url}
                            alt={cruise.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={primaryMedia.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Ship className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {/* Featured Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-[#FFD700] text-[#003366] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          인기
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#003366] mb-2 line-clamp-2">
                        {cruise.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Ship className="w-4 h-4" />
                        <span className="text-sm">{cruise.shipName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <span className="text-sm">{cruise.departurePort} 출발</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-1">{destinationsText}</p>
                      <p className="text-gray-400 text-xs mb-4">{cruise.durationDays}일</p>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <span className="text-3xl font-bold text-[#FFD700]">
                            {cruise.currency === "USD" ? "$" : cruise.currency === "KRW" ? "₩" : "€"}
                            {cruise.startingPrice.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 block">1인 기준</span>
                        </div>
                        <Link href={`/cruises/${cruise.id}`}>
                          <Button className="bg-[#003366] hover:bg-[#004080]">
                            상세보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          {featuredCruises.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/cruises">
                <Button size="lg" variant="outline" className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white">
                  모든 크루즈 보기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#003366] mb-12">
            MSC Cruises를 선택하는 이유
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Ship className="w-12 h-12" />, title: "최신 선박", desc: "혁신적인 디자인과 최첨단 시설" },
              { icon: <Star className="w-12 h-12" />, title: "월드클래스 다이닝", desc: "미슐랭 스타 셰프의 글로벌 요리" },
              { icon: <Calendar className="w-12 h-12" />, title: "엔터테인먼트", desc: "브로드웨이 수준의 쇼" },
              { icon: <Users className="w-12 h-12" />, title: "가족 친화적", desc: "모두가 즐길 수 있는 다양한 활동" },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-[#003366] mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#003366] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
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
                <li><a href="#cruises" className="hover:text-[#FFD700]">크루즈</a></li>
                <li><a href="#schedule" className="hover:text-[#FFD700]">출발일정</a></li>
                <li><a href="#deals" className="hover:text-[#FFD700]">특가</a></li>
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
              <h3 className="text-[#FFD700] font-bold text-lg mb-4">My MSC</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#FFD700]">로그인</a></li>
                <li><a href="#" className="hover:text-[#FFD700]">회원가입</a></li>
                <li><a href="#" className="hover:text-[#FFD700]">Voyagers Club</a></li>
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
