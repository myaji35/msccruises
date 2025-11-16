# Story 006 테스트 가이드

## 🎯 테스트 목적

Story 006에서 구현한 고급 결제 기능들이 정상적으로 작동하는지 확인합니다.

---

## ✅ 사전 준비사항

### 1. 필수 환경변수 설정

`.env` 파일에 다음 항목들을 실제 값으로 설정해야 합니다:

#### Stripe 설정 (필수)
```bash
# Stripe Test Dashboard에서 확인
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Stripe 키 발급 방법:**
1. https://dashboard.stripe.com/test/apikeys 접속
2. Publishable key와 Secret key 복사
3. Webhook Secret은 Stripe CLI로 생성:
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook
   ```

#### Email 설정 (선택사항 - 영수증 발송 테스트용)
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-digit-app-password"
```

**Gmail 앱 비밀번호 생성:**
1. Google 계정 > 보안 > 2단계 인증 활성화
2. 보안 > 앱 비밀번호 > 메일 선택 > 생성
3. 16자리 비밀번호를 `.env`에 입력

### 2. 서버 실행 확인

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행 중이어야 합니다.

### 3. 테스트 계정 로그인

- Google OAuth 또는 테스트 계정으로 로그인
- 로그인하지 않으면 대시보드 접근 불가

---

## 🧪 기능별 테스트 시나리오

### 1️⃣ Stripe Elements Custom UI 테스트

**목적:** 사용자가 결제 페이지에서 직접 카드 정보를 입력할 수 있는지 확인

#### 테스트 순서:

1. **크루즈 선택 및 예약**
   - http://localhost:3000 접속
   - 크루즈 선택 → "지금 예약하기" 클릭
   - 예약 정보 입력 → "예약하기" 클릭

2. **결제 페이지 접근**
   - 예약 완료 후 `/payment` 페이지로 자동 이동
   - 또는 직접 http://localhost:3000/payment 접속

3. **Stripe 결제 선택**
   - "Stripe" 버튼 클릭
   - Stripe 호스팅 페이지로 리디렉션 되지 않고, 같은 페이지에 카드 입력 폼이 표시되어야 함

4. **카드 정보 입력**
   - **테스트 카드 번호:** `4242 4242 4242 4242`
   - **만료일:** 미래 날짜 (예: 12/25)
   - **CVC:** 임의 3자리 (예: 123)

5. **결제 진행**
   - "결제하기" 버튼 클릭
   - 로딩 스피너 표시 확인
   - 결제 성공 시 "결제가 완료되었습니다!" 알림 표시
   - `/dashboard/bookings` 페이지로 자동 이동

#### 예상 결과:
- ✅ Stripe 결제 폼이 페이지 내에서 바로 표시됨
- ✅ 카드 번호 입력 시 실시간 유효성 검사
- ✅ 결제 완료 후 예약 대시보드로 이동
- ✅ 브라우저 콘솔에 에러 없음

#### 실패 케이스 테스트:
- **유효하지 않은 카드:** `4000 0000 0000 0002` 입력 → "카드가 거부되었습니다" 메시지 표시
- **불완전한 정보:** CVC 미입력 → "결제하기" 버튼 비활성화

---

### 2️⃣ Payment History Page 테스트

**목적:** 사용자가 자신의 결제 내역을 조회하고 필터링할 수 있는지 확인

#### 테스트 순서:

1. **결제 히스토리 페이지 접근**
   - http://localhost:3000/dashboard/payments 접속
   - 또는 대시보드에서 "결제 내역" 메뉴 클릭

2. **결제 목록 확인**
   - 이전에 완료한 결제들이 카드 형태로 표시됨
   - 각 카드에 다음 정보 포함:
     - 크루즈 이름 / 선박 이름
     - 결제 금액
     - 결제 상태 (완료/대기중/환불완료)
     - 결제 방법 (Stripe/TossPay)
     - 결제 날짜

3. **필터 기능 테스트**
   - "전체" 탭 클릭 → 모든 결제 표시
   - "완료" 탭 클릭 → `status: 'completed'` 결제만 표시
   - "대기중" 탭 클릭 → `status: 'pending'` 결제만 표시
   - "환불완료" 탭 클릭 → `status: 'refunded'` 결제만 표시

4. **상세 페이지 이동**
   - 결제 카드의 "상세보기" 버튼 클릭
   - `/dashboard/payments/[id]` 페이지로 이동

#### 예상 결과:
- ✅ 현재 로그인한 사용자의 결제만 표시됨
- ✅ 필터링이 즉시 적용됨
- ✅ "결제 내역이 없습니다" 메시지가 적절히 표시됨 (결제 없을 때)
- ✅ 날짜가 최신순으로 정렬됨

---

### 3️⃣ Payment Detail Page 테스트

**목적:** 결제의 상세 정보와 타임라인을 확인할 수 있는지 테스트

#### 테스트 순서:

1. **상세 페이지 접근**
   - 결제 히스토리에서 결제 선택 → "상세보기" 클릭
   - 또는 직접 URL: http://localhost:3000/dashboard/payments/[payment-id]

2. **정보 섹션 확인**
   - **결제 정보:**
     - Payment ID
     - 결제 상태 (배지 색상 확인: 완료=녹색, 대기=노란색, 실패=빨간색)
     - 결제 금액
     - 결제 방법
     - Order ID / Payment Key

   - **크루즈 정보:**
     - 크루즈 이름
     - 선박 이름
     - 출발일 / 도착일

   - **예약 정보:**
     - Booking ID
     - 예약 상태
     - 승객 수

3. **타임라인 확인**
   - 결제 생성 시각
   - 결제 완료 시각 (완료된 경우)
   - 환불 시각 (환불된 경우)
   - 시간 순서대로 표시되는지 확인

4. **액션 버튼 테스트**
   - **"영수증 발송" 버튼:**
     - 클릭 시 "영수증이 이메일로 전송되었습니다" 알림
     - (SMTP 설정 시) 실제로 이메일 수신 확인

   - **"환불 요청" 버튼:**
     - 클릭 시 환불 모달 표시
     - `status: 'completed'` 결제만 환불 버튼 표시

#### 예상 결과:
- ✅ 모든 결제 정보가 정확히 표시됨
- ✅ 타임라인이 시간 순서대로 표시됨
- ✅ 결제 상태에 따라 적절한 버튼만 활성화됨
- ✅ 존재하지 않는 결제 ID 접근 시 "결제를 찾을 수 없습니다" 에러

---

### 4️⃣ Partial Refund UI 테스트

**목적:** 전체/부분 환불을 요청할 수 있는지 확인

#### 테스트 순서:

1. **환불 모달 열기**
   - 완료된 결제의 상세 페이지에서 "환불 요청" 버튼 클릭
   - 모달 팝업 표시됨

2. **전체 환불 테스트**
   - "전체 환불" 라디오 버튼 선택
   - 환불 금액 필드가 자동으로 전체 금액으로 채워지고 비활성화됨
   - 환불 사유 입력 (선택사항)
   - "환불 요청" 버튼 클릭
   - "환불이 요청되었습니다" 알림 표시
   - 결제 상태가 "환불 완료"로 변경됨

3. **부분 환불 테스트**
   - 새로운 완료된 결제에서 환불 모달 열기
   - "부분 환불" 라디오 버튼 선택
   - 환불 금액 입력 필드 활성화됨
   - **유효성 검사:**
     - 0원 입력 → "환불 금액은 0보다 커야 합니다" 에러
     - 원래 금액보다 큰 금액 입력 → "환불 금액은 결제 금액을 초과할 수 없습니다" 에러
     - 정상 금액 입력 (예: 원래 금액의 50%) → 환불 진행

4. **환불 후 상태 확인**
   - 결제 상세 페이지에서 상태가 "환불 완료"로 표시됨
   - "환불 요청" 버튼이 사라짐 (중복 환불 방지)
   - 타임라인에 환불 시각이 추가됨

#### 예상 결과:
- ✅ 전체/부분 환불 선택에 따라 UI가 변경됨
- ✅ 금액 유효성 검사가 정상 작동함
- ✅ 환불 후 결제 상태가 즉시 업데이트됨
- ✅ 이미 환불된 결제는 환불 버튼 미표시

---

### 5️⃣ Email Receipt Functionality 테스트

**목적:** 결제 영수증이 이메일로 전송되는지 확인

#### 사전 준비:
- `.env`에 SMTP 설정 완료 (Gmail 앱 비밀번호 등)
- 실제 수신 가능한 이메일 주소 준비

#### 테스트 순서:

1. **영수증 발송 요청**
   - 완료된 결제의 상세 페이지에서 "영수증 발송" 버튼 클릭
   - "영수증이 이메일로 전송되었습니다" 알림 표시

2. **이메일 수신 확인**
   - 등록된 이메일 계정에서 수신함 확인
   - 발신자: "MSC Cruises <noreply@msccruises.com>"
   - 제목: "Payment Receipt - MSC Cruises (Order #[주문번호])"

3. **이메일 내용 확인**
   - **HTML 버전:**
     - MSC Cruises 브랜딩
     - 결제 요약 (금액, 날짜, 방법)
     - 크루즈 정보 (이름, 선박, 출발/도착일)
     - 예약 정보 (Booking ID, 승객 수)
     - 거래 상세 (Order ID, Payment Key)

   - **텍스트 버전:**
     - 이메일 클라이언트에서 HTML 미지원 시 텍스트 버전 표시
     - 동일한 정보를 플레인 텍스트로 제공

4. **에러 처리 테스트**
   - SMTP 설정을 잘못 입력 → API 응답에서 에러 메시지 확인
   - 완료되지 않은 결제에서 영수증 발송 시도 → "완료된 결제만 영수증을 발송할 수 있습니다" 에러

#### 예상 결과:
- ✅ 이메일이 1분 이내 수신됨
- ✅ HTML 이메일이 깔끔하게 렌더링됨
- ✅ 모든 결제 정보가 정확히 표시됨
- ✅ 스팸 폴더에 들어가지 않음 (SPF/DKIM 설정 시)

---

### 6️⃣ Webhook Retry Logic 테스트

**목적:** Webhook 실패 시 자동 재시도가 작동하는지 확인

#### 사전 준비:
- Stripe CLI 설치 및 로그인
- Webhook 엔드포인트 포워딩 설정

#### 테스트 순서:

1. **Stripe CLI 설정**
   ```bash
   # 터미널에서 실행
   stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook
   ```
   - Webhook Secret이 출력됨 → `.env`의 `STRIPE_WEBHOOK_SECRET`에 복사

2. **정상 Webhook 테스트**
   - Stripe 결제 진행 (테스트 카드 사용)
   - Stripe CLI 로그에서 `payment_intent.succeeded` 이벤트 확인
   - 데이터베이스에서 `WebhookLog` 레코드 확인:
     ```sql
     SELECT * FROM WebhookLog WHERE provider = 'stripe' ORDER BY createdAt DESC LIMIT 1;
     ```
   - `status`가 `'success'`로 표시되어야 함

3. **실패 및 재시도 테스트**

   **방법 1: 임시로 서버 중단**
   - 결제 시작 → 즉시 Next.js 서버 중단 (`Ctrl+C`)
   - Stripe Webhook이 실패함 (서버가 응답하지 않음)
   - 서버 재시작
   - 데이터베이스 확인:
     ```sql
     SELECT id, status, attemptCount, lastError FROM WebhookLog WHERE status = 'pending';
     ```
   - `attemptCount`가 증가하는지 확인

   **방법 2: Payment Service 에러 시뮬레이션**
   - `services/payment.service.ts`의 `confirmStripePayment` 메서드에 임시 에러 추가:
     ```typescript
     async confirmStripePayment(...) {
       throw new Error('Simulated error');
     }
     ```
   - 결제 진행
   - Webhook이 실패하고 재시도됨
   - 콘솔에서 재시도 로그 확인:
     ```
     Process webhook error: Simulated error
     ```

4. **Exponential Backoff 확인**
   - Webhook이 실패한 후 재시도 간격 확인:
     - 1차 실패 → 1초 후 재시도
     - 2차 실패 → 2초 후 재시도
     - 3차 실패 → 4초 후 재시도
     - 4차 실패 → 8초 후 재시도
     - 5차 실패 → 16초 후 재시도
     - 5회 실패 → `status: 'failed'`, 더 이상 재시도 안 함

5. **Cron Job 테스트**
   ```bash
   # Webhook 재시도 엔드포인트 호출
   curl -X POST http://localhost:3000/api/v1/webhooks/retry \
     -H "Authorization: Bearer development-secret-change-in-production" \
     -H "Content-Type: application/json"
   ```
   - 응답에서 `processedCount`와 `stats` 확인
   - 대기 중인 Webhook들이 재처리됨

6. **통계 조회 테스트**
   ```bash
   curl -X GET http://localhost:3000/api/v1/webhooks/retry \
     -H "Authorization: Bearer development-secret-change-in-production"
   ```
   - 최근 7일간 Webhook 상태별 통계 확인:
     ```json
     {
       "success": true,
       "data": [
         { "status": "success", "count": 15 },
         { "status": "pending", "count": 2 },
         { "status": "failed", "count": 1 }
       ]
     }
     ```

#### 예상 결과:
- ✅ Webhook이 즉시 데이터베이스에 로그됨
- ✅ 실패 시 자동으로 재시도됨
- ✅ 재시도 간격이 기하급수적으로 증가함 (1s → 2s → 4s → 8s → 16s)
- ✅ 5회 실패 후 더 이상 재시도 안 함
- ✅ Cron job이 대기 중인 Webhook들을 재처리함
- ✅ 중복 처리 방지 (같은 eventId는 한 번만 처리)

---

## 🔍 데이터베이스 검증

각 기능 테스트 후 데이터베이스를 직접 확인하여 데이터 정합성을 검증합니다.

### Prisma Studio로 확인
```bash
npx prisma studio
```

브라우저에서 http://localhost:5555 접속

### 확인할 테이블:

1. **Payment**
   ```sql
   SELECT id, status, amount, method, bookingId, createdAt
   FROM Payment
   ORDER BY createdAt DESC;
   ```
   - 결제 상태가 올바른지 확인
   - 환불 시 `status`가 `'refunded'`로 변경되었는지 확인

2. **WebhookLog**
   ```sql
   SELECT id, provider, eventType, status, attemptCount, lastError, createdAt
   FROM WebhookLog
   ORDER BY createdAt DESC;
   ```
   - Webhook 처리 상태 확인
   - 재시도 횟수 확인
   - 에러 메시지 확인

3. **Booking**
   ```sql
   SELECT id, userId, cruiseId, status, createdAt
   FROM Booking
   ORDER BY createdAt DESC;
   ```
   - 결제 완료 시 예약 상태가 `'confirmed'`인지 확인

---

## 🐛 일반적인 문제 해결

### 1. Stripe 결제 폼이 표시되지 않음
**원인:** Stripe 키가 설정되지 않았거나 잘못됨
**해결:**
- `.env` 파일에서 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`와 `STRIPE_SECRET_KEY` 확인
- 키가 `pk_test_`와 `sk_test_`로 시작하는지 확인 (테스트 모드)
- 브라우저 콘솔에서 에러 메시지 확인

### 2. 영수증 이메일이 발송되지 않음
**원인:** SMTP 설정 오류
**해결:**
- Gmail 2단계 인증이 활성화되어 있는지 확인
- 앱 비밀번호를 정확히 입력했는지 확인 (16자리, 공백 없이)
- 서버 콘솔에서 상세 에러 메시지 확인
- 테스트용으로 Ethereal Email 사용 고려: https://ethereal.email/

### 3. Webhook이 수신되지 않음
**원인:** Stripe CLI가 실행되지 않았거나 포트가 다름
**해결:**
- Stripe CLI가 실행 중인지 확인:
  ```bash
  stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook
  ```
- Next.js 서버 포트와 일치하는지 확인 (기본 3000)
- Webhook Secret을 `.env`에 정확히 복사했는지 확인

### 4. 결제 히스토리가 비어있음
**원인:** 로그인한 사용자가 다르거나 결제 데이터가 없음
**해결:**
- 결제를 진행한 계정으로 로그인했는지 확인
- 데이터베이스에 실제로 결제 데이터가 있는지 확인:
  ```sql
  SELECT COUNT(*) FROM Payment;
  ```
- API 응답 확인: 브라우저 개발자 도구 → Network 탭 → `/api/v1/payments/history` 응답 확인

### 5. 환불이 처리되지 않음
**원인:** Stripe API 호출 실패 또는 권한 문제
**해결:**
- Stripe Secret Key가 올바른지 확인
- 서버 콘솔에서 에러 로그 확인
- Stripe Dashboard에서 환불이 실제로 생성되었는지 확인

---

## 📊 성공 기준

모든 테스트를 통과하면 다음 조건을 만족해야 합니다:

- ✅ **Stripe Elements Custom UI**
  - 결제 페이지에서 카드 입력 폼이 표시됨
  - 테스트 카드로 결제 성공
  - 결제 후 자동으로 대시보드로 이동

- ✅ **Payment History**
  - 사용자의 모든 결제가 표시됨
  - 필터링이 정상 작동함
  - 상세 페이지로 이동 가능

- ✅ **Payment Detail**
  - 결제의 모든 정보가 정확히 표시됨
  - 타임라인이 시간순으로 표시됨
  - 액션 버튼이 상태에 따라 표시됨

- ✅ **Partial Refund**
  - 전체/부분 환불 선택 가능
  - 금액 유효성 검사 작동
  - 환불 후 상태가 업데이트됨

- ✅ **Email Receipt**
  - 영수증 이메일이 정상 발송됨
  - HTML/텍스트 버전 모두 제공됨
  - 모든 결제 정보가 포함됨

- ✅ **Webhook Retry**
  - Webhook이 데이터베이스에 로그됨
  - 실패 시 자동 재시도됨
  - Exponential backoff 작동
  - Cron job으로 일괄 재시도 가능

---

## 🚀 다음 단계

모든 테스트를 통과했다면:

1. **프로덕션 환경변수 설정**
   - Stripe Live 키로 변경
   - 실제 SMTP 계정 사용
   - 강력한 CRON_SECRET 생성

2. **프로덕션 배포**
   - Google Cloud Run / Vercel / AWS 등에 배포
   - 환경변수 설정
   - Webhook URL을 Stripe Dashboard에 등록

3. **모니터링 설정**
   - Webhook 실패율 모니터링
   - 이메일 발송 성공률 추적
   - 결제 오류 로그 수집

4. **다음 Story 진행**
   - Story 007: 크루즈 검색 및 필터링
   - Story 008: 대시보드 및 예약 관리
   - Story 009: 알림 시스템

---

## 📝 테스트 완료 체크리스트

```markdown
- [ ] Stripe Elements 폼이 정상 표시됨
- [ ] 테스트 카드로 결제 성공
- [ ] 결제 히스토리 페이지에서 결제 목록 확인
- [ ] 필터링 기능 정상 작동
- [ ] 결제 상세 페이지에서 모든 정보 표시
- [ ] 타임라인이 시간순으로 표시됨
- [ ] 전체 환불 성공
- [ ] 부분 환불 성공
- [ ] 금액 유효성 검사 작동
- [ ] 영수증 이메일 수신
- [ ] HTML 이메일 정상 렌더링
- [ ] Webhook이 데이터베이스에 로그됨
- [ ] Webhook 재시도 작동 확인
- [ ] Exponential backoff 확인
- [ ] Cron job 엔드포인트 호출 성공
- [ ] 데이터베이스 데이터 정합성 확인
```

---

**테스트 중 문제가 발생하면 위의 "일반적인 문제 해결" 섹션을 참고하세요.**
**추가 도움이 필요하면 서버 콘솔 로그와 브라우저 개발자 도구의 에러 메시지를 확인하세요.**
