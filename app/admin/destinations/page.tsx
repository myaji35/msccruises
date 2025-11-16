'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Destination {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  region: string | null;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    region: '',
    description: '',
    imageUrl: '',
    order: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/admin/destinations');
      const data = await response.json();
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
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
      region: '',
      description: '',
      imageUrl: '',
      order: '0',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (dest: Destination) => {
    setEditingId(dest.id);
    setFormData({
      code: dest.code,
      name: dest.name,
      nameEn: dest.nameEn || '',
      region: dest.region || '',
      description: dest.description || '',
      imageUrl: dest.imageUrl || '',
      order: dest.order.toString(),
      isActive: dest.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      name: formData.name,
      nameEn: formData.nameEn || null,
      region: formData.region || null,
      description: formData.description || null,
      imageUrl: formData.imageUrl || null,
      order: parseInt(formData.order),
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/admin/destinations/${editingId}` : '/api/admin/destinations';
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

      await fetchDestinations();
      setShowModal(false);
      alert(editingId ? '수정되었습니다' : '생성되었습니다');
    } catch (error) {
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchDestinations();
        alert('삭제되었습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/destinations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });
      await fetchDestinations();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const moveDestination = async (id: string, direction: 'up' | 'down') => {
    const index = destinations.findIndex((d) => d.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= destinations.length) return;

    try {
      const current = destinations[index];
      const target = destinations[newIndex];

      await Promise.all([
        fetch(`/api/admin/destinations/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/admin/destinations/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);

      await fetchDestinations();
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">목적지 관리</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          새 목적지
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">순서</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">코드</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">이름</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">지역</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest, index) => (
              <tr key={dest.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveDestination(dest.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDestination(dest.id, 'down')}
                      disabled={index === destinations.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="ml-2 text-gray-600">{dest.order}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{dest.code}</code>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{dest.name}</div>
                  {dest.nameEn && <div className="text-sm text-gray-500">{dest.nameEn}</div>}
                </td>
                <td className="px-4 py-3">{dest.region || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(dest.id, dest.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dest.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {dest.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(dest)} className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(dest.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
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
              <h2 className="text-2xl font-bold">{editingId ? '목적지 수정' : '새 목적지'}</h2>
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
                    placeholder="caribbean, mediterranean..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">지역</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Americas, Europe, Asia..."
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
                  placeholder="카리브해"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">이름 (영문)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Caribbean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
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
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">활성화</span>
                  </label>
                </div>
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
