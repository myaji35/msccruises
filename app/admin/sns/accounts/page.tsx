"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Facebook, Instagram, Twitter } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface SnsAccount {
  id?: string;
  platform: string;
  accountId: string;
  accessToken: string;
  isActive: boolean;
}

export default function SnsAccountsPage() {
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SnsAccount>({
    platform: "facebook",
    accountId: "",
    accessToken: "",
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/sns/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Failed to fetch SNS accounts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/sns/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("SNS 계정이 추가되었습니다.");
        setShowForm(false);
        setFormData({ platform: "facebook", accountId: "", accessToken: "", isActive: true });
        fetchAccounts();
      } else {
        throw new Error("Failed to add account");
      }
    } catch (error) {
      alert("계정 추가에 실패했습니다.");
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/sns/accounts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("삭제되었습니다.");
        fetchAccounts();
      }
    } catch (error) {
      alert("삭제에 실패했습니다.");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case "instagram":
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case "tiktok":
        return <div className="w-5 h-5 bg-black rounded" />;
      case "threads":
        return <Twitter className="w-5 h-5 text-gray-800" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <AdminNav />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">SNS 계정 관리</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">소셜 미디어 계정을 연결하여 자동 포스팅을 관리하세요.</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            계정 추가
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold mb-4">새 SNS 계정 추가</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="threads">Threads</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계정 ID</label>
                <input
                  type="text"
                  required
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="@username 또는 계정 ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">액세스 토큰</label>
                <textarea
                  required
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="API 액세스 토큰을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ⚠️ 실제 프로덕션 환경에서는 안전하게 암호화되어 저장됩니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <p className="text-gray-600">등록된 SNS 계정이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <p className="font-semibold capitalize">{account.platform}</p>
                      <p className="text-sm text-gray-600">{account.accountId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAccount(account.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      account.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {account.isActive ? "활성" : "비활성"}
                  </span>
                  <p className="text-xs text-gray-500">토큰: {account.accessToken.substring(0, 20)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
