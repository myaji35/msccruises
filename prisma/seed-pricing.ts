import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPricing() {
  console.log('🎯 Seeding pricing data...');

  // 1. Create default pricing rules
  const defaultRule = await prisma.pricingRule.upsert({
    where: { id: 'default-rule-001' },
    update: {},
    create: {
      id: 'default-rule-001',
      name: 'Default Pricing Rule',
      description: 'Standard dynamic pricing rules for all cruises',
      ruleType: 'inventory',

      // Inventory thresholds
      inventoryThresholdLow: 30,
      inventoryThresholdMedium: 50,
      inventoryThresholdHigh: 70,

      // Price multipliers
      priceMultiplierLow: 1.20, // +20% when inventory < 30%
      priceMultiplierMedium: 1.10, // +10% when inventory < 50%
      priceMultiplierHigh: 1.05, // +5% when inventory < 70%

      // Demand multipliers
      demandMultiplierHigh: 1.15, // +15% for high demand
      demandMultiplierMedium: 1.07, // +7% for medium demand
      demandMultiplierLow: 1.00, // No change for low demand

      // Group discounts
      groupDiscount3to5: 0.05, // 5% for 3-5 cabins
      groupDiscount6to10: 0.10, // 10% for 6-10 cabins
      groupDiscount11plus: 0.15, // 15% for 11+ cabins

      isActive: true,
      priority: 1,
      createdBy: 'system',
    },
  });

  console.log('✅ Created default pricing rule:', defaultRule.id);

  // 2. Create summer promotion
  const summerPromo = await prisma.promotionCode.upsert({
    where: { code: 'SUMMER2025' },
    update: {},
    create: {
      code: 'SUMMER2025',
      type: 'percentage',
      value: 15, // 15% off
      description: 'Summer 2025 Special - 15% off all Mediterranean cruises',

      validFrom: new Date('2025-06-01'),
      validUntil: new Date('2025-08-31'),

      maxUses: 1000,
      currentUses: 0,
      maxUsesPerUser: 1,

      minOrderAmount: 2000,
      applicableCruises: null, // All cruises
      applicableCategories: null, // All categories

      isActive: true,
      createdBy: 'system',
    },
  });

  console.log('✅ Created promotion:', summerPromo.code);

  // 3. Create early bird promotion
  const earlyBirdPromo = await prisma.promotionCode.upsert({
    where: { code: 'EARLYBIRD' },
    update: {},
    create: {
      code: 'EARLYBIRD',
      type: 'fixed',
      value: 300, // $300 off
      currency: 'USD',
      description: 'Early Bird Special - Book 90 days in advance',

      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),

      maxUses: null, // Unlimited
      currentUses: 0,
      maxUsesPerUser: 2,

      minOrderAmount: 3000,
      applicableCruises: null,
      applicableCategories: JSON.stringify(['balcony', 'suite']), // Only balcony and suite

      isActive: true,
      createdBy: 'system',
    },
  });

  console.log('✅ Created promotion:', earlyBirdPromo.code);

  // 4. Create Black Friday promotion
  const blackFridayPromo = await prisma.promotionCode.upsert({
    where: { code: 'BLACKFRIDAY2025' },
    update: {},
    create: {
      code: 'BLACKFRIDAY2025',
      type: 'percentage',
      value: 25, // 25% off
      description: 'Black Friday 2025 - Biggest sale of the year!',

      validFrom: new Date('2025-11-28'),
      validUntil: new Date('2025-11-30'),

      maxUses: 500,
      currentUses: 0,
      maxUsesPerUser: 1,

      minOrderAmount: 1500,
      applicableCruises: null,
      applicableCategories: null,

      isActive: true,
      createdBy: 'system',
    },
  });

  console.log('✅ Created promotion:', blackFridayPromo.code);

  // 5. Create first-time customer promotion
  const firstTimePromo = await prisma.promotionCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10, // 10% off
      description: 'Welcome to MSC - First-time customer discount',

      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),

      maxUses: null, // Unlimited
      currentUses: 0,
      maxUsesPerUser: 1, // Only once per user

      minOrderAmount: 1000,
      applicableCruises: null,
      applicableCategories: null,

      isActive: true,
      createdBy: 'system',
    },
  });

  console.log('✅ Created promotion:', firstTimePromo.code);

  // 6. Create sample price history entries
  const cruises = await prisma.cruise.findMany({ take: 3 });

  for (const cruise of cruises) {
    const categories = ['inside', 'oceanview', 'balcony', 'suite'];

    for (const category of categories) {
      await prisma.priceHistory.create({
        data: {
          cruiseId: cruise.id,
          cabinCategory: category,
          oldPrice: cruise.startingPrice * 1.3,
          newPrice: cruise.startingPrice * 1.5,
          changeReason: 'inventory',
          changeDetails: JSON.stringify({
            inventoryLevel: 'low',
            percentageAvailable: 25,
          }),
          changedBy: 'system',
        },
      });
    }
  }

  console.log(`✅ Created price history for ${cruises.length} cruises`);

  console.log('✨ Pricing data seeded successfully!\n');
}

seedPricing()
  .catch((e) => {
    console.error('❌ Error seeding pricing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
