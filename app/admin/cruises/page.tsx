"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Star } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface Cruise {
  id: string;
  name: string;
  shipName: string;
  departurePort: string;
  durationDays: number;
  startingPrice: number;
  currency: string;
  status: string;
  featured: boolean;
  media: Array<{
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }>;
}

export default function CruiseListPage() {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCruises();
  }, []);

  const fetchCruises = async () => {
    try {
      const response = await fetch("/api/admin/cruises");
      const data = await response.json();
      setCruises(data.cruises || []);
    } catch (error) {
      console.error("Failed to fetch cruises:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCruise = async (id: string) => {
    if (!confirm("정말 이 크루즈 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/cruises/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      alert("삭제되었습니다.");
      fetchCruises();
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          {/* Navigation Bar */}
          <AdminNav />

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">크루즈 상품 관리</h1>
              <p className="text-gray-600 mt-1">등록된 크루즈 상품을 관리하세요</p>
            </div>
            <Link href="/admin/cruises/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                새 상품 등록
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : cruises.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-600 mb-4">등록된 크루즈 상품이 없습니다.</p>
            <Link href="/admin/cruises/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                첫 상품 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cruises.map((cruise) => {
              const primaryMedia = cruise.media.find((m) => m.isPrimary) || cruise.media[0];

              return (
                <div
                  key={cruise.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {primaryMedia ? (
                      primaryMedia.type === "image" ? (
                        <Image
                          src={primaryMedia.url}
                          alt={cruise.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={primaryMedia.url}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {cruise.featured && (
                        <span className="bg-[#FFD700] text-[#003366] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          인기
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          cruise.status === "active"
                            ? "bg-green-500 text-white"
                            : cruise.status === "draft"
                            ? "bg-gray-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {cruise.status === "active"
                          ? "활성"
                          : cruise.status === "draft"
                          ? "초안"
                          : "비활성"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {cruise.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {cruise.shipName} • {cruise.durationDays}일
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {cruise.currency === "USD" ? "$" : cruise.currency === "KRW" ? "₩" : "€"}
                          {cruise.startingPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">~</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/admin/cruises/${cruise.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          보기
                        </Button>
                      </Link>
                      <Link href={`/admin/cruises/${cruise.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCruise(cruise.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
