'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CabinCategory {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  features: string[];
  priceMultiplier: number;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  code: string;
  name: string;
  nameEn: string;
  description: string;
  features: string;
  priceMultiplier: string;
  imageUrl: string;
  order: string;
  isActive: boolean;
}

export default function CabinCategoriesPage() {
  const [categories, setCategories] = useState<CabinCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    code: '',
    name: '',
    nameEn: '',
    description: '',
    features: '',
    priceMultiplier: '1.0',
    imageUrl: '',
    order: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/cabin-categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch cabin categories:', error);
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
      features: '',
      priceMultiplier: '1.0',
      imageUrl: '',
      order: '0',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (category: CabinCategory) => {
    setEditingId(category.id);
    setFormData({
      code: category.code,
      name: category.name,
      nameEn: category.nameEn || '',
      description: category.description || '',
      features: category.features.join('\n'),
      priceMultiplier: category.priceMultiplier.toString(),
      imageUrl: category.imageUrl || '',
      order: category.order.toString(),
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      code: formData.code,
      name: formData.name,
      nameEn: formData.nameEn || null,
      description: formData.description || null,
      features: featuresArray,
      priceMultiplier: parseFloat(formData.priceMultiplier),
      imageUrl: formData.imageUrl || null,
      order: parseInt(formData.order),
      isActive: formData.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/cabin-categories/${editingId}`
        : '/api/admin/cabin-categories';
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

      await fetchCategories();
      closeModal();
      alert(editingId ? '수정되었습니다' : '생성되었습니다');
    } catch (error) {
      console.error('Submit error:', error);
      alert('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/cabin-categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        alert('삭제되었습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/admin/cabin-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    try {
      const current = categories[index];
      const target = categories[newIndex];

      await Promise.all([
        fetch(`/api/admin/cabin-categories/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/admin/cabin-categories/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);

      await fetchCategories();
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">객실 카테고리 관리</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          새 카테고리
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">순서</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">코드</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">이름</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">배율</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="ml-2 text-gray-600">{category.order}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {category.code}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.nameEn && (
                      <div className="text-sm text-gray-500">{category.nameEn}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono">{category.priceMultiplier}x</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(category.id, category.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? '카테고리 수정' : '새 카테고리'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    코드 * (영문)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="inside, oceanview..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    배율 *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.priceMultiplier}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMultiplier: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
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
                  placeholder="내부 객실 (Inside)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">이름 (영문)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Inside Cabin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  특징 (한 줄에 하나씩)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={5}
                  placeholder="창문 없음&#10;트윈 베드 또는 더블 베드&#10;개인 욕실 및 샤워 시설"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">순서</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">활성화</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
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
