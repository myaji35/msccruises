import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding partner (중간관리자) accounts...');

  // Hash password
  const password = await bcrypt.hash('partner123!', 10);

  // Partner 1: 글로벌여행사 (승인 완료)
  const partner1 = await prisma.user.upsert({
    where: { email: 'partner1@global-travel.com' },
    update: {},
    create: {
      email: 'partner1@global-travel.com',
      name: '김대리',
      password: password,
      phone: '010-1111-2222',
      userType: 'partner',
    },
  });

  await prisma.partnerInfo.upsert({
    where: { userId: partner1.id },
    update: {},
    create: {
      userId: partner1.id,
      companyName: '글로벌여행사',
      businessNumber: '123-45-67890',
      representativeName: '김대표',
      address: '서울시 강남구 테헤란로 123',
      commissionRate: 0.08,
      subpageUrl: `global-travel-${partner1.id.substring(0, 8)}`,
      status: 'active',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Partner 1 created:', {
    email: 'partner1@global-travel.com',
    password: 'partner123!',
    company: '글로벌여행사',
    status: 'active (승인 완료)',
  });

  // Partner 2: 드림투어 (승인 완료)
  const partner2 = await prisma.user.upsert({
    where: { email: 'partner2@dream-tour.com' },
    update: {},
    create: {
      email: 'partner2@dream-tour.com',
      name: '이실장',
      password: password,
      phone: '010-3333-4444',
      userType: 'partner',
    },
  });

  await prisma.partnerInfo.upsert({
    where: { userId: partner2.id },
    update: {},
    create: {
      userId: partner2.id,
      companyName: '드림투어',
      businessNumber: '234-56-78901',
      representativeName: '이대표',
      address: '서울시 중구 명동길 456',
      commissionRate: 0.10, // 10% commission (VIP partner)
      subpageUrl: `dream-tour-${partner2.id.substring(0, 8)}`,
      status: 'active',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Partner 2 created:', {
    email: 'partner2@dream-tour.com',
    password: 'partner123!',
    company: '드림투어',
    status: 'active (승인 완료)',
  });

  // Partner 3: 바다여행 (승인 대기)
  const partner3 = await prisma.user.upsert({
    where: { email: 'partner3@ocean-travel.com' },
    update: {},
    create: {
      email: 'partner3@ocean-travel.com',
      name: '박과장',
      password: password,
      phone: '010-5555-6666',
      userType: 'partner',
    },
  });

  await prisma.partnerInfo.upsert({
    where: { userId: partner3.id },
    update: {},
    create: {
      userId: partner3.id,
      companyName: '바다여행',
      businessNumber: '345-67-89012',
      representativeName: '박대표',
      address: '부산시 해운대구 해변로 789',
      commissionRate: 0.08,
      subpageUrl: `ocean-travel-${partner3.id.substring(0, 8)}`,
      status: 'pending',
      approvedAt: null,
    },
  });

  console.log('✅ Partner 3 created:', {
    email: 'partner3@ocean-travel.com',
    password: 'partner123!',
    company: '바다여행',
    status: 'pending (승인 대기)',
  });

  // Partner 4: 럭셔리트래블 (승인 완료 - 고급 여행사)
  const partner4 = await prisma.user.upsert({
    where: { email: 'partner4@luxury-travel.com' },
    update: {},
    create: {
      email: 'partner4@luxury-travel.com',
      name: '최부장',
      password: password,
      phone: '010-7777-8888',
      userType: 'partner',
    },
  });

  await prisma.partnerInfo.upsert({
    where: { userId: partner4.id },
    update: {},
    create: {
      userId: partner4.id,
      companyName: '럭셔리트래블',
      businessNumber: '456-78-90123',
      representativeName: '최대표',
      address: '서울시 강남구 청담동 럭셔리빌딩 10층',
      commissionRate: 0.12, // 12% commission (Premium partner)
      subpageUrl: `luxury-travel-${partner4.id.substring(0, 8)}`,
      status: 'active',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Partner 4 created:', {
    email: 'partner4@luxury-travel.com',
    password: 'partner123!',
    company: '럭셔리트래블',
    status: 'active (승인 완료)',
  });

  // Partner 5: 제주크루즈 (승인 완료 - 지역 특화)
  const partner5 = await prisma.user.upsert({
    where: { email: 'partner5@jeju-cruise.com' },
    update: {},
    create: {
      email: 'partner5@jeju-cruise.com',
      name: '강지점장',
      password: password,
      phone: '010-9999-0000',
      userType: 'partner',
    },
  });

  await prisma.partnerInfo.upsert({
    where: { userId: partner5.id },
    update: {},
    create: {
      userId: partner5.id,
      companyName: '제주크루즈투어',
      businessNumber: '567-89-01234',
      representativeName: '강대표',
      address: '제주시 중앙로 321',
      commissionRate: 0.09,
      subpageUrl: `jeju-cruise-${partner5.id.substring(0, 8)}`,
      status: 'active',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Partner 5 created:', {
    email: 'partner5@jeju-cruise.com',
    password: 'partner123!',
    company: '제주크루즈투어',
    status: 'active (승인 완료)',
  });

  console.log('\n📊 Summary:');
  console.log('========================================');
  console.log('✅ 5개의 중간관리자(회원사) 계정 생성 완료');
  console.log('  - 승인 완료: 4개');
  console.log('  - 승인 대기: 1개 (partner3@ocean-travel.com)');
  console.log('========================================');
  console.log('\n🔑 Login Credentials:');
  console.log('========================================');
  console.log('Email                          | Password     | Company        | Status');
  console.log('-------------------------------|--------------|----------------|--------');
  console.log('partner1@global-travel.com     | partner123!  | 글로벌여행사    | 활성');
  console.log('partner2@dream-tour.com        | partner123!  | 드림투어       | 활성');
  console.log('partner3@ocean-travel.com      | partner123!  | 바다여행       | 대기');
  console.log('partner4@luxury-travel.com     | partner123!  | 럭셔리트래블   | 활성');
  console.log('partner5@jeju-cruise.com       | partner123!  | 제주크루즈투어 | 활성');
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
