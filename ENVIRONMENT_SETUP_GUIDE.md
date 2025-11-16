# 🔧 Environment Variables Setup Guide

**날짜:** 2025-11-16  
**상태:** ✅ 완료

---

## 📋 환경 변수 설정 완료

### 1. ENCRYPTION_SECRET ✅
**용도:** SNS 토큰, API 키 등 민감 데이터 암호화

**생성 방법:**
```bash
openssl rand -base64 32
```

**설정:**
```bash
# .env 파일에 추가됨
ENCRYPTION_SECRET="F5xYSiiSf0+aOZEFIqTry1yRMyzAPoGTBv2vnnwGm5U="
```

⚠️ **CRITICAL:**  
- 이 키를 잃어버리면 암호화된 모든 데이터를 복호화할 수 없습니다!
- 프로덕션 배포 전 반드시 별도의 안전한 곳에 백업하세요
- AWS Secrets Manager 또는 Google Secret Manager 사용 권장

---

## 📝 전체 환경 변수 목록

### Database
```bash
DATABASE_URL="file:./dev.db"  # SQLite for development
# Production: postgresql://user:pass@host:5432/dbname
```

### Authentication
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[32+ character secret]"
```

### OAuth Providers
```bash
# Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Naver
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```

### Payment Gateways
```bash
# TossPay
TOSSPAY_CLIENT_KEY="test_ck_xxxxx"
TOSSPAY_SECRET_KEY="test_sk_xxxxx"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

### Security (NEW) ✅
```bash
# Encryption for sensitive data
ENCRYPTION_SECRET="F5xYSiiSf0+aOZEFIqTry1yRMyzAPoGTBv2vnnwGm5U="
```

### APIs
```bash
# Kanban MCP Server
KANBAN_API_URL="http://localhost:3015/api/kanban/shared"
NEXT_PUBLIC_KANBAN_API_KEY="your-api-key-here"

# CRS/GDS API (when available)
NEXT_PUBLIC_CRS_API_URL="https://api.amadeus.com"
CRS_API_KEY="your-crs-api-key"
CRS_API_SECRET="your-crs-api-secret"
```

---

## 🔒 보안 모범 사례

### 1. .env 파일 관리
```bash
# ✅ DO
- .env를 .gitignore에 추가 (이미 완료)
- .env.example은 git에 커밋 (비밀 값 제외)
- 환경별로 분리 (.env.development, .env.production)

# ❌ DON'T
- .env 파일을 git에 커밋
- 환경 변수를 코드에 하드코딩
- console.log(process.env) 로그
```

### 2. 프로덕션 환경
```bash
# AWS Secrets Manager 사용 예시
aws secretsmanager get-secret-value \
  --secret-id msc-cruises/encryption-secret \
  --query SecretString \
  --output text

# Google Secret Manager 사용 예시
gcloud secrets versions access latest \
  --secret="encryption-secret"
```

### 3. 로테이션 정책
```bash
# 주기적으로 변경해야 하는 키
- ENCRYPTION_SECRET: 6개월마다
- NEXTAUTH_SECRET: 6개월마다
- API Keys: 3개월마다

# 변경 시 주의사항
1. 기존 암호화된 데이터 백업
2. 새 키로 재암호화
3. 배포 및 검증
4. 구 키 폐기
```

---

## 🧪 테스트

### 환경 변수 로드 확인
```typescript
// lib/env-check.ts
export function checkRequiredEnvVars() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'ENCRYPTION_SECRET',  // NEW
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
}
```

### 암호화 기능 테스트
```bash
# 개발 서버 재시작
npm run dev

# API 테스트
curl -X POST http://localhost:3000/api/admin/sns-accounts \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "test_token"}'

# 응답에서 토큰이 마스킹되었는지 확인
# "accessToken": "test****"
```

---

## 📊 체크리스트

- [x] ENCRYPTION_SECRET 생성 및 설정
- [x] .env 파일 업데이트
- [x] .env.example 업데이트
- [x] 암호화 기능 테스트
- [ ] 프로덕션 Secret Manager 설정 (배포 전)
- [ ] 키 백업 (오프라인 저장소)
- [ ] 팀원에게 환경 변수 공유

---

## 🚀 다음 단계

1. **개발 환경:** 현재 .env 파일 사용 (완료)
2. **Staging 환경:** Secret Manager 설정 필요
3. **Production 환경:** Secret Manager + 감사 로그

---

**작성자:** Development Team  
**최종 업데이트:** 2025-11-16
