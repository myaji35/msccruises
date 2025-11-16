'use client';

import React, { useState } from 'react';
import { X, AlertCircle, DollarSign, RefreshCw } from 'lucide-react';

interface RefundModalProps {
  paymentId: string;
  maxAmount: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundModal({
  paymentId,
  maxAmount,
  currency,
  onClose,
  onSuccess,
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState(maxAmount);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = refundType === 'full' ? maxAmount : refundAmount;

      if (amount <= 0) {
        throw new Error('환불 금액은 0보다 커야 합니다.');
      }

      if (amount > maxAmount) {
        throw new Error('환불 금액이 결제 금액을 초과할 수 없습니다.');
      }

      const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundType === 'full' ? undefined : amount,
          reason: reason || 'Customer requested refund',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '환불 요청에 실패했습니다.');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '환불 요청에 실패했습니다.');
      }

      // Success
      onSuccess();
    } catch (err: any) {
      console.error('Refund error:', err);
      setError(err.message || '환불 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            환불 요청
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">오류</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              환불 유형
            </label>
            <div className="space-y-3">
              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${refundType === 'full' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input
                  type="radio"
                  name="refundType"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType('full')}
                  className="sr-only"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">전액 환불</p>
                  <p className="text-sm text-gray-600">
                    ${maxAmount.toLocaleString()} {currency} 전액 환불
                  </p>
                </div>
              </label>

              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${refundType === 'partial' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input
                  type="radio"
                  name="refundType"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType('partial')}
                  className="sr-only"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900">부분 환불</p>
                  <p className="text-sm text-gray-600">일부 금액만 환불</p>
                </div>
              </label>
            </div>
          </div>

          {/* Partial Refund Amount */}
          {refundType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 금액
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                  min="0.01"
                  max={maxAmount}
                  step="0.01"
                  required
                  className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-0 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">{currency}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                최대 환불 가능 금액: ${maxAmount.toLocaleString()} {currency}
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 사유 (선택)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="환불 사유를 입력해주세요"
              className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-0 transition-colors resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">환불 안내</p>
                <ul className="space-y-1 text-xs">
                  <li>• 환불은 원래 결제 수단으로 처리됩니다</li>
                  <li>• 환불 처리에는 영업일 기준 3-7일이 소요될 수 있습니다</li>
                  <li>• 환불 후 예약은 자동으로 취소됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-700">환불 금액</span>
              <span className="text-blue-600">
                ${(refundType === 'full' ? maxAmount : refundAmount).toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>환불 요청</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
