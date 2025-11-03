"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MediaUploader from "@/components/admin/MediaUploader";
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

export default function NewCruisePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    shipName: "",
    description: "",
    departurePort: "",
    destinations: "",
    durationDays: "",
    startingPrice: "",
    currency: "USD",
    status: "draft",
    featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/cruises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          destinations: formData.destinations.split(",").map((d) => d.trim()),
          media: media,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create cruise");
      }

      const data = await response.json();
      alert("크루즈 상품이 성공적으로 등록되었습니다!");
      router.push(`/admin/cruises/${data.cruise.id}`);
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
                  뒤로
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">새 크루즈 상품 등록</h1>
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/cruises">
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
