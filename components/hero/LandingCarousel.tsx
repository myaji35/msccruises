'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LandingImage {
  id: string;
  url: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  order: number;
}

export default function LandingCarousel() {
  const [images, setImages] = useState<LandingImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/landing-images');
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch landing images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    setDirection('next');
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [images.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    setDirection('prev');
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [images.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || images.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [images.length, isTransitioning]);

  // 자동 전환 (5초 간격)
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, nextSlide]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">이미지 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">MSC Cruises</h2>
          <p className="text-xl md:text-2xl">세계 최고의 크루즈 여행 경험</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
      {/* 이미지 슬라이드 */}
      <div className="relative w-full h-full">
        {images.map((image, index) => {
          // 현재 이미지, 다음 이미지, 이전 이미지만 렌더링 (성능 최적화)
          const nextIndex = (currentIndex + 1) % images.length;
          const prevIndex = (currentIndex - 1 + images.length) % images.length;

          const isVisible =
            index === currentIndex ||
            index === nextIndex ||
            index === prevIndex;

          if (!isVisible) return null;

          const isActive = index === currentIndex;

          // Calculate translate value based on position
          let translateValue = 0;
          if (isActive) {
            translateValue = 0; // Active image is centered
          } else if (index === nextIndex) {
            // Next image always comes from right
            translateValue = 100;
          } else if (index === prevIndex) {
            // Previous image always comes from left
            translateValue = -100;
          }

          return (
            <div
              key={image.id}
              className="absolute inset-0 transition-transform duration-600 ease-in-out"
              style={{
                transform: `translateX(${translateValue}%)`,
                zIndex: isActive ? 10 : 5,
              }}
            >
              <Image
                src={image.url}
                alt={image.alt || 'MSC Cruises'}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
              {/* 어두운 오버레이 */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
          );
        })}
      </div>

      {/* 좌측 화살표 */}
      {images.length > 1 && (
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="이전 이미지"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}

      {/* 우측 화살표 */}
      {images.length > 1 && (
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="다음 이미지"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}

      {/* 인디케이터 점 */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 텍스트 오버레이 - 각 이미지의 제목과 설명 표시 */}
      <div className="absolute inset-0 z-15 flex items-center justify-center text-white pointer-events-none">
        {/* 그래디언트 배경 - 아래에서 위로 어두워지는 효과 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 텍스트 콘텐츠 */}
        <div className="text-center px-4 md:px-8 relative z-10">
          {images[currentIndex]?.title ? (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 drop-shadow-2xl animate-fade-in">
              {images[currentIndex].title}
            </h1>
          ) : (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl animate-fade-in">
              MSC Cruises
            </h1>
          )}

          {images[currentIndex]?.description && (
            <p className="text-lg md:text-2xl lg:text-3xl drop-shadow-lg animate-fade-in animation-delay-200 font-light max-w-2xl mx-auto">
              {images[currentIndex].description}
            </p>
          )}

          {!images[currentIndex]?.description && !images[currentIndex]?.title && (
            <p className="text-xl md:text-2xl lg:text-3xl drop-shadow-lg animate-fade-in animation-delay-200">
              세계 최고의 크루즈 여행 경험
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
