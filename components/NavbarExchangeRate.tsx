"use client";

import { useState, useEffect } from "react";
import { DollarSign, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";

interface ExchangeRate {
  USD: number;
  EUR: number;
  JPY: number;
}

export default function NavbarExchangeRate() {
  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        const data = await response.json();

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
        setRates({
          USD: 1320.50,
          EUR: 1445.20,
          JPY: 9.15,
        });
        setLastUpdated(new Date());
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!rates) {
    return (
      <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <DollarSign className="w-4 h-4 animate-pulse" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Compact Display - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#FFD700]" />
          <div className="text-left">
            <div className="text-white font-semibold text-sm">
              USD ₩{rates.USD.toLocaleString()}
            </div>
            {lastUpdated && (
              <div className="text-white/60 text-xs">
                {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>

      {/* Expanded Panel - Shows All Rates */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 z-50 animate-in slide-in-from-top">
          <div className="mb-3 pb-3 border-b border-gray-200">
            <h3 className="font-bold text-[#003366] text-sm mb-1">실시간 환율</h3>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })} 업데이트
              </p>
            )}
          </div>

          <div className="space-y-2">
            {/* USD */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white font-bold px-2 py-1 rounded text-xs">
                  USD
                </div>
                <div>
                  <div className="text-xs text-gray-600">미국 달러</div>
                  <div className="font-bold text-base text-[#003366]">
                    ₩{rates.USD.toLocaleString()}
                  </div>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>

            {/* EUR */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 text-white font-bold px-2 py-1 rounded text-xs">
                  EUR
                </div>
                <div>
                  <div className="text-xs text-gray-600">유로</div>
                  <div className="font-bold text-base text-[#003366]">
                    ₩{rates.EUR.toLocaleString()}
                  </div>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>

            {/* JPY */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-bold px-2 py-1 rounded text-xs">
                  JPY
                </div>
                <div>
                  <div className="text-xs text-gray-600">일본 엔화 (100엔)</div>
                  <div className="font-bold text-base text-[#003366]">
                    ₩{(rates.JPY * 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 크루즈 요금은 USD 기준으로 책정됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
