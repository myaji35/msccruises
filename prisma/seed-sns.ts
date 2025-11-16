import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔗 Seeding SNS Accounts and Rules...');

  // 1년 후까지 유효한 토큰
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  // Create or find an admin user
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@msccruises.com' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@msccruises.com',
        name: 'MSC Admin',
        userType: 'customer', // Change to admin type if you have it
      },
    });
    console.log('  ✓ Created admin user');
  }

  // SNS Accounts to seed
  const snsAccounts = [
    {
      userId: adminUser.id,
      platform: 'facebook',
      accountName: 'MSC Cruises Korea',
      accountId: 'msccruises_kr',
      accessToken: 'fake_facebook_access_token_' + Math.random().toString(36).substring(7),
      refreshToken: 'fake_facebook_refresh_token_' + Math.random().toString(36).substring(7),
      tokenExpiresAt: oneYearFromNow,
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'instagram',
      accountName: '@msccruises_korea',
      accountId: 'msccruises_korea',
      accessToken: 'fake_instagram_access_token_' + Math.random().toString(36).substring(7),
      refreshToken: 'fake_instagram_refresh_token_' + Math.random().toString(36).substring(7),
      tokenExpiresAt: oneYearFromNow,
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'twitter',
      accountName: '@MSCCruisesKR',
      accountId: 'msccruises_kr',
      accessToken: 'fake_twitter_access_token_' + Math.random().toString(36).substring(7),
      refreshToken: 'fake_twitter_refresh_token_' + Math.random().toString(36).substring(7),
      tokenExpiresAt: oneYearFromNow,
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'kakao',
      accountName: 'MSC크루즈',
      accountId: 'msccruises',
      accessToken: 'fake_kakao_access_token_' + Math.random().toString(36).substring(7),
      refreshToken: 'fake_kakao_refresh_token_' + Math.random().toString(36).substring(7),
      tokenExpiresAt: oneYearFromNow,
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'naver',
      accountName: 'MSC크루즈코리아',
      accountId: 'msccruises_kr',
      accessToken: 'fake_naver_access_token_' + Math.random().toString(36).substring(7),
      refreshToken: 'fake_naver_refresh_token_' + Math.random().toString(36).substring(7),
      tokenExpiresAt: oneYearFromNow,
      isActive: true,
    },
  ];

  // Create SNS accounts
  const createdAccounts: { [key: string]: any } = {};
  for (const account of snsAccounts) {
    const existing = await prisma.snsAccount.findUnique({
      where: {
        userId_platform_accountId: {
          userId: account.userId,
          platform: account.platform,
          accountId: account.accountId,
        },
      },
    });

    if (existing) {
      createdAccounts[account.platform] = existing;
      console.log(`  ⏭  Skipped ${account.platform} (already exists)`);
    } else {
      const created = await prisma.snsAccount.create({
        data: account,
      });
      createdAccounts[account.platform] = created;
      console.log(`  ✓ Created ${account.platform} account: ${account.accountName}`);
    }
  }

  // Create Auto-Post Rules
  const autoPostRules = [
    {
      name: '프로모션 할인 → Facebook 자동 포스팅',
      description: '새로운 패키지 할인이 생성되면 Facebook에 자동 포스팅',
      contentType: 'packageDiscount',
      snsAccountId: createdAccounts['facebook'].id,
      template: `🎉 특별 할인 이벤트! 🎉

{name}
{description}

💰 할인율: {discount}
📅 유효기간: {validUntil}까지

지금 바로 예약하세요!
👉 https://msccruises.co.kr`,
      hashtagTemplate: '#MSC크루즈 #크루즈여행 #특별할인 #여행 #패키지할인',
      postImmediately: true,
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      name: '프로모션 할인 → Instagram 자동 포스팅',
      description: '새로운 패키지 할인이 생성되면 Instagram에 자동 포스팅',
      contentType: 'packageDiscount',
      snsAccountId: createdAccounts['instagram'].id,
      template: `✨ {name} ✨

{description}

💝 {discount} 할인
⏰ {validUntil}까지

Link in bio 👆`,
      hashtagTemplate: '#MSC크루즈 #크루즈 #여행 #할인 #특가 #바다여행 #럭셔리여행',
      postImmediately: false,
      scheduleDelayMinutes: 30,
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      name: '새 목적지 → Instagram 자동 포스팅',
      description: '새로운 크루즈 목적지가 추가되면 Instagram에 자동 포스팅',
      contentType: 'destination',
      snsAccountId: createdAccounts['instagram'].id,
      template: `🌍 새로운 여행지 소개 🌍

{name}
{description}

당신의 꿈의 크루즈 여행을 시작하세요! ⚓`,
      hashtagTemplate: '#MSC크루즈 #{name} #크루즈여행 #세계여행 #여행지추천',
      postImmediately: true,
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      name: '새 목적지 → Twitter 자동 포스팅',
      description: '새로운 크루즈 목적지가 추가되면 Twitter에 자동 포스팅',
      contentType: 'destination',
      snsAccountId: createdAccounts['twitter'].id,
      template: `🚢 New Destination: {name}

{description}

Book now: https://msccruises.co.kr`,
      hashtagTemplate: '#MSCCruises #{name} #CruiseTravel #Travel',
      postImmediately: true,
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      name: '새 크루즈 상품 → Facebook 자동 포스팅',
      description: '새로운 크루즈 일정이 추가되면 Facebook에 자동 포스팅',
      contentType: 'cruise',
      snsAccountId: createdAccounts['facebook'].id,
      template: `⚓ 신규 크루즈 일정 공개! ⚓

{name}
{description}

🚢 선박: {shipName}
📍 출발항: {departurePort}
📅 기간: {durationDays}일
💵 시작가: {startingPrice}원~

지금 바로 예약하세요!`,
      hashtagTemplate: '#MSC크루즈 #크루즈여행 #신규일정 #{shipName}',
      postImmediately: false,
      scheduleDelayMinutes: 60,
      isActive: true,
      createdBy: adminUser.id,
    },
  ];

  for (const rule of autoPostRules) {
    const existing = await prisma.snsAutoPostRule.findFirst({
      where: {
        name: rule.name,
        contentType: rule.contentType,
        snsAccountId: rule.snsAccountId,
      },
    });

    if (existing) {
      console.log(`  ⏭  Skipped rule: ${rule.name}`);
    } else {
      await prisma.snsAutoPostRule.create({
        data: rule,
      });
      console.log(`  ✓ Created auto-post rule: ${rule.name}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('========================================');
  console.log('✅ SNS 계정 생성 완료:');
  console.log('  - Facebook: MSC Cruises Korea');
  console.log('  - Instagram: @msccruises_korea');
  console.log('  - Twitter: @MSCCruisesKR');
  console.log('  - Kakao: MSC크루즈');
  console.log('  - Naver: MSC크루즈코리아');
  console.log('\n✅ 자동 포스팅 규칙 생성 완료:');
  console.log('  - 프로모션/할인 → Facebook, Instagram');
  console.log('  - 새 목적지 → Instagram, Twitter');
  console.log('  - 새 크루즈 → Facebook');
  console.log('========================================');
  console.log('\n🔗 Admin URLs:');
  console.log('  http://localhost:3000/admin/sns-accounts');
  console.log('  http://localhost:3000/admin/sns-posts');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
