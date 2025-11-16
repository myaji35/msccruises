'use client';

import React, { useState } from 'react';
import { Check, X, Info, ZoomIn, ZoomOut } from 'lucide-react';

interface Cabin {
  number: string;
  deck: number;
  category: string;
  position: { x: number; y: number };
  available: boolean;
  price: number;
}

interface DeckPlanProps {
  selectedCategory: string;
  onSelectCabin: (cabin: Cabin) => void;
  selectedCabinNumber?: string;
}

// Mock deck data - 실제로는 API에서 가져올 것
const generateMockDeck = (deckNumber: number, category: string): Cabin[] => {
  const cabins: Cabin[] = [];
  const categoryConfig = {
    inside: { count: 40, basePrice: 1500 },
    oceanview: { count: 30, basePrice: 2000 },
    balcony: { count: 25, basePrice: 2500 },
    suite: { count: 10, basePrice: 4000 },
  };

  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.inside;
  const cabinsPerRow = 10;
  const rows = Math.ceil(config.count / cabinsPerRow);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cabinsPerRow; col++) {
      const index = row * cabinsPerRow + col;
      if (index >= config.count) break;

      const cabinNumber = `${deckNumber}${String(index + 1).padStart(3, '0')}`;

      cabins.push({
        number: cabinNumber,
        deck: deckNumber,
        category,
        position: {
          x: col * 60 + 40,
          y: row * 50 + 40,
        },
        available: Math.random() > 0.3, // 70% 가용성
        price: config.basePrice + Math.random() * 500,
      });
    }
  }

  return cabins;
};

export default function DeckPlan({ selectedCategory, onSelectCabin, selectedCabinNumber }: DeckPlanProps) {
  const [selectedDeck, setSelectedDeck] = useState(8);
  const [zoom, setZoom] = useState(1);
  const [hoveredCabin, setHoveredCabin] = useState<string | null>(null);

  const decks = [6, 7, 8, 9, 10, 11, 12]; // 사용 가능한 덱
  const cabins = generateMockDeck(selectedDeck, selectedCategory);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const getCabinColor = (cabin: Cabin, isHovered: boolean, isSelected: boolean) => {
    if (!cabin.available) return '#E5E7EB'; // gray-200
    if (isSelected) return '#2563EB'; // blue-600
    if (isHovered) return '#60A5FA'; // blue-400

    // 카테고리별 색상
    const colors = {
      inside: '#93C5FD', // blue-300
      oceanview: '#A5B4FC', // indigo-300
      balcony: '#C4B5FD', // purple-300
      suite: '#FCD34D', // amber-300
    };
    return colors[cabin.category as keyof typeof colors] || colors.inside;
  };

  const getCabinStrokeColor = (cabin: Cabin, isHovered: boolean, isSelected: boolean) => {
    if (!cabin.available) return '#9CA3AF'; // gray-400
    if (isSelected) return '#1E40AF'; // blue-800
    if (isHovered) return '#2563EB'; // blue-600
    return '#6B7280'; // gray-500
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">덱 플랜</h3>
            <p className="text-sm text-gray-600">원하는 객실을 클릭하여 선택하세요</p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={zoom <= 0.6}
            >
              <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={zoom >= 2}
            >
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Deck Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {decks.map((deck) => (
            <button
              key={deck}
              onClick={() => setSelectedDeck(deck)}
              className={`
                px-4 py-2 rounded-lg font-medium transition whitespace-nowrap
                ${selectedDeck === deck
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Deck {deck}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300 border border-gray-500 rounded" />
            <span className="text-gray-700">선택 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded" />
            <span className="text-gray-700">예약 완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border border-blue-800 rounded" />
            <span className="text-gray-700">현재 선택</span>
          </div>
        </div>
      </div>

      {/* Deck Plan SVG */}
      <div className="overflow-auto border border-gray-200 rounded-lg bg-gradient-to-b from-blue-50 to-white">
        <svg
          width={700 * zoom}
          height={400 * zoom}
          className="mx-auto"
          style={{ minWidth: '100%' }}
        >
          {/* Ship Outline */}
          <path
            d="M 50 50 L 650 50 L 680 200 L 650 350 L 50 350 L 20 200 Z"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Bow (앞) Label */}
          <text x={680} y={30} fontSize={zoom * 14} fill="#64748B" textAnchor="middle">
            ▲ 선수 (Bow)
          </text>

          {/* Stern (뒤) Label */}
          <text x={20} y={30} fontSize={zoom * 14} fill="#64748B" textAnchor="middle">
            선미 (Stern)
          </text>

          {/* Port Side Label */}
          <text x={350} y={25} fontSize={zoom * 12} fill="#64748B" textAnchor="middle">
            Port (좌현)
          </text>

          {/* Starboard Side Label */}
          <text x={350} y={380} fontSize={zoom * 12} fill="#64748B" textAnchor="middle">
            Starboard (우현)
          </text>

          {/* Cabins */}
          {cabins.map((cabin) => {
            const isHovered = hoveredCabin === cabin.number;
            const isSelected = selectedCabinNumber === cabin.number;
            const fillColor = getCabinColor(cabin, isHovered, isSelected);
            const strokeColor = getCabinStrokeColor(cabin, isHovered, isSelected);

            return (
              <g key={cabin.number}>
                <rect
                  x={cabin.position.x * zoom}
                  y={cabin.position.y * zoom}
                  width={40 * zoom}
                  height={35 * zoom}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : 1}
                  rx={4 * zoom}
                  className={cabin.available ? 'cursor-pointer' : 'cursor-not-allowed'}
                  onMouseEnter={() => cabin.available && setHoveredCabin(cabin.number)}
                  onMouseLeave={() => setHoveredCabin(null)}
                  onClick={() => cabin.available && onSelectCabin(cabin)}
                />

                {/* Cabin Number */}
                <text
                  x={(cabin.position.x + 20) * zoom}
                  y={(cabin.position.y + 20) * zoom}
                  fontSize={zoom * 10}
                  fill={isSelected ? 'white' : cabin.available ? '#374151' : '#9CA3AF'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                >
                  {cabin.number.slice(-3)}
                </text>

                {/* Availability Icon */}
                {!cabin.available && (
                  <circle
                    cx={(cabin.position.x + 32) * zoom}
                    cy={(cabin.position.y + 8) * zoom}
                    r={4 * zoom}
                    fill="#EF4444"
                  />
                )}

                {isSelected && (
                  <circle
                    cx={(cabin.position.x + 32) * zoom}
                    cy={(cabin.position.y + 8) * zoom}
                    r={4 * zoom}
                    fill="white"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered Cabin Info */}
      {hoveredCabin && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                객실 {hoveredCabin}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                {cabins.find((c) => c.number === hoveredCabin)?.available
                  ? `$${cabins.find((c) => c.number === hoveredCabin)?.price.toLocaleString()} - 예약 가능`
                  : '이미 예약된 객실입니다'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Cabin Info */}
      {selectedCabinNumber && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">
                  선택한 객실: {selectedCabinNumber}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Deck {selectedDeck} · {selectedCategory.toUpperCase()}
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-green-900">
              ${cabins.find((c) => c.number === selectedCabinNumber)?.price.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">전체 객실</p>
          <p className="text-2xl font-bold text-gray-900">{cabins.length}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">예약 가능</p>
          <p className="text-2xl font-bold text-green-700">
            {cabins.filter((c) => c.available).length}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">예약 완료</p>
          <p className="text-2xl font-bold text-red-700">
            {cabins.filter((c) => !c.available).length}
          </p>
        </div>
      </div>
    </div>
  );
}
