'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CruiseExtra {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  features: string[];
  imageUrl: string | null;
  maxPerBooking: number | null;
  order: number;
  isActive: boolean;
}

const CATEGORIES = [
  { value: 'dining', label: '다이닝' },
  { value: 'beverage', label: '음료' },
  { value: 'wifi', label: '인터넷' },
  { value: 'shore-excursion', label: '투어' },
  { value: 'spa', label: '스파' },
];

export default function CruiseExtrasPage() {
  const [extras, setExtras] = useState<CruiseExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    description: '',
    price: '',
    currency: 'USD',
    category: 'dining',
    features: '',
    imageUrl: '',
    maxPerBooking: '',
    order: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchExtras();
  }, []);

  const fetchExtras = async () => {
    try {
      const response = await fetch('/api/admin/cruise-extras');
      const data = await response.json();
      setExtras(data.extras || []);
    } catch (error) {
      console.error('Failed to fetch extras:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      nameEn: '',
      description: '',
      price: '',
      currency: 'USD',
      category: 'dining',
      features: '',
      imageUrl: '',
      maxPerBooking: '',
      order: '0',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (extra: CruiseExtra) => {
    setEditingId(extra.id);
    setFormData({
      code: extra.code,
      name: extra.name,
      nameEn: extra.nameEn || '',
      description: extra.description || '',
      price: extra.price.toString(),
      currency: extra.currency,
      category: extra.category,
      features: extra.features.join('\n'),
      imageUrl: extra.imageUrl || '',
      maxPerBooking: extra.maxPerBooking?.toString() || '',
      order: extra.order.toString(),
      isActive: extra.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      name: formData.name,
      nameEn: formData.nameEn || null,
      description: formData.description || null,
      price: parseFloat(formData.price),
      currency: formData.currency,
      category: formData.category,
      features: formData.features.split('\n').map(f => f.trim()).filter(f => f),
      imageUrl: formData.imageUrl || null,
      maxPerBooking: formData.maxPerBooking ? parseInt(formData.maxPerBooking) : null,
      order: parseInt(formData.order),
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/admin/cruise-extras/${editingId}` : '/api/admin/cruise-extras';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '저장에 실패했습니다');
        return;
      }

      await fetchExtras();
      setShowModal(false);
      alert(editingId ? '수정되었습니다' : '생성되었습니다');
    } catch (error) {
      console.error('Submit error:', error);
      alert('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/cruise-extras/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExtras();
        alert('삭제되었습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/cruise-extras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });
      await fetchExtras();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">부가상품 관리</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          새 부가상품
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">카테고리</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">코드</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">이름</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">가격</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {extras.map((extra) => (
              <tr key={extra.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {CATEGORIES.find(c => c.value === extra.category)?.label || extra.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{extra.code}</code>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{extra.name}</div>
                  {extra.nameEn && <div className="text-sm text-gray-500">{extra.nameEn}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono">${extra.price}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(extra.id, extra.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      extra.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {extra.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(extra)} className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(extra.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingId ? '부가상품 수정' : '새 부가상품'}</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">코드 *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">카테고리 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">이름 (한글) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">이름 (영문)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">가격 (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">최대 수량</label>
                  <input
                    type="number"
                    value={formData.maxPerBooking}
                    onChange={(e) => setFormData({ ...formData, maxPerBooking: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">특징 (한 줄에 하나씩)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={4}
                />
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
