# 크루즈 항로 관리 기능 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 스키마 업데이트
- `CruiseItinerary` 모델 개선
- 출발/경유/도착 구분 (`portType` 필드)
- GPS 좌표 추가 (`latitude`, `longitude`)
- 항구 코드 추가 (`portCode`)
- Migration 완료: `20251103065909_enhance_cruise_itinerary`

---

## 📊 항로 데이터 구조

### CruiseItinerary 모델

```prisma
model CruiseItinerary {
  id              String   @id @default(cuid())
  cruiseId        String
  day             Int      // Day number (1-based)
  portType        String   // "departure", "port_of_call", "arrival"
  port            String   // Port name
  portCode        String?  // IATA/port code (e.g., MIA, BCN)
  country         String?  // Country name
  latitude        Float?   // GPS coordinates
  longitude       Float?   // GPS coordinates
  arrival         String?  // Time of arrival (HH:MM format)
  departure       String?  // Time of departure (HH:MM format)
  durationHours   Int?     // Hours spent at port
  activities      String?  // JSON array of activities
  description     String?  // Port description
  imageUrl        String?  // Port image
  order           Int      @default(0) // Display order
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### portType 값

| 값 | 설명 | 예시 |
|----|------|------|
| `departure` | 출발 항구 | Day 1: Miami 출발 |
| `port_of_call` | 경유 항구 | Day 2-6: 중간 경유지 |
| `arrival` | 최종 도착 항구 | Day 7: Miami 도착 (왕복) |

---

## 🎯 사용 예시

### 예시 1: 7박 8일 카리브해 크루즈

```
Day 1 (출발): Miami, FL, USA
  - portType: "departure"
  - departure: "17:00"
  - description: "마이애미 항구에서 출발"

Day 2 (경유): At Sea
  - portType: "port_of_call"
  - port: "At Sea"
  - description: "선상 활동 및 휴식"

Day 3 (경유): Cozumel, Mexico
  - portType: "port_of_call"
  - arrival: "08:00"
  - departure: "18:00"
  - durationHours: 10
  - activities: ["스노클링", "마야 유적 투어", "해변 휴식"]

Day 4 (경유): George Town, Grand Cayman
  - portType: "port_of_call"
  - arrival: "07:00"
  - departure: "16:00"
  - durationHours: 9
  - activities: ["Seven Mile Beach", "스팅레이 시티"]

Day 5 (경유): Falmouth, Jamaica
  - portType: "port_of_call"
  - arrival: "08:00"
  - departure: "17:00"
  - durationHours: 9
  - activities: ["던스 리버 폭포", "밥 말리 박물관"]

Day 6 (경유): At Sea
  - portType: "port_of_call"

Day 7 (경유): At Sea
  - portType: "port_of_call"

Day 8 (도착): Miami, FL, USA
  - portType: "arrival"
  - arrival: "07:00"
  - description: "마이애미 항구 도착 및 하선"
```

---

## 🛠 구현 계획

### Phase 1: 항로 관리 컴포넌트

#### 파일: `/components/admin/ItineraryManager.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Clock, Calendar } from "lucide-react";

interface Itinerary {
  id?: string;
  day: number;
  portType: "departure" | "port_of_call" | "arrival";
  port: string;
  portCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  arrival?: string;
  departure?: string;
  durationHours?: number;
  activities?: string[];
  description?: string;
  imageUrl?: string;
  order: number;
}

interface ItineraryManagerProps {
  cruiseId?: string;
  itineraries: Itinerary[];
  onChange: (itineraries: Itinerary[]) => void;
}

export default function ItineraryManager({
  cruiseId,
  itineraries,
  onChange,
}: ItineraryManagerProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const addDay = () => {
    const newDay: Itinerary = {
      day: itineraries.length + 1,
      portType: "port_of_call",
      port: "",
      order: itineraries.length,
    };
    onChange([...itineraries, newDay]);
  };

  const removeDay = (index: number) => {
    const updated = itineraries.filter((_, i) => i !== index);
    // Re-number days
    const renumbered = updated.map((item, i) => ({
      ...item,
      day: i + 1,
      order: i,
    }));
    onChange(renumbered);
  };

  const updateDay = (index: number, field: keyof Itinerary, value: any) => {
    const updated = [...itineraries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getPortTypeLabel = (type: string) => {
    switch (type) {
      case "departure":
        return "🛫 출발";
      case "arrival":
        return "🛬 도착";
      case "port_of_call":
        return "⚓ 경유";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">항로 일정</h3>
        <Button onClick={addDay} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          일정 추가
        </Button>
      </div>

      {itineraries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">아직 항로 일정이 없습니다</p>
          <Button onClick={addDay} variant="outline">
            첫 일정 추가하기
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {itineraries.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    일차
                  </label>
                  <input
                    type="number"
                    value={item.day}
                    onChange={(e) =>
                      updateDay(index, "day", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>

                {/* Port Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    구분
                  </label>
                  <select
                    value={item.portType}
                    onChange={(e) => updateDay(index, "portType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="departure">🛫 출발</option>
                    <option value="port_of_call">⚓ 경유</option>
                    <option value="arrival">🛬 도착</option>
                  </select>
                </div>

                {/* Port Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    항구명
                  </label>
                  <input
                    type="text"
                    value={item.port}
                    onChange={(e) => updateDay(index, "port", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: Cozumel, Mexico"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    국가
                  </label>
                  <input
                    type="text"
                    value={item.country || ""}
                    onChange={(e) => updateDay(index, "country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: Mexico"
                  />
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    도착 시간
                  </label>
                  <input
                    type="time"
                    value={item.arrival || ""}
                    onChange={(e) => updateDay(index, "arrival", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    출발 시간
                  </label>
                  <input
                    type="time"
                    value={item.departure || ""}
                    onChange={(e) => updateDay(index, "departure", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    체류 시간 (시간)
                  </label>
                  <input
                    type="number"
                    value={item.durationHours || ""}
                    onChange={(e) =>
                      updateDay(
                        index,
                        "durationHours",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="예: 8"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-end">
                  <Button
                    onClick={() => removeDay(index)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) => updateDay(index, "description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="이 항구에 대한 설명을 입력하세요..."
                />
              </div>

              {/* Activities */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  액티비티 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={item.activities?.join(", ") || ""}
                  onChange={(e) =>
                    updateDay(
                      index,
                      "activities",
                      e.target.value ? e.target.value.split(",").map((a) => a.trim()) : []
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="예: 스노클링, 마야 유적 투어, 해변 휴식"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Phase 2: API Routes

#### 파일: `/app/api/admin/cruises/[id]/itineraries/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruises/[id]/itineraries
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const itineraries = await prisma.cruiseItinerary.findMany({
      where: { cruiseId: id },
      orderBy: [{ day: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ itineraries });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch itineraries", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/cruises/[id]/itineraries
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itineraries } = body;

    // Delete existing itineraries
    await prisma.cruiseItinerary.deleteMany({
      where: { cruiseId: id },
    });

    // Create new itineraries
    if (itineraries && itineraries.length > 0) {
      await prisma.cruiseItinerary.createMany({
        data: itineraries.map((item: any, index: number) => ({
          cruiseId: id,
          day: item.day,
          portType: item.portType,
          port: item.port,
          portCode: item.portCode || null,
          country: item.country || null,
          latitude: item.latitude || null,
          longitude: item.longitude || null,
          arrival: item.arrival || null,
          departure: item.departure || null,
          durationHours: item.durationHours || null,
          activities: item.activities ? JSON.stringify(item.activities) : null,
          description: item.description || null,
          imageUrl: item.imageUrl || null,
          order: index,
        })),
      });
    }

    const updated = await prisma.cruiseItinerary.findMany({
      where: { cruiseId: id },
      orderBy: [{ day: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ success: true, itineraries: updated });
  } catch (error: any) {
    console.error("[Itinerary Update Error]", error);
    return NextResponse.json(
      { error: "Failed to update itineraries", message: error.message },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: 크루즈 등록/수정 페이지에 통합

#### 수정 파일: `/app/admin/cruises/new/page.tsx`

항로 관리 섹션 추가:

```typescript
import ItineraryManager from "@/components/admin/ItineraryManager";

// ... 기존 코드 ...

const [itineraries, setItineraries] = useState<Itinerary[]>([]);

// Form 내부에 추가:
<section className="bg-white rounded-xl p-6 shadow-sm">
  <h2 className="text-xl font-bold mb-6 text-gray-900">항로 일정</h2>
  <ItineraryManager
    itineraries={itineraries}
    onChange={setItineraries}
  />
</section>
```

---

### Phase 4: 항로 정보 표시 (고객용)

#### 파일: `/components/ItineraryTimeline.tsx`

```typescript
"use client";

import { MapPin, Clock, Calendar, Ship } from "lucide-react";

interface Itinerary {
  day: number;
  portType: string;
  port: string;
  country?: string;
  arrival?: string;
  departure?: string;
  durationHours?: number;
  activities?: string[];
  description?: string;
}

interface ItineraryTimelineProps {
  itineraries: Itinerary[];
}

export default function ItineraryTimeline({ itineraries }: ItineraryTimelineProps) {
  const getPortIcon = (type: string) => {
    switch (type) {
      case "departure":
        return "🛫";
      case "arrival":
        return "🛬";
      case "port_of_call":
        return "⚓";
      default:
        return "📍";
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-500"></div>

      <div className="space-y-8">
        {itineraries.map((item, index) => (
          <div key={index} className="relative flex gap-6">
            {/* Day marker */}
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
              Day {item.day}
            </div>

            {/* Content */}
            <div className="flex-grow bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPortIcon(item.portType)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{item.port}</h3>
                  </div>
                  {item.country && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.country}
                    </p>
                  )}
                </div>

                {item.durationHours && (
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">체류 시간</p>
                    <p className="font-bold text-blue-600">{item.durationHours}시간</p>
                  </div>
                )}
              </div>

              {/* Times */}
              {(item.arrival || item.departure) && (
                <div className="flex gap-6 mb-3">
                  {item.arrival && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm">도착: </span>
                      <span className="font-semibold">{item.arrival}</span>
                    </div>
                  )}
                  {item.departure && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">출발: </span>
                      <span className="font-semibold">{item.departure}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 mb-3">{item.description}</p>
              )}

              {/* Activities */}
              {item.activities && item.activities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    추천 액티비티:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.activities.map((activity, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🗺 항로 지도 표시 (선택사항)

### Google Maps 또는 Mapbox 연동

#### 파일: `/components/ItineraryMap.tsx`

```typescript
"use client";

import { useEffect, useRef } from "react";

interface Itinerary {
  port: string;
  latitude?: number;
  longitude?: number;
  portType: string;
}

interface ItineraryMapProps {
  itineraries: Itinerary[];
}

export default function ItineraryMap({ itineraries }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Filter itineraries with coordinates
    const portsWithCoords = itineraries.filter(
      (i) => i.latitude && i.longitude
    );

    if (portsWithCoords.length === 0) return;

    // Initialize map (example with Google Maps)
    const map = new google.maps.Map(mapRef.current, {
      center: {
        lat: portsWithCoords[0].latitude!,
        lng: portsWithCoords[0].longitude!,
      },
      zoom: 6,
    });

    // Add markers
    portsWithCoords.forEach((port, index) => {
      const marker = new google.maps.Marker({
        position: { lat: port.latitude!, lng: port.longitude! },
        map: map,
        title: port.port,
        label: (index + 1).toString(),
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div>
          <h3>${port.port}</h3>
          <p>${port.portType === "departure" ? "출발" : port.portType === "arrival" ? "도착" : "경유"}</p>
        </div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Draw route line
    const path = portsWithCoords.map((p) => ({
      lat: p.latitude!,
      lng: p.longitude!,
    }));

    new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#0066FF",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map,
    });
  }, [itineraries]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg"
    ></div>
  );
}
```

---

## 📝 데이터 예시

### API 요청 예시

```json
POST /api/admin/cruises/{cruiseId}/itineraries

{
  "itineraries": [
    {
      "day": 1,
      "portType": "departure",
      "port": "Miami, FL",
      "portCode": "MIA",
      "country": "USA",
      "latitude": 25.7617,
      "longitude": -80.1918,
      "departure": "17:00",
      "description": "마이애미 항구에서 출발"
    },
    {
      "day": 2,
      "portType": "port_of_call",
      "port": "At Sea",
      "description": "선상 활동 및 휴식"
    },
    {
      "day": 3,
      "portType": "port_of_call",
      "port": "Cozumel",
      "portCode": "CZM",
      "country": "Mexico",
      "latitude": 20.5083,
      "longitude": -86.9458,
      "arrival": "08:00",
      "departure": "18:00",
      "durationHours": 10,
      "activities": ["스노클링", "마야 유적 투어", "해변 휴식"],
      "description": "멕시코 코수멜 섬에서의 하루"
    }
  ]
}
```

---

## 🚀 구현 우선순위

### Phase 1 (High Priority)
- [x] DB 스키마 업데이트
- [ ] ItineraryManager 컴포넌트 구현
- [ ] 항로 관리 API (CRUD)
- [ ] 크루즈 등록/수정 페이지에 통합

### Phase 2 (Medium Priority)
- [ ] 고객용 항로 타임라인 표시
- [ ] 항로 정보 프리뷰
- [ ] 항로 템플릿 (인기 경로 저장/재사용)

### Phase 3 (Low Priority)
- [ ] 항로 지도 시각화 (Google Maps/Mapbox)
- [ ] GPS 좌표 자동 입력 (Geocoding API)
- [ ] 항구 정보 데이터베이스 (별도 Port 모델)

---

## 💡 사용 팁

### 1. "At Sea" 일정 표시
바다 위에서 보내는 날은 다음과 같이 입력:
```
port: "At Sea"
description: "선상 활동 및 휴식"
activities: ["수영장", "스파", "쇼 관람", "피트니스"]
```

### 2. 왕복 크루즈
출발지와 도착지가 같은 경우:
```
Day 1: departure (Miami)
Day 2-6: port_of_call (경유지들)
Day 7: arrival (Miami)
```

### 3. 편도 크루즈
출발지와 도착지가 다른 경우:
```
Day 1: departure (Barcelona)
Day 2-6: port_of_call (경유지들)
Day 7: arrival (Rome)
```

---

## 🔗 관련 API

- **Google Geocoding API**: 항구명 → GPS 좌표 변환
- **Google Maps JavaScript API**: 지도 표시
- **Mapbox GL JS**: 대안 지도 솔루션 (무료 티어 generous)

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-11-03
**작성자**: Claude Code Assistant
