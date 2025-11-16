'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Promotion {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  applicableCruises: string[];
  applicableCategories: string[];
  isActive: boolean;
  createdAt: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    applicableCruises: '',
    applicableCategories: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/v1/promotions');
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const validUntil = nextMonth.toISOString().split('T')[0];

    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '10',
      minOrderAmount: '1000',
      maxUses: '100',
      validFrom: today,
      validUntil: validUntil,
      applicableCruises: '',
      applicableCategories: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      minOrderAmount: promo.minOrderAmount?.toString() || '',
      maxUses: promo.maxUses?.toString() || '',
      validFrom: promo.validFrom.split('T')[0],
      validUntil: promo.validUntil.split('T')[0],
      applicableCruises: promo.applicableCruises.join(','),
      applicableCategories: promo.applicableCategories.join(','),
      isActive: promo.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      applicableCruises: formData.applicableCruises ? formData.applicableCruises.split(',').map((s) => s.trim()) : [],
      applicableCategories: formData.applicableCategories
        ? formData.applicableCategories.split(',').map((s) => s.trim())
        : [],
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/v1/promotions/${editingId}` : '/api/v1/promotions';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '저장 실패');
        return;
      }

      await fetchPromotions();
      setShowModal(false);
      alert(editingId ? '수정되었습니다' : '생성되었습니다');
    } catch (error) {
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v1/promotions/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchPromotions();
        alert('삭제되었습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/v1/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });
      await fetchPromotions();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  const getUsagePercentage = (current: number, max: number | null) => {
    if (!max) return 0;
    return Math.min(100, (current / max) * 100);
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">프로모션 코드 관리</h1>
          <p className="text-gray-600 mt-1">할인 코드를 생성하고 관리합니다</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          새 프로모션
        </Button>
      </div>

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold bg-gray-100 px-3 py-1 rounded">{promo.code}</code>
                    <button
                      onClick={() => copyToClipboard(promo.code)}
                      className="p-2 hover:bg-gray-100 rounded transition"
                      title="코드 복사"
                    >
                      {copiedCode === promo.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => toggleActive(promo.id, promo.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {promo.isActive ? '활성' : '비활성'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">할인</div>
                    <div className="font-semibold">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue.toLocaleString()}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">최소 주문 금액</div>
                    <div className="font-semibold">
                      {promo.minOrderAmount ? `$${promo.minOrderAmount.toLocaleString()}` : '제한 없음'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">사용 현황</div>
                    <div className="font-semibold">
                      {promo.currentUses} / {promo.maxUses || '∞'}
                      {promo.maxUses && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${getUsagePercentage(promo.currentUses, promo.maxUses)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">유효 기간</div>
                    <div className="font-semibold text-sm">
                      {formatDate(promo.validFrom)} ~ {formatDate(promo.validUntil)}
                    </div>
                  </div>
                </div>

                {(promo.applicableCruises.length > 0 || promo.applicableCategories.length > 0) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600">적용 대상</div>
                    <div className="flex gap-2 mt-1">
                      {promo.applicableCruises.length > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          특정 크루즈: {promo.applicableCruises.join(', ')}
                        </span>
                      )}
                      {promo.applicableCategories.length > 0 && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          객실 유형: {promo.applicableCategories.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button onClick={() => openEditModal(promo)} className="p-2 hover:bg-gray-100 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(promo.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {promotions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">등록된 프로모션이 없습니다</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingId ? '프로모션 수정' : '새 프로모션'}</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">프로모션 코드 *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 border rounded uppercase"
                    placeholder="SUMMER2025"
                    maxLength={20}
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    자동 생성
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">영문 대문자와 숫자만 사용 (최대 20자)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">할인 유형 *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="percentage">비율 할인 (%)</option>
                    <option value="fixed">정액 할인 ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">할인 금액 *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">최소 주문 금액 ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">비워두면 제한 없음</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">최대 사용 횟수</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">비워두면 무제한</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">시작일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">종료일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">적용 크루즈 (선택)</label>
                <input
                  type="text"
                  value={formData.applicableCruises}
                  onChange={(e) => setFormData({ ...formData, applicableCruises: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="MSC123456, MSC789012 (쉼표로 구분)"
                />
                <p className="text-xs text-gray-500 mt-1">비워두면 모든 크루즈에 적용</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">적용 객실 유형 (선택)</label>
                <input
                  type="text"
                  value={formData.applicableCategories}
                  onChange={(e) => setFormData({ ...formData, applicableCategories: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="balcony, suite (쉼표로 구분)"
                />
                <p className="text-xs text-gray-500 mt-1">비워두면 모든 객실 유형에 적용</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">활성화</span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
