"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ship, Calendar, Users, Star, Plane, User, Settings, DollarSign, ChevronDown, ChevronUp, TrendingUp, TrendingDown, LogOut, BookOpen, Package, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CinematicHero from "@/components/hero/CinematicHero";
import { useSession, signOut } from "next-auth/react";

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

interface ExchangeRates {
  USD: number;
  EUR: number;
  JPY: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [featuredCruises, setFeaturedCruises] = useState<Cruise[]>([]);
  const [loadingCruises, setLoadingCruises] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isRatesExpanded, setIsRatesExpanded] = useState(false);

  useEffect(() => {
    fetchFeaturedCruises();
    fetchExchangeRate();
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

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
      const data = await response.json();

      const usdRate = 1 / data.rates.USD;
      const eurRate = 1 / data.rates.EUR;
      const jpyRate = 1 / data.rates.JPY;

      setExchangeRates({
        USD: Math.round(usdRate * 100) / 100,
        EUR: Math.round(eurRate * 100) / 100,
        JPY: Math.round(jpyRate * 100) / 100,
      });
    } catch (error) {
      console.error('환율 정보를 가져오는데 실패했습니다:', error);
      setExchangeRates({
        USD: 1320.50,
        EUR: 1445.20,
        JPY: 9.15,
      });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
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
              <li><a href="#cruises" className="hover:text-[#FFD700] transition">크루즈</a></li>
              <li><Link href="/packages" className="hover:text-[#FFD700] transition flex items-center gap-1">
                <Plane className="w-4 h-4" />
                패키지 검색
              </Link></li>
              <li><a href="#schedule" className="hover:text-[#FFD700] transition">출발일정</a></li>
              <li><a href="#destinations" className="hover:text-[#FFD700] transition">목적지</a></li>
              <li><Link href="/about" className="hover:text-[#FFD700] transition">회사소개</Link></li>
              <li><Link href="/admin/cruises" className="hover:text-[#FFD700] transition flex items-center gap-1">
                <Settings className="w-4 h-4" />
                관리자
              </Link></li>
            </ul>
            {exchangeRates && (
              <div className="relative">
                {/* Compact Display */}
                <button
                  onClick={() => setIsRatesExpanded(!isRatesExpanded)}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-white text-sm font-semibold">
                    USD ₩{exchangeRates.USD.toLocaleString()}
                  </span>
                  {isRatesExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70" />
                  )}
                </button>

                {/* Expanded Panel */}
                {isRatesExpanded && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 z-50 animate-in slide-in-from-top">
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <h3 className="font-bold text-[#003366] text-sm">실시간 환율</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} 업데이트
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* USD */}
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500 text-white font-bold px-2 py-1 rounded text-xs">
                            USD
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">미국 달러</div>
                            <div className="font-bold text-sm text-[#003366]">
                              ₩{exchangeRates.USD.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>

                      {/* EUR */}
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-500 text-white font-bold px-2 py-1 rounded text-xs">
                            EUR
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">유로</div>
                            <div className="font-bold text-sm text-[#003366]">
                              ₩{exchangeRates.EUR.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>

                      {/* JPY */}
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-red-500 text-white font-bold px-2 py-1 rounded text-xs">
                            JPY
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">일본 엔화 (100엔)</div>
                            <div className="font-bold text-sm text-[#003366]">
                              ₩{(exchangeRates.JPY * 100).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        💡 크루즈 요금은 USD 기준입니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login/Logout Button */}
            {status === "loading" ? (
              <Button variant="secondary" size="sm" disabled className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              </Button>
            ) : session ? (
              <div className="flex items-center gap-3">
                {/* Admin Dropdown Menu */}
                {session.user?.userType === "admin" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden md:flex items-center gap-2 text-white hover:text-[#FFD700] transition-colors cursor-pointer">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-semibold">{session.user?.name || session.user?.email}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white" align="end">
                      <DropdownMenuLabel className="text-[#003366]">
                        관리자 메뉴
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/cruises" className="flex items-center gap-2 cursor-pointer">
                          <Package className="w-4 h-4" />
                          크루즈 관리
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/sns/accounts" className="flex items-center gap-2 cursor-pointer">
                          <Share2 className="w-4 h-4" />
                          SNS 계정 관리
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          설정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 cursor-pointer text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2 text-white">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-semibold">{session.user?.name || session.user?.email}</span>
                  </div>
                )}
                {/* Show '내 예약' button only for non-admin users */}
                {session.user?.userType !== "admin" && (
                  <>
                    <Link href="/dashboard/my-bookings">
                      <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        내 예약
                      </Button>
                    </Link>
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  로그인
                </Button>
              </Link>
            )}
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

      {/* Destinations Section */}
      <section id="destinations" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#003366] mb-4">인기 목적지</h2>
            <p className="text-gray-600 text-lg">세계에서 가장 아름다운 곳으로 떠나는 여행</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Caribbean */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-cyan-400 to-blue-600 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🌴</div>
                  <h3 className="text-2xl font-bold mb-2">카리브해</h3>
                  <p className="text-sm opacity-90">에메랄드빛 바다와 백사장의 천국</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">자메이카</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">바하마</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">멕시코</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mediterranean */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-indigo-600 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🏖️</div>
                  <h3 className="text-2xl font-bold mb-2">지중해</h3>
                  <p className="text-sm opacity-90">역사와 문화가 살아있는 유럽의 보석</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">이탈리아</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">그리스</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">스페인</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asia */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-red-600 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🗾</div>
                  <h3 className="text-2xl font-bold mb-2">아시아</h3>
                  <p className="text-sm opacity-90">동양의 신비와 현대가 어우러진 대륙</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">일본</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">싱가포르</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">태국</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Northern Europe */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-teal-400 to-cyan-700 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🌊</div>
                  <h3 className="text-2xl font-bold mb-2">북유럽</h3>
                  <p className="text-sm opacity-90">피오르드와 오로라의 신비로운 세계</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">노르웨이</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">아이슬란드</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">덴마크</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alaska */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-400 to-blue-700 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🏔️</div>
                  <h3 className="text-2xl font-bold mb-2">알래스카</h3>
                  <p className="text-sm opacity-90">빙하와 야생의 대자연</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">주노</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">케치칸</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">스캐그웨이</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dubai & Emirates */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-400 to-orange-600 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-4xl mb-2">🕌</div>
                  <h3 className="text-2xl font-bold mb-2">중동</h3>
                  <p className="text-sm opacity-90">사막과 초고층 빌딩의 미래도시</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">두바이</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">아부다비</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">오만</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">전 세계 200개 이상의 항구에서 펼쳐지는 특별한 경험</p>
            <Button size="lg" className="bg-[#003366] hover:bg-[#002244] text-white">
              모든 목적지 보기
            </Button>
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
