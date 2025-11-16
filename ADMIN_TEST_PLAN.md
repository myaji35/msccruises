# 🔍 관리자 상품등록 기능 종합 테스트 계획서

**작성일:** 2025-11-12
**담당자:** QA Team
**프로젝트:** MSC Cruises Admin Panel - Cruise Product Registration
**중요도:** ⭐⭐⭐⭐⭐ CRITICAL

---

## 📋 목차

1. [테스트 개요](#테스트-개요)
2. [테스트 환경](#테스트-환경)
3. [발견된 중요 이슈](#발견된-중요-이슈)
4. [상세 테스트 케이스](#상세-테스트-케이스)
5. [E2E 테스트 시나리오](#e2e-테스트-시나리오)
6. [테스트 결과 기록](#테스트-결과-기록)
7. [최종 체크리스트](#최종-체크리스트)

---

## 테스트 개요

### 테스트 범위
- ✅ 관리자 인증 (Admin Authentication)
- ✅ 크루즈 상품 CRUD (Create, Read, Update, Delete)
- ✅ 미디어 관리 (이미지/비디오 업로드)
- ✅ 항공편 관리 (Flight Itinerary)
- ✅ 항구 일정 관리 (Port Itinerary)
- ✅ SNS 계정 관리
- ✅ 데이터 유효성 검증
- ✅ 에러 처리 및 예외 상황

### 테스트 목표
```
1. 상품등록 전체 흐름이 정상 작동하는지 검증
2. 데이터 무결성 보장
3. 보안 취약점 식별
4. 성능 문제 파악
5. 사용자 경험 검증
```

### 기대 결과
- 모든 CRUD 작업이 성공적으로 완료
- 데이터베이스에 정확하게 저장
- 적절한 에러 메시지 표시
- 예상치 못한 동작 없음

---

## 테스트 환경

### 시스템 정보
- **Node.js Version:** v18+
- **Next.js Version:** 16.0.1
- **Database:** SQLite (Prisma)
- **Browser:** Chrome/Safari/Firefox (latest)
- **OS:** macOS/Windows/Linux

### 사전 준비
```bash
# 1. 개발 서버 시작
npm run dev

# 2. 데이터베이스 초기화
npx prisma migrate dev
npx prisma db seed

# 3. 브라우저 열기
http://localhost:3000/admin
```

### 테스트 데이터
- **Admin Password:** `admin123`
- **Test Cruise:** `test-cruise-caribbean-001` (seed data)
- **Test User:** `admin@test.com` / `password123`

---

## 발견된 중요 이슈

### 🚨 CRITICAL ISSUES (즉시 수정 필요)

#### Issue #1: PUT/DELETE 크루즈 엔드포인트 미구현
- **위치:** `/app/api/admin/cruises/[id]/route.ts`
- **문제:**
  - Edit 페이지에서 `PUT /api/admin/cruises/[id]` 호출 시도 → **실패**
  - Delete 버튼에서 `DELETE /api/admin/cruises/[id]` 호출 시도 → **실패**
  - 현재 엔드포인트에는 GET만 구현되어 있음
- **영향도:** 크루즈 수정 및 삭제 불가능
- **수정 방법:**
  ```typescript
  // PUT 구현 필요
  export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await request.json();

    const cruise = await prisma.cruise.update({
      where: { id },
      data: {
        name: data.name,
        shipName: data.shipName,
        description: data.description,
        departurePort: data.departurePort,
        destinations: JSON.stringify(data.destinations),
        durationDays: parseInt(data.durationDays),
        startingPrice: parseFloat(data.startingPrice),
        currency: data.currency,
        status: data.status,
        featured: data.featured
      },
      include: { media: true, cruiseItineraries: true }
    });

    return NextResponse.json({ success: true, cruise });
  }

  // DELETE 구현 필요
  export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await prisma.cruise.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Cruise deleted" });
  }
  ```

#### Issue #2: 클라이언트 측 인증만 구현됨
- **위치:** `/admin/page.tsx`, `/admin/layout.tsx`
- **문제:**
  - 모든 인증이 `localStorage`에 기반
  - 개발자 도구에서 토큰 조작 가능
  - 서버에서 인증 검증 없음
  - `admin_authenticated: true` 설정 후 접근 가능
- **영향도:** 보안 취약점 - 누구나 관리자 페이지 접근 가능
- **권장 사항:**
  - NextAuth.js 또는 커스텀 JWT 기반 인증 구현
  - 서버 사이드 세션 관리
  - 안전한 토큰 저장소 사용

#### Issue #3: SNS 토큰 평문 저장
- **위치:** `/api/admin/sns/accounts/route.ts` line 44
- **문제:**
  ```typescript
  const account = await prisma.snsAccount.create({
    data: {
      platform,
      accountId,
      accessToken,  // 암호화 없이 평문으로 저장!
      refreshToken,  // 암호화 없이 평문으로 저장!
    }
  });
  ```
- **영향도:** CRITICAL - API 토큰이 노출되면 소셜 계정 탈취 가능
- **수정 방법:**
  ```typescript
  import crypto from 'crypto';

  const key = process.env.ENCRYPTION_KEY; // 256-bit key
  const cipher = crypto.createCipher('aes-256-cbc', key);

  let encrypted = cipher.update(accessToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const account = await prisma.snsAccount.create({
    data: {
      platform,
      accountId,
      accessToken: encrypted,  // 암호화된 토큰 저장
      refreshToken: encrypted
    }
  });
  ```

---

### ⚠️ HIGH PRIORITY ISSUES

#### Issue #4: 서버 측 폼 검증 부족
- **위치:** `/api/admin/cruises/route.ts`
- **현재 상태:** 필수 필드 체크만 수행 (line 92-96)
- **문제:** 타입 검증, 범위 검증 없음
- **개선 사항:** Zod, Yup 등 스키마 라이브러리 사용

#### Issue #5: 개발 모드 인증 우회
- **위치:** `/api/admin/cruises/route.ts` line 54-72
- **문제:**
  ```typescript
  // 프로덕션 체크 미구현
  if (process.env.NODE_ENV === 'development') {
    console.log("[DEV MODE] Skipping authentication...");
    // 인증 없이 진행
  }
  ```
- **영향도:** 개발 중에도 보안 테스트 불가능

---

## 상세 테스트 케이스

### 1️⃣ 관리자 인증 테스트

#### TC-AUTH-001: 올바른 비밀번호로 로그인
```
[ ] 1. /admin 페이지 접근
[ ] 2. 비밀번호 입력: "admin123"
[ ] 3. "로그인" 버튼 클릭
[ ] 4. ✅ 기대 결과: 대시보드로 이동
[ ] 5. ✅ localStorage에 'admin_authenticated' = true 저장 확인
[ ] 6. ✅ 모든 관리자 메뉴 표시 확인
```

#### TC-AUTH-002: 잘못된 비밀번호 시도
```
[ ] 1. /admin 페이지 접근
[ ] 2. 비밀번호 입력: "wrongpassword"
[ ] 3. "로그인" 버튼 클릭
[ ] 4. ✅ 기대 결과: 에러 메시지 표시
[ ] 5. ✅ 페이지 이동 없음
[ ] 6. ✅ localStorage 토큰 생성 안 됨
```

#### TC-AUTH-003: 비밀번호 변경
```
[ ] 1. 로그인 완료
[ ] 2. "설정" → "비밀번호 변경" 클릭
[ ] 3. 현재 비밀번호: "admin123"
[ ] 4. 새 비밀번호: "newPassword123"
[ ] 5. 확인 클릭
[ ] 6. ✅ 기대 결과: 성공 메시지
[ ] 7. ✅ 새 비밀번호로 재로그인 가능 확인
```

#### TC-AUTH-004: 인증 없이 관리자 페이지 접근
```
[ ] 1. localStorage 에서 'admin_authenticated' 제거
[ ] 2. /admin/cruises 직접 접근
[ ] 3. ✅ 기대 결과: 로그인 페이지로 리다이렉트
[ ] 4. ❌ 문제점: 실제로는 페이지 로드될 수 있음 (취약점)
```

---

### 2️⃣ 크루즈 생성(CREATE) 테스트

#### TC-CRUISE-CREATE-001: 필수 필드만으로 크루즈 생성
```
[ ] 1. /admin/cruises → "새 상품 등록" 버튼 클릭
[ ] 2. 다음 필드 입력:
    [ ] - 크루즈명: "Test Cruise 001"
    [ ] - 선박명: "MSC Test Ship"
    [ ] - 출발항: "Dubai, UAE"
    [ ] - 목적지: "Mumbai,Oman,Qatar"
    [ ] - 기간: 7
    [ ] - 가격: 1500
    [ ] - 통화: USD
[ ] 3. 미디어 업로드 건너뛰기
[ ] 4. "상품 등록" 버튼 클릭
[ ] 5. ✅ 기대 결과: 성공 메시지 + 상품 상세 페이지 표시
[ ] 6. ✅ 데이터베이스 확인:
    [ ] - Cruise 테이블에 레코드 추가됨
    [ ] - 모든 필드 값 정확히 저장됨
```

#### TC-CRUISE-CREATE-002: 모든 필드로 크루즈 생성
```
[ ] 1. /admin/cruises/new 페이지 접근
[ ] 2. 모든 필드 입력:
    [ ] - 크루즈명: "Mediterranean Cruise Pro"
    [ ] - 선박명: "MSC Virtuosa"
    [ ] - 설명: "7일간 지중해 크루즈"
    [ ] - 출발항: "Barcelona, Spain"
    [ ] - 목적지: "Rome,Nice,Palma,Ibiza"
    [ ] - 기간: 7
    [ ] - 가격: 1999.99
    [ ] - 통화: EUR
    [ ] - 상태: "active"
    [ ] - 추천: ✓ 체크
[ ] 3. 이미지 업로드 (최소 1개)
[ ] 4. "상품 등록" 클릭
[ ] 5. ✅ 기대 결과: 모든 데이터 저장됨
[ ] 6. ✅ 대시보드에서 "추천" 배지 표시
```

#### TC-CRUISE-CREATE-003: 필수 필드 누락 시 오류
```
[ ] 1. 크루즈명 필드 비우기
[ ] 2. 선박명만 입력: "MSC Test"
[ ] 3. "상품 등록" 클릭
[ ] 4. ✅ 기대 결과: 폼 검증 에러 메시지
[ ] 5. ✅ 필수 필드 표시 (*)
[ ] 6. ✅ 서버 응답 400 에러 확인
```

#### TC-CRUISE-CREATE-004: 잘못된 데이터 타입
```
[ ] 1. 기간 필드에 "abc" 입력
[ ] 2. 가격 필드에 "-100" 입력
[ ] 3. "상품 등록" 클릭
[ ] 4. ✅ 기대 결과: 입력 형식 오류 메시지
[ ] 5. ✅ 숫자만 허용하는 HTML5 입력 제약
[ ] 6. ✅ 음수 가격 거부
```

#### TC-CRUISE-CREATE-005: 이미지 업로드 - 유효한 파일
```
[ ] 1. 크루즈 생성 페이지에서 이미지 업로드 영역으로 이동
[ ] 2. 파일 선택: "cruise-image.jpg" (5MB, JPEG)
[ ] 3. ✅ 기대 결과: 미리보기 표시
[ ] 4. ✅ 파일명 표시
[ ] 5. ✅ 업로드 진행률 표시
[ ] 6. ✅ 업로드 완료 후 목록에 추가
```

#### TC-CRUISE-CREATE-006: 이미지 업로드 - 파일 크기 초과
```
[ ] 1. 파일 선택: "large-video.mp4" (15MB)
[ ] 2. ✅ 기대 결과: "파일 크기 초과 (10MB 제한)" 에러
[ ] 3. ✅ 파일 업로드 거부
```

#### TC-CRUISE-CREATE-007: 이미지 업로드 - 허용되지 않는 타입
```
[ ] 1. 파일 선택: "document.pdf"
[ ] 2. ✅ 기대 결과: "지원되지 않는 파일 형식" 에러
[ ] 3. ✅ 이미지/비디오만 허용 확인
```

#### TC-CRUISE-CREATE-008: 다중 이미지 업로드
```
[ ] 1. 이미지 3개 동시 선택:
    [ ] - photo1.jpg
    [ ] - photo2.png
    [ ] - photo3.webp
[ ] 2. ✅ 기대 결과: 모두 업로드됨
[ ] 3. ✅ 각 파일에 고유 URL 생성됨
[ ] 4. ✅ 모두 미디어 목록에 추가됨
```

#### TC-CRUISE-CREATE-009: 주요 이미지 설정
```
[ ] 1. 여러 이미지 업로드
[ ] 2. 특정 이미지의 "주요 이미지" 라디오 버튼 선택
[ ] 3. "상품 등록" 클릭
[ ] 4. ✅ 기대 결과: 크루즈 목록에서 해당 이미지가 썸네일로 표시
[ ] 5. ✅ 상세 페이지에서도 주요 이미지가 배너로 표시
```

---

### 3️⃣ 크루즈 조회(READ) 테스트

#### TC-CRUISE-READ-001: 크루즈 목록 조회
```
[ ] 1. /admin/cruises 페이지 접근
[ ] 2. ✅ 기대 결과: 등록된 모든 크루즈 표시
[ ] 3. ✅ 각 크루즈별 카드 표시:
    [ ] - 썸네일 이미지
    [ ] - 크루즈명
    [ ] - 선박명
    [ ] - 기간
    [ ] - 가격
    [ ] - 상태 배지
    [ ] - 액션 버튼 (보기, 편집, 삭제)
```

#### TC-CRUISE-READ-002: 크루즈 상세 조회
```
[ ] 1. 목록에서 크루즈 클릭
[ ] 2. ✅ 기대 결과: 상세 페이지 표시
[ ] 3. ✅ 다음 정보 표시:
    [ ] - 주요 이미지 (큰 배너)
    [ ] - 기본 정보 (명, 선박, 항, 기간, 가격)
    [ ] - 설명 텍스트
    [ ] - 목적지 태그
    [ ] - 모든 미디어 갤러리
    [ ] - 일정 (항구별 도착/출발 시간)
    [ ] - 메타데이터 (생성일, 수정일)
    [ ] - 액션 버튼 (편집, 삭제)
```

#### TC-CRUISE-READ-003: 상세 페이지 - 항공편 정보
```
[ ] 1. 상세 페이지 스크롤
[ ] 2. ✅ 기대 결과: 항공편 섹션 표시
[ ] 3. ✅ 다음 정보 표시:
    [ ] - 출발 항공편 (항공사, 번호, 시간)
    [ ] - 귀국 항공편 (항공사, 번호, 시간)
    [ ] - 비행 시간
    [ ] - 탑승반 정보
```

#### TC-CRUISE-READ-004: 검색 기능 (예정)
```
[ ] 1. 크루즈명 검색: "Caribbean"
[ ] 2. ✅ 기대 결과: 일치하는 크루즈만 표시
[ ] 3. ✅ 검색 초기화 버튼 작동
```

---

### 4️⃣ 크루즈 수정(UPDATE) 테스트

#### TC-CRUISE-UPDATE-001: 기본 정보 수정
```
[ ] 1. 크루즈 상세 페이지 → "편집" 버튼
[ ] 2. ❌ 현재 상태: "편집" 기능 미구현 (PUT 엔드포인트 없음)
[ ] 3. 수정 후 "저장" 클릭 시 실패
[ ] 4. 🔧 FIX REQUIRED: PUT /api/admin/cruises/[id] 구현 필요
```

#### TC-CRUISE-UPDATE-002: 가격 변경
```
[ ] 1. 편집 페이지에서 가격 필드 수정
[ ] 2. 원가격: $1500 → 새 가격: $1299
[ ] 3. "저장" 클릭
[ ] 4. ✅ 기대 결과: 목록과 상세 페이지에 새 가격 반영
[ ] 5. ✅ 변경 이력 추적 가능
```

#### TC-CRUISE-UPDATE-003: 상태 변경
```
[ ] 1. 상태: draft → active 변경
[ ] 2. "저장" 클릭
[ ] 3. ✅ 기대 결과:
    [ ] - 목록에서 "활성" 배지 표시
    [ ] - 고객이 검색하면 해당 상품 노출
```

#### TC-CRUISE-UPDATE-004: 미디어 추가
```
[ ] 1. 편집 페이지에서 미디어 섹션으로 이동
[ ] 2. 새 이미지 업로드
[ ] 3. "저장" 클릭
[ ] 4. ✅ 기대 결과: 기존 미디어 유지, 새 미디어 추가
```

#### TC-CRUISE-UPDATE-005: 항구 일정 수정
```
[ ] 1. 편집 페이지에서 항구 일정 수정
[ ] 2. 날짜 2: 항구명 변경 "Nassau" → "Port Royal"
[ ] 3. "저장" 클릭
[ ] 4. ✅ 기대 결과: 일정 업데이트됨
```

#### TC-CRUISE-UPDATE-006: 동시 수정 충돌
```
[ ] 1. 브라우저 2개 탭에서 동일 크루즈 편집
[ ] 2. 탭1: 가격 $1500으로 수정 → 저장
[ ] 3. 탭2: 가격 $1299로 수정 → 저장
[ ] 4. ✅ 기대 결과:
    [ ] - 마지막 저장값으로 덮어씀 (또는)
    [ ] - 버전 충돌 경고 표시
```

---

### 5️⃣ 크루즈 삭제(DELETE) 테스트

#### TC-CRUISE-DELETE-001: 크루즈 삭제
```
[ ] 1. 크루즈 목록에서 삭제할 크루즈 선택
[ ] 2. "삭제" 버튼 클릭
[ ] 3. ❌ 현재 상태: DELETE 엔드포인트 미구현
[ ] 4. 🔧 FIX REQUIRED: DELETE /api/admin/cruises/[id] 구현 필요
```

#### TC-CRUISE-DELETE-002: 삭제 확인 다이얼로그
```
[ ] 1. 삭제 버튼 클릭
[ ] 2. ✅ 기대 결과: 확인 다이얼로그 표시
    [ ] - "정말 삭제하시겠습니까?"
    [ ] - 크루즈명 표시
    [ ] - "취소" / "삭제" 버튼
[ ] 3. "취소" 클릭 시 삭제 취소
```

#### TC-CRUISE-DELETE-003: 연관 데이터 삭제
```
[ ] 1. 크루즈 삭제 (미디어, 항구, 항공편 포함)
[ ] 2. ✅ 기대 결과:
    [ ] - 크루즈 레코드 삭제됨
    [ ] - 관련 CruiseMedia 레코드 삭제됨
    [ ] - 관련 CruiseItinerary 레코드 삭제됨
    [ ] - 관련 FlightItinerary 레코드 삭제됨
    [ ] - 데이터베이스 무결성 유지
```

#### TC-CRUISE-DELETE-004: 삭제된 크루즈 복구 불가
```
[ ] 1. 크루즈 삭제
[ ] 2. 목록 새로고침
[ ] 3. ✅ 기대 결과: 크루즈가 목록에서 사라짐
[ ] 4. ✅ 복구 기능 없음 (아카이브 권장)
```

---

### 6️⃣ 항구 일정 관리 테스트

#### TC-ITINERARY-001: 항구 추가
```
[ ] 1. 크루즈 편집 페이지 → 항구 일정 섹션
[ ] 2. "항구 추가" 버튼
[ ] 3. 다음 정보 입력:
    [ ] - 날짜: 3
    [ ] - 항구: "Cozumel, Mexico"
    [ ] - 항구 코드: CMX
    [ ] - 도착 시간: 08:00
    [ ] - 출발 시간: 17:00
    [ ] - 활동: Snorkeling, Beach, Water Sports
[ ] 4. "추가" 클릭
[ ] 5. ✅ 기대 결과: 항구가 일정에 추가됨
```

#### TC-ITINERARY-002: 항구 순서 변경
```
[ ] 1. 항구 일정 목록에서 드래그 앤 드롭
[ ] 2. Day 2 ↔ Day 3 순서 변경
[ ] 3. "저장" 클릭
[ ] 4. ✅ 기대 결과: 순서가 데이터베이스에 반영됨
```

#### TC-ITINERARY-003: 항구 제거
```
[ ] 1. 항구 항목의 "제거" 버튼 클릭
[ ] 2. ✅ 기대 결과: 항구가 목록에서 제거됨
[ ] 3. ✅ "저장" 클릭 시 데이터베이스에서 삭제됨
```

---

### 7️⃣ 항공편 관리 테스트

#### TC-FLIGHT-001: 출발 항공편 등록
```
[ ] 1. 크루즈 편집 → 항공편 섹션
[ ] 2. "출발편 추가" 버튼
[ ] 3. 다음 정보 입력:
    [ ] - 항공사: Korean Air
    [ ] - 항공사 코드: KE
    [ ] - 항공편 번호: KE101
    [ ] - 출발지: ICN (Incheon)
    [ ] - 목적지: MIA (Miami)
    [ ] - 출발 날짜: 2025-12-14
    [ ] - 출발 시간: 10:30
    [ ] - 도착 시간: 16:45 (다음날)
    [ ] - 소요 시간: 915분
    [ ] - 항공기: Boeing 777-300ER
    [ ] - 탑승반: Economy (또는 Business)
    [ ] - 경유편: 0 (직항)
[ ] 4. "추가" 클릭
[ ] 5. ✅ 기대 결과: 항공편이 등록됨
```

#### TC-FLIGHT-002: 귀국 항공편 등록
```
[ ] 1. "귀국편 추가" 버튼
[ ] 2. 출발편 정보와 반대로 입력
    [ ] - 출발지: MIA → ICN
    [ ] - 목적지: ICN
[ ] 3. "추가" 클릭
[ ] 4. ✅ 기대 결과: 귀국편 등록됨
```

#### TC-FLIGHT-003: 경유편 등록
```
[ ] 1. 경유편 추가:
    [ ] - 경유 횟수: 1
    [ ] - 1차 도시: NRT (Tokyo)
    [ ] - 경유 시간: 2시간
[ ] 2. "추가" 클릭
[ ] 3. ✅ 기대 결과: 경유 정보 저장됨
```

#### TC-FLIGHT-004: 항공편 정보 수정
```
[ ] 1. 등록된 항공편의 "편집" 버튼
[ ] 2. 탑승반 변경: Economy → Business
[ ] 3. "저장" 클릭
[ ] 4. ✅ 기대 결과: 변경사항 반영됨
```

#### TC-FLIGHT-005: 항공편 삭제
```
[ ] 1. 항공편의 "삭제" 버튼
[ ] 2. "저장" 클릭
[ ] 3. ✅ 기대 결과: 항공편 삭제됨
```

---

### 8️⃣ 데이터 유효성 테스트

#### TC-VALIDATION-001: 날짜 범위 검증
```
[ ] 1. 크루즈 기간: 20일
[ ] 2. 항구 일정 추가:
    [ ] - Day 1: Departure
    [ ] - Day 20: Arrival
    [ ] - Day 25: 일정 추가 시도 (범위 초과)
[ ] 3. ✅ 기대 결과: "크루즈 기간을 초과할 수 없습니다" 에러
```

#### TC-VALIDATION-002: 시간 포맷 검증
```
[ ] 1. 항구 도착 시간: "25:00" 입력 시도
[ ] 2. ✅ 기대 결과: "유효한 시간 형식이 아닙니다" 에러
[ ] 3. ✅ HH:MM 형식만 허용
```

#### TC-VALIDATION-003: 좌표 범위 검증
```
[ ] 1. 위도: 91 입력 시도 (-90~90 범위)
[ ] 2. ✅ 기대 결과: 범위 오류 표시
```

#### TC-VALIDATION-004: 중복 체크
```
[ ] 1. 동일한 크루즈명으로 2개 등록 시도
[ ] 2. ✅ 기대 결과:
    [ ] - 허용 (이름 중복 가능) 또는
    [ ] - 거부 (이름 고유성 요구)
    [ ] - 정책 명확히 할 것
```

---

## E2E 테스트 시나리오

### 🎯 Scenario A: 전체 크루즈 등록 흐름

**목적:** 새로운 크루즈 상품을 처음부터 끝까지 등록하고 조회할 수 있는지 검증

**전제 조건:**
- 관리자 로그인 완료
- 데이터베이스 초기 상태

**테스트 단계:**

```
[Step 1] 크루즈 기본정보 입력
├─ /admin/cruises/new 접근
├─ 필드 입력:
│  ├─ 크루즈명: "Arctic Explorer 2025"
│  ├─ 선박명: "MSC Arctica"
│  ├─ 설명: "북극 탐험 크루즈"
│  ├─ 출발항: "Reykjavik, Iceland"
│  ├─ 목적지: "Spitsbergen,Greenland,Arctic Ocean"
│  ├─ 기간: 12
│  ├─ 가격: 2999.99
│  ├─ 통화: USD
│  ├─ 상태: draft
│  └─ 추천: 미선택
└─ ✅ 결과: 폼 유효성 검사 통과

[Step 2] 미디어 업로드
├─ 이미지 파일 선택: 3개
│  ├─ arctic-01.jpg (주요 이미지로 설정)
│  ├─ arctic-02.jpg
│  └─ arctic-03.jpg
├─ 드래그 앤 드롭 또는 파일 선택
├─ 각 파일 업로드 진행률 확인
└─ ✅ 결과: 모두 업로드 완료

[Step 3] 항구 일정 추가
├─ Day 1: Reykjavik (Departure, 18:00)
├─ Day 2-3: At Sea
├─ Day 4: Svalbard/Spitsbergen (08:00-17:00)
│  └─ 활동: Polar Safari, Dog Sledding
├─ Day 5-11: Arctic Exploration
├─ Day 12: Reykjavik (Arrival, 08:00)
└─ ✅ 결과: 모든 항구 일정 등록됨

[Step 4] 항공편 등록
├─ 출발편:
│  ├─ KE102 (Korean Air)
│  ├─ ICN → KEF (Reykjavik International)
│  ├─ 2025-12-13 10:30 → 2025-12-13 16:45
│  └─ 915분 (직항)
├─ 귀국편:
│  ├─ KE101 (Korean Air)
│  ├─ KEF → ICN
│  ├─ 2025-12-25 18:00 → 2025-12-26 10:30
│  └─ 915분 (직항)
└─ ✅ 결과: 양방향 항공편 등록됨

[Step 5] 최종 저장
├─ "상품 등록" 버튼 클릭
├─ 폼 검증 통과
├─ API 요청 `/api/admin/cruises` POST
└─ ✅ 결과: 성공 메시지 + 상품 상세 페이지 이동

[Step 6] 데이터 검증
├─ 데이터베이스 쿼리:
│  ├─ Cruise 테이블 확인
│  │  └─ id, name, shipName 등 모든 필드 저장됨
│  ├─ CruiseMedia 테이블 확인
│  │  └─ 3개 이미지 레코드 생성
│  ├─ CruiseItinerary 테이블 확인
│  │  └─ 12개 day 레코드 생성
│  └─ FlightItinerary 테이블 확인
│     └─ 2개 항공편 (outbound, return) 레코드 생성
└─ ✅ 결과: 모든 데이터 정상 저장

[Step 7] 조회 기능 검증
├─ /admin/cruises 목록 접근
├─ "Arctic Explorer 2025" 크루즈 확인
│  ├─ 썸네일: arctic-01.jpg 표시
│  ├─ 기본 정보 표시
│  └─ draft 상태 배지 표시
├─ 크루즈 클릭 → 상세 페이지
│  ├─ 주요 이미지: arctic-01.jpg 배너
│  ├─ 모든 기본정보 표시
│  ├─ 항구 일정 타임라인 표시
│  ├─ 항공편 정보 표시
│  ├─ 모든 미디어 갤러리 표시
│  └─ "편집" / "삭제" 버튼 표시
└─ ✅ 결과: 모든 정보 정상 표시

결과 정리:
✅ 크루즈 생성 성공
✅ 데이터 무결성 보장
✅ 조회 기능 정상
```

---

### 🎯 Scenario B: 크루즈 정보 수정 (Update Flow)

**목적:** 등록된 크루즈의 정보를 수정할 수 있는지 검증

**전제 조건:**
- Step A 완료 (크루즈 등록됨)
- 관리자 로그인 상태

**테스트 단계:**

```
[Step 1] 편집 페이지 접근
├─ /admin/cruises 목록에서 "Arctic Explorer 2025" 찾기
├─ "편집" 버튼 클릭
├─ /admin/cruises/[id]/edit 페이지 로드
├─ ⚠️ 현재 상태: 이 버튼이 작동하지 않을 수 있음
└─ 🔧 FIX NEEDED: PUT 엔드포인트 구현

[Step 2] 정보 수정 (기대 동작)
├─ 가격 변경: $2999.99 → $2699.99
├─ 상태 변경: draft → active
├─ 추천 설정: 체크
├─ "저장" 클릭
├─ ✅ 기대 결과: PUT /api/admin/cruises/[id] 호출
└─ ✅ 데이터베이스 업데이트

[Step 3] 미디어 추가
├─ 기존 이미지: 3개
├─ 새 이미지 추가: arctic-04.jpg
├─ "저장" 클릭
├─ ✅ 기대 결과: CruiseMedia 레코드 추가
└─ ✅ 기존 미디어는 유지

[Step 4] 항구 일정 수정
├─ Day 4 항구명 변경: "Spitsbergen" → "Ny-Alesund"
├─ Day 4 활동 추가: "Aurora Watching"
├─ "저장" 클릭
├─ ✅ 기대 결과: CruiseItinerary 업데이트
└─ ✅ 다른 항구 일정은 유지

[Step 5] 수정 반영 확인
├─ 상세 페이지 새로고침
├─ 새 가격 표시: $2699.99
├─ 상태: active로 변경됨
├─ 추천 배지 표시됨
├─ 항구 정보 업데이트됨
└─ ✅ 모든 변경사항 적용됨
```

---

### 🎯 Scenario C: 오류 처리 및 보안 검증

**목적:** 예상치 못한 상황에서 시스템이 안전하게 처리하는지 검증

**테스트 시나리오:**

```
[C1] 네트워크 오류 발생
├─ 상품 등록 중 네트워크 끊김 시뮬레이션
├─ ✅ 기대 결과:
│  ├─ 명확한 에러 메시지 표시
│  ├─ "다시 시도" 버튼 제공
│  ├─ 입력한 데이터 유지
│  └─ 불완전한 데이터 저장 방지

[C2] 서버 오류 (5xx)
├─ API 응답: 500 Internal Server Error
├─ ✅ 기대 결과:
│  ├─ "서버 오류가 발생했습니다" 메시지
│  ├─ 에러 로그 기록
│  ├─ 관리자에게 알림 (선택사항)
│  └─ 데이터 롤백

[C3] 대용량 파일 업로드
├─ 파일 크기: 100MB
├─ ✅ 기대 결과:
│  ├─ 파일 크기 검증 (10MB 제한)
│  ├─ "파일이 너무 큽니다" 에러
│  └─ 업로드 차단

[C4] 동시성 문제
├─ 2개 탭에서 동시에 같은 크루즈 편집
├─ 탭A: 가격 변경 후 저장
├─ 탭B: 설명 변경 후 저장 (마지막)
├─ ✅ 기대 결과:
│  ├─ 마지막 저장값이 최종 상태
│  ├─ 또는 버전 충돌 경고
│  └─ 데이터 일관성 유지

[C5] 입력 검증 - XSS 방지
├─ 크루즈명 입력: "<script>alert('xss')</script>"
├─ ✅ 기대 결과:
│  ├─ 스크립트 태그가 제거되거나 이스케이프됨
│  ├─ 데이터베이스에 안전하게 저장됨
│  ├─ 화면에 표시할 때 렌더링되지 않음
│  └─ 보안 취약점 방지

[C6] SQL Injection 방지
├─ 입력: "'; DROP TABLE Cruise; --"
├─ ✅ 기대 결과:
│  ├─ Prisma ORM이 자동으로 파라미터화
│  ├─ 쿼리 인젝션 불가능
│  └─ 데이터 안전 보장
```

---

## 테스트 결과 기록

### 테스트 실행 일시
- **날짜:** 2025-11-12
- **시작 시간:**
- **종료 시간:**
- **테스터:**

### 테스트 환경
- **브라우저:** Chrome / Safari / Firefox
- **Node 버전:**
- **데이터베이스:** SQLite
- **개발 서버:** http://localhost:3000

### 테스트 결과 요약

| 카테고리 | 테스트 수 | 성공 | 실패 | 스킵 | 성공률 |
|---------|---------|------|------|------|-------|
| 인증 | 4 | _ | _ | _ | _%  |
| 생성 | 9 | _ | _ | _ | _%  |
| 조회 | 4 | _ | _ | _ | _%  |
| 수정 | 6 | _ | _ | _ | _%  |
| 삭제 | 4 | _ | _ | _ | _%  |
| 항구 | 3 | _ | _ | _ | _%  |
| 항공편 | 5 | _ | _ | _ | _%  |
| 유효성 | 4 | _ | _ | _ | _%  |
| **전체** | **39** | **_** | **_** | **_** | **_%** |

### 상세 테스트 결과

#### TC-AUTH-001: 올바른 비밀번호로 로그인
- **상태:** [ ] 미실행 [ ] 통과 ✅ [X] 실패
- **에러:**
- **스크린샷:**
- **노트:**

#### TC-CRUISE-CREATE-001: 필수 필드만으로 크루즈 생성
- **상태:** [ ] 미실행 [ ] 통과 [ ] 실패
- **에러:**
- **스크린샷:**
- **노트:**

#### TC-CRUISE-UPDATE-001: 기본 정보 수정
- **상태:** [ ] 미실행 [ ] 통과 [X] 실패 ❌
- **에러:** `404 Not Found - PUT /api/admin/cruises/[id]`
- **원인:** PUT 엔드포인트 미구현
- **노트:** 수정 기능 비활성화 필요

#### TC-CRUISE-DELETE-001: 크루즈 삭제
- **상태:** [ ] 미실행 [ ] 통과 [X] 실패 ❌
- **에러:** `404 Not Found - DELETE /api/admin/cruises/[id]`
- **원인:** DELETE 엔드포인트 미구현
- **노트:** 삭제 기능 비활성화 필요

---

### 발견된 버그/이슈 목록

#### 🔴 Critical Issues

| ID | 제목 | 심각도 | 상태 | 수정 담당 | 기한 |
|----|------|--------|------|---------|------|
| BUG-001 | PUT/DELETE 엔드포인트 미구현 | 🔴 Critical | Open | Backend | 필수 |
| BUG-002 | 클라이언트 측 인증만 구현 | 🔴 Critical | Open | Backend | 필수 |
| BUG-003 | SNS 토큰 평문 저장 | 🔴 Critical | Open | Backend | 필수 |

#### 🟠 High Priority Issues

| ID | 제목 | 심각도 | 상태 |
|----|------|--------|------|
| BUG-004 | 서버 측 폼 검증 부족 | 🟠 High | Open |
| BUG-005 | 개발 모드 인증 우회 | 🟠 High | Open |
| BUG-006 | 에러 로깅 미흡 | 🟠 High | Open |

#### 🟡 Medium Issues

| ID | 제목 | 심각도 | 상태 |
|----|------|--------|------|
| BUG-007 | CORS 미구성 | 🟡 Medium | Open |
| BUG-008 | 레이트 리미팅 없음 | 🟡 Medium | Open |

---

## 최종 체크리스트

### ✅ 테스트 완료 조건

```
대시보드 & 인증
[ ] 로그인 페이지 렌더링
[ ] 올바른 비밀번호로 로그인 성공
[ ] 잘못된 비밀번호 거부
[ ] 인증 없이 /admin 접근 시 리다이렉트
[ ] 비밀번호 변경 기능

상품 생성
[ ] 필수 필드로만 생성
[ ] 모든 필드로 생성
[ ] 필드 검증 (필수, 타입, 범위)
[ ] 이미지 업로드 (단일, 다중)
[ ] 이미지 파일 크기 검증
[ ] 비디오 업로드
[ ] 주요 이미지 설정
[ ] 저장 후 목록에 반영

상품 조회
[ ] 목록 페이지 렌더링
[ ] 크루즈 상세 페이지
[ ] 모든 필드 정상 표시
[ ] 이미지 갤러리
[ ] 항구 일정 타임라인
[ ] 항공편 정보

상품 수정
[ ] 편집 페이지 접근
[ ] 기본 정보 수정
[ ] 이미지 추가/제거
[ ] 항구 일정 수정
[ ] 항공편 수정
[ ] 저장 후 변경사항 반영

상품 삭제
[ ] 삭제 버튼 작동
[ ] 삭제 확인 다이얼로그
[ ] 데이터베이스에서 삭제됨
[ ] 목록에서 제거됨

항구 관리
[ ] 항구 추가
[ ] 항구 순서 변경
[ ] 항구 정보 수정
[ ] 항구 제거

항공편 관리
[ ] 출발편 추가
[ ] 귀국편 추가
[ ] 경유편 추가
[ ] 항공편 정보 수정
[ ] 항공편 제거

데이터 유효성
[ ] 필수 필드 검증
[ ] 타입 검증 (숫자, 날짜)
[ ] 범위 검증 (양수, 시간)
[ ] 형식 검증 (이메일, URL)
[ ] 중복 체크

에러 처리
[ ] 404 Not Found 처리
[ ] 400 Bad Request 처리
[ ] 500 Server Error 처리
[ ] 네트워크 오류 처리
[ ] 타임아웃 처리

보안
[ ] XSS 방지
[ ] SQL Injection 방지
[ ] CSRF 토큰 (해당 시)
[ ] 인증 토큰 보안 저장
[ ] 민감 정보 암호화

성능
[ ] 로딩 시간 < 3초
[ ] 대용량 파일 처리
[ ] 동시 요청 처리
[ ] 메모리 누수 없음
```

---

## 테스트 체크리스트 (관리자용)

### 실행 전 확인
```
[ ] 개발 서버 실행 (npm run dev)
[ ] 데이터베이스 초기화 (npx prisma migrate dev)
[ ] 테스트 데이터 로드 (npx prisma db seed)
[ ] 브라우저 개발자 도구 열기 (F12)
[ ] 콘솔 에러 모니터링
```

### 로그인 테스트
```
[ ] 비밀번호: admin123 입력
[ ] 로그인 버튼 클릭
[ ] 대시보드 표시 확인
[ ] localStorage 토큰 생성 확인
```

### 상품 생성 테스트
```
[ ] /admin/cruises/new 접근
[ ] 모든 필수 필드 입력
[ ] 이미지 최소 1개 업로드
[ ] "상품 등록" 클릭
[ ] 성공 메시지 확인
[ ] 상세 페이지로 이동 확인
```

### 상품 수정 테스트 (FIX NEEDED)
```
[ ] ❌ 편집 버튼 클릭 시 404 에러 예상
[ ] 🔧 PUT 엔드포인트 구현 후 재테스트
[ ] 가격 변경 시 목록에 반영 확인
```

### 상품 삭제 테스트 (FIX NEEDED)
```
[ ] ❌ 삭제 버튼 클릭 시 404 에러 예상
[ ] 🔧 DELETE 엔드포인트 구현 후 재테스트
[ ] 확인 다이얼로그 표시 확인
[ ] 목록에서 제거 확인
```

---

## 보고서 작성 가이드

### 테스트 완료 후 작성할 사항

1. **Executive Summary** (경영진 요약)
   ```
   - 테스트 범위
   - 테스트 기간
   - 전체 통과율
   - 주요 이슈 3개
   - 권장 사항
   ```

2. **Detailed Findings** (상세 발견사항)
   ```
   각 이슈별:
   - ID
   - 제목
   - 심각도
   - 재현 방법
   - 기대 결과 vs 실제 결과
   - 스크린샷
   - 영향도
   - 권장 수정 방법
   ```

3. **Test Coverage** (테스트 커버리지)
   ```
   - 테스트된 기능 %
   - 테스트되지 않은 기능
   - 개선 영역
   ```

4. **Recommendations** (권장사항)
   ```
   - 즉시 수정 필요사항
   - 개선 권장사항
   - 향후 테스트 계획
   ```

---

## 관련 문서 참고

- **API 분석:** [ADMIN_API_ANALYSIS.md](./ADMIN_API_ANALYSIS.md)
- **보안 점검:** [SECURITY_REVIEW.md](./SECURITY_REVIEW.md)
- **성능 테스트:** [PERFORMANCE_TEST.md](./PERFORMANCE_TEST.md)

---

**문서 버전:** v1.0
**최종 수정:** 2025-11-12
**승인자:** Product Manager / QA Lead
