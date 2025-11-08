# 🧪 로그인 페이지 테스트 계획

**테스트 대상**: http://localhost:3000/login
**작성일**: 2025-11-03
**테스트 환경**: Development (localhost:3000)

---

## 📋 테스트 범위

### 1. UI/UX 테스트
- [ ] 페이지 레이아웃 및 디자인
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 폼 요소 표시
- [ ] 에러 메시지 표시

### 2. 기능 테스트
- [ ] 이메일/비밀번호 로그인
- [ ] Google OAuth 로그인
- [ ] Naver OAuth 로그인
- [ ] 회원가입 링크
- [ ] 회원사 등록 링크
- [ ] 메인으로 돌아가기

### 3. 인증 테스트
- [ ] 회원사 계정 로그인
- [ ] 일반 고객 계정 로그인
- [ ] 잘못된 이메일
- [ ] 잘못된 비밀번호
- [ ] 존재하지 않는 계정

### 4. 에러 핸들링
- [ ] OAuthAccountNotLinked 에러
- [ ] 네트워크 에러
- [ ] 서버 에러
- [ ] 빈 필드 제출

---

## 🎯 테스트 시나리오

### 시나리오 1: 회원사(Partner) 로그인 - 성공 케이스

**목적**: 활성화된 회원사 계정으로 정상 로그인
**준비**: 테스트 계정 5개 준비 완료

**테스트 케이스 1.1**: Partner1 로그인
```
입력:
- Email: partner1@global-travel.com
- Password: partner123!

예상 결과:
✅ 로그인 성공
✅ /dashboard/my-bookings로 리다이렉트
✅ 헤더에 "김대리" 표시
✅ 세션 생성 확인
```

**테스트 케이스 1.2**: Partner2 로그인 (높은 수수료율)
```
입력:
- Email: partner2@dream-tour.com
- Password: partner123!

예상 결과:
✅ 로그인 성공
✅ 수수료율 10% 적용 확인
```

**테스트 케이스 1.3**: Partner3 로그인 (승인 대기 상태)
```
입력:
- Email: partner3@ocean-travel.com
- Password: partner123!

예상 결과:
✅ 로그인 성공 (인증은 통과)
⚠️ 상태: pending
💡 대시보드에서 "승인 대기" 메시지 표시 (예정)
```

---

### 시나리오 2: 실패 케이스 - 인증 오류

**테스트 케이스 2.1**: 잘못된 비밀번호
```
입력:
- Email: partner1@global-travel.com
- Password: wrongpassword

예상 결과:
❌ 로그인 실패
🔴 에러 메시지: "비밀번호가 일치하지 않습니다"
```

**테스트 케이스 2.2**: 존재하지 않는 이메일
```
입력:
- Email: notexist@example.com
- Password: password123

예상 결과:
❌ 로그인 실패
🔴 에러 메시지: "등록되지 않은 이메일입니다"
```

**테스트 케이스 2.3**: 빈 필드 제출
```
입력:
- Email: (비어있음)
- Password: (비어있음)

예상 결과:
❌ 브라우저 기본 검증 (required)
🔴 "이 입력란을 작성하세요"
```

---

### 시나리오 3: Google OAuth 로그인

**테스트 케이스 3.1**: 새 Google 계정
```
동작:
1. "Google로 로그인" 버튼 클릭
2. Google 계정 선택 (새 계정)
3. 권한 승인

예상 결과:
✅ 새 User 생성
✅ Voyagers Club 자동 가입
✅ OAuth Account 연결
✅ 로그인 성공
✅ /dashboard/my-bookings로 리다이렉트
```

**테스트 케이스 3.2**: 기존 이메일/비밀번호 계정과 동일한 이메일
```
동작:
1. partner1@global-travel.com으로 이미 가입됨
2. 같은 이메일의 Google 계정으로 로그인 시도

예상 결과 (allowDangerousEmailAccountLinking: true):
✅ 계정 자동 연결
✅ 로그인 성공
✅ 이후 Google/이메일 둘 다 사용 가능
```

**테스트 케이스 3.3**: Redirect URI 미설정 시
```
동작:
1. Google OAuth 설정 없이 로그인 시도

예상 결과:
❌ redirect_uri_mismatch 에러
🔴 로그인 페이지로 리다이렉트
🔴 에러 메시지 표시
```

---

### 시나리오 4: URL 파라미터 에러 처리

**테스트 케이스 4.1**: OAuthAccountNotLinked 에러
```
URL:
http://localhost:3000/login?error=OAuthAccountNotLinked

예상 결과:
🔴 에러 배너 표시
📝 "이 이메일은 이미 다른 방법으로 가입되었습니다..."
💡 해결방법 안내 표시
```

**테스트 케이스 4.2**: 기타 에러
```
URL:
http://localhost:3000/login?error=OAuthCallback

예상 결과:
🔴 에러 배너 표시
📝 "소셜 로그인 중 오류가 발생했습니다"
```

---

### 시나리오 5: 네비게이션 테스트

**테스트 케이스 5.1**: 회원가입 링크
```
동작:
"회원가입" 링크 클릭

예상 결과:
✅ /register로 이동
```

**테스트 케이스 5.2**: 회원사 등록 링크
```
동작:
"회원사(대리점) 등록하기" 링크 클릭

예상 결과:
✅ /register?type=partner로 이동
```

**테스트 케이스 5.3**: 메인으로 돌아가기
```
동작:
"메인으로" 버튼 클릭

예상 결과:
✅ /로 이동
```

---

### 시나리오 6: 반응형 디자인

**테스트 케이스 6.1**: 모바일 (375px)
```
확인 사항:
✅ 폼 너비 조정
✅ 버튼 크기 적절
✅ 텍스트 가독성
✅ 스크롤 없이 주요 요소 표시
```

**테스트 케이스 6.2**: 태블릿 (768px)
```
확인 사항:
✅ 레이아웃 중앙 정렬
✅ 여백 적절
```

**테스트 케이스 6.3**: 데스크톱 (1920px)
```
확인 사항:
✅ 최대 너비 제한 (max-w-md)
✅ 중앙 정렬
```

---

### 시나리오 7: 세션 및 보안

**테스트 케이스 7.1**: 세션 유지
```
동작:
1. 로그인
2. 브라우저 새로고침
3. 다른 페이지 이동

예상 결과:
✅ 로그인 상태 유지
✅ 세션 만료 전까지 유지
```

**테스트 케이스 7.2**: 로그아웃 후 접근
```
동작:
1. 로그인
2. 로그아웃
3. /dashboard/my-bookings 직접 접근

예상 결과:
✅ /login으로 리다이렉트
✅ callbackUrl 파라미터 포함
```

---

## 🔧 자동화 테스트 스크립트

### 회원사 계정 5개 자동 테스트

```typescript
// test-all-partners.ts
const testAccounts = [
  { email: 'partner1@global-travel.com', password: 'partner123!', name: '김대리' },
  { email: 'partner2@dream-tour.com', password: 'partner123!', name: '이실장' },
  { email: 'partner3@ocean-travel.com', password: 'partner123!', name: '박과장' },
  { email: 'partner4@luxury-travel.com', password: 'partner123!', name: '최부장' },
  { email: 'partner5@jeju-cruise.com', password: 'partner123!', name: '강지점장' },
];

// 각 계정으로 로그인 테스트
```

---

## 📊 테스트 결과 체크리스트

### UI/UX
- [ ] MSC 로고 표시
- [ ] 그라데이션 배경 (from-[#003366] to-[#004080])
- [ ] 로그인 폼 중앙 정렬
- [ ] Google 로그인 버튼 (흰색 배경)
- [ ] Naver 로그인 버튼 (초록색 #03C75A)
- [ ] 이메일/비밀번호 입력 필드
- [ ] "로그인 상태 유지" 체크박스
- [ ] "비밀번호 찾기" 링크
- [ ] OAuth 설정 안내 (파란색 박스)

### 기능
- [ ] 이메일/비밀번호 로그인 작동
- [ ] Google OAuth 작동 (Client Secret 설정 후)
- [ ] Naver OAuth 작동 (설정 후)
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 로그인 성공 시 리다이렉트

### 인증
- [ ] Partner 계정 (5개) 모두 로그인 가능
- [ ] 일반 고객 계정 로그인 가능
- [ ] 잘못된 자격증명 거부
- [ ] 세션 생성 확인

### 에러 핸들링
- [ ] OAuthAccountNotLinked 에러 표시
- [ ] 친절한 에러 메시지
- [ ] 해결 방법 안내

---

## 🎯 우선순위

### P0 (긴급)
1. ✅ 회원사 5개 계정 로그인 테스트
2. ✅ 에러 메시지 표시 확인
3. ✅ 세션 생성 확인

### P1 (높음)
4. ✅ Google OAuth 연동 테스트
5. ✅ URL 에러 파라미터 처리
6. ⏳ Naver OAuth 연동 테스트

### P2 (중간)
7. ⏳ 반응형 디자인 확인
8. ⏳ 네비게이션 링크 테스트
9. ⏳ 보안 테스트

---

## 📝 테스트 실행 방법

### 수동 테스트
```bash
# 1. 서버 실행 확인
http://localhost:3000

# 2. 로그인 페이지 접속
http://localhost:3000/login

# 3. 각 시나리오별로 테스트 진행
```

### 자동 테스트 (준비 중)
```bash
# 회원사 계정 검증
npx tsx test-partner-login.ts

# 전체 인증 플로우 테스트
npm run test:auth
```

---

## 🐛 알려진 이슈

1. **Naver OAuth 미설정**
   - Client ID/Secret 설정 필요
   - .env 파일에 추가 필요

2. **Google Client Secret**
   - ✅ 설정 완료
   - ✅ Redirect URI 설정 완료

3. **allowDangerousEmailAccountLinking**
   - ⚠️ 프로덕션에서는 이메일 검증 필요
   - 현재는 개발 편의성을 위해 활성화

---

## ✅ 완료 기준

모든 테스트 케이스가 "예상 결과"와 일치하면 테스트 통과

---

**테스트 담당**: Claude Code
**검토자**: 사용자
**상태**: 🟡 진행 중
