"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Ship,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Plane,
  Clock,
  ArrowRight
} from "lucide-react";

interface Cruise {
  id: string;
  name: string;
  shipName: string;
  description: string;
  departurePort: string;
  destinations: string[];
  durationDays: number;
  startingPrice: number;
  currency: string;
  media: any[];
  cruiseItineraries: any[];
  flightItineraries: any[];
}

export default function CruiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [cruiseId, setCruiseId] = useState<string>("");
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolvedParams) => {
      setCruiseId(resolvedParams.id);
      fetchCruise(resolvedParams.id);
    });
  }, []);

  const fetchCruise = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/cruises/${id}`);
      if (!response.ok) throw new Error("Failed to fetch cruise");
      const data = await response.json();

      // Parse destinations
      const cruise = data.cruise;
      cruise.destinations = cruise.destinations
        ? JSON.parse(cruise.destinations)
        : [];

      setCruise(cruise);

      // Load itineraries
      const [itinRes, flightRes] = await Promise.all([
        fetch(`/api/admin/cruises/${id}/itineraries`),
        fetch(`/api/admin/cruises/${id}/flights`),
      ]);

      if (itinRes.ok) {
        const itinData = await itinRes.json();
        cruise.cruiseItineraries = itinData.itineraries || [];
      }

      if (flightRes.ok) {
        const flightData = await flightRes.json();
        cruise.flightItineraries = flightData.flights || [];
      }

      setCruise({ ...cruise });
    } catch (error) {
      console.error("Failed to fetch cruise:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!cruise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">크루즈를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const primaryImage = cruise.media.find((m) => m.isPrimary) || cruise.media[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={180}
              height={54}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      {primaryImage && (
        <div className="relative h-96 bg-gray-900">
          <Image
            src={primaryImage.url}
            alt={cruise.name}
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold text-white mb-2">
                {cruise.name}
              </h1>
              <p className="text-xl text-gray-200">{cruise.shipName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">크루즈 개요</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">기간</p>
                    <p className="font-semibold">{cruise.durationDays}일</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">출발</p>
                    <p className="font-semibold">{cruise.departurePort}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ship className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">선박</p>
                    <p className="font-semibold">{cruise.shipName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">목적지</p>
                    <p className="font-semibold">{cruise.destinations.length}곳</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{cruise.description}</p>
            </section>

            {/* Itinerary */}
            {cruise.cruiseItineraries && cruise.cruiseItineraries.length > 0 && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">항해 일정</h2>
                <div className="space-y-4">
                  {cruise.cruiseItineraries
                    .sort((a, b) => a.day - b.day)
                    .map((itinerary, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {itinerary.day}
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">
                              {itinerary.port}
                            </h3>
                            {itinerary.portCode && (
                              <span className="text-sm text-gray-500">
                                ({itinerary.portCode})
                              </span>
                            )}
                          </div>
                          {itinerary.country && (
                            <p className="text-sm text-gray-600 mb-2">
                              {itinerary.country}
                            </p>
                          )}
                          {(itinerary.arrival || itinerary.departure) && (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {itinerary.arrival && (
                                <span>도착: {itinerary.arrival}</span>
                              )}
                              {itinerary.departure && (
                                <span>출발: {itinerary.departure}</span>
                              )}
                            </div>
                          )}
                          {itinerary.description && (
                            <p className="text-sm text-gray-700 mt-2">
                              {itinerary.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Flights */}
            {cruise.flightItineraries && cruise.flightItineraries.length > 0 && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">항공편 정보</h2>
                <div className="space-y-4">
                  {cruise.flightItineraries.map((flight, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Plane className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">
                            {flight.segmentType === "outbound"
                              ? "가는편"
                              : "오는편"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {flight.airline} {flight.flightNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">출발</p>
                          <p className="font-semibold">{flight.departureCode}</p>
                          <p className="text-sm text-gray-600">
                            {flight.departureTime}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">도착</p>
                          <p className="font-semibold">{flight.arrivalCode}</p>
                          <p className="text-sm text-gray-600">
                            {flight.arrivalTime}
                          </p>
                        </div>
                        {flight.duration && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {Math.floor(flight.duration / 60)}시간{" "}
                              {flight.duration % 60}분
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {cruise.media.length > 1 && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cruise.media.map((media, index) => (
                    <div
                      key={index}
                      className="relative h-48 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={media.url}
                        alt={media.alt || `Gallery ${index + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-8">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">시작 가격</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600">
                    ${cruise.startingPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/인</span>
                </div>
              </div>

              <Link href={`/booking/${cruise.id}`}>
                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
                  지금 예약하기
                </button>
              </Link>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{cruise.durationDays}일 {cruise.durationDays - 1}박</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{cruise.departurePort} 출발</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  <span>{cruise.shipName}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">
                  * 가격은 1인 기준이며, 세금 및 수수료가 별도로 부과될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
