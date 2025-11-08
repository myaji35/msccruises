import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SNS test accounts...');

  // Find admin user (or create a test user)
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@msccruises.com' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@msccruises.com',
        name: 'MSC Admin',
        userType: 'customer', // In real scenario, this would be 'admin'
      },
    });
    console.log('✅ Test admin user created');
  }

  // Create SNS accounts
  const snsAccounts = [
    {
      userId: adminUser.id,
      platform: 'facebook',
      accountId: '@MSCCruisesOfficial',
      accessToken: 'fb_test_token_' + Math.random().toString(36).substring(7),
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'instagram',
      accountId: '@msc_cruises',
      accessToken: 'ig_test_token_' + Math.random().toString(36).substring(7),
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'tiktok',
      accountId: '@msccruises',
      accessToken: 'tt_test_token_' + Math.random().toString(36).substring(7),
      isActive: true,
    },
    {
      userId: adminUser.id,
      platform: 'threads',
      accountId: '@msc.cruises',
      accessToken: 'th_test_token_' + Math.random().toString(36).substring(7),
      isActive: false, // One inactive account for testing
    },
  ];

  for (const account of snsAccounts) {
    await prisma.snsAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: account.userId,
          platform: account.platform,
          accountId: account.accountId,
        },
      },
      update: {},
      create: account,
    });
  }

  console.log('✅ SNS accounts created');

  // Create sample scheduled posts
  const cruise = await prisma.cruise.findFirst({
    where: { featured: true },
  });

  if (cruise) {
    const fbAccount = await prisma.snsAccount.findFirst({
      where: { platform: 'facebook', userId: adminUser.id },
    });

    if (fbAccount) {
      await prisma.snsPost.create({
        data: {
          cruiseId: cruise.id,
          snsAccountId: fbAccount.id,
          platform: 'facebook',
          content: `🚢 ✨ Discover Paradise on the High Seas! ✨🚢

Join us on the magnificent ${cruise.shipName} for an unforgettable ${cruise.durationDays}-day Caribbean adventure!

🌴 ${cruise.name}
💰 Starting from just $${cruise.startingPrice}
📍 Departing from ${cruise.departurePort}

Experience:
🏖️ Stunning tropical islands
🍽️ World-class dining
🎭 Broadway-style entertainment
💆 Luxury spa & relaxation

Book now and make memories that last a lifetime! 🌊

#MSCCruises #CaribbeanCruise #TravelGoals #VacationMode #CruiseLife #Paradise`,
          hashtags: '#MSCCruises,#CaribbeanCruise,#TravelGoals,#VacationMode',
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          createdBy: adminUser.id,
        },
      });

      console.log('✅ Sample scheduled post created');
    }
  }

  console.log('\n📊 Summary:');
  console.log('========================================');
  console.log('✅ 4개의 SNS 테스트 계정 생성');
  console.log('  - Facebook: @MSCCruisesOfficial (활성)');
  console.log('  - Instagram: @msc_cruises (활성)');
  console.log('  - TikTok: @msccruises (활성)');
  console.log('  - Threads: @msc.cruises (비활성)');
  console.log('\n✅ 1개의 예약된 포스트 생성');
  console.log('========================================');
  console.log('\n🔗 Test URL:');
  console.log('http://localhost:3000/admin/sns/accounts');
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
