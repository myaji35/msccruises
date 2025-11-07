"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Euro, X, ChevronUp, ChevronDown } from "lucide-react";

interface ExchangeRate {
  USD: number;
  EUR: number;
  JPY: number;
}

export default function ExchangeRateWidget() {
  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // 환율 정보 가져오기
    const fetchRates = async () => {
      try {
        // 한국은행 API 대신 무료 exchangerate-api 사용
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        const data = await response.json();

        // KRW 기준이므로 역수를 계산 (1 USD = ? KRW)
        const usdRate = 1 / data.rates.USD;
        const eurRate = 1 / data.rates.EUR;
        const jpyRate = 1 / data.rates.JPY;

        setRates({
          USD: Math.round(usdRate * 100) / 100,
          EUR: Math.round(eurRate * 100) / 100,
          JPY: Math.round(jpyRate * 100) / 100,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error('환율 정보를 가져오는데 실패했습니다:', error);
        // 실패시 임시 데이터 사용
        setRates({
          USD: 1320.50,
          EUR: 1445.20,
          JPY: 9.15,
        });
        setLastUpdated(new Date());
      }
    };

    fetchRates();

    // 10분마다 환율 업데이트
    const interval = setInterval(fetchRates, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div
        className="fixed top-20 right-4 bg-gradient-to-br from-[#003366] to-[#004080] text-white rounded-full p-3 shadow-lg cursor-pointer hover:scale-110 transition-transform z-50"
        onClick={() => setIsMinimized(false)}
      >
        <DollarSign className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 z-50 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-gradient-to-br from-[#003366] to-[#004080] p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#003366]">실시간 환율</h3>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} 업데이트
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            title={isExpanded ? "접기" : "펼치기"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            title="최소화"
          >
            <TrendingDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exchange Rates - Only show when expanded */}
      {isExpanded && (
        <>
          {rates ? (
            <div className="space-y-3 transition-all duration-300">
              {/* USD */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white font-bold px-2 py-1 rounded text-sm">
                    USD
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">미국 달러</div>
                    <div className="font-bold text-lg text-[#003366]">
                      ₩{rates.USD.toLocaleString()}
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>

              {/* EUR */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 text-white font-bold px-2 py-1 rounded text-sm">
                    EUR
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">유로</div>
                    <div className="font-bold text-lg text-[#003366]">
                      ₩{rates.EUR.toLocaleString()}
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>

              {/* JPY */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 text-white font-bold px-2 py-1 rounded text-sm">
                    JPY
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">일본 엔화 (100엔)</div>
                    <div className="font-bold text-lg text-[#003366]">
                      ₩{(rates.JPY * 100).toLocaleString()}
                    </div>
                  </div>
                </div>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-2"></div>
              <p className="text-sm">환율 정보를 불러오는 중...</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              크루즈 요금은 USD 기준으로 책정됩니다
            </p>
          </div>
        </>
      )}
    </div>
  );
}
