import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testPartnerLogin() {
  console.log('🔍 회원사 로그인 테스트\n');
  console.log('='.repeat(60));

  // Test accounts
  const testAccounts = [
    { email: 'partner1@global-travel.com', password: 'partner123!' },
    { email: 'partner2@dream-tour.com', password: 'partner123!' },
    { email: 'partner3@ocean-travel.com', password: 'partner123!' },
    { email: 'partner4@luxury-travel.com', password: 'partner123!' },
    { email: 'partner5@jeju-cruise.com', password: 'partner123!' },
  ];

  console.log('\n📋 테스트할 계정:');
  testAccounts.forEach((acc, idx) => {
    console.log(`${idx + 1}. ${acc.email}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🧪 각 계정 검증 중...\n');

  for (const testAccount of testAccounts) {
    console.log(`\n테스트: ${testAccount.email}`);
    console.log('-'.repeat(60));

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: testAccount.email },
      include: {
        partnerInfo: true,
      },
    });

    if (!user) {
      console.log('❌ 사용자가 존재하지 않습니다');
      continue;
    }

    console.log('✅ 사용자 존재 확인');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - 이름: ${user.name}`);
    console.log(`   - 타입: ${user.userType}`);

    // 2. Check password
    if (!user.password) {
      console.log('❌ 비밀번호가 설정되지 않음');
      continue;
    }

    const isPasswordValid = await bcrypt.compare(
      testAccount.password,
      user.password
    );

    if (!isPasswordValid) {
      console.log('❌ 비밀번호 불일치');
      continue;
    }

    console.log('✅ 비밀번호 확인');

    // 3. Check partner info
    if (!user.partnerInfo) {
      console.log('⚠️  회원사 정보 없음 (일반 사용자)');
      continue;
    }

    console.log('✅ 회원사 정보 확인');
    console.log(`   - 회사명: ${user.partnerInfo.companyName}`);
    console.log(`   - 수수료율: ${user.partnerInfo.commissionRate * 100}%`);
    console.log(`   - 상태: ${user.partnerInfo.status}`);
    console.log(`   - 서브페이지 URL: ${user.partnerInfo.subpageUrl || '없음'}`);

    // 4. Final verdict
    if (user.partnerInfo.status === 'active') {
      console.log('🎉 로그인 가능 - 활성화된 회원사 계정');
    } else {
      console.log(`⚠️  로그인 가능하나 상태가 "${user.partnerInfo.status}"입니다`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 전체 통계:');

  const totalUsers = await prisma.user.count({
    where: {
      email: { in: testAccounts.map(a => a.email) },
    },
  });

  const totalPartners = await prisma.partnerInfo.count({
    where: {
      user: {
        email: { in: testAccounts.map(a => a.email) },
      },
    },
  });

  const activePartners = await prisma.partnerInfo.count({
    where: {
      user: {
        email: { in: testAccounts.map(a => a.email) },
      },
      status: 'active',
    },
  });

  console.log(`- 등록된 사용자: ${totalUsers}/${testAccounts.length}`);
  console.log(`- 회원사 정보: ${totalPartners}/${testAccounts.length}`);
  console.log(`- 활성 회원사: ${activePartners}/${testAccounts.length}`);

  console.log('\n' + '='.repeat(60));
  console.log('\n🌐 테스트 방법:');
  console.log('1. http://localhost:3000/login 접속');
  console.log('2. 이메일: partner1@global-travel.com');
  console.log('3. 비밀번호: partner123!');
  console.log('4. "이메일로 로그인" 버튼 클릭');
  console.log('\n예상 결과: 로그인 성공 → /dashboard/my-bookings로 리다이렉트');
  console.log('='.repeat(60));
}

testPartnerLogin()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
