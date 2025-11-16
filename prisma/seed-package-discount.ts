import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎁 Seeding Package Discounts...');

  // 1년 후까지 유효한 할인
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const packageDiscounts = [
    {
      code: 'cruise-flight-package-10',
      name: '크루즈+항공 패키지 할인',
      nameEn: 'Cruise + Flight Package Discount',
      description: '크루즈와 항공권을 함께 예약하시면 최대 10% 할인 혜택을 드립니다.',
      discountType: 'percentage',
      discountValue: 0.10, // 10%
      maxDiscountAmount: 500, // Maximum $500 discount
      minOrderAmount: 2000, // Minimum $2000 order
      benefits: JSON.stringify([
        '크루즈 요금 10% 할인',
        '항공권 특별 요금 적용',
        '무료 공항 라운지 이용권',
        '수하물 추가 무료',
      ]),
      conditions: JSON.stringify([
        '크루즈와 항공권을 동시 예약 시',
        '출발 30일 전까지 예약',
        '최소 2인 이상 예약',
      ]),
      applicableTo: 'cruise-flight',
      displayText: '패키지 할인 최대 10%',
      validFrom: new Date(),
      validUntil: oneYearFromNow,
      priority: 100,
      isActive: true,
    },
    {
      code: 'early-bird-15',
      name: '얼리버드 할인',
      nameEn: 'Early Bird Discount',
      description: '출발 90일 전 예약 시 15% 특별 할인',
      discountType: 'percentage',
      discountValue: 0.15, // 15%
      maxDiscountAmount: 800, // Maximum $800 discount
      minOrderAmount: 3000, // Minimum $3000 order
      benefits: JSON.stringify([
        '크루즈 요금 15% 할인',
        '우선 객실 선택권',
        '무료 와인 패키지',
      ]),
      conditions: JSON.stringify([
        '출발 90일 전까지 예약',
        '최소 4박 5일 이상 크루즈',
        '전액 선불 결제',
      ]),
      applicableTo: 'all',
      displayText: '얼리버드 최대 15%',
      validFrom: new Date(),
      validUntil: oneYearFromNow,
      priority: 90,
      isActive: true,
    },
  ];

  for (const discount of packageDiscounts) {
    await prisma.packageDiscount.upsert({
      where: { code: discount.code },
      update: discount,
      create: discount,
    });
    console.log(`  ✓ Created/Updated discount: ${discount.name}`);
  }

  console.log('✅ Package Discounts seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
