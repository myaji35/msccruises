# 토스페이먼츠 결제 시스템 연동 가이드

## 개요
MSC Cruises 웹사이트에 토스페이먼츠 결제 시스템이 성공적으로 연동되었습니다.

## 구현된 기능

### 1. 결제 페이지 (`/dashboard/bookings/payment`)
- 예약 정보 표시
- 결제 금액 확인 (USD → KRW 환율 적용)
- 토스페이먼츠 SDK를 통한 안전한 카드 결제
- PCI-DSS 보안 기준 준수

**주요 파일:**
- `/app/dashboard/bookings/payment/page.tsx`

**기능:**
- 예약 ID를 통한 결제 정보 조회
- 토스페이먼츠 SDK 로드 및 초기화
- 카드 결제 요청
- 결제 성공/실패 리디렉션

### 2. 결제 성공 페이지 (`/dashboard/bookings/payment/success`)
- 결제 성공 애니메이션 (confetti)
- 결제 정보 확인
- 다음 단계 안내
- 고객 지원 정보

**주요 파일:**
- `/app/dashboard/bookings/payment/success/page.tsx`

**기능:**
- 결제 정보 검증
- 예약 확인 버튼
- 영수증 다운로드 (예정)
- 고객 지원 연락처

### 3. 결제 실패 페이지 (`/dashboard/bookings/payment/fail`)
- 오류 코드 및 메시지 표시
- 문제 해결 가이드
- 재시도 기능
- 고객 지원 안내

**주요 파일:**
- `/app/dashboard/bookings/payment/fail/page.tsx`

**오류 코드 처리:**
- `PAY_PROCESS_CANCELED`: 사용자 취소
- `REJECT_CARD_PAYMENT`: 카드 거부
- `EXCEED_MAX_CARD_DAILY_LIMIT`: 일일 한도 초과
- `INVALID_CARD_EXPIRATION`: 유효기간 만료
- 기타 다양한 오류 코드

### 4. 결제 검증 API (`/api/payment/verify`)
- 백엔드 결제 검증
- 토스페이먼츠 API와 통신
- 결제 상태 확인

**주요 파일:**
- `/app/api/payment/verify/route.ts`

**기능:**
- 토스페이먼츠 API 호출
- 결제 승인 확인
- 데이터베이스 업데이트 (예정)
- 확인 이메일 발송 (예정)

### 5. 예약 상세 페이지 업데이트
- 결제 대기 상태일 때 결제 버튼 표시
- 결제 완료 전 E-Ticket 다운로드 비활성화
- 결제 상태에 따른 UI 변경

**수정 파일:**
- `/app/dashboard/bookings/[id]/page.tsx`

## 환경 변수 설정

`.env` 파일에 다음 변수들이 추가되었습니다:

```env
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"
TOSS_SECRET_KEY="test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
```

**주의사항:**
- 현재는 테스트 키를 사용 중입니다
- 프로덕션 배포 시 실제 키로 변경해야 합니다
- Secret Key는 절대 클라이언트에 노출되지 않습니다

## 설치된 패키지

```bash
npm install @tosspayments/payment-sdk  # 토스페이먼츠 SDK
npm install canvas-confetti            # 성공 애니메이션
```

## 결제 플로우

1. **예약 생성**
   - 사용자가 크루즈 예약 완료
   - 예약 상태: `confirmed`
   - 결제 상태: `pending`

2. **결제 페이지 이동**
   - 예약 상세 페이지에서 "결제하기" 버튼 클릭
   - `/dashboard/bookings/payment?bookingId={id}` 페이지로 이동

3. **결제 요청**
   - 토스페이먼츠 SDK 로드
   - 카드 정보 입력
   - 결제 승인 요청

4. **결제 처리**
   - 성공 시: `/dashboard/bookings/payment/success` 페이지로 리디렉션
   - 실패 시: `/dashboard/bookings/payment/fail` 페이지로 리디렉션

5. **결제 검증** (백엔드)
   - `/api/payment/verify` 엔드포인트 호출
   - 토스페이먼츠 API로 결제 확인
   - 데이터베이스 업데이트
   - 확인 이메일 발송

## 보안 고려사항

1. **PCI-DSS 준수**
   - 카드 정보는 토스페이먼츠에서 직접 처리
   - 서버에 카드 정보 저장하지 않음

2. **API 키 관리**
   - Client Key: 클라이언트에서 사용 (공개 가능)
   - Secret Key: 서버에서만 사용 (비공개)

3. **결제 검증**
   - 클라이언트 결제 완료 후 서버에서 재검증
   - 이중 검증으로 보안 강화

## 향후 구현 예정

- [ ] 데이터베이스에 결제 내역 저장
- [ ] 예약 상태 자동 업데이트
- [ ] 결제 완료 이메일 발송
- [ ] 영수증 PDF 생성 및 다운로드
- [ ] 환불 기능
- [ ] 결제 내역 조회
- [ ] 다양한 결제 수단 추가 (계좌이체, 가상계좌 등)

## 테스트 방법

1. **로컬 서버 실행**
   ```bash
   npm run dev
   ```

2. **예약 상세 페이지 접속**
   - http://localhost:3000/dashboard/bookings/test-001

3. **결제하기 버튼 클릭**
   - 결제 페이지로 이동

4. **테스트 카드 정보 입력**
   - 토스페이먼츠 테스트 카드 번호 사용
   - https://docs.tosspayments.com/resources/test-cards

5. **결제 프로세스 확인**
   - 성공/실패 페이지 확인
   - 각 단계별 UI 검증

## 문제 해결

### 결제 SDK 로드 실패
- 환경 변수 확인: `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- 네트워크 연결 확인
- 브라우저 콘솔에서 오류 확인

### 결제 승인 실패
- 테스트 카드 번호 확인
- 금액 확인 (최소 결제 금액 이상)
- Secret Key 확인

### 리디렉션 오류
- successUrl, failUrl 확인
- 도메인 설정 확인

## 참고 문서

- [토스페이먼츠 개발자 문서](https://docs.tosspayments.com/)
- [토스페이먼츠 SDK 가이드](https://docs.tosspayments.com/reference/js-sdk)
- [테스트 카드 정보](https://docs.tosspayments.com/resources/test-cards)
- [오류 코드](https://docs.tosspayments.com/reference/error-codes)
