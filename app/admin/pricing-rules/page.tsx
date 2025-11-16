'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingRule {
  id: string;
  name: string;
  ruleType: string | null;
  priority: number;
  isActive: boolean;
  inventoryThresholdLow: number | null;
  inventoryThresholdMedium: number | null;
  inventoryThresholdHigh: number | null;
  priceMultiplierLow: number | null;
  priceMultiplierMedium: number | null;
  priceMultiplierHigh: number | null;
  demandMultiplierHigh: number | null;
  demandMultiplierMedium: number | null;
  demandMultiplierLow: number | null;
  groupDiscount3to5: number | null;
  groupDiscount6to10: number | null;
  groupDiscount11plus: number | null;
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'inventory',
    inventoryThresholdLow: '30',
    inventoryThresholdMedium: '50',
    inventoryThresholdHigh: '70',
    priceMultiplierLow: '1.20',
    priceMultiplierMedium: '1.10',
    priceMultiplierHigh: '1.05',
    demandMultiplierHigh: '1.15',
    demandMultiplierMedium: '1.07',
    demandMultiplierLow: '1.00',
    groupDiscount3to5: '0.05',
    groupDiscount6to10: '0.10',
    groupDiscount11plus: '0.15',
    priority: '100',
    isActive: true,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/pricing-rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      ruleType: 'inventory',
      inventoryThresholdLow: '30',
      inventoryThresholdMedium: '50',
      inventoryThresholdHigh: '70',
      priceMultiplierLow: '1.20',
      priceMultiplierMedium: '1.10',
      priceMultiplierHigh: '1.05',
      demandMultiplierHigh: '1.15',
      demandMultiplierMedium: '1.07',
      demandMultiplierLow: '1.00',
      groupDiscount3to5: '0.05',
      groupDiscount6to10: '0.10',
      groupDiscount11plus: '0.15',
      priority: '100',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (rule: PricingRule) => {
    setEditingId(rule.id);
    setFormData({
      name: rule.name,
      ruleType: rule.ruleType || 'inventory',
      inventoryThresholdLow: rule.inventoryThresholdLow?.toString() || '',
      inventoryThresholdMedium: rule.inventoryThresholdMedium?.toString() || '',
      inventoryThresholdHigh: rule.inventoryThresholdHigh?.toString() || '',
      priceMultiplierLow: rule.priceMultiplierLow?.toString() || '',
      priceMultiplierMedium: rule.priceMultiplierMedium?.toString() || '',
      priceMultiplierHigh: rule.priceMultiplierHigh?.toString() || '',
      demandMultiplierHigh: rule.demandMultiplierHigh?.toString() || '',
      demandMultiplierMedium: rule.demandMultiplierMedium?.toString() || '',
      demandMultiplierLow: rule.demandMultiplierLow?.toString() || '',
      groupDiscount3to5: rule.groupDiscount3to5?.toString() || '',
      groupDiscount6to10: rule.groupDiscount6to10?.toString() || '',
      groupDiscount11plus: rule.groupDiscount11plus?.toString() || '',
      priority: rule.priority.toString(),
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      ruleType: formData.ruleType,
      inventoryThresholdLow: parseFloat(formData.inventoryThresholdLow) || null,
      inventoryThresholdMedium: parseFloat(formData.inventoryThresholdMedium) || null,
      inventoryThresholdHigh: parseFloat(formData.inventoryThresholdHigh) || null,
      priceMultiplierLow: parseFloat(formData.priceMultiplierLow) || null,
      priceMultiplierMedium: parseFloat(formData.priceMultiplierMedium) || null,
      priceMultiplierHigh: parseFloat(formData.priceMultiplierHigh) || null,
      demandMultiplierHigh: parseFloat(formData.demandMultiplierHigh) || null,
      demandMultiplierMedium: parseFloat(formData.demandMultiplierMedium) || null,
      demandMultiplierLow: parseFloat(formData.demandMultiplierLow) || null,
      groupDiscount3to5: parseFloat(formData.groupDiscount3to5) || null,
      groupDiscount6to10: parseFloat(formData.groupDiscount6to10) || null,
      groupDiscount11plus: parseFloat(formData.groupDiscount11plus) || null,
      priority: parseInt(formData.priority),
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/admin/pricing-rules/${editingId}` : '/api/admin/pricing-rules';
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

      await fetchRules();
      setShowModal(false);
      alert(editingId ? '수정되었습니다' : '생성되었습니다');
    } catch (error) {
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchRules();
        alert('삭제되었습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });
      await fetchRules();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">가격 규칙 관리</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          새 규칙
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">우선순위</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">이름</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">유형</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm">{rule.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{rule.name}</div>
                </td>
                <td className="px-4 py-3">{rule.ruleType || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(rule.id, rule.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rule.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(rule)} className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingId ? '규칙 수정' : '새 규칙'}</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">규칙 이름 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">우선순위 *</label>
                  <input
                    type="number"
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">재고 기반 가격 조정</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">낮음 임계값 (%)</label>
                    <input
                      type="number"
                      value={formData.inventoryThresholdLow}
                      onChange={(e) => setFormData({ ...formData, inventoryThresholdLow: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">중간 임계값 (%)</label>
                    <input
                      type="number"
                      value={formData.inventoryThresholdMedium}
                      onChange={(e) => setFormData({ ...formData, inventoryThresholdMedium: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">높음 임계값 (%)</label>
                    <input
                      type="number"
                      value={formData.inventoryThresholdHigh}
                      onChange={(e) => setFormData({ ...formData, inventoryThresholdHigh: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="block text-sm mb-1">낮음 배율</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMultiplierLow}
                      onChange={(e) => setFormData({ ...formData, priceMultiplierLow: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">중간 배율</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMultiplierMedium}
                      onChange={(e) => setFormData({ ...formData, priceMultiplierMedium: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">높음 배율</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMultiplierHigh}
                      onChange={(e) => setFormData({ ...formData, priceMultiplierHigh: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">수요 기반 배율</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">높음</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.demandMultiplierHigh}
                      onChange={(e) => setFormData({ ...formData, demandMultiplierHigh: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">중간</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.demandMultiplierMedium}
                      onChange={(e) => setFormData({ ...formData, demandMultiplierMedium: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">낮음</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.demandMultiplierLow}
                      onChange={(e) => setFormData({ ...formData, demandMultiplierLow: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">그룹 할인</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">3-5 객실</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.groupDiscount3to5}
                      onChange={(e) => setFormData({ ...formData, groupDiscount3to5: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">6-10 객실</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.groupDiscount6to10}
                      onChange={(e) => setFormData({ ...formData, groupDiscount6to10: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">11+ 객실</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.groupDiscount11plus}
                      onChange={(e) => setFormData({ ...formData, groupDiscount11plus: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
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
