"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePromotionModal({ isOpen, onClose, onSuccess }: CreatePromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    currency: "USD",
    description: "",
    validFrom: "",
    validUntil: "",
    maxUses: "",
    maxUsesPerUser: "1",
    minOrderAmount: "",
    applicableCruises: "",
    applicableCategories: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const data: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        description: formData.description || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        maxUsesPerUser: parseInt(formData.maxUsesPerUser),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        isActive: true,
      };

      if (formData.type === "fixed") {
        data.currency = formData.currency;
      }

      if (formData.applicableCruises) {
        data.applicableCruises = formData.applicableCruises.split(",").map((s) => s.trim());
      }

      if (formData.applicableCategories) {
        data.applicableCategories = formData.applicableCategories.split(",").map((s) => s.trim());
      }

      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("프로모션이 성공적으로 생성되었습니다!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          code: "",
          type: "percentage",
          value: "",
          currency: "USD",
          description: "",
          validFrom: "",
          validUntil: "",
          maxUses: "",
          maxUsesPerUser: "1",
          minOrderAmount: "",
          applicableCruises: "",
          applicableCategories: "",
        });
      } else {
        toast.error(result.error || "프로모션 생성에 실패했습니다");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">새 프로모션 생성</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <Label htmlFor="code">
              프로모션 코드 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              type="text"
              required
              placeholder="예: SUMMER2025"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">영문 대문자와 숫자만 사용 가능</p>
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">
                할인 유형 <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "percentage" | "fixed" })
                }
                className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">퍼센트 (%)</option>
                <option value="fixed">고정 금액</option>
              </select>
            </div>
            <div>
              <Label htmlFor="value">
                할인 값 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                required
                step="0.01"
                min="0"
                placeholder={formData.type === "percentage" ? "예: 20" : "예: 100"}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Currency (if fixed) */}
          {formData.type === "fixed" && (
            <div>
              <Label htmlFor="currency">통화</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="KRW">KRW</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">설명</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="프로모션 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Valid Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">
                시작일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="validFrom"
                type="datetime-local"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="validUntil">
                종료일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="validUntil"
                type="datetime-local"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUses">최대 사용 횟수</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                placeholder="무제한"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">비워두면 무제한</p>
            </div>
            <div>
              <Label htmlFor="maxUsesPerUser">
                사용자당 최대 사용 횟수 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                required
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Min Order Amount */}
          <div>
            <Label htmlFor="minOrderAmount">최소 주문 금액</Label>
            <Input
              id="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="제한 없음"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">비워두면 제한 없음</p>
          </div>

          {/* Applicable Cruises */}
          <div>
            <Label htmlFor="applicableCruises">적용 가능 크루즈 ID</Label>
            <Input
              id="applicableCruises"
              type="text"
              placeholder="쉼표로 구분 (예: MSC001, MSC002)"
              value={formData.applicableCruises}
              onChange={(e) => setFormData({ ...formData, applicableCruises: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">비워두면 모든 크루즈에 적용</p>
          </div>

          {/* Applicable Categories */}
          <div>
            <Label htmlFor="applicableCategories">적용 가능 객실 카테고리</Label>
            <Input
              id="applicableCategories"
              type="text"
              placeholder="쉼표로 구분 (예: balcony, suite)"
              value={formData.applicableCategories}
              onChange={(e) => setFormData({ ...formData, applicableCategories: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">비워두면 모든 객실에 적용</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  프로모션 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
