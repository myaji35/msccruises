"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Tag,
  RefreshCcw,
  Calendar,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import CreatePromotionModal from "@/components/admin/CreatePromotionModal";

interface Promotion {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  currency?: string | null;
  description?: string | null;
  validFrom: string;
  validUntil: string;
  maxUses?: number | null;
  currentUses: number;
  maxUsesPerUser?: number | null;
  minOrderAmount?: number | null;
  applicableCruises?: string[] | null;
  applicableCategories?: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PricingRule {
  id: string;
  name: string;
  description?: string | null;
  ruleType: string;
  isActive: boolean;
  priority: number;
  inventoryThresholdLow?: number | null;
  inventoryThresholdMedium?: number | null;
  inventoryThresholdHigh?: number | null;
  priceMultiplierLow?: number | null;
  priceMultiplierMedium?: number | null;
  priceMultiplierHigh?: number | null;
  demandMultiplierHigh?: number | null;
  demandMultiplierMedium?: number | null;
  demandMultiplierLow?: number | null;
  groupDiscount3to5?: number | null;
  groupDiscount6to10?: number | null;
  groupDiscount11plus?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<"promotions" | "rules" | "history">("promotions");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePromoModal, setShowCreatePromoModal] = useState(false);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);

  // Fetch promotions
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions);
      } else {
        toast.error("Failed to load promotions");
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Error loading promotions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pricing rules
  const fetchPricingRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing-rules");
      const data = await res.json();
      setPricingRules(data.rules || []);
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
      toast.error("Error loading pricing rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "promotions") {
      fetchPromotions();
    } else if (activeTab === "rules") {
      fetchPricingRules();
    }
  }, [activeTab]);

  // Delete promotion
  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Promotion deleted successfully");
        fetchPromotions();
      } else {
        toast.error(data.error || "Failed to delete promotion");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error deleting promotion");
    }
  };

  // Toggle promotion active status
  const handleTogglePromotionStatus = async (promotion: Promotion) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promotion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promotion.isActive }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Promotion ${data.promotion.isActive ? "activated" : "deactivated"}`);
        fetchPromotions();
      } else {
        toast.error(data.error || "Failed to update promotion");
      }
    } catch (error) {
      console.error("Error toggling promotion:", error);
      toast.error("Error updating promotion");
    }
  };

  // Filter promotions by search query
  const filteredPromotions = promotions.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">가격 관리 대시보드</h1>
          <p className="text-gray-600">프로모션 코드, 가격 규칙 및 이력을 관리합니다</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">활성 프로모션</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.filter((p) => p.isActive && !isExpired(p.validUntil)).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">가격 규칙</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pricingRules.filter((r) => r.isActive).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 사용 횟수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.reduce((sum, p) => sum + p.currentUses, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">만료 예정</p>
                <p className="text-2xl font-bold text-gray-900">
                  {promotions.filter((p) => {
                    const daysUntilExpiry = Math.floor(
                      (new Date(p.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("promotions")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "promotions"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                프로모션 코드
              </div>
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "rules"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                가격 규칙
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                가격 이력
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "promotions" && (
              <div>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="프로모션 코드 검색..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      필터
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchPromotions}>
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      새로고침
                    </Button>
                    <Button size="sm" onClick={() => setShowCreatePromoModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      새 프로모션
                    </Button>
                  </div>
                </div>

                {/* Promotions Table */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-2">로딩 중...</p>
                  </div>
                ) : filteredPromotions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">프로모션 코드가 없습니다</p>
                    <Button size="sm" onClick={() => setShowCreatePromoModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      첫 프로모션 생성하기
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            코드
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            할인
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            유효기간
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            사용 현황
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            상태
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            액션
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredPromotions.map((promo) => (
                          <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-semibold text-gray-900">{promo.code}</p>
                                {promo.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-medium text-blue-600">
                                {promo.type === "percentage"
                                  ? `${promo.value}%`
                                  : `${promo.currency || "USD"} ${promo.value.toFixed(2)}`}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                <p className="text-gray-900">{formatDate(promo.validFrom)}</p>
                                <p className="text-gray-500">~ {formatDate(promo.validUntil)}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                <p className="text-gray-900">
                                  {promo.currentUses}/{promo.maxUses || "∞"}
                                </p>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                      width: promo.maxUses
                                        ? `${Math.min((promo.currentUses / promo.maxUses) * 100, 100)}%`
                                        : "0%",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {isExpired(promo.validUntil) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  만료됨
                                </span>
                              ) : promo.isActive ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="w-3 h-3 mr-1" />
                                  활성
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <X className="w-3 h-3 mr-1" />
                                  비활성
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePromotionStatus(promo)}
                                  disabled={isExpired(promo.validUntil)}
                                >
                                  {promo.isActive ? "비활성화" : "활성화"}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromotion(promo.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "rules" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">가격 책정 규칙을 관리합니다</p>
                  <Button size="sm" onClick={() => setShowCreateRuleModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 규칙
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-2">로딩 중...</p>
                  </div>
                ) : pricingRules.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">가격 규칙이 없습니다</p>
                    <Button size="sm" onClick={() => setShowCreateRuleModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      첫 규칙 생성하기
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingRules.map((rule) => (
                      <Card key={rule.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                            {rule.description && (
                              <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rule.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.isActive ? "활성" : "비활성"}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">유형:</span> {rule.ruleType}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">우선순위:</span> {rule.priority}
                          </p>
                          {rule.ruleType === "inventory" && rule.priceMultiplierLow && (
                            <p className="text-gray-600">
                              <span className="font-medium">재고 낮음 가격 조정:</span> +
                              {((rule.priceMultiplierLow - 1) * 100).toFixed(0)}%
                            </p>
                          )}
                          {rule.ruleType === "demand" && rule.demandMultiplierHigh && (
                            <p className="text-gray-600">
                              <span className="font-medium">높은 수요 가격 조정:</span> +
                              {((rule.demandMultiplierHigh - 1) * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            수정
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">가격 이력 조회 기능은 개발 중입니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals will be added in next iteration */}
      <CreatePromotionModal
        isOpen={showCreatePromoModal}
        onClose={() => setShowCreatePromoModal(false)}
        onSuccess={fetchPromotions}
      />

      {showCreateRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 가격 규칙 생성</h3>
            <p className="text-gray-600 mb-4">가격 규칙 생성 폼은 다음 단계에서 구현됩니다.</p>
            <Button onClick={() => setShowCreateRuleModal(false)}>닫기</Button>
          </div>
        </div>
      )}
    </div>
  );
}
