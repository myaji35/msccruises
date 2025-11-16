"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AdminNav from "@/components/admin/AdminNav";
import { ArrowLeft, Edit, Trash2, Star, MapPin, Calendar, DollarSign, Ship } from "lucide-react";

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
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  media: Array<{
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
    filename: string;
    alt?: string;
    caption?: string;
  }>;
  itineraries: Array<{
    id: string;
    day: number;
    port: string;
    arrival?: string;
    departure?: string;
    description?: string;
  }>;
}

export default function CruiseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [loading, setLoading] = useState(true);
  const [cruiseId, setCruiseId] = useState<string>("");

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

      // Transform API response to match client interface
      const cruise = data.cruise;
      const transformedCruise = {
        ...cruise,
        itineraries: cruise.cruiseItineraries || [],
        flights: cruise.flightItineraries || []
      };
      setCruise(transformedCruise);
    } catch (error) {
      console.error("Failed to fetch cruise:", error);
      alert("크루즈 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCruise = async () => {
    if (!confirm("정말 이 크루즈 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/cruises/${cruiseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      alert("삭제되었습니다.");
      router.push("/admin/cruises");
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
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
        <div className="text-center">
          <p className="text-gray-600 mb-4">크루즈를 찾을 수 없습니다.</p>
          <Link href="/admin/cruises">
            <Button>목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryMedia = cruise.media.find((m) => m.isPrimary) || cruise.media[0];
  const destinations = cruise.destinations ? JSON.parse(cruise.destinations) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          {/* Navigation Bar */}
          <AdminNav />

          {/* Page Title */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/cruises">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  목록으로
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{cruise.name}</h1>
                <p className="text-gray-600">{cruise.shipName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/cruises/${cruise.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </Button>
              </Link>
              <Button variant="destructive" onClick={deleteCruise}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Status Badges */}
          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                cruise.status === "active"
                  ? "bg-green-500 text-white"
                  : cruise.status === "draft"
                  ? "bg-gray-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {cruise.status === "active" ? "활성" : cruise.status === "draft" ? "초안" : "비활성"}
            </span>
            {cruise.featured && (
              <span className="bg-[#FFD700] text-[#003366] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                인기 상품
              </span>
            )}
          </div>

          {/* Main Image */}
          {primaryMedia && (
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-lg">
              {primaryMedia.type === "image" ? (
                <Image
                  src={primaryMedia.url}
                  alt={primaryMedia.alt || cruise.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <video src={primaryMedia.url} className="w-full h-full object-cover" controls />
              )}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Ship className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">선박 이름</p>
                  <p className="text-lg font-semibold text-gray-900">{cruise.shipName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">출발 항구</p>
                  <p className="text-lg font-semibold text-gray-900">{cruise.departurePort}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">여행 기간</p>
                  <p className="text-lg font-semibold text-gray-900">{cruise.durationDays}일</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">시작 가격</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {cruise.currency === "USD" ? "$" : cruise.currency === "KRW" ? "₩" : "€"}
                    {cruise.startingPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {destinations.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">목적지</p>
                <div className="flex flex-wrap gap-2">
                  {destinations.map((dest: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {dest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cruise.description && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">상품 설명</p>
                <p className="text-gray-800 leading-relaxed">{cruise.description}</p>
              </div>
            )}
          </div>

          {/* Media Gallery */}
          {cruise.media.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                미디어 갤러리 ({cruise.media.length}개)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cruise.media.map((media) => (
                  <div
                    key={media.id}
                    className="relative aspect-video rounded-lg overflow-hidden border-2"
                    style={{
                      borderColor: media.isPrimary ? "#FFD700" : "#e5e7eb",
                    }}
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.url}
                        alt={media.alt || "Cruise image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" />
                    )}
                    {media.isPrimary && (
                      <div className="absolute top-2 right-2 bg-[#FFD700] text-[#003366] px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        대표
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itineraries */}
          {cruise.itineraries.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">여행 일정</h2>
              <div className="space-y-4">
                {cruise.itineraries.map((itinerary) => (
                  <div key={itinerary.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Day {itinerary.day}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {itinerary.port}
                      </span>
                    </div>
                    {(itinerary.arrival || itinerary.departure) && (
                      <div className="text-sm text-gray-600">
                        {itinerary.arrival && <span>도착: {itinerary.arrival}</span>}
                        {itinerary.arrival && itinerary.departure && " | "}
                        {itinerary.departure && <span>출발: {itinerary.departure}</span>}
                      </div>
                    )}
                    {itinerary.description && (
                      <p className="text-gray-700 mt-2">{itinerary.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">생성일:</span>{" "}
                {new Date(cruise.createdAt).toLocaleString("ko-KR")}
              </div>
              <div>
                <span className="font-semibold">수정일:</span>{" "}
                {new Date(cruise.updatedAt).toLocaleString("ko-KR")}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
