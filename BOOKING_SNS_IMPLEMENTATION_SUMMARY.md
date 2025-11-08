# 예약 시스템 + SNS 홍보 기능 구현 완료

## 📅 구현 일자
2025-11-03

## ✅ 완료 항목

### 1. 예약 시스템 (Booking System)

#### A. 고객용 크루즈 상세 페이지
**파일:** `/app/cruises/[id]/page.tsx`

**기능:**
- 크루즈 상품 상세 정보 표시
- 항로 타임라인 (일자별)
- 항공편 정보 표시
- 이미지 갤러리
- 예약 버튼 CTA
- 가격 계산기 (승객 수 기반)

**주요 컴포넌트:**
```typescript
- Hero Image Section
- Overview Section (기간, 출발지, 선박, 목적지)
- Itinerary Timeline (크루즈 항로)
- Flight Information (항공편)
- Gallery Section
- Booking Summary Card (sticky)
```

#### B. 예약 플로우 페이지
**파일:** `/app/booking/[id]/page.tsx`

**3단계 예약 프로세스:**
1. **상품 선택**
   - 출발 날짜 선택
   - 캐빈 등급 선택 (내부/오션뷰/발코니/스위트)
   - 실시간 가격 계산

2. **승객 정보**
   - 승객 추가/삭제
   - 개인정보 입력 (이름, 생년월일, 여권번호, 국적)
   - 대표 승객 지정

3. **결제**
   - 예약 요약
   - 최종 금액 확인
   - 예약 완료 (데모 모드)

**특징:**
- Progress indicator (진행 단계 표시)
- 실시간 가격 계산
- 폼 검증
- 반응형 디자인

#### C. 예약 내역 조회
**파일:** `/app/bookings/page.tsx`

**기능:**
- 사용자별 예약 목록 조회
- 예약 상태 표시 (대기/확정/취소/완료)
- 결제 상태 표시 (결제대기/결제완료/환불)
- 예약 상세보기 링크
- 취소 기능 (pending 상태만)

#### D. 예약 API 엔드포인트
**파일:** `/app/api/bookings/route.ts`

**POST /api/bookings** - 예약 생성
- 인증 확인 (NextAuth session)
- 예약번호 자동 생성 (MSC-YYYYMMDD-XXXX)
- 승객 정보 일괄 저장 (Transaction)
- 중간관리자 수수료 자동 계산

**GET /api/bookings** - 예약 목록 조회
- 사용자별 예약 조회
- 승객 정보 포함
- 생성일 기준 정렬

**데이터 구조:**
```typescript
{
  userId: string
  bookingNumber: string (자동 생성)
  cruiseId: string
  cruiseName: string
  shipName: string
  departureDate: DateTime
  returnDate: DateTime (자동 계산)
  cabinCategory: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "refunded"
  partnerId?: string (선택)
  partnerCommission?: number (자동 계산)
  passengers: Passenger[]
}
```

---

### 2. SNS 홍보 시스템

#### A. SNS 계정 관리 UI
**파일:** `/app/admin/sns/accounts/page.tsx`

**기능:**
- SNS 계정 등록 (Facebook, Instagram, TikTok, Threads)
- 액세스 토큰 저장
- 계정 활성/비활성 관리
- 계정 삭제

**지원 플랫폼:**
- Facebook Page
- Instagram Business
- TikTok
- Threads

**보안:**
- 액세스 토큰 암호화 필요 (TODO)
- 사용자별 계정 분리

#### B. SNS API 엔드포인트
**파일:** `/app/api/admin/sns/accounts/route.ts`

**GET /api/admin/sns/accounts** - 계정 목록
- 사용자별 SNS 계정 조회

**POST /api/admin/sns/accounts** - 계정 추가
- 플랫폼 선택
- 계정 ID 및 액세스 토큰 저장

**DELETE /api/admin/sns/accounts/[id]** - 계정 삭제

---

## 📊 데이터베이스 스키마

### Booking (예약)
```prisma
model Booking {
  id              String   @id @default(cuid())
  userId          String
  bookingNumber   String   @unique
  cruiseId        String
  cruiseName      String
  shipName        String
  departureDate   DateTime
  returnDate      DateTime
  departurePort   String
  cabinCategory   String
  cabinNumber     String?
  totalPrice      Float
  currency        String   @default("USD")
  status          String   @default("pending")
  paymentStatus   String   @default("pending")

  // Package info
  isPackage       Boolean  @default(false)
  outboundFlight  String?
  returnFlight    String?
  packageDiscount Float?

  // Partner info
  partnerId       String?
  partnerCommission Float?

  user            User     @relation
  partner         PartnerInfo? @relation
  passengers      Passenger[]
}
```

### Passenger (승객)
```prisma
model Passenger {
  id            String   @id @default(cuid())
  bookingId     String
  firstName     String
  lastName      String
  dateOfBirth   DateTime
  passportNumber String?
  nationality   String
  isPrimary     Boolean  @default(false)

  booking       Booking  @relation
}
```

### SnsAccount (SNS 계정)
```prisma
model SnsAccount {
  id              String   @id @default(cuid())
  userId          String
  platform        String   // "facebook", "instagram", "tiktok", "threads"
  accountId       String
  accessToken     String?  // Encrypted
  refreshToken    String?
  tokenExpiresAt  DateTime?
  isActive        Boolean  @default(true)

  user            User     @relation
  posts           SnsPost[]
}
```

---

## 🎯 사용자 플로우

### 고객 예약 프로세스
```
1. 메인 페이지 (/
) → 인기 크루즈 보기
2. 크루즈 상세 (/cruises/[id]) → 상세 정보 확인
3. "지금 예약하기" 클릭
4. 예약 페이지 (/booking/[id])
   └─ Step 1: 날짜/캐빈 선택
   └─ Step 2: 승객 정보 입력
   └─ Step 3: 결제 (데모)
5. 예약 완료 → 예약번호 발급
6. 예약 내역 (/bookings) → 예약 목록 조회
```

### 관리자 SNS 관리
```
1. 관리자 대시보드
2. SNS 계정 관리 (/admin/sns/accounts)
3. 계정 추가 → 플랫폼/토큰 입력
4. SNS 포스팅 스케줄러 (미구현)
   └─ 크루즈 선택
   └─ 콘텐츠 작성
   └─ 예정일 설정
   └─ 예정 → 확정 → 자동 포스팅
```

---

## 🚀 다음 단계 (미구현 항목)

### 1. SNS 포스팅 스케줄러 UI
- 크루즈별 포스팅 생성
- 이미지/동영상 업로드
- 해시태그 관리
- 예정/확정 상태 관리

### 2. 실제 SNS API 연동
- Facebook Graph API
- Instagram API
- TikTok API
- Threads API

### 3. Cron Job 설정
- Vercel Cron 또는 별도 스케줄러
- 예정된 포스팅 자동 발행
- 토큰 만료 체크 및 갱신

### 4. 결제 시스템
- Stripe / 토스페이먼츠 연동
- 결제 프로세스 구현
- 결제 내역 관리
- 환불 프로세스

### 5. 예약 상세 페이지
- `/bookings/[id]` 구현
- 예약 수정
- 예약 취소
- E-티켓 다운로드

### 6. 중간관리자 대시보드
- 예약 현황 조회
- 수수료 통계
- 전용 예약 링크
- 서브페이지 관리

### 7. 이메일 알림
- 예약 확인 이메일
- 출발 리마인더
- 결제 영수증

---

## 📝 테스트 방법

### 예약 시스템 테스트

1. **크루즈 상세 페이지 확인**
```bash
# 브라우저에서:
http://localhost:3000/cruises/[크루즈ID]
```

2. **예약 프로세스 테스트**
```bash
# 예약 페이지 접속:
http://localhost:3000/booking/[크루즈ID]

# 테스트 데이터:
- 출발일: 2025-12-15
- 캐빈: Balcony
- 승객 1: John Doe, 1990-01-01
- 승객 2: Jane Doe, 1992-05-15
```

3. **예약 내역 확인**
```bash
# 로그인 후:
http://localhost:3000/bookings
```

### SNS 계정 관리 테스트

1. **SNS 계정 페이지 접속**
```bash
http://localhost:3000/admin/sns/accounts
```

2. **테스트 계정 추가**
```
Platform: Facebook
Account ID: @msc_cruises_official
Access Token: test_token_123456 (실제 환경에서는 실제 토큰 필요)
```

---

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일 우선 설계
- 태블릿/데스크톱 최적화
- Grid 및 Flexbox 레이아웃

### 사용자 경험
- 3단계 예약 프로세스 (명확한 진행 표시)
- 실시간 가격 계산
- 즉각적인 피드백
- 로딩 상태 표시

### 시각적 요소
- Progress indicator
- Status badges (색상 코딩)
- 아이콘 사용 (Lucide React)
- 호버 효과 및 트랜지션

---

## 🔒 보안 고려사항

### 인증
- NextAuth.js 세션 기반
- API 라우트 보호
- 사용자별 데이터 분리

### 데이터 보호
- ⚠️ **TODO**: SNS 액세스 토큰 암호화
- ⚠️ **TODO**: PCI-DSS 준수 (결제)
- 개인정보 처리 (GDPR/CCPA)

---

## 📈 성능 최적화

### 이미 적용된 최적화
- Next.js Image 컴포넌트
- Server Components (기본)
- Database indexing
- Transaction 기반 데이터 저장

### 추가 최적화 필요
- 이미지 CDN
- 캐싱 전략
- API 응답 압축
- 코드 스플리팅

---

## 🐛 알려진 이슈

1. **SNS 토큰 암호화 미구현**
   - 현재: 평문 저장
   - 필요: crypto 라이브러리 사용 암호화

2. **실제 결제 시스템 없음**
   - 현재: 데모 모드
   - 필요: Stripe/토스페이먼츠 연동

3. **SNS 실제 API 연동 없음**
   - 현재: DB에만 저장
   - 필요: 각 플랫폼 API 연동

4. **이메일 알림 없음**
   - 필요: Resend/SendGrid 연동

---

## 📚 관련 문서

- `/ITINERARY_MANAGEMENT_SUMMARY.md` - 항로 관리 시스템
- `/SNS_PROMOTION_GUIDE.md` - SNS 홍보 상세 가이드
- `/ROUTE_MANAGEMENT_GUIDE.md` - 항로 관리 상세 가이드
- `/TEST_SCENARIOS.md` - 전체 테스트 시나리오

---

## ✨ 주요 성과

### 구현 완료
✅ 고객 예약 시스템 (3단계 플로우)
✅ 예약 API (생성/조회)
✅ 예약 내역 관리
✅ SNS 계정 관리
✅ SNS API 기본 구조

### 비즈니스 가치
- 💰 **직접 예약** - 외부 플랫폼 수수료 절감
- 📈 **전환율 향상** - 간소화된 예약 프로세스
- 🎯 **SNS 자동화** - 마케팅 효율성 증대
- 👥 **중간관리자 지원** - 수수료 자동 계산

---

**구현 완료:** 2025-11-03
**개발자:** Claude Code
**상태:** ✅ 예약 시스템 완료, ⚠️ SNS 포스팅 스케줄러 추가 필요
