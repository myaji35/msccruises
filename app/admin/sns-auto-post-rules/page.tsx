"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

interface SnsAutoPostRule {
  id: string;
  name: string;
  description: string | null;
  contentType: string;
  snsAccountId: string;
  template: string;
  hashtagTemplate: string | null;
  postImmediately: boolean;
  scheduleDelayMinutes: number | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  snsAccount: {
    id: string;
    platform: string;
    accountName: string | null;
    accountId: string;
  };
}

interface SnsAccount {
  id: string;
  platform: string;
  accountName: string | null;
  accountId: string;
  isActive: boolean;
}

const PLATFORMS = [
  { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  { value: "instagram", label: "Instagram", color: "bg-pink-600" },
  { value: "twitter", label: "Twitter/X", color: "bg-sky-500" },
  { value: "kakao", label: "Kakao", color: "bg-yellow-400 text-gray-900" },
  { value: "naver", label: "Naver", color: "bg-green-600" },
];

const CONTENT_TYPES = [
  { value: "packageDiscount", label: "프로모션/할인", icon: "💰" },
  { value: "destination", label: "목적지", icon: "🌍" },
  { value: "cruise", label: "크루즈", icon: "🚢" },
];

export default function SnsAutoPostRulesPage() {
  const [rules, setRules] = useState<SnsAutoPostRule[]>([]);
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contentType: "packageDiscount",
    snsAccountId: "",
    template: "",
    hashtagTemplate: "",
    postImmediately: true,
    scheduleDelayMinutes: "",
    isActive: true,
  });

  useEffect(() => {
    fetchRules();
    fetchAccounts();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/admin/sns-auto-post-rules");
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error("Failed to fetch auto-post rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/sns-accounts?isActive=true");
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch SNS accounts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary user ID
    const tempUserId = "admin-user-id";

    const payload = {
      name: formData.name,
      description: formData.description || null,
      contentType: formData.contentType,
      snsAccountId: formData.snsAccountId,
      template: formData.template,
      hashtagTemplate: formData.hashtagTemplate || null,
      postImmediately: formData.postImmediately,
      scheduleDelayMinutes: formData.scheduleDelayMinutes
        ? parseInt(formData.scheduleDelayMinutes)
        : null,
      isActive: formData.isActive,
      createdBy: tempUserId,
    };

    try {
      const url = editingId
        ? `/api/admin/sns-auto-post-rules/${editingId}`
        : "/api/admin/sns-auto-post-rules";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchRules();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save"}`);
      }
    } catch (error) {
      console.error("Error saving auto-post rule:", error);
      alert("Failed to save auto-post rule");
    }
  };

  const handleEdit = (rule: SnsAutoPostRule) => {
    setEditingId(rule.id);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      contentType: rule.contentType,
      snsAccountId: rule.snsAccountId,
      template: rule.template,
      hashtagTemplate: rule.hashtagTemplate || "",
      postImmediately: rule.postImmediately,
      scheduleDelayMinutes: rule.scheduleDelayMinutes?.toString() || "",
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 자동 포스팅 규칙을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/sns-auto-post-rules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRules();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to delete"}`);
      }
    } catch (error) {
      console.error("Error deleting auto-post rule:", error);
      alert("Failed to delete auto-post rule");
    }
  };

  const toggleActive = async (rule: SnsAutoPostRule) => {
    try {
      const response = await fetch(`/api/admin/sns-auto-post-rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });

      if (response.ok) {
        await fetchRules();
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      contentType: "packageDiscount",
      snsAccountId: "",
      template: "",
      hashtagTemplate: "",
      postImmediately: true,
      scheduleDelayMinutes: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const getPlatformColor = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.color || "bg-gray-500";
  };

  const getPlatformLabel = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.label || platform;
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES.find((t) => t.value === type) || { label: type, icon: "📄" };
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">자동 포스팅 규칙 관리</h1>
          <p className="text-gray-600 mt-1">
            콘텐츠 생성 시 자동으로 SNS에 포스팅하는 규칙을 설정합니다
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 규칙 추가
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            등록된 자동 포스팅 규칙이 없습니다
          </div>
        ) : (
          rules.map((rule) => {
            const contentTypeInfo = getContentTypeInfo(rule.contentType);

            return (
              <div
                key={rule.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {rule.name}
                      </h3>
                      <button
                        onClick={() => toggleActive(rule)}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                          rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rule.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            활성
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            비활성
                          </>
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    {rule.description && (
                      <p className="text-gray-600 mb-3">{rule.description}</p>
                    )}

                    {/* Info Badges */}
                    <div className="flex gap-3 mb-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {contentTypeInfo.icon} {contentTypeInfo.label}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPlatformColor(
                          rule.snsAccount.platform
                        )}`}
                      >
                        {getPlatformLabel(rule.snsAccount.platform)}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                        {rule.postImmediately ? (
                          <>즉시 포스팅</>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            {rule.scheduleDelayMinutes}분 후 예약
                          </>
                        )}
                      </span>
                    </div>

                    {/* Template Preview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          포스트 템플릿:
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                            {rule.template.substring(0, 200)}
                            {rule.template.length > 200 && "..."}
                          </pre>
                        </div>
                      </div>

                      {rule.hashtagTemplate && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            해시태그 템플릿:
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-sm text-blue-600">
                              {rule.hashtagTemplate}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="mt-3 text-sm text-gray-500">
                      SNS 계정:{" "}
                      {rule.snsAccount.accountName || rule.snsAccount.accountId}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "자동 포스팅 규칙 수정" : "새 자동 포스팅 규칙 추가"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    규칙 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    placeholder="프로모션 할인 → Facebook 자동 포스팅"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="새로운 패키지 할인이 생성되면 Facebook에 자동 포스팅"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    콘텐츠 타입 *
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData({ ...formData, contentType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SNS 계정 선택 *
                  </label>
                  <select
                    value={formData.snsAccountId}
                    onChange={(e) =>
                      setFormData({ ...formData, snsAccountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">계정 선택...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {getPlatformLabel(account.platform)} -{" "}
                        {account.accountName || account.accountId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포스트 템플릿 *
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  사용 가능한 변수: {"{"}name{"}"}, {"{"}description{"}"},{" "}
                  {"{"}discount{"}"}, {"{"}validUntil{"}"}, {"{"}shipName{"}"}
                  , {"{"}departurePort{"}"}, {"{"}durationDays{"}"},{" "}
                  {"{"}startingPrice{"}"}
                </div>
                <textarea
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  rows={8}
                  required
                  placeholder={`🎉 특별 할인 이벤트! 🎉

{name}
{description}

💰 할인율: {discount}
📅 유효기간: {validUntil}까지

지금 바로 예약하세요!
👉 https://msccruises.co.kr`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  해시태그 템플릿
                </label>
                <input
                  type="text"
                  value={formData.hashtagTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hashtagTemplate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="#MSC크루즈 #크루즈여행 #특별할인 #{name}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.postImmediately}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postImmediately: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      즉시 포스팅
                    </span>
                  </label>
                </div>

                {!formData.postImmediately && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예약 지연 (분)
                    </label>
                    <input
                      type="number"
                      value={formData.scheduleDelayMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleDelayMinutes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="30"
                      min="1"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    활성 상태
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="outline"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingId ? "수정" : "추가"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
