# Zustand Store 전체 가이드

## 📦 구현된 모든 Store

### Phase 1 (완료)
- ✅ **useBookingStore** - 예약 프로세스 관리
- ✅ **useSearchStore** - 검색 및 필터 관리

### Phase 2 (완료)
- ✅ **useAuthStore** - 인증 및 사용자 관리
- ✅ **useCartStore** - 장바구니 관리

### Phase 3 (완료)
- ✅ **useAdminStore** - 관리자 대시보드

---

## 🎯 각 Store 사용 예제

### 1. useAuthStore - 인증 관리

```typescript
'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';

export default function UserProfile() {
  const {
    user,
    isAuthenticated,
    voyagersClub,
    login,
    logout,
    addPoints,
    isAdmin
  } = useAuthStore();

  // NextAuth 세션과 동기화
  useEffect(() => {
    if (session?.user) {
      login({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name!,
        userType: session.user.userType as any,
      });
    }
  }, [session]);

  return (
    <div className="p-6">
      {isAuthenticated ? (
        <>
          <h2>환영합니다, {user?.name}님!</h2>
          <p>회원 유형: {user?.userType}</p>

          {voyagersClub && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3>MSC Voyagers Club</h3>
              <p>등급: {voyagersClub.tier.toUpperCase()}</p>
              <p>포인트: {voyagersClub.points.toLocaleString()}</p>
            </div>
          )}

          {isAdmin() && (
            <Link href="/admin">
              <button className="mt-4 px-4 py-2 bg-red-600 text-white">
                관리자 패널
              </button>
            </Link>
          )}

          <button onClick={logout} className="mt-4 px-4 py-2 bg-gray-200">
            로그아웃
          </button>
        </>
      ) : (
        <button onClick={() => router.push('/login')}>
          로그인
        </button>
      )}
    </div>
  );
}
```

#### 포인트 적립 예제
```typescript
'use client';

import { useAuthStore } from '@/stores/useAuthStore';

export function BookingConfirmation({ bookingAmount }: { bookingAmount: number }) {
  const { addPoints, voyagersClub } = useAuthStore();

  const handleBookingComplete = () => {
    // 예약 금액의 1% 포인트 적립
    const pointsEarned = Math.floor(bookingAmount * 0.01);
    addPoints(pointsEarned);

    alert(`${pointsEarned} 포인트가 적립되었습니다!`);
  };

  return (
    <div>
      <p>현재 포인트: {voyagersClub?.points || 0}</p>
      <button onClick={handleBookingComplete}>예약 완료</button>
    </div>
  );
}
```

---

### 2. useCartStore - 장바구니 관리

```typescript
'use client';

import { useCartStore } from '@/stores/useCartStore';
import { useBookingStore } from '@/stores/useBookingStore';

export default function CartPage() {
  const {
    items,
    getCartCount,
    getCartTotal,
    removeFromCart,
    clearCart
  } = useCartStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        장바구니 ({getCartCount()}개)
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          장바구니가 비어있습니다
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.cruise.cruiseName}</h3>
                    <p className="text-gray-600">{item.cruise.shipName}</p>
                    <p className="text-sm text-gray-500">
                      출발: {new Date(item.cruise.departureDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      승객: {item.passengers.length}명
                    </p>
                    <p className="text-sm text-gray-500">
                      객실: {item.cabin.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${item.totalPrice.toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-red-600 text-sm hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">총 금액</span>
              <span className="text-3xl font-bold text-blue-600">
                ${getCartTotal().toLocaleString()}
              </span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
              결제하기
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg"
            >
              장바구니 비우기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

#### 장바구니에 추가하기
```typescript
'use client';

import { useCartStore } from '@/stores/useCartStore';
import { useBookingStore } from '@/stores/useBookingStore';

export function AddToCartButton() {
  const bookingState = useBookingStore();
  const { addToCart, isItemInCart } = useCartStore();

  const handleAddToCart = () => {
    // 중복 체크
    if (isItemInCart(bookingState.cruiseId!, bookingState.departureDate!)) {
      alert('이미 장바구니에 추가된 상품입니다');
      return;
    }

    addToCart({
      cruise: {
        cruiseId: bookingState.cruiseId!,
        cruiseName: bookingState.cruiseName!,
        shipName: bookingState.shipName!,
        itineraryId: bookingState.cruiseItineraryId!,
        departureDate: bookingState.departureDate!,
        returnDate: bookingState.returnDate!,
        departurePort: bookingState.departurePort!,
        durationDays: bookingState.durationDays!,
      },
      cabin: bookingState.cabin,
      passengers: bookingState.passengers,
      flight: bookingState.isPackage ? {
        outboundFlightNumber: bookingState.flightInfo.outboundFlightNumber,
        returnFlightNumber: bookingState.flightInfo.returnFlightNumber,
        totalPrice: bookingState.flightPrice,
      } : null,
      isPackage: bookingState.isPackage,
      basePrice: bookingState.cruiseBasePrice,
      totalPrice: bookingState.totalPrice,
    });

    alert('장바구니에 추가되었습니다!');
  };

  return (
    <button
      onClick={handleAddToCart}
      className="px-6 py-3 bg-green-600 text-white rounded-lg"
    >
      장바구니에 담기
    </button>
  );
}
```

---

### 3. useAdminStore - 관리자 대시보드

```typescript
'use client';

import { useAdminStore } from '@/stores/useAdminStore';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const {
    metrics,
    isLoadingMetrics,
    currentSection,
    refreshMetrics,
    setCurrentSection,
    getRevenueGrowth,
    getBookingGrowth,
  } = useAdminStore();

  useEffect(() => {
    refreshMetrics();
  }, []);

  if (isLoadingMetrics) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg">
        <nav className="p-4">
          <button
            onClick={() => setCurrentSection('dashboard')}
            className={`w-full text-left p-3 rounded ${
              currentSection === 'dashboard' ? 'bg-blue-600 text-white' : ''
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setCurrentSection('cruises')}
            className={`w-full text-left p-3 rounded ${
              currentSection === 'cruises' ? 'bg-blue-600 text-white' : ''
            }`}
          >
            크루즈 관리
          </button>
          <button
            onClick={() => setCurrentSection('sns')}
            className={`w-full text-left p-3 rounded ${
              currentSection === 'sns' ? 'bg-blue-600 text-white' : ''
            }`}
          >
            SNS 관리
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {currentSection === 'dashboard' && metrics && (
          <>
            <h1 className="text-3xl font-bold mb-8">대시보드</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm">총 예약</h3>
                <p className="text-3xl font-bold">
                  {metrics.bookingStats.totalBookings}
                </p>
                <p className="text-sm text-green-600">
                  +{getBookingGrowth().toFixed(1)}% 전월 대비
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm">총 수익</h3>
                <p className="text-3xl font-bold">
                  ${metrics.bookingStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{getRevenueGrowth().toFixed(1)}% 전월 대비
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm">활성 크루즈</h3>
                <p className="text-3xl font-bold">
                  {metrics.cruiseStats.activeCruises}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm">총 회원</h3>
                <p className="text-3xl font-bold">
                  {metrics.userStats.totalUsers}
                </p>
              </div>
            </div>

            {/* Top Selling Cruises */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">인기 크루즈</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">크루즈명</th>
                    <th className="text-right py-2">예약 수</th>
                    <th className="text-right py-2">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topSellingCruises.map((cruise) => (
                    <tr key={cruise.id} className="border-b">
                      <td className="py-3">{cruise.name}</td>
                      <td className="text-right">{cruise.bookings}</td>
                      <td className="text-right">
                        ${cruise.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
```

---

## 🔄 Store 간 연동 예제

### 예약 완료 후 여러 Store 업데이트

```typescript
'use client';

import { useBookingStore } from '@/stores/useBookingStore';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';

export async function completeBooking() {
  const booking = useBookingStore.getState();
  const cart = useCartStore.getState();
  const auth = useAuthStore.getState();

  try {
    // 1. API로 예약 전송
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cruiseId: booking.cruiseId,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        userId: auth.user?.id,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // 2. 포인트 적립
      const points = Math.floor(booking.totalPrice * 0.01);
      auth.addPoints(points);

      // 3. 예약 상태 초기화
      booking.clearBooking();

      // 4. 장바구니에서 제거 (만약 있다면)
      cart.items.forEach(item => {
        if (item.cruise.cruiseId === booking.cruiseId) {
          cart.removeFromCart(item.id);
        }
      });

      return { success: true, bookingId: data.id };
    }
  } catch (error) {
    console.error('Booking failed:', error);
    return { success: false };
  }
}
```

---

## 💡 Best Practices

### 1. 리렌더링 최적화
```typescript
// ❌ 나쁜 예
const store = useAuthStore(); // 전체 store 구독

// ✅ 좋은 예
const user = useAuthStore(state => state.user); // 필요한 것만 구독
const logout = useAuthStore(state => state.logout);
```

### 2. TypeScript 활용
```typescript
// Store의 타입을 export하여 다른 곳에서 사용
import type { User } from '@/stores/useAuthStore';

const displayUser = (user: User) => {
  console.log(user.name);
};
```

### 3. Store 외부에서 사용
```typescript
// API 미들웨어에서 사용
import { useAuthStore } from '@/stores/useAuthStore';

export async function apiCall(endpoint: string) {
  const token = useAuthStore.getState().user?.id;

  return fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

---

## 🚀 완료!

모든 Zustand Store가 구현되었습니다:

- ✅ useBookingStore
- ✅ useSearchStore
- ✅ useAuthStore
- ✅ useCartStore
- ✅ useAdminStore

**서버**: http://localhost:3003
