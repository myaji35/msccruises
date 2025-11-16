"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Send, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface SnsPost {
  id: string;
  contentType: string;
  contentId: string | null;
  platform: string;
  content: string;
  mediaUrls: string[];
  hashtags: string | null;
  status: string;
  scheduledAt: string | null;
  postedAt: string | null;
  platformPostId: string | null;
  errorMessage: string | null;
  createdBy: string;
  createdAt: string;
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
  { value: "manual", label: "수동 포스트" },
  { value: "packageDiscount", label: "프로모션/할인" },
  { value: "destination", label: "목적지" },
  { value: "cruise", label: "크루즈" },
];

const STATUS_CONFIG = {
  draft: { label: "초안", color: "bg-gray-100 text-gray-800", icon: Calendar },
  scheduled: { label: "예약됨", color: "bg-blue-100 text-blue-800", icon: Clock },
  posting: { label: "포스팅 중", color: "bg-yellow-100 text-yellow-800", icon: Send },
  posted: { label: "완료", color: "bg-green-100 text-green-800", icon: CheckCircle },
  failed: { label: "실패", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function SnsPostsPage() {
  const [posts, setPosts] = useState<SnsPost[]>([]);
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPlatform, setFilterPlatform] = useState<string>("");

  const [formData, setFormData] = useState({
    snsAccountId: "",
    contentType: "manual",
    contentId: "",
    content: "",
    mediaUrls: "",
    hashtags: "",
    scheduledAt: "",
  });

  useEffect(() => {
    fetchPosts();
    fetchAccounts();
  }, [filterStatus, filterPlatform]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterPlatform) params.append("platform", filterPlatform);

      const response = await fetch(`/api/admin/sns-posts?${params.toString()}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch SNS posts:", error);
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

    // Temporary user ID - in real app, get from session
    const tempUserId = "admin-user-id";

    const mediaUrlsArray = formData.mediaUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      snsAccountId: formData.snsAccountId,
      contentType: formData.contentType,
      contentId: formData.contentId || null,
      content: formData.content,
      mediaUrls: mediaUrlsArray.length > 0 ? mediaUrlsArray : undefined,
      hashtags: formData.hashtags || undefined,
      scheduledAt: formData.scheduledAt || undefined,
      createdBy: tempUserId,
    };

    try {
      const response = await fetch("/api/admin/sns-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchPosts();
        setShowModal(false);
        resetForm();
        alert("포스트가 성공적으로 생성되었습니다!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to create post"}`);
      }
    } catch (error) {
      console.error("Error creating SNS post:", error);
      alert("Failed to create SNS post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 포스트를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/sns-posts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPosts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to delete"}`);
      }
    } catch (error) {
      console.error("Error deleting SNS post:", error);
      alert("Failed to delete SNS post");
    }
  };

  const resetForm = () => {
    setFormData({
      snsAccountId: "",
      contentType: "manual",
      contentId: "",
      content: "",
      mediaUrls: "",
      hashtags: "",
      scheduledAt: "",
    });
  };

  const getPlatformColor = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.color || "bg-gray-500";
  };

  const getPlatformLabel = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.label || platform;
  };

  const getContentTypeLabel = (type: string) => {
    return CONTENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
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
          <h1 className="text-3xl font-bold text-gray-900">SNS 포스팅 기록</h1>
          <p className="text-gray-600 mt-1">
            SNS 포스팅 기록을 조회하고 새 포스트를 작성합니다
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
          수동 포스트 작성
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태 필터
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="draft">초안</option>
              <option value="scheduled">예약됨</option>
              <option value="posting">포스팅 중</option>
              <option value="posted">완료</option>
              <option value="failed">실패</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              플랫폼 필터
            </label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              {PLATFORMS.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            포스팅 기록이 없습니다
          </div>
        ) : (
          posts.map((post) => {
            const statusConfig = getStatusConfig(post.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPlatformColor(
                          post.platform
                        )}`}
                      >
                        {getPlatformLabel(post.platform)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getContentTypeLabel(post.contentType)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Account Info */}
                    <div className="text-sm text-gray-600 mb-3">
                      계정: {post.snsAccount.accountName || post.snsAccount.accountId}
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {post.hashtags && (
                        <p className="text-blue-600 mt-2">{post.hashtags}</p>
                      )}
                    </div>

                    {/* Media URLs */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">
                          첨부 미디어: {post.mediaUrls.length}개
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {post.mediaUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              미디어 {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <div>
                        생성:{" "}
                        {new Date(post.createdAt).toLocaleString("ko-KR")}
                      </div>
                      {post.scheduledAt && (
                        <div>
                          예약:{" "}
                          {new Date(post.scheduledAt).toLocaleString("ko-KR")}
                        </div>
                      )}
                      {post.postedAt && (
                        <div>
                          포스팅:{" "}
                          {new Date(post.postedAt).toLocaleString("ko-KR")}
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {post.errorMessage && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="text-sm font-medium text-red-800">
                          오류 메시지:
                        </div>
                        <div className="text-sm text-red-700">
                          {post.errorMessage}
                        </div>
                      </div>
                    )}

                    {/* Platform Post ID */}
                    {post.platformPostId && (
                      <div className="mt-2 text-xs text-gray-500">
                        플랫폼 ID: {post.platformPostId}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4">
                    {post.status !== "posted" && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">새 포스트 작성</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  콘텐츠 타입
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) =>
                    setFormData({ ...formData, contentType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.contentType !== "manual" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    콘텐츠 ID (선택사항)
                  </label>
                  <input
                    type="text"
                    value={formData.contentId}
                    onChange={(e) =>
                      setFormData({ ...formData, contentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="연결할 콘텐츠의 ID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포스트 내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={6}
                  required
                  placeholder="포스트에 표시될 텍스트를 입력하세요..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.content.length}자
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  해시태그
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) =>
                    setFormData({ ...formData, hashtags: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="#MSC크루즈 #여행 #크루즈"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미디어 URL (한 줄에 하나씩)
                </label>
                <textarea
                  value={formData.mediaUrls}
                  onChange={(e) =>
                    setFormData({ ...formData, mediaUrls: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약 일시 (선택사항)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="text-sm text-gray-500 mt-1">
                  비워두면 즉시 포스팅됩니다
                </div>
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
                  <Send className="w-4 h-4 mr-2" />
                  {formData.scheduledAt ? "예약하기" : "바로 포스팅"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
