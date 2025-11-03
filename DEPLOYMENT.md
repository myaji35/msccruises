# GCP 배포 가이드

## 사전 준비

### 1. Google Cloud SDK 설치
```bash
# macOS (Homebrew)
brew install --cask google-cloud-sdk

# 또는 직접 다운로드
# https://cloud.google.com/sdk/docs/install
```

### 2. GCP 프로젝트 설정
```bash
# GCP 로그인
gcloud auth login

# 프로젝트 설정 (프로젝트 ID: msccruises)
gcloud config set project msccruises

# App Engine 활성화 (최초 1회만)
gcloud app create --region=asia-northeast3  # 서울 리전
```

### 3. Cloud SQL (PostgreSQL) 설정

#### 3.1 Cloud SQL 인스턴스 생성
```bash
# PostgreSQL 인스턴스 생성
gcloud sql instances create msccruises-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --root-password=YOUR_SECURE_PASSWORD

# 데이터베이스 생성
gcloud sql databases create msccruises \
  --instance=msccruises-db

# 사용자 생성
gcloud sql users create msccruises_user \
  --instance=msccruises-db \
  --password=YOUR_USER_PASSWORD
```

#### 3.2 Cloud SQL Proxy 연결 문자열 확인
```bash
gcloud sql instances describe msccruises-db --format="value(connectionName)"
```

결과 예시: `msccruises:asia-northeast3:msccruises-db`

### 4. 환경 변수 설정

GCP Console에서 환경 변수 설정:
1. App Engine > Settings > Environment variables
2. 다음 환경 변수 추가:

```
DATABASE_URL=postgresql://msccruises_user:YOUR_USER_PASSWORD@/msccruises?host=/cloudsql/msccruises:asia-northeast3:msccruises-db
NEXTAUTH_URL=https://msccruises.uc.r.appspot.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
NAVER_CLIENT_ID=YOUR_NAVER_CLIENT_ID
NAVER_CLIENT_SECRET=YOUR_NAVER_CLIENT_SECRET
```

**NEXTAUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

## 배포 단계

### 1. 빌드 스크립트 수정

`package.json`에 배포 스크립트가 준비되어 있습니다:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 8080",
    "deploy": "gcloud app deploy"
  }
}
```

### 2. Prisma 마이그레이션 적용

배포 전에 프로덕션 데이터베이스에 스키마 적용:

```bash
# DATABASE_URL 환경변수를 프로덕션으로 설정
export DATABASE_URL="postgresql://msccruises_user:YOUR_USER_PASSWORD@/msccruises?host=/cloudsql/msccruises:asia-northeast3:msccruises-db"

# 마이그레이션 적용
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 3. App Engine 배포

```bash
# 배포 실행
gcloud app deploy

# 배포 완료 후 브라우저에서 열기
gcloud app browse
```

배포 URL: `https://msccruises.uc.r.appspot.com`

### 4. 로그 확인

```bash
# 실시간 로그 보기
gcloud app logs tail -s default

# 최근 로그 보기
gcloud app logs read
```

## 배포 후 확인 사항

### 1. 데이터베이스 연결 확인
- `/api/health` 엔드포인트 확인 (있다면)
- 크루즈 상품 목록 확인: `/admin/cruises`

### 2. 인증 기능 확인
- 구글 로그인 테스트
- 네이버 로그인 테스트
- OAuth Redirect URI 확인
  - Google: `https://msccruises.uc.r.appspot.com/api/auth/callback/google`
  - Naver: `https://msccruises.uc.r.appspot.com/api/auth/callback/naver`

### 3. 미디어 업로드 확인
- 크루즈 상품 등록 테스트
- 이미지/비디오 업로드 테스트

## Cloud Storage 설정 (선택사항)

현재는 로컬 파일 시스템(`/public/uploads`)을 사용하지만, 프로덕션에서는 Cloud Storage 사용 권장:

### 1. Cloud Storage 버킷 생성
```bash
gsutil mb -l asia-northeast3 gs://msccruises-media
gsutil defacl set public-read gs://msccruises-media
```

### 2. 코드 수정 필요
`app/api/admin/media/upload/route.ts`를 수정하여 Cloud Storage에 업로드하도록 변경

## 비용 최적화

### 현재 설정 (무료/저비용 티어)
- App Engine: F2 인스턴스 (자동 스케일링)
- Cloud SQL: db-f1-micro (무료 티어에 가까운 최소 사양)
- Cloud Storage: 필요시 추가

### 예상 월 비용
- App Engine: 트래픽 적을 시 ~$0-50
- Cloud SQL: ~$7-15 (db-f1-micro)
- Cloud Storage: ~$0-5 (사용량에 따라)

**총 예상: 월 $10-70**

## 문제 해결

### 배포 실패 시
```bash
# 자세한 로그 확인
gcloud app logs tail -s default

# 이전 버전으로 롤백
gcloud app versions list
gcloud app services set-traffic default --splits=VERSION_ID=1
```

### 데이터베이스 연결 실패 시
- Cloud SQL Proxy 설정 확인
- DATABASE_URL 형식 확인
- Cloud SQL 인스턴스가 실행 중인지 확인

### 빌드 실패 시
```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# 빌드 성공 시 배포 재시도
gcloud app deploy
```

## 커스텀 도메인 설정 (선택사항)

```bash
# 도메인 매핑
gcloud app domain-mappings create www.msccruises.com

# SSL 인증서 자동 프로비저닝됨
```

## CI/CD 설정 (향후 고려사항)

GitHub Actions를 통한 자동 배포:

`.github/workflows/deploy.yml` 생성:
```yaml
name: Deploy to GCP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: msccruises
      - run: gcloud app deploy
```

## 참고 자료

- [Google App Engine 문서](https://cloud.google.com/appengine/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Prisma 프로덕션 가이드](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 현재 상태

✅ Git 저장소 초기화 완료
✅ GitHub 푸시 완료 (https://github.com/myaji35/msccruises.git)
✅ GCP 배포 설정 파일 생성 (`app.yaml`, `.gcloudignore`)
⏳ GCP 배포 대기 중 (위 단계 수동 실행 필요)

## 빠른 배포 명령어

```bash
# 1. GCP 프로젝트 설정
gcloud config set project msccruises

# 2. 배포
gcloud app deploy

# 3. 브라우저에서 확인
gcloud app browse
```

**참고**: Cloud SQL 설정과 환경변수 설정은 GCP Console에서 수동으로 진행해야 합니다.
