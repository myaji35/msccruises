"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MediaUploader from "@/components/admin/MediaUploader";
import CruiseItineraryManager from "@/components/admin/CruiseItineraryManager";
import FlightItineraryManager from "@/components/admin/FlightItineraryManager";
import AdminNav from "@/components/admin/AdminNav";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
  isPrimary: boolean;
  alt?: string;
  caption?: string;
}

export default function EditCruisePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [cruiseId, setCruiseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [cruiseItineraries, setCruiseItineraries] = useState<any[]>([]);
  const [flightItineraries, setFlightItineraries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    shipName: "",
    description: "",
    departurePort: "",
    destinations: "",
    durationDays: "",
    startingPrice: "",
    originalPrice: "",
    currency: "USD",
    status: "draft",
    featured: false,
    departureDate: "",
    returnDate: "",
    promotionTag: "",
    bookingStatus: "일반",
    currentParticipants: "",
    maxParticipants: "",
  });

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

      const cruise = data.cruise;

      // Parse destinations from JSON string
      const destinations = cruise.destinations
        ? JSON.parse(cruise.destinations).join(", ")
        : "";

      setFormData({
        name: cruise.name || "",
        shipName: cruise.shipName || "",
        description: cruise.description || "",
        departurePort: cruise.departurePort || "",
        destinations: destinations,
        durationDays: cruise.durationDays?.toString() || "",
        startingPrice: cruise.startingPrice?.toString() || "",
        originalPrice: cruise.originalPrice?.toString() || "",
        currency: cruise.currency || "USD",
        status: cruise.status || "draft",
        featured: cruise.featured || false,
        departureDate: cruise.departureDate ? new Date(cruise.departureDate).toISOString().split('T')[0] : "",
        returnDate: cruise.returnDate ? new Date(cruise.returnDate).toISOString().split('T')[0] : "",
        promotionTag: cruise.promotionTag || "",
        bookingStatus: cruise.bookingStatus || "일반",
        currentParticipants: cruise.currentParticipants?.toString() || "",
        maxParticipants: cruise.maxParticipants?.toString() || "",
      });

      // Set media
      if (cruise.media && cruise.media.length > 0) {
        setMedia(cruise.media.map((m: any) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          type: m.type,
          mimeType: m.type === "image" ? "image/jpeg" : "video/mp4",
          size: 0,
          isPrimary: m.isPrimary,
          alt: m.alt,
          caption: m.caption,
        })));
      }

      // Load itineraries
      const itinResponse = await fetch(`/api/admin/cruises/${id}/itineraries`);
      if (itinResponse.ok) {
        const itinData = await itinResponse.json();
        setCruiseItineraries(itinData.itineraries || []);
      }

      // Load flight itineraries
      const flightResponse = await fetch(`/api/admin/cruises/${id}/flights`);
      if (flightResponse.ok) {
        const flightData = await flightResponse.json();
        setFlightItineraries(flightData.flights || []);
      }
    } catch (error) {
      console.error("Failed to fetch cruise:", error);
      alert("크루즈 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update cruise basic info
      const response = await fetch(`/api/admin/cruises/${cruiseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          destinations: formData.destinations.split(",").map((d) => d.trim()),
          durationDays: parseInt(formData.durationDays),
          startingPrice: parseFloat(formData.startingPrice),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          departureDate: formData.departureDate ? new Date(formData.departureDate).toISOString() : null,
          returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : null,
          currentParticipants: formData.currentParticipants ? parseInt(formData.currentParticipants) : 0,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          media: media,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cruise");
      }

      // 2. Update cruise itineraries
      await fetch(`/api/admin/cruises/${cruiseId}/itineraries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itineraries: cruiseItineraries }),
      });

      // 3. Update flight itineraries
      await fetch(`/api/admin/cruises/${cruiseId}/flights`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flights: flightItineraries }),
      });

      alert("크루즈 상품이 성공적으로 수정되었습니다!");
      router.push(`/admin/cruises/${cruiseId}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

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
              <Link href={`/admin/cruises/${cruiseId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">크루즈 상품 수정</h1>
            </div>
            <Button onClick={handleSubmit} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
          {/* Basic Information */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900">기본 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  크루즈 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="예: Caribbean Adventure"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  선박 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="shipName"
                  required
                  value={formData.shipName}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="예: MSC Seaside"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  상품 설명
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="크루즈에 대한 자세한 설명을 입력하세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  출발 항구 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="departurePort"
                  required
                  value={formData.departurePort}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="예: Miami, FL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  목적지 (쉼표로 구분) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="destinations"
                  required
                  value={formData.destinations}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="예: Cozumel, Jamaica, Bahamas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  여행 기간 (일) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="durationDays"
                  required
                  min="1"
                  value={formData.durationDays}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  시작 가격 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="startingPrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="1299.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  원래 가격 (할인 표시용)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="1899.00 (선택사항)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  통화
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  출발일
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  귀국일
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  프로모션 태그
                </label>
                <input
                  type="text"
                  name="promotionTag"
                  value={formData.promotionTag}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="발렌타인 특가, 얼리버드 등"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  모객 현황
                </label>
                <select
                  name="bookingStatus"
                  value={formData.bookingStatus}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="일반">일반</option>
                  <option value="출확">출확</option>
                  <option value="집중모객">집중모객</option>
                  <option value="마감">마감</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  현재 참가자 수
                </label>
                <input
                  type="number"
                  name="currentParticipants"
                  min="0"
                  value={formData.currentParticipants}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="26"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  최대 참가자 수
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  min="0"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  상태
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="draft">초안</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-700">
                  인기 상품으로 표시
                </label>
              </div>
            </div>
          </section>

          {/* Media Upload */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2 text-gray-900">이미지 및 비디오</h2>
            <p className="text-sm text-gray-600 mb-6">
              크루즈 상품의 이미지와 비디오를 업로드하세요. 첫 번째 미디어가 자동으로 대표 이미지로 설정됩니다.
            </p>
            <MediaUploader media={media} onChange={setMedia} />
          </section>

          {/* Cruise Itinerary */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <CruiseItineraryManager
              cruiseId={cruiseId}
              initialItineraries={cruiseItineraries}
              onChange={setCruiseItineraries}
            />
          </section>

          {/* Flight Itinerary */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <FlightItineraryManager
              cruiseId={cruiseId}
              initialFlights={flightItineraries}
              onChange={setFlightItineraries}
            />
          </section>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href={`/admin/cruises/${cruiseId}`}>
              <Button type="button" variant="outline" size="lg">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
