# 🧪 MSC Cruises 테스트 가이드

## 📅 업데이트: 2025-11-03

이 문서는 MSC Cruises 플랫폼의 모든 기능을 테스트하는 방법을 안내합니다.

---

## 🎯 테스트 준비

### 1. 서버 실행 확인
```bash
npm run dev
# 서버가 http://localhost:3000 에서 실행 중인지 확인
```

### 2. 테스트 데이터 생성 (이미 완료)
✅ 중간관리자 5개 계정
✅ 카리브해 크루즈 1개 (완전한 데이터)
✅ SNS 계정 4개

---

## 🔐 테스트 계정

### 중간관리자 (Partner) 계정
```
Email: partner1@global-travel.com
Password: partner123!
Company: 글로벌여행사
Commission: 8%
Status: Active

Email: partner2@dream-tour.com
Password: partner123!
Company: 드림투어
Commission: 10%
Status: Active

Email: partner3@ocean-travel.com
Password: partner123!
Company: 바다여행
Status: Pending (승인 대기)

Email: partner4@luxury-travel.com
Password: partner123!
Company: 럭셔리트래블
Commission: 12%
Status: Active

Email: partner5@jeju-cruise.com
Password: partner123!
Company: 제주크루즈투어
Commission: 9%
Status: Active
```

### 관리자 계정
```
Email: admin@msccruises.com
Name: MSC Admin
(비밀번호 미설정 - 소셜 로그인 또는 직접 생성 필요)
```

---

## 📝 기능별 테스트 가이드

### 1. 메인 페이지 (/)

**URL:** `http://localhost:3000`

**테스트 항목:**
- ✅ MSC 로고 표시
- ✅ 네비게이션 메뉴 (크루즈, 패키지, 출발일정, 목적지, 관리자)
- ✅ 로그인 버튼
- ✅ Cinematic Hero 섹션
- ✅ 출발 일정 테이블 (4개 샘플 데이터)
- ✅ 인기 크루즈 섹션 (Caribbean Paradise 표시)
- ✅ Why Choose Us 섹션
- ✅ Footer

**기대 결과:**
- Caribbean Paradise 7-Night Cruise가 인기 크루즈로 표시됨
- 가격: $1,299
- 선박: MSC Seaside
- 8일 일정

---

### 2. 크루즈 상세 페이지

**URL:** `http://localhost:3000/cruises/test-cruise-caribbean-001`

**테스트 항목:**
- ✅ Hero 이미지 (크루즈 선박)
- ✅ 크루즈 정보 카드
  - 기간: 8일
  - 출발: Miami, Florida
  - 선박: MSC Seaside
  - 목적지: 4곳
- ✅ 상세 설명
- ✅ 항해 일정 (8일 타임라인)
  - Day 1: Miami (출발)
  - Day 2: Nassau, Bahamas
  - Day 3: Cozumel, Mexico
  - Day 4: George Town, Cayman Islands
  - Day 5: Ocho Rios, Jamaica
  - Day 6-7: At Sea
  - Day 8: Miami (도착)
- ✅ 항공편 정보
  - 가는편: ICN → MIA (KE123)
  - 오는편: MIA → ICN (KE124)
- ✅ 갤러리 (3개 이미지)
- ✅ 예약 카드 (우측 sticky)
  - 시작 가격: $1,299
  - "지금 예약하기" 버튼

**기대 결과:**
- 모든 항로 정보가 표시됨
- 각 항구의 도착/출발 시간 표시
- 활동 및 설명 표시

---

### 3. 예약 플로우 (3단계)

**URL:** `http://localhost:3000/booking/test-cruise-caribbean-001`

#### Step 1: 상품 선택
**테스트:**
1. 출발 날짜 선택 (예: 2025-12-15)
2. 캐빈 등급 선택:
   - ✅ 내부 캐빈 ($1,299)
   - ✅ 오션뷰 ($1,689)
   - ✅ 발코니 ($2,078)
   - ✅ 스위트 ($3,248)
3. "다음: 승객 정보 입력" 클릭

**기대 결과:**
- 선택한 캐빈에 따라 가격이 실시간으로 변경됨
- Progress indicator 1단계 완료 표시

#### Step 2: 승객 정보
**테스트:**
1. 대표 승객 정보 입력:
   - First Name: John
   - Last Name: Doe
   - Date of Birth: 1990-01-15
   - Passport: M12345678
   - Nationality: South Korea

2. "승객 추가" 버튼 클릭
3. 2번째 승객 정보 입력:
   - First Name: Jane
   - Last Name: Doe
   - Date of Birth: 1992-05-20
   - Nationality: South Korea

4. "다음: 결제" 클릭

**기대 결과:**
- 승객 추가/삭제 가능
- 대표 승객은 삭제 불가
- 우측 예약 요약에 승객 수 반영
- 총 금액 = 캐빈 가격 x 승객 수

#### Step 3: 결제 (데모)
**테스트:**
1. 데모 안내 메시지 확인
2. "예약 완료" 버튼 클릭

**기대 결과:**
- 예약번호 발급 (형식: MSC-YYYYMMDD-XXXX)
- Alert로 예약 완료 메시지 표시
- 예약 상세 페이지로 리다이렉트 (구현 예정)

---

### 4. 예약 내역 조회

**URL:** `http://localhost:3000/bookings`

**테스트:**
1. 로그인하지 않은 경우:
   - ✅ 로그인 페이지로 리다이렉트

2. 로그인 후:
   - ✅ 예약 목록 표시
   - ✅ 각 예약 카드:
     - 크루즈명
     - 선박명
     - 예약번호
     - 출발일
     - 승객 수
     - 결제금액
     - 상태 (대기중/확정/취소/완료)
     - 결제 상태 (결제대기/결제완료/환불)
   - ✅ "상세보기" 버튼
   - ✅ "취소" 버튼 (pending 상태만)

**기대 결과:**
- 사용자가 생성한 모든 예약이 최신순으로 표시됨
- 상태별 색상 코딩 적용

---

### 5. 크루즈 관리 (관리자)

**URL:** `http://localhost:3000/admin/cruises`

**테스트:**
1. ✅ 크루즈 목록 조회
2. ✅ 새 크루즈 생성 (`/admin/cruises/new`)
3. ✅ 크루즈 수정 (`/admin/cruises/[id]/edit`)
4. ✅ 크루즈 상세 (`/admin/cruises/[id]`)

#### 크루즈 수정 페이지
**URL:** `http://localhost:3000/admin/cruises/test-cruise-caribbean-001/edit`

**테스트:**
1. **기본 정보 수정:**
   - 이름, 선박명, 설명 수정
   - 출발 항구, 목적지 수정
   - 기간, 가격, 통화 수정
   - 상태, Featured 체크박스

2. **미디어 관리:**
   - 이미지/비디오 업로드
   - 대표 이미지 설정
   - 순서 변경
   - 삭제

3. **크루즈 항로 관리:**
   - "항로 추가" 버튼
   - 일차, 항구 타입 선택
   - 항구명, 코드, 국가 입력
   - 도착/출발 시간 입력
   - GPS 좌표 입력
   - 활동, 설명, 이미지 URL
   - 항로 삭제

4. **항공 경로 관리:**
   - "항공편 추가" 버튼
   - 가는편/오는편 선택
   - 항공편명, 항공사 입력
   - 출발/도착 공항 정보
   - 비행 시간, 기종, 좌석 등급
   - 경유 횟수, 수하물, 기내식
   - 항공편 삭제

5. **저장**

**기대 결과:**
- 모든 정보가 Transaction으로 한 번에 저장됨
- 항로와 항공편이 함께 관리됨
- 에러 없이 저장 완료

---

### 6. SNS 계정 관리

**URL:** `http://localhost:3000/admin/sns/accounts`

**테스트:**
1. ✅ SNS 계정 목록 조회
   - Facebook: @MSCCruisesOfficial (활성)
   - Instagram: @msc_cruises (활성)
   - TikTok: @msccruises (활성)
   - Threads: @msc.cruises (비활성)

2. ✅ "계정 추가" 버튼 클릭
3. ✅ 새 계정 추가:
   - Platform: Twitter
   - Account ID: @msc_cruises_kr
   - Access Token: test_token_123
4. ✅ "추가" 버튼

5. ✅ 계정 삭제 (Trash 아이콘)

**기대 결과:**
- 4개의 테스트 계정이 표시됨
- 새 계정 추가 가능
- 계정 삭제 가능
- 플랫폼별 아이콘 표시

---

### 7. 로그인/회원가입

**URL:** `http://localhost:3000/login`

**테스트:**
1. ✅ 이메일/비밀번호 로그인
   - Email: partner1@global-travel.com
   - Password: partner123!

2. ✅ "Google로 로그인" 버튼
   - Google OAuth 인증 플로우
   - (Client Secret 설정 후 테스트 가능)

3. ✅ "회원가입" 링크 → `/register`

**기대 결과:**
- 로그인 성공 시 메인 페이지로 리다이렉트
- NextAuth 세션 생성
- 헤더에 사용자 정보 표시

---

## 🔍 API 엔드포인트 테스트

### 예약 API

**POST /api/bookings**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "cruiseId": "test-cruise-caribbean-001",
    "departureDate": "2025-12-15",
    "cabinCategory": "balcony",
    "passengers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-15",
        "passportNumber": "M12345678",
        "nationality": "South Korea",
        "isPrimary": true
      }
    ],
    "totalPrice": 2078
  }'
```

**GET /api/bookings**
```bash
curl http://localhost:3000/api/bookings \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 항로 API

**GET /api/admin/cruises/[id]/itineraries**
```bash
curl http://localhost:3000/api/admin/cruises/test-cruise-caribbean-001/itineraries
```

**GET /api/admin/cruises/[id]/flights**
```bash
curl http://localhost:3000/api/admin/cruises/test-cruise-caribbean-001/flights
```

### SNS API

**GET /api/admin/sns/accounts**
```bash
curl http://localhost:3000/api/admin/sns/accounts \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## 🐛 알려진 이슈 & 해결책

### 1. Google OAuth 로그인 실패
**원인:** Client Secret 미설정
**해결:** `.env` 파일에 `GOOGLE_CLIENT_SECRET` 추가

### 2. 예약 시 "Unauthorized" 에러
**원인:** 로그인하지 않음
**해결:** 먼저 `/login`에서 로그인

### 3. 크루즈 상세 페이지에서 이미지 안 보임
**원인:** 외부 이미지 URL (Unsplash)
**해결:** 인터넷 연결 확인 또는 `next.config.ts`에 도메인 추가

### 4. 서버 재시작 후 데이터 사라짐
**원인:** SQLite 파일 위치 변경
**해결:** Seed 스크립트 재실행:
```bash
npx tsx prisma/seed-cruise.ts
npx tsx prisma/seed-partner.ts
npx tsx prisma/seed-sns.ts
```

---

## ✅ 테스트 체크리스트

### 고객 기능
- [ ] 메인 페이지 접속
- [ ] 인기 크루즈 카드 클릭
- [ ] 크루즈 상세 페이지 확인
- [ ] 항로 타임라인 확인
- [ ] 항공편 정보 확인
- [ ] "지금 예약하기" 클릭
- [ ] Step 1: 날짜/캐빈 선택
- [ ] Step 2: 승객 정보 입력 (2명)
- [ ] Step 3: 예약 완료
- [ ] 예약 내역 페이지 확인
- [ ] 예약 상태 확인

### 관리자 기능
- [ ] 크루즈 목록 조회
- [ ] 크루즈 수정 페이지 접속
- [ ] 기본 정보 수정
- [ ] 미디어 업로드
- [ ] 크루즈 항로 추가/수정/삭제
- [ ] 항공 경로 추가/수정/삭제
- [ ] 저장 및 확인
- [ ] SNS 계정 페이지 접속
- [ ] SNS 계정 목록 확인
- [ ] 새 계정 추가
- [ ] 계정 삭제

### 인증
- [ ] 이메일 로그인 (partner1@global-travel.com)
- [ ] Google 로그인 (Client Secret 설정 후)
- [ ] 로그아웃
- [ ] 회원가입

---

## 📸 스크린샷 가이드

다음 화면들의 스크린샷을 촬영하여 검증:

1. 메인 페이지 (Hero + 인기 크루즈)
2. 크루즈 상세 (항로 타임라인 포함)
3. 예약 Step 1 (캐빈 선택)
4. 예약 Step 2 (승객 정보)
5. 예약 Step 3 (완료)
6. 예약 내역 목록
7. 크루즈 수정 (항로 관리)
8. SNS 계정 관리

---

## 🎯 성능 테스트

### 페이지 로딩 시간
- 메인 페이지: < 2초
- 크루즈 상세: < 1.5초
- 예약 페이지: < 1.5초

### API 응답 시간
- GET 요청: < 500ms
- POST 요청: < 1초

---

## 📞 문제 발생 시

1. 브라우저 콘솔 확인 (F12)
2. 서버 로그 확인
3. `.next` 폴더 삭제 후 재시작
4. 데이터베이스 재생성:
```bash
rm prisma/dev.db
npx prisma migrate dev
npx tsx prisma/seed-cruise.ts
npx tsx prisma/seed-partner.ts
npx tsx prisma/seed-sns.ts
```

---

**테스트 완료일:** 2025-11-03
**버전:** v1.0
**상태:** ✅ 모든 기능 테스트 가능
