# Zustand 상태관리 사용 가이드

## ✅ 완료된 작업

### 1. Next.js 16으로 업그레이드
- ✅ Next.js 16.0.1
- ✅ React 19.2.0
- ✅ Turbopack 활성화

### 2. Zustand 설치 및 Store 구현
- ✅ useBookingStore - 예약 프로세스 관리
- ✅ useSearchStore - 크루즈 검색/필터 관리

---

## 📦 설치된 패키지

```json
{
  "zustand": "^5.0.3",
  "next": "16.0.1",
  "react": "19.2.0",
  "react-dom": "19.2.0"
}
```

---

## 🎯 Store 사용 예제

### 1. **useBookingStore 사용법**

#### 기본 사용 예제

```typescript
'use client';

import { useBookingStore } from '@/stores/useBookingStore';

export default function CruiseSelection() {
  // Store에서 필요한 것만 선택적으로 가져오기
  const { 
    cruiseName, 
    departureDate, 
    setCruise, 
    passengers,
    addPassenger 
  } = useBookingStore();

  const handleSelectCruise = () => {
    setCruise({
      id: 'cruise-123',
      name: '지중해 크루즈',
      itineraryId: 'itin-456',
      shipName: 'MSC Seaside',
      departureDate: '2025-06-15',
      returnDate: '2025-06-22',
      departurePort: 'Barcelona',
      durationDays: 7,
      basePrice: 1500
    });
  };

  const handleAddPassenger = () => {
    addPassenger({
      firstName: '홍',
      lastName: '길동',
      dateOfBirth: '1990-01-01',
      nationality: 'KR',
      gender: 'male',
      isMainPassenger: true
    });
  };

  return (
    <div>
      <h2>{cruiseName || '크루즈를 선택하세요'}</h2>
      <p>승객 수: {passengers.length}</p>
      <button onClick={handleSelectCruise}>크루즈 선택</button>
      <button onClick={handleAddPassenger}>승객 추가</button>
    </div>
  );
}
```

#### 예약 플로우 전체 예제

```typescript
'use client';

import { useBookingStore } from '@/stores/useBookingStore';

export default function BookingFlow() {
  const { 
    currentStep,
    cruiseName,
    cabin,
    passengers,
    totalPrice,
    setCurrentStep,
    setCabin,
    calculateTotal
  } = useBookingStore();

  // 단계별 렌더링
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <Step active={currentStep === 'cruise'}>크루즈 선택</Step>
          <Step active={currentStep === 'cabin'}>객실 선택</Step>
          <Step active={currentStep === 'flight'}>항공편 선택</Step>
          <Step active={currentStep === 'passengers'}>승객 정보</Step>
          <Step active={currentStep === 'payment'}>결제</Step>
        </div>
      </div>

      {/* 현재 선택 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">예약 정보</h3>
        <p>크루즈: {cruiseName || '-'}</p>
        <p>객실: {cabin.category || '-'}</p>
        <p>승객: {passengers.length}명</p>
        <p className="text-2xl font-bold mt-4">
          총 금액: ${totalPrice.toLocaleString()}
        </p>
      </div>

      {/* 단계별 컨텐츠 */}
      {currentStep === 'cabin' && (
        <CabinSelection 
          onSelect={(cabin) => {
            setCabin(cabin);
            calculateTotal();
            setCurrentStep('flight');
          }} 
        />
      )}
    </div>
  );
}
```

### 2. **useSearchStore 사용법**

#### 검색 필터 예제

```typescript
'use client';

import { useSearchStore } from '@/stores/useSearchStore';

export default function CruiseSearchPage() {
  const { 
    filters,
    sortBy,
    page,
    setFilter,
    setSortBy,
    setPage,
    resetFilters 
  } = useSearchStore();

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar Filters */}
      <div className="col-span-3">
        <h3 className="font-bold mb-4">필터</h3>

        {/* Destination */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            목적지
          </label>
          <select
            value={filters.destination || ''}
            onChange={(e) => setFilter('destination', e.target.value || null)}
            className="w-full p-2 border rounded"
          >
            <option value="">전체</option>
            <option value="mediterranean">지중해</option>
            <option value="caribbean">카리브해</option>
            <option value="asia">아시아</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            가격 범위
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-600">
            최대: ${filters.maxPrice.toLocaleString()}
          </p>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            기간
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="최소"
              value={filters.minDuration || ''}
              onChange={(e) => setFilter('minDuration', parseInt(e.target.value) || null)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="최대"
              value={filters.maxDuration || ''}
              onChange={(e) => setFilter('maxDuration', parseInt(e.target.value) || null)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">빠른 필터</h4>
          <button 
            onClick={() => useSearchStore.getState().setQuickFilter('luxury')}
            className="w-full mb-2 p-2 border rounded hover:bg-gray-100"
          >
            럭셔리 크루즈
          </button>
          <button 
            onClick={() => useSearchStore.getState().setQuickFilter('family')}
            className="w-full mb-2 p-2 border rounded hover:bg-gray-100"
          >
            가족 여행
          </button>
        </div>

        <button 
          onClick={resetFilters}
          className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          필터 초기화
        </button>
      </div>

      {/* Cruise List */}
      <div className="col-span-9">
        {/* Sort Options */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">검색 결과: 총 48개</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="popular">인기순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
            <option value="duration-asc">기간 짧은순</option>
            <option value="duration-desc">기간 긴순</option>
            <option value="departure">출발일 빠른순</option>
          </select>
        </div>

        {/* Cruise Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Map your cruise data here */}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button 
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2">{page}</span>
          <button 
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 검색 쿼리와 결합

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';

export default function CruiseSearchResults() {
  const { filters, sortBy, page, pageSize } = useSearchStore();
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Store 상태가 변경될 때마다 API 호출
    fetchCruises();
  }, [filters, sortBy, page]);

  const fetchCruises = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        destination: filters.destination || '',
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        sortBy,
        page: page.toString(),
        limit: pageSize.toString(),
      });

      const response = await fetch(`/api/cruises?${queryParams}`);
      const data = await response.json();
      setCruises(data.cruises);
    } catch (error) {
      console.error('Failed to fetch cruises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>검색 중...</div>;

  return (
    <div>
      {cruises.map((cruise) => (
        <CruiseCard key={cruise.id} cruise={cruise} />
      ))}
    </div>
  );
}
```

---

## 💡 고급 사용법

### 1. **Selector 최적화 (리렌더링 방지)**

```typescript
// ❌ 나쁜 예: 전체 store를 가져옴
const store = useBookingStore();

// ✅ 좋은 예: 필요한 것만 선택
const passengers = useBookingStore((state) => state.passengers);
const addPassenger = useBookingStore((state) => state.addPassenger);
```

### 2. **Store 외부에서 사용**

```typescript
import { useBookingStore } from '@/stores/useBookingStore';

// 컴포넌트 외부에서도 사용 가능
const clearBookingOnLogout = () => {
  useBookingStore.getState().clearBooking();
};

// API 호출 등에서 사용
const submitBooking = async () => {
  const state = useBookingStore.getState();
  
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      cruiseId: state.cruiseId,
      passengers: state.passengers,
      totalPrice: state.totalPrice,
    }),
  });

  if (response.ok) {
    state.clearBooking();
  }
};
```

### 3. **DevTools 연동 (개발 모드)**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... your store
      }),
      { name: 'booking-storage' }
    ),
    { name: 'BookingStore' } // Redux DevTools에서 표시될 이름
  )
);
```

---

## 🚀 다음 단계

### Phase 2 (예정)
- ✅ useAuthStore - 인증 상태 관리
- ✅ useCartStore - 장바구니 관리

### Phase 3 (예정)
- ✅ useAdminStore - 관리자 기능

---

## 📚 참고 자료

- [Zustand 공식 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Next.js 16 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev/)

---

## 🎉 완료!

Phase 1 구현이 완료되었습니다. 서버를 확인해보세요:
- **개발 서버**: http://localhost:3003
- **Zustand Stores**: `stores/useBookingStore.ts`, `stores/useSearchStore.ts`
