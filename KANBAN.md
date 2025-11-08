# MSC Cruises Project Kanban Board

## 🎯 프로젝트 개요
- **프로젝트명**: MSC Cruises 웹사이트
- **GCP 프로젝트 ID**: msccruises
- **배포 URL**: https://msccruises.du.r.appspot.com
- **로컬 개발**: http://localhost:3003
- **GitHub**: https://github.com/myaji35/msccruises

---

## 📋 작업 현황

### ✅ Done (완료)

#### 인프라 & 배포
- [x] Next.js 16.0.1 업그레이드
- [x] React 19.2.0 업그레이드
- [x] Turbopack 활성화
- [x] Docker 설정 (Dockerfile, .dockerignore)
- [x] GCP App Engine 배포 완료
- [x] 프로덕션 빌드 최적화

#### 상태 관리 (Zustand)
- [x] useBookingStore - 예약 프로세스 관리
- [x] useSearchStore - 검색 및 필터 관리
- [x] useAuthStore - 인증 및 사용자 관리
- [x] useCartStore - 장바구니 관리 (7일 자동 삭제)
- [x] useAdminStore - 관리자 대시보드

#### 관리자 기능
- [x] Admin Panel (/admin) - 패스워드 인증
- [x] Admin Layout - 인증 미들웨어
- [x] Admin Settings - 패스워드 변경 기능
- [x] 크루즈 관리 (/admin/cruises)
- [x] SNS 계정 관리 (/admin/sns/accounts)
- [x] 대시보드 통계 (예약, 수익, 크루즈, 회원)

#### 인증 & 사용자
- [x] NextAuth 설정
- [x] 사용자 로그인/회원가입
- [x] Admin 계정 (admin@msccruises.com / admin123)
- [x] Voyagers Club 포인트 시스템
- [x] 티어 자동 업그레이드 (Classic → Silver → Gold → Black)

#### 예약 시스템
- [x] 크루즈 검색 및 필터링
- [x] 객실 선택
- [x] 승객 정보 입력
- [x] 항공 패키지 옵션
- [x] 장바구니 기능
- [x] 결제 연동 (Toss Payments)
- [x] 예약 내역 조회
- [x] 예약 취소 기능

#### 데이터베이스
- [x] Prisma ORM 설정
- [x] SQLite (dev.db)
- [x] User, Cruise, Booking, Payment 모델
- [x] SNS 연동 모델
- [x] Itinerary, Flight 모델

#### UI/UX
- [x] Tailwind CSS 설정
- [x] Shadcn UI 컴포넌트
- [x] Radix UI 드롭다운
- [x] 반응형 디자인
- [x] 로딩 스피너 & Suspense
- [x] 결제 성공/실패 페이지

#### 문서화
- [x] ZUSTAND_USAGE_GUIDE.md
- [x] stores/README.md (14K, 전체 Store 가이드)
- [x] BOOKING_SNS_IMPLEMENTATION_SUMMARY.md
- [x] ITINERARY_MANAGEMENT_SUMMARY.md
- [x] SNS_PROMOTION_GUIDE.md
- [x] TESTING_GUIDE.md

---

### 🚧 In Progress (진행 중)

_현재 진행 중인 작업 없음_

---

### 📝 To Do (예정)

#### 기능 개선
- [ ] 실시간 크루즈 재고 관리
- [ ] 이메일 알림 (예약 확인, 출발 안내)
- [ ] SMS 알림
- [ ] 다국어 지원 (i18n)
- [ ] 모바일 앱 (React Native)

#### 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] CDN 설정
- [ ] 캐싱 전략
- [ ] DB 쿼리 최적화

#### 보안
- [ ] HTTPS 강제
- [ ] Rate Limiting
- [ ] CSRF 보호
- [ ] XSS 방지
- [ ] SQL Injection 방지

#### 테스트
- [ ] Unit 테스트 (Jest)
- [ ] Integration 테스트
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 테스트

#### 모니터링
- [ ] Google Analytics 연동
- [ ] Sentry 에러 트래킹
- [ ] 로그 수집 (Cloud Logging)
- [ ] APM (Application Performance Monitoring)

---

### 🔴 Blocked (차단됨)

_현재 차단된 작업 없음_

---

## 🎨 Store 구조

### useBookingStore
```typescript
- cruiseId, cruiseName, shipName
- passengers[]
- cabin (category, deck, cabin number)
- flightInfo (outbound, return)
- totalPrice
- Actions: setCruise, addPassenger, setCabin, calculateTotal
```

### useSearchStore
```typescript
- filters (destination, price, duration, dates)
- sortBy (popular, price, duration)
- page, pageSize
- quickFilters (luxury, family, weekend)
- Actions: setFilter, setSortBy, resetFilters
```

### useAuthStore
```typescript
- user (id, email, name, userType)
- voyagersClub (tier, points)
- partnerInfo
- Actions: login, logout, addPoints, updateTier
- Permissions: isAdmin, isPartner, isCustomer
```

### useCartStore
```typescript
- items[]
- Actions: addToCart, removeFromCart, clearCart
- Getters: getCartTotal, getCartCount
- Auto-cleanup: 7일 이상 된 항목 자동 삭제
```

### useAdminStore
```typescript
- metrics (bookings, revenue, users, cruises)
- snsAccounts[]
- currentSection
- Actions: refreshMetrics, bulkDeleteCruises
- Analytics: getRevenueGrowth, getBookingGrowth
```

---

## 🔑 주요 기능

### 1. 관리자 패널
- **URL**: https://msccruises.du.r.appspot.com/admin
- **로그인**: 패스워드 `admin123`
- **기능**: 크루즈 관리, SNS 계정, 대시보드, 설정

### 2. 예약 시스템
- 크루즈 검색 → 객실 선택 → 승객 정보 → 결제
- 장바구니에 여러 예약 저장 가능
- Voyagers Club 포인트 자동 적립 (1% 캐시백)

### 3. Voyagers Club
- **Classic**: 0 - 4,999 포인트
- **Silver**: 5,000 - 19,999 포인트
- **Gold**: 20,000 - 49,999 포인트
- **Black**: 50,000+ 포인트

---

## 📊 프로젝트 통계

- **총 Stores**: 5개
- **총 코드 라인**: ~1,092 lines (stores만)
- **총 문서**: 10+ MD 파일
- **API Routes**: 28개
- **Pages**: 28개

---

## 🚀 배포 정보

### 환경 변수
```bash
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=[설정 필요]
NEXTAUTH_URL=https://msccruises.du.r.appspot.com
```

### 성능 목표
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **빌드 시간**: ~12s

---

## 📞 연락처

- **개발자**: Claude Code
- **GitHub**: https://github.com/myaji35/msccruises
- **이메일**: socialdoctors35@gmail.com

---

**마지막 업데이트**: 2025-11-08
**버전**: 1.0.0
**상태**: ✅ 프로덕션 배포 완료
