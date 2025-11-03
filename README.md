# MSC Cruises - Frontend

Next.js 15 기반의 MSC Cruises 크루즈 예약 시스템입니다.

## 🚀 기능

### 1. 인증 시스템 (NextAuth.js)
- ✅ 이메일/비밀번호 로그인
- ✅ Google OAuth 로그인
- ✅ Naver OAuth 로그인
- ✅ 회원가입 (일반 회원 / 회원사)
- ✅ 세션 관리

### 2. 크루즈 + 항공 통합 패키지
- ✅ 크루즈와 항공권 동시 검색
- ✅ 한국 출발 공항 선택 (인천/김포/부산)
- ✅ 항공 좌석 등급 선택
- ✅ 경유 횟수 필터
- ✅ 패키지 할인 자동 적용
- ✅ 실시간 가격 계산

### 3. 회원 대시보드
- ✅ 예약 내역 조회
- ✅ MSC Voyagers Club 멤버십 관리
- ✅ 포인트 및 등급 시스템

### 4. 회원사(대리점) 시스템
- ✅ 회원사 등록 및 승인
- ✅ 통계 대시보드 (예약 건수, 매출, 수수료)
- ✅ 전용 서브페이지 URL
- ✅ 고객 예약 관리

## 📦 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Auth**: NextAuth.js 4
- **Database**: SQLite (Prisma ORM)
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. OAuth를 사용하려면 API 키를 설정해야 합니다.

```bash
# .env 파일 내용 확인
cat .env
```

**OAuth 설정이 필요한 경우:**
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) 파일을 참고하여 Google과 Naver OAuth 설정

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 테스트 데이터 추가 (선택 사항)

```bash
npm run db:seed
```

테스트 계정이 생성됩니다:
- **일반 회원**: `customer@test.com` / `password123`
- **회원사**: `partner@test.com` / `password123`

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 📁 프로젝트 구조

```
frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth API
│   │   └── register/             # 회원가입 API
│   ├── login/                    # 로그인 페이지
│   ├── register/                 # 회원가입 페이지
│   ├── packages/                 # 패키지 검색 페이지
│   ├── dashboard/
│   │   ├── my-bookings/          # 일반 회원 대시보드
│   │   └── partner/              # 회원사 대시보드
│   └── partners/[slug]/          # 회원사 서브페이지
├── components/                   # React 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── PackageSearch.tsx         # 패키지 검색 폼
│   └── PackageResults.tsx        # 검색 결과
├── lib/                          # 유틸리티 및 설정
│   ├── auth.ts                   # NextAuth 설정
│   ├── prisma.ts                 # Prisma Client
│   └── utils.ts                  # 공통 유틸리티
├── prisma/                       # Prisma
│   ├── schema.prisma             # 데이터베이스 스키마
│   ├── migrations/               # 마이그레이션 파일
│   └── seed.ts                   # 시드 데이터
├── services/                     # API 서비스
│   ├── crs-api.service.ts        # 크루즈 API
│   ├── flight-api.service.ts     # 항공편 API
│   ├── package.service.ts        # 패키지 조합
│   └── auth.service.ts           # 인증 (Legacy)
├── types/                        # TypeScript 타입
│   ├── cruise.types.ts
│   ├── flight.types.ts
│   ├── auth.types.ts
│   └── next-auth.d.ts            # NextAuth 타입 확장
└── public/                       # 정적 파일
```

## 🔐 인증 흐름

### 이메일/비밀번호 로그인
1. `/login` 페이지에서 이메일과 비밀번호 입력
2. NextAuth Credentials Provider로 인증
3. Prisma를 통해 사용자 확인 및 비밀번호 검증
4. 세션 생성 후 대시보드로 리다이렉트

### OAuth 로그인 (Google/Naver)
1. `/login` 페이지에서 OAuth 버튼 클릭
2. OAuth 제공자 페이지로 리다이렉트
3. 사용자 승인 후 콜백 URL로 돌아옴
4. NextAuth가 사용자 정보 확인 및 세션 생성
5. 신규 사용자는 자동으로 DB에 등록 및 Voyagers Club 가입

### 회원가입
1. `/register` 페이지에서 정보 입력
2. `/api/register` API로 POST 요청
3. 비밀번호 bcrypt 해싱
4. Prisma를 통해 DB에 사용자 생성
5. 일반 회원: Voyagers Club 자동 생성
6. 회원사: Partner Info 생성 (승인 대기 상태)
7. 자동 로그인 후 대시보드로 이동

## 📊 데이터베이스 스키마

주요 모델:

- **User**: 사용자 (일반 회원 + 회원사)
- **Account**: OAuth 계정 연동 정보
- **Session**: 세션 관리
- **VoyagersClub**: MSC Voyagers Club 멤버십
- **PartnerInfo**: 회원사 정보
- **Booking**: 예약 내역
- **Passenger**: 탑승객 정보

전체 스키마는 `prisma/schema.prisma` 참조.

## 🧪 테스트 계정

```bash
npm run db:seed
```

실행 후 사용 가능:

| 계정 유형 | 이메일 | 비밀번호 | 설명 |
|----------|--------|---------|------|
| 일반 회원 | customer@test.com | password123 | MSC Voyagers Club 멤버십 보유 |
| 회원사 | partner@test.com | password123 | 서울크루즈여행사 |

## 🎯 주요 URL

| 페이지 | URL | 설명 |
|--------|-----|------|
| 메인 | http://localhost:3000 | 랜딩 페이지 |
| 로그인 | http://localhost:3000/login | 로그인 (OAuth 포함) |
| 회원가입 | http://localhost:3000/register | 일반/회원사 가입 |
| 패키지 검색 | http://localhost:3000/packages | 크루즈+항공 통합 검색 |
| 내 예약 | http://localhost:3000/dashboard/my-bookings | 일반 회원 대시보드 |
| 회원사 | http://localhost:3000/dashboard/partner | 회원사 대시보드 |
| 파트너 페이지 | http://localhost:3000/partners/seoul-cruise | 회원사 서브페이지 예시 |

## 🔧 Prisma 명령어

```bash
# Prisma Studio 실행 (DB GUI)
npx prisma studio

# 마이그레이션 생성
npx prisma migrate dev --name migration_name

# Prisma Client 재생성
npx prisma generate

# 데이터베이스 리셋 (주의!)
npx prisma migrate reset
```

## 📝 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| DATABASE_URL | SQLite 데이터베이스 파일 경로 | ✅ |
| NEXTAUTH_URL | NextAuth 베이스 URL | ✅ |
| NEXTAUTH_SECRET | NextAuth 비밀키 (32자 이상) | ✅ |
| GOOGLE_CLIENT_ID | Google OAuth 클라이언트 ID | OAuth 사용 시 |
| GOOGLE_CLIENT_SECRET | Google OAuth 클라이언트 시크릿 | OAuth 사용 시 |
| NAVER_CLIENT_ID | Naver OAuth 클라이언트 ID | OAuth 사용 시 |
| NAVER_CLIENT_SECRET | Naver OAuth 클라이언트 시크릿 | OAuth 사용 시 |

자세한 OAuth 설정 방법은 [OAUTH_SETUP.md](./OAUTH_SETUP.md) 참조.

## 🐛 트러블슈팅

### "Invalid `prisma.xxx.create()` invocation"
- Prisma Client를 재생성: `npx prisma generate`

### "Error: Cannot find module '@prisma/client'"
- 의존성 재설치: `npm install`

### OAuth 로그인 실패
1. `.env` 파일의 클라이언트 ID와 시크릿 확인
2. OAuth 제공자 설정에서 리다이렉트 URI 확인
3. 개발 서버 재시작

### 데이터베이스 변경사항 적용 안됨
- 마이그레이션 실행: `npx prisma migrate dev`

## 📚 참고 문서

- [Next.js 문서](https://nextjs.org/docs)
- [NextAuth.js 문서](https://next-auth.js.org/)
- [Prisma 문서](https://www.prisma.io/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
