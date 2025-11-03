"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Search } from "lucide-react";

export default function CinematicHero() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Parallax effect calculations (disable on mobile or reduced motion)
  const parallaxOffset = (!isMobile && !prefersReducedMotion) ? scrollY * 0.5 : 0;
  const opacityValue = Math.max(1 - scrollY / 600, 0);

  return (
    <section className="relative h-screen min-h-[700px] md:min-h-[800px] overflow-hidden">
      {/* Video/Image Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        {/* Video for desktop, Image for mobile (performance) */}
        {!isMobile && !prefersReducedMotion ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
          >
            {/* Add your cruise video source here */}
            <source src="/videos/cruise-hero.mp4" type="video/mp4" />
          </video>
        ) : (
          // Fallback to static image for mobile and reduced-motion users
          <Image
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
            alt="Luxury cruise ship sailing on the ocean"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        {/* Animated gradient overlay (disable animation on reduced motion) */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30 ${!prefersReducedMotion ? 'animate-gradient' : ''}`} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div
          className="container mx-auto px-4 text-center"
          style={{
            opacity: opacityValue,
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {/* Main Heading with animation */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in-up">
            <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              꿈꿀 수 있는
            </span>
            <span className="block mt-2 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
              모든 여행
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 max-w-3xl mx-auto font-light animate-fade-in-up animation-delay-200">
            지중해부터 카리브해까지, 세계 최고의 크루즈 경험
          </p>

          {/* CTA Button with gradient hover effect */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#003366] hover:from-[#FFC700] hover:to-[#FF8C00] text-lg px-10 py-7 rounded-full font-bold shadow-2xl hover:shadow-[#FFD700]/50 transition-all duration-300 hover:scale-105 group"
            >
              <span className="flex items-center gap-2">
                지금 예약하기
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 text-lg px-10 py-7 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Search Card */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-20 animate-fade-in-up animation-delay-600">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Destination */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  목적지
                </label>
                <select className="w-full p-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-[#FFD700] transition-all">
                  <option>목적지 선택</option>
                  <option>🏝️ 카리브해</option>
                  <option>🏛️ 지중해</option>
                  <option>❄️ 북유럽</option>
                  <option>🏔️ 알래스카</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Calendar className="w-4 h-4" />
                  출발일
                </label>
                <input
                  type="date"
                  className="w-full p-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-[#FFD700] transition-all"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Calendar className="w-4 h-4" />
                  여행 기간
                </label>
                <select className="w-full p-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-[#FFD700] transition-all">
                  <option>기간 선택</option>
                  <option>3-7일</option>
                  <option>8-14일</option>
                  <option>15일 이상</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <label className="text-white font-semibold text-sm opacity-0 hidden md:block">
                  검색
                </label>
                <Button
                  className="w-full h-[52px] md:h-[56px] bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#003366] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-5 h-5 mr-2" />
                  검색
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 animate-bounce"
        style={{ opacity: opacityValue }}
      >
        <div className="flex flex-col items-center gap-2 text-white/70">
          <span className="text-sm font-medium">스크롤하세요</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
