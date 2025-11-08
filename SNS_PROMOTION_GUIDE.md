# SNS 홍보 기능 구현 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 스키마 추가
- `SnsAccount` 모델: SNS 계정 정보 저장 (Facebook, Instagram, TikTok, Threads)
- `SnsPost` 모델: SNS 포스팅 예약 및 상태 관리
- Migration 완료: `20251103065448_add_sns_models`

---

## 📋 다음 구현 단계

### Phase 1: SNS 계정 관리 (우선순위: High)

#### 1-1. SNS 계정 등록 페이지
**파일**: `/app/admin/sns/accounts/page.tsx`

**기능**:
- SNS 플랫폼 선택 (Facebook, Instagram, TikTok, Threads)
- 계정 ID/사용자명 입력
- Access Token 입력 (암호화 저장)
- 계정 활성화/비활성화

**UI 구성**:
```
[+] SNS 계정 추가

+------------------------------------------+
| 플랫폼: [Facebook ▼]                      |
| 계정 ID: [@your_page_name               ]|
| Access Token: [••••••••••••••••         ]|
|  [활성화 ☑]                              |
|          [취소] [저장]                    |
+------------------------------------------+

등록된 계정 목록:
+----------------------------------------------------------------+
| 플랫폼    | 계정 ID          | 상태    | 토큰 만료일 | 작업    |
|----------------------------------------------------------------|
| Facebook | @msc_cruises_kr | 활성화  | 2025-12-31 | [수정][삭제]|
| Instagram| @msccruises     | 활성화  | 2025-11-30 | [수정][삭제]|
| TikTok   | @msc_official   | 비활성화| -          | [수정][삭제]|
+----------------------------------------------------------------+
```

#### 1-2. API Routes
**파일**: `/app/api/admin/sns/accounts/route.ts`

```typescript
// GET /api/admin/sns/accounts - 계정 목록 조회
// POST /api/admin/sns/accounts - 새 계정 등록
// PUT /api/admin/sns/accounts/[id] - 계정 수정
// DELETE /api/admin/sns/accounts/[id] - 계정 삭제
```

---

### Phase 2: SNS 포스팅 예약 (우선순위: High)

#### 2-1. 포스팅 작성 페이지
**파일**: `/app/admin/cruises/[cruiseId]/promote/page.tsx`

**기능**:
- 크루즈 상품 정보 자동 로드
- 포스팅 내용 작성 (템플릿 제공)
- 미디어 선택 (크루즈 이미지/비디오)
- 해시태그 자동 생성 (#크루즈 #여행 #MSCCruises)
- 포스팅 예약 날짜/시간 선택
- 플랫폼별 미리보기

**UI 구성**:
```
+===============================================+
| 크루즈 홍보 포스팅 작성                        |
+===============================================+

크루즈 정보:
+-----------------------------------------------+
| 이름: Caribbean Dream Cruise - Updated       |
| 선박: MSC Seaside                            |
| 가격: $1,299.99 USD                          |
+-----------------------------------------------+

SNS 계정 선택:
☑ Facebook (@msc_cruises_kr)
☑ Instagram (@msccruises)
☐ TikTok (@msc_official) - 계정 비활성화
☑ Threads (@msccruises)

포스팅 내용:
+-----------------------------------------------+
| 🚢✨ Caribbean Dream Cruise 특별 할인! ✨🚢    |
|                                               |
| MSC Seaside 타고 떠나는 카리브해 크루즈        |
| 📍 Miami, FL 출발                            |
| 🗓 7박 8일                                    |
| 💰 $1,299.99부터                             |
|                                               |
| 지금 예약하고 꿈같은 휴가를 시작하세요!        |
| 👉 [링크]                                     |
+-----------------------------------------------+

미디어 선택: (3개 선택됨)
[이미지1] [이미지2] [동영상1]

해시태그:
#크루즈 #여행 #MSCCruises #카리브해 #휴가 #럭셔리여행

예약 설정:
+-----------------------------------------------+
| 상태: [예정 ▼] (예정/확정)                    |
| 예약 날짜: [2025-11-05]                       |
| 예약 시간: [10:00 ▼]                         |
+-----------------------------------------------+

[미리보기] [임시저장] [예약하기]
```

#### 2-2. API Routes
**파일**: `/app/api/admin/sns/posts/route.ts`

```typescript
// GET /api/admin/sns/posts - 포스팅 목록 조회
// POST /api/admin/sns/posts - 새 포스팅 예약
// PUT /api/admin/sns/posts/[id] - 포스팅 수정
// DELETE /api/admin/sns/posts/[id] - 포스팅 취소
// POST /api/admin/sns/posts/[id]/confirm - 예정 → 확정
// POST /api/admin/sns/posts/[id]/publish - 즉시 게시
```

---

### Phase 3: 포스팅 관리 대시보드 (우선순위: Medium)

#### 3-1. 포스팅 목록 및 상태 관리
**파일**: `/app/admin/sns/posts/page.tsx`

**기능**:
- 상태별 필터 (예정/확정/게시됨/실패)
- 예약 날짜별 정렬
- 플랫폼별 필터
- 일괄 확정 기능
- 에러 발생 시 재시도

**UI 구성**:
```
SNS 포스팅 관리
+==================================================================+
| 필터: [전체 ▼] [Facebook ▼] [2025-11 ▼]                  [검색] |
+==================================================================+

+------------------------------------------------------------------+
| 크루즈명 | 플랫폼 | 예약일시 | 상태 | 조회수 | 작업          |
|------------------------------------------------------------------|
| Caribbean Dream | Facebook | 11/05 10:00 | 예정 | - | [확정][수정][삭제] |
| Alaska Glacier  | Instagram| 11/06 14:00 | 확정 | - | [취소][수정]       |
| Med Romance     | Threads  | 11/04 09:00 | 게시됨| 1.2K | [통계][삭제]     |
| Pacific Wonder  | TikTok   | 11/03 15:00 | 실패 | - | [재시도][삭제]    |
+------------------------------------------------------------------+

선택한 항목: 2개
[일괄 확정] [일괄 삭제]
```

---

### Phase 4: 자동 포스팅 스케줄러 (우선순위: Medium)

#### 4-1. Cron Job 설정
**파일**: `/lib/sns-scheduler.ts`

**기능**:
- 매분마다 예약된 포스팅 확인
- 예약 시간 도달 시 자동 게시
- 플랫폼별 API 호출
- 게시 결과 기록 (성공/실패)
- 실패 시 재시도 로직

**구현 예시**:
```typescript
// /lib/sns-scheduler.ts
import { prisma } from '@/lib/prisma';
import { publishToFacebook, publishToInstagram, publishToTikTok, publishToThreads } from './sns-api';

export async function checkScheduledPosts() {
  const now = new Date();

  // Find posts scheduled for now and status = 'confirmed'
  const postsToPublish = await prisma.snsPost.findMany({
    where: {
      status: 'confirmed',
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      cruise: {
        include: {
          media: true,
        },
      },
      snsAccount: true,
    },
  });

  for (const post of postsToPublish) {
    try {
      let result;

      switch (post.platform) {
        case 'facebook':
          result = await publishToFacebook(post);
          break;
        case 'instagram':
          result = await publishToInstagram(post);
          break;
        case 'tiktok':
          result = await publishToTikTok(post);
          break;
        case 'threads':
          result = await publishToThreads(post);
          break;
      }

      // Update post status
      await prisma.snsPost.update({
        where: { id: post.id },
        data: {
          status: 'posted',
          postedAt: new Date(),
          platformPostId: result.postId,
        },
      });

      console.log(`✅ Post published: ${post.id} on ${post.platform}`);
    } catch (error: any) {
      // Log error and update status
      await prisma.snsPost.update({
        where: { id: post.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      console.error(`❌ Post failed: ${post.id}`, error);
    }
  }
}
```

#### 4-2. API Route for Cron
**파일**: `/app/api/cron/sns-scheduler/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkScheduledPosts } from '@/lib/sns-scheduler';

export async function GET(request: Request) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await checkScheduledPosts();
    return NextResponse.json({ success: true, message: 'Scheduler executed' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Vercel Cron 설정** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/sns-scheduler",
    "schedule": "* * * * *"
  }]
}
```

---

### Phase 5: SNS API 연동 (우선순위: High)

#### 5-1. Facebook/Instagram Graph API
**파일**: `/lib/sns-api/facebook.ts`

```typescript
interface FacebookPost {
  message: string;
  link?: string;
  published: boolean;
  scheduled_publish_time?: number;
}

export async function publishToFacebook(post: any) {
  const { snsAccount, content, mediaUrls } = post;

  const url = `https://graph.facebook.com/v18.0/${snsAccount.accountId}/feed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: content,
      access_token: snsAccount.accessToken,
      published: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API Error: ${error.error.message}`);
  }

  const data = await response.json();
  return { postId: data.id };
}
```

#### 5-2. Instagram Graph API
**파일**: `/lib/sns-api/instagram.ts`

```typescript
export async function publishToInstagram(post: any) {
  const { snsAccount, content, mediaUrls } = post;

  // Step 1: Create media container
  const containerUrl = `https://graph.facebook.com/v18.0/${snsAccount.accountId}/media`;

  const mediaResponse = await fetch(containerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: mediaUrls[0], // First image
      caption: content,
      access_token: snsAccount.accessToken,
    }),
  });

  const mediaData = await mediaResponse.json();
  const containerId = mediaData.id;

  // Step 2: Publish container
  const publishUrl = `https://graph.facebook.com/v18.0/${snsAccount.accountId}/media_publish`;

  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: snsAccount.accessToken,
    }),
  });

  const publishData = await publishResponse.json();
  return { postId: publishData.id };
}
```

#### 5-3. TikTok API
**파일**: `/lib/sns-api/tiktok.ts`

```typescript
export async function publishToTikTok(post: any) {
  const { snsAccount, content, mediaUrls } = post;

  // TikTok Content Posting API
  const url = 'https://open.tiktokapis.com/v2/post/publish/video/init/';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${snsAccount.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: content.substring(0, 150), // TikTok title limit
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_url: mediaUrls[0],
      },
    }),
  });

  const data = await response.json();
  return { postId: data.data.publish_id };
}
```

#### 5-4. Threads API
**파일**: `/lib/sns-api/threads.ts`

```typescript
export async function publishToThreads(post: any) {
  const { snsAccount, content, mediaUrls } = post;

  // Threads uses Instagram Graph API
  const url = `https://graph.threads.net/v1.0/${snsAccount.accountId}/threads`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      media_type: mediaUrls?.length > 0 ? 'IMAGE' : 'TEXT',
      image_url: mediaUrls?.[0],
      text: content,
      access_token: snsAccount.accessToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Threads API Error: ${error.error.message}`);
  }

  const data = await response.json();

  // Publish the thread
  const publishUrl = `https://graph.threads.net/v1.0/${snsAccount.accountId}/threads_publish`;
  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: data.id,
      access_token: snsAccount.accessToken,
    }),
  });

  const publishData = await publishResponse.json();
  return { postId: publishData.id };
}
```

---

## 🔐 보안 고려사항

### 1. Access Token 암호화
**파일**: `/lib/encryption.ts`

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY!, 'hex'), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY!, 'hex'), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 2. 환경 변수 설정
**`.env` 추가**:
```bash
# SNS API Credentials
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret

TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret

THREADS_APP_ID=your_app_id
THREADS_APP_SECRET=your_app_secret

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_key

# Cron Security
CRON_SECRET=your_secret_key
```

---

## 📊 데이터 흐름

### 포스팅 생성 → 게시 프로세스

```
1. 관리자/회원사가 크루즈 상세 페이지에서 "SNS 홍보" 클릭
   ↓
2. 포스팅 작성 페이지로 이동
   - 크루즈 정보 자동 로드
   - SNS 계정 목록 표시
   ↓
3. 포스팅 내용 작성
   - 텍스트 입력
   - 미디어 선택 (크루즈 이미지/동영상)
   - 해시태그 입력
   ↓
4. 예약 설정
   - 상태: "예정" 선택
   - 날짜/시간 선택
   ↓
5. "예약하기" 클릭
   - DB에 SnsPost 레코드 생성
   - status = "scheduled"
   ↓
6. 관리자가 포스팅 목록에서 확인
   - 상태: "예정"
   ↓
7. 관리자가 "확정" 버튼 클릭
   - status = "scheduled" → "confirmed"
   ↓
8. 예약 시간 도달
   - Cron Job이 확정된 포스팅 감지
   ↓
9. SNS API 호출
   - 플랫폼별 API로 포스팅
   ↓
10. 결과 업데이트
    - 성공: status = "posted", platformPostId 저장
    - 실패: status = "failed", errorMessage 저장
```

---

## 🚀 빠른 시작 가이드

### 1. 데이터베이스 마이그레이션 (완료됨)
```bash
npx prisma migrate dev --name add_sns_models
```

### 2. SNS 계정 등록
1. `/admin/sns/accounts` 페이지 접속
2. "SNS 계정 추가" 클릭
3. 플랫폼 선택 및 정보 입력
4. 저장

### 3. 첫 포스팅 예약
1. 크루즈 상세 페이지에서 "SNS 홍보" 클릭
2. 포스팅 내용 작성
3. SNS 계정 선택 (복수 선택 가능)
4. 상태: "예정" 선택
5. 예약 날짜/시간 설정
6. "예약하기" 클릭

### 4. 포스팅 확정
1. `/admin/sns/posts` 페이지 접속
2. 예정 상태 포스팅 확인
3. "확정" 버튼 클릭

### 5. 자동 게시 확인
- Cron Job이 예약 시간에 자동으로 SNS에 게시
- 포스팅 목록에서 상태 확인 (게시됨/실패)

---

## 📝 TODO 리스트

### Phase 1: 기본 기능 (우선순위: High)
- [ ] SNS 계정 관리 페이지 구현
- [ ] SNS 계정 API (CRUD)
- [ ] 포스팅 작성 페이지 구현
- [ ] 포스팅 API (CRUD)
- [ ] 예정/확정 상태 전환 기능

### Phase 2: SNS API 연동 (우선순위: High)
- [ ] Facebook Graph API 연동
- [ ] Instagram Graph API 연동
- [ ] TikTok API 연동
- [ ] Threads API 연동
- [ ] Access Token 암호화/복호화

### Phase 3: 자동화 (우선순위: Medium)
- [ ] Cron Job 설정 (매분 실행)
- [ ] 예약 포스팅 자동 게시
- [ ] 실패 재시도 로직
- [ ] 이메일 알림 (게시 성공/실패)

### Phase 4: 대시보드 (우선순위: Medium)
- [ ] 포스팅 목록/필터/검색
- [ ] 통계 대시보드 (조회수, 좋아요, 댓글)
- [ ] 일괄 작업 (확정, 삭제)
- [ ] 플랫폼별 성과 분석

### Phase 5: 고급 기능 (우선순위: Low)
- [ ] 포스팅 템플릿 관리
- [ ] AI 자동 해시태그 생성
- [ ] 최적 게시 시간 추천
- [ ] A/B 테스트 기능

---

## 🔗 관련 문서

- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Threads API](https://developers.facebook.com/docs/threads)

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-11-03
**작성자**: Claude Code Assistant
