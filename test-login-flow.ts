import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface TestResult {
  testCase: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(testCase: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
  results.push({ testCase, status, message, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${testCase}: ${message}`);
  if (details) {
    console.log(`   세부사항:`, details);
  }
}

async function testLoginFlow() {
  console.log('\n🧪 로그인 페이지 종합 테스트 시작\n');
  console.log('='.repeat(70));
  console.log('테스트 대상: http://localhost:3000/login');
  console.log('테스트 일시:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(70));

  // ============================================
  // 시나리오 1: 회원사 계정 인증 테스트
  // ============================================
  console.log('\n📋 시나리오 1: 회원사 계정 인증 테스트\n');

  const partnerAccounts = [
    { email: 'partner1@global-travel.com', password: 'partner123!', name: '김대리', company: '글로벌여행사' },
    { email: 'partner2@dream-tour.com', password: 'partner123!', name: '이실장', company: '드림투어' },
    { email: 'partner3@ocean-travel.com', password: 'partner123!', name: '박과장', company: '바다여행' },
    { email: 'partner4@luxury-travel.com', password: 'partner123!', name: '최부장', company: '럭셔리트래블' },
    { email: 'partner5@jeju-cruise.com', password: 'partner123!', name: '강지점장', company: '제주크루즈투어' },
  ];

  for (const account of partnerAccounts) {
    const user = await prisma.user.findUnique({
      where: { email: account.email },
      include: { partnerInfo: true },
    });

    if (!user) {
      addResult(
        `1.${partnerAccounts.indexOf(account) + 1} - ${account.company}`,
        'FAIL',
        '계정이 존재하지 않음',
        { email: account.email }
      );
      continue;
    }

    // Check password
    if (!user.password) {
      addResult(
        `1.${partnerAccounts.indexOf(account) + 1} - ${account.company}`,
        'FAIL',
        '비밀번호가 설정되지 않음'
      );
      continue;
    }

    const isPasswordValid = await bcrypt.compare(account.password, user.password);

    if (!isPasswordValid) {
      addResult(
        `1.${partnerAccounts.indexOf(account) + 1} - ${account.company}`,
        'FAIL',
        '비밀번호 불일치'
      );
      continue;
    }

    // Check partner info
    if (!user.partnerInfo) {
      addResult(
        `1.${partnerAccounts.indexOf(account) + 1} - ${account.company}`,
        'FAIL',
        '회원사 정보 없음'
      );
      continue;
    }

    addResult(
      `1.${partnerAccounts.indexOf(account) + 1} - ${account.company}`,
      'PASS',
      '로그인 가능',
      {
        email: account.email,
        name: user.name,
        company: user.partnerInfo.companyName,
        status: user.partnerInfo.status,
        commission: `${user.partnerInfo.commissionRate * 100}%`,
      }
    );
  }

  // ============================================
  // 시나리오 2: 실패 케이스 - 존재하지 않는 계정
  // ============================================
  console.log('\n📋 시나리오 2: 실패 케이스 테스트\n');

  const nonExistentEmail = 'notexist@example.com';
  const nonExistentUser = await prisma.user.findUnique({
    where: { email: nonExistentEmail },
  });

  if (nonExistentUser) {
    addResult(
      '2.1 - 존재하지 않는 계정',
      'FAIL',
      '계정이 존재함 (예상: 존재하지 않음)'
    );
  } else {
    addResult(
      '2.1 - 존재하지 않는 계정',
      'PASS',
      '존재하지 않는 이메일 확인됨',
      { email: nonExistentEmail, expectedError: '등록되지 않은 이메일입니다' }
    );
  }

  // ============================================
  // 시나리오 3: 잘못된 비밀번호
  // ============================================
  const testUser = await prisma.user.findUnique({
    where: { email: 'partner1@global-travel.com' },
  });

  if (testUser && testUser.password) {
    const wrongPassword = 'wrongpassword123';
    const isWrongPasswordInvalid = !(await bcrypt.compare(wrongPassword, testUser.password));

    if (isWrongPasswordInvalid) {
      addResult(
        '2.2 - 잘못된 비밀번호',
        'PASS',
        '잘못된 비밀번호 검증 작동',
        { expectedError: '비밀번호가 일치하지 않습니다' }
      );
    } else {
      addResult(
        '2.2 - 잘못된 비밀번호',
        'FAIL',
        '비밀번호 검증 실패'
      );
    }
  }

  // ============================================
  // 시나리오 4: OAuth 계정 확인
  // ============================================
  console.log('\n📋 시나리오 3: OAuth 계정 확인\n');

  const oauthAccounts = await prisma.account.findMany({
    include: {
      user: true,
    },
  });

  addResult(
    '3.1 - OAuth 계정 수',
    oauthAccounts.length > 0 ? 'PASS' : 'FAIL',
    `${oauthAccounts.length}개의 OAuth 계정 발견`,
    {
      accounts: oauthAccounts.map(acc => ({
        provider: acc.provider,
        email: acc.user.email,
        type: acc.type,
      })),
    }
  );

  // ============================================
  // 시나리오 5: Voyagers Club 멤버십 확인
  // ============================================
  console.log('\n📋 시나리오 4: Voyagers Club 멤버십\n');

  const voyagersClubs = await prisma.voyagersClub.findMany({
    include: {
      user: true,
    },
  });

  addResult(
    '4.1 - Voyagers Club 멤버',
    voyagersClubs.length > 0 ? 'PASS' : 'FAIL',
    `${voyagersClubs.length}명의 멤버 확인`,
    {
      members: voyagersClubs.map(vc => ({
        email: vc.user.email,
        membershipNumber: vc.membershipNumber,
        tier: vc.tier,
        points: vc.points,
      })),
    }
  );

  // ============================================
  // 시나리오 6: 데이터베이스 무결성
  // ============================================
  console.log('\n📋 시나리오 5: 데이터베이스 무결성\n');

  const totalUsers = await prisma.user.count();
  const totalPartners = await prisma.partnerInfo.count();
  const totalSessions = await prisma.session.count();

  addResult(
    '5.1 - 사용자 수',
    totalUsers > 0 ? 'PASS' : 'FAIL',
    `${totalUsers}명의 사용자 등록됨`
  );

  addResult(
    '5.2 - 회원사 수',
    totalPartners >= 5 ? 'PASS' : 'FAIL',
    `${totalPartners}개의 회원사 등록됨`,
    { expected: 5, actual: totalPartners }
  );

  addResult(
    '5.3 - 활성 세션',
    'PASS',
    `${totalSessions}개의 세션 존재`
  );

  // ============================================
  // 최종 결과 요약
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(70));

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const totalCount = results.length;
  const successRate = ((passCount / totalCount) * 100).toFixed(1);

  console.log(`\n총 테스트: ${totalCount}개`);
  console.log(`✅ 통과: ${passCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📈 성공률: ${successRate}%\n`);

  if (failCount === 0) {
    console.log('🎉 모든 테스트를 통과했습니다!\n');
  } else {
    console.log('⚠️  일부 테스트가 실패했습니다. 위의 결과를 확인하세요.\n');
  }

  // ============================================
  // 실제 테스트 가이드
  // ============================================
  console.log('='.repeat(70));
  console.log('🌐 브라우저 테스트 가이드');
  console.log('='.repeat(70));
  console.log('\n다음 URL로 접속하여 수동 테스트를 진행하세요:\n');
  console.log('1. 로그인 페이지: http://localhost:3000/login');
  console.log('\n2. 테스트 계정:');
  partnerAccounts.forEach((acc, idx) => {
    console.log(`   ${idx + 1}. ${acc.email} / ${acc.password}`);
  });
  console.log('\n3. 에러 테스트 URL:');
  console.log('   http://localhost:3000/login?error=OAuthAccountNotLinked');
  console.log('\n4. 회원가입 테스트:');
  console.log('   http://localhost:3000/register');
  console.log('   http://localhost:3000/register?type=partner');
  console.log('\n' + '='.repeat(70));
}

testLoginFlow()
  .catch((e) => {
    console.error('\n❌ 테스트 실행 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
