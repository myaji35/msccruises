"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";

interface SnsAccount {
  id: string;
  userId: string;
  platform: string;
  accountName: string | null;
  accountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    posts: number;
    autoPostRules: number;
  };
}

const PLATFORMS = [
  { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  { value: "instagram", label: "Instagram", color: "bg-pink-600" },
  { value: "twitter", label: "Twitter/X", color: "bg-sky-500" },
  { value: "kakao", label: "Kakao", color: "bg-yellow-400" },
  { value: "naver", label: "Naver", color: "bg-green-600" },
];

export default function SnsAccountsPage() {
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    platform: "facebook",
    accountName: "",
    accountId: "",
    accessToken: "",
    refreshToken: "",
    tokenExpiresAt: "",
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/sns-accounts");
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch SNS accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      userId: formData.userId,
      platform: formData.platform,
      accountName: formData.accountName || null,
      accountId: formData.accountId,
      accessToken: formData.accessToken || null,
      refreshToken: formData.refreshToken || null,
      tokenExpiresAt: formData.tokenExpiresAt || null,
      isActive: formData.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/sns-accounts/${editingId}`
        : "/api/admin/sns-accounts";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAccounts();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save"}`);
      }
    } catch (error) {
      console.error("Error saving SNS account:", error);
      alert("Failed to save SNS account");
    }
  };

  const handleEdit = (account: SnsAccount) => {
    setEditingId(account.id);
    setFormData({
      userId: account.userId,
      platform: account.platform,
      accountName: account.accountName || "",
      accountId: account.accountId,
      accessToken: account.accessToken || "",
      refreshToken: account.refreshToken || "",
      tokenExpiresAt: account.tokenExpiresAt
        ? new Date(account.tokenExpiresAt).toISOString().split("T")[0]
        : "",
      isActive: account.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 SNS 계정을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/sns-accounts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAccounts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to delete"}`);
      }
    } catch (error) {
      console.error("Error deleting SNS account:", error);
      alert("Failed to delete SNS account");
    }
  };

  const toggleActive = async (account: SnsAccount) => {
    try {
      const response = await fetch(`/api/admin/sns-accounts/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !account.isActive }),
      });

      if (response.ok) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      platform: "facebook",
      accountName: "",
      accountId: "",
      accessToken: "",
      refreshToken: "",
      tokenExpiresAt: "",
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

  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
          <h1 className="text-3xl font-bold text-gray-900">SNS 계정 관리</h1>
          <p className="text-gray-600 mt-1">
            소셜 미디어 계정을 등록하고 관리합니다
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
          새 계정 추가
        </Button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                플랫폼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                계정 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                소유자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                토큰 만료일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                통계
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  등록된 SNS 계정이 없습니다
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPlatformColor(
                        account.platform
                      )}`}
                    >
                      {getPlatformLabel(account.platform)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {account.accountName || account.accountId}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{account.accountId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {account.user.name}
                      </div>
                      <div className="text-gray-500">{account.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.tokenExpiresAt ? (
                      <div>
                        <div
                          className={`text-sm ${
                            isTokenExpired(account.tokenExpiresAt)
                              ? "text-red-600 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {new Date(account.tokenExpiresAt).toLocaleDateString()}
                        </div>
                        {isTokenExpired(account.tokenExpiresAt) && (
                          <div className="text-xs text-red-600">만료됨</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      포스트: {account._count.posts}개
                    </div>
                    <div className="text-sm text-gray-500">
                      자동규칙: {account._count.autoPostRules}개
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(account)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        account.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {account.isActive ? "활성" : "비활성"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={
                          account._count.posts > 0 ||
                          account._count.autoPostRules > 0
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "SNS 계정 수정" : "새 SNS 계정 추가"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    플랫폼 *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingId}
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    소유자 User ID *
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingId}
                    placeholder="cuid 형식의 User ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정 이름
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="MSC Cruises Korea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정 ID * (Username)
                </label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) =>
                    setFormData({ ...formData, accountId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!!editingId}
                  placeholder="msccruises_kr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <textarea
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="플랫폼에서 발급받은 Access Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Token
                </label>
                <textarea
                  value={formData.refreshToken}
                  onChange={(e) =>
                    setFormData({ ...formData, refreshToken: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="플랫폼에서 발급받은 Refresh Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  토큰 만료일
                </label>
                <input
                  type="date"
                  value={formData.tokenExpiresAt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tokenExpiresAt: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  활성 상태
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
