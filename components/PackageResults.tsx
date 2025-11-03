"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Ship, Plane, Clock, MapPin, Calendar, Tag, CheckCircle } from "lucide-react";
import type { CruiseFlightPackage } from "@/types/flight.types";

interface PackageResultsProps {
  packages: CruiseFlightPackage[];
  onSelectPackage: (pkg: CruiseFlightPackage) => void;
}

export function PackageResults({ packages, onSelectPackage }: PackageResultsProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-16">
        <Ship className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-gray-500">다른 조건으로 다시 검색해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#003366]">
          검색 결과 <span className="text-[#FFD700]">({packages.length}개)</span>
        </h2>
        <div className="text-sm text-gray-600">
          가격 낮은 순으로 정렬됨
        </div>
      </div>

      {packages.map((pkg) => (
        <PackageCard key={pkg.id} package={pkg} onSelect={onSelectPackage} />
      ))}
    </div>
  );
}

function PackageCard({
  package: pkg,
  onSelect,
}: {
  package: CruiseFlightPackage;
  onSelect: (pkg: CruiseFlightPackage) => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const savingsPercent = pkg.pricing.discount
    ? Math.round((pkg.pricing.discount / (pkg.pricing.cruise_price + pkg.pricing.flight_price)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left: Cruise Info with Image */}
        <div className="lg:col-span-1">
          <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
            {pkg.cruise.image_url && (
              <Image
                src={pkg.cruise.image_url}
                alt={pkg.cruise.name}
                fill
                className="object-cover"
              />
            )}
            {savingsPercent > 0 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {savingsPercent}% 할인
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#003366]">
              <Ship className="w-5 h-5" />
              <span className="font-semibold">{pkg.cruise.ship_name}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{pkg.cruise.name}</h3>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{pkg.cruise.departure_port}</div>
                <div className="text-xs text-gray-500">
                  {pkg.cruise.destinations.join(" → ")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(pkg.cruise.departure_date)} ~ {formatDate(pkg.cruise.return_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{pkg.cruise.duration_days}일 {pkg.cruise.duration_days - 1}박</span>
            </div>
          </div>
        </div>

        {/* Middle: Flight Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Outbound Flight */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">가는 항공편</span>
            </div>
            <FlightSegments flight={pkg.flights.outbound} formatTime={formatTime} />
            <div className="mt-2 text-xs text-gray-500">
              총 소요시간: {formatDuration(pkg.flights.outbound.total_duration_minutes)}
              {pkg.flights.outbound.stops > 0 && ` · ${pkg.flights.outbound.stops}회 경유`}
            </div>
          </div>

          {/* Return Flight */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-green-600 rotate-180" />
              <span className="text-sm font-semibold text-green-600">오는 항공편</span>
            </div>
            <FlightSegments flight={pkg.flights.return} formatTime={formatTime} />
            <div className="mt-2 text-xs text-gray-500">
              총 소요시간: {formatDuration(pkg.flights.return.total_duration_minutes)}
              {pkg.flights.return.stops > 0 && ` · ${pkg.flights.return.stops}회 경유`}
            </div>
          </div>

          {/* Package Benefits */}
          {pkg.package_benefits && pkg.package_benefits.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-amber-800 mb-2">패키지 혜택</div>
              <div className="space-y-1">
                {pkg.package_benefits.slice(0, 2).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-amber-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pricing */}
        <div className="lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">크루즈 요금</span>
                <span className="font-medium">{formatPrice(pkg.pricing.cruise_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">항공권 요금</span>
                <span className="font-medium">{formatPrice(pkg.pricing.flight_price)}</span>
              </div>
              {pkg.pricing.discount && pkg.pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>패키지 할인</span>
                  <span>-{formatPrice(pkg.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between items-end">
                  <span className="text-gray-700 font-semibold">총 결제금액</span>
                  <div className="text-right">
                    {pkg.pricing.discount && pkg.pricing.discount > 0 && (
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(pkg.pricing.cruise_price + pkg.pricing.flight_price)}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-[#003366]">
                      {formatPrice(pkg.pricing.total_price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              * 1인 기준 요금입니다
            </div>
          </div>

          <Button
            onClick={() => onSelect(pkg)}
            size="lg"
            className="w-full bg-[#FFD700] hover:bg-[#E5C200] text-[#003366] font-bold text-lg mt-4"
          >
            <Tag className="w-5 h-5 mr-2" />
            패키지 예약하기
          </Button>
        </div>
      </div>
    </div>
  );
}

function FlightSegments({
  flight,
  formatTime,
}: {
  flight: any;
  formatTime: (iso: string) => string;
}) {
  return (
    <div className="space-y-2">
      {flight.segments.map((segment: any, idx: number) => (
        <div key={idx} className="text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{segment.departure_airport.code}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold">{segment.arrival_airport.code}</span>
            </div>
            <div className="text-xs text-gray-500">{segment.airline}</div>
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(segment.departure_time)} - {formatTime(segment.arrival_time)}
          </div>
          {idx < flight.segments.length - 1 && (
            <div className="text-xs text-orange-600 mt-1">↓ 경유</div>
          )}
        </div>
      ))}
    </div>
  );
}
