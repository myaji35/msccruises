# OAuth 설정 가이드

NextAuth.js를 사용한 구글(Google)과 네이버(Naver) 소셜 로그인 설정 방법입니다.

## 1. Google OAuth 설정

### 1.1 Google Cloud Console에서 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "사용자 인증 정보" 메뉴 선택

### 1.2 OAuth 2.0 클라이언트 ID 생성

1. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" 선택
2. 애플리케이션 유형: **웹 애플리케이션** 선택
3. 이름: 원하는 이름 입력 (예: MSC Cruises)
4. 승인된 JavaScript 원본:
   ```
   http://localhost:3000
   ```
5. 승인된 리디렉션 URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. "만들기" 클릭

### 1.3 클라이언트 ID 및 보안 비밀 복사

- **클라이언트 ID**와 **클라이언트 보안 비밀**을 복사합니다.

### 1.4 .env 파일에 추가

```bash
GOOGLE_CLIENT_ID="여기에_클라이언트_ID_입력"
GOOGLE_CLIENT_SECRET="여기에_클라이언트_보안_비밀_입력"
```

---

## 2. Naver OAuth 설정

### 2.1 네이버 개발자 센터

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 네이버 계정으로 로그인
3. "Application" → "애플리케이션 등록" 클릭

### 2.2 애플리케이션 등록

1. **애플리케이션 이름**: MSC Cruises (또는 원하는 이름)
2. **사용 API**: "네이버 로그인" 선택
3. **제공 정보 선택**:
   - 필수: 이메일, 이름
   - 선택: 프로필 사진
4. **로그인 오픈 API 서비스 환경**:
   - PC 웹 체크
5. **서비스 URL**:
   ```
   http://localhost:3000
   ```
6. **네이버 아이디로 로그인 Callback URL**:
   ```
   http://localhost:3000/api/auth/callback/naver
   ```
7. "등록하기" 클릭

### 2.3 Client ID 및 Client Secret 복사

- 등록 완료 후 표시되는 **Client ID**와 **Client Secret**을 복사합니다.

### 2.4 .env 파일에 추가

```bash
NAVER_CLIENT_ID="여기에_클라이언트_ID_입력"
NAVER_CLIENT_SECRET="여기에_클라이언트_보안_비밀_입력"
```

---

## 3. 최종 .env 파일 예시

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="msc-cruises-secret-key-please-change-in-production-minimum-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"

# Naver OAuth
NAVER_CLIENT_ID="AbCdEfGhIjKlMnOp"
NAVER_CLIENT_SECRET="XyZ12345Ab"
```

---

## 4. 개발 서버 재시작

.env 파일을 수정한 후에는 **개발 서버를 재시작**해야 합니다.

```bash
# Ctrl+C로 서버 종료 후
npm run dev
```

---

## 5. 테스트

1. http://localhost:3000/login 접속
2. "Google로 로그인" 또는 "네이버로 로그인" 버튼 클릭
3. OAuth 인증 화면에서 계정 선택 및 승인
4. 성공 시 대시보드로 리다이렉트

---

## 6. 프로덕션 배포 시 주의사항

### 6.1 환경 변수 업데이트

프로덕션 도메인으로 변경:

```bash
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="랜덤하고_강력한_비밀키_32자_이상"
```

### 6.2 Google Cloud Console

- 승인된 JavaScript 원본에 프로덕션 도메인 추가:
  ```
  https://your-domain.com
  ```
- 승인된 리디렉션 URI에 프로덕션 콜백 URL 추가:
  ```
  https://your-domain.com/api/auth/callback/google
  ```

### 6.3 네이버 개발자 센터

- 서비스 URL 업데이트:
  ```
  https://your-domain.com
  ```
- Callback URL 업데이트:
  ```
  https://your-domain.com/api/auth/callback/naver
  ```

---

## 7. NEXTAUTH_SECRET 생성 방법

안전한 랜덤 비밀키 생성:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -base64 32
```

---

## 8. 문제 해결

### Google OAuth 에러: "redirect_uri_mismatch"

- Google Cloud Console의 리디렉션 URI와 실제 콜백 URL이 정확히 일치하는지 확인
- 프로토콜(http/https), 포트 번호까지 정확히 일치해야 함

### Naver OAuth 에러: "invalid_client"

- 네이버 개발자 센터에서 Client ID와 Secret이 올바른지 확인
- Callback URL이 정확히 일치하는지 확인

### NextAuth 세션 에러

- NEXTAUTH_SECRET이 32자 이상인지 확인
- .env 파일을 수정한 후 개발 서버를 재시작했는지 확인

---

## 9. 추가 정보

- NextAuth.js 공식 문서: https://next-auth.js.org/
- Google OAuth 문서: https://developers.google.com/identity/protocols/oauth2
- 네이버 로그인 API: https://developers.naver.com/docs/login/api/
