'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriceHistory {
  id: string;
  cruiseId: string;
  cabinCategory: string;
  oldPrice: number;
  newPrice: number;
  changeReason: 'inventory' | 'demand' | 'promotion' | 'manual';
  changeDetails: any;
  changedBy: string;
  changedAt: string;
}

export default function PriceHistoryPage() {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cruiseId: '',
    cabinCategory: '',
    changeReason: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.cruiseId) params.append('cruiseId', filters.cruiseId);
      if (filters.cabinCategory) params.append('cabinCategory', filters.cabinCategory);
      if (filters.changeReason) params.append('changeReason', filters.changeReason);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/price-history?${params.toString()}`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);
    fetchHistory();
  };

  const resetFilters = () => {
    setFilters({
      cruiseId: '',
      cabinCategory: '',
      changeReason: '',
      startDate: '',
      endDate: '',
    });
    setLoading(true);
    setTimeout(() => fetchHistory(), 100);
  };

  const exportToCSV = () => {
    const headers = ['날짜', '크루즈 ID', '객실 유형', '이전 가격', '새 가격', '변경률', '변경 사유', '변경자'];
    const rows = history.map((h) => [
      new Date(h.changedAt).toLocaleString('ko-KR'),
      h.cruiseId,
      h.cabinCategory,
      `$${h.oldPrice.toFixed(2)}`,
      `$${h.newPrice.toFixed(2)}`,
      `${getChangePercentage(h.oldPrice, h.newPrice).toFixed(1)}%`,
      getReasonLabel(h.changeReason),
      h.changedBy,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getChangePercentage = (oldPrice: number, newPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inventory: '재고 변동',
      demand: '수요 변동',
      promotion: '프로모션',
      manual: '수동 조정',
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      inventory: 'bg-blue-100 text-blue-800',
      demand: 'bg-purple-100 text-purple-800',
      promotion: 'bg-green-100 text-green-800',
      manual: 'bg-gray-100 text-gray-800',
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">가격 변동 이력</h1>
          <p className="text-gray-600 mt-1">모든 가격 변경 내역을 추적하고 분석합니다</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            필터
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV 내보내기
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">필터 옵션</h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">크루즈 ID</label>
              <input
                type="text"
                value={filters.cruiseId}
                onChange={(e) => setFilters({ ...filters, cruiseId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="MSC123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">객실 유형</label>
              <select
                value={filters.cabinCategory}
                onChange={(e) => setFilters({ ...filters, cabinCategory: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">전체</option>
                <option value="inside">내부</option>
                <option value="oceanview">오션뷰</option>
                <option value="balcony">발코니</option>
                <option value="suite">스위트</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">변경 사유</label>
              <select
                value={filters.changeReason}
                onChange={(e) => setFilters({ ...filters, changeReason: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">전체</option>
                <option value="inventory">재고 변동</option>
                <option value="demand">수요 변동</option>
                <option value="promotion">프로모션</option>
                <option value="manual">수동 조정</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">시작일</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">종료일</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              초기화
            </Button>
            <Button onClick={applyFilters}>적용</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">날짜/시간</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">크루즈 ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">객실 유형</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">이전 가격</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">→</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">새 가격</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">변경률</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">변경 사유</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">변경자</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const changePercent = getChangePercentage(item.oldPrice, item.newPrice);
                const isIncrease = changePercent > 0;

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(item.changedAt)}</td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{item.cruiseId}</code>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{item.cabinCategory}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm">${item.oldPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {isIncrease ? (
                        <TrendingUp className="w-4 h-4 text-red-600 mx-auto" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold">${item.newPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isIncrease ? '+' : ''}
                        {changePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getReasonColor(item.changeReason)}`}>
                        {getReasonLabel(item.changeReason)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.changedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {history.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            {Object.values(filters).some((v) => v) ? '필터 조건에 맞는 이력이 없습니다' : '가격 변동 이력이 없습니다'}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>💡 팁: 5% 이상의 가격 변경만 자동으로 기록됩니다</p>
      </div>
    </div>
  );
}
