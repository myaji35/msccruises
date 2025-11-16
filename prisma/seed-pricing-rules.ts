import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding pricing rules...");

  // Default pricing rule
  const defaultRule = {
    name: "기본 가격 규칙",
    description: "모든 크루즈에 적용되는 기본 가격 책정 규칙",
    ruleType: "inventory",

    // Inventory-based pricing
    inventoryThresholdLow: 30,
    inventoryThresholdMedium: 50,
    inventoryThresholdHigh: 70,
    priceMultiplierLow: 1.20,
    priceMultiplierMedium: 1.10,
    priceMultiplierHigh: 1.05,

    // Demand-based pricing
    demandMultiplierHigh: 1.15,
    demandMultiplierMedium: 1.07,
    demandMultiplierLow: 1.00,

    // Group discounts
    groupDiscount3to5: 0.05,
    groupDiscount6to10: 0.10,
    groupDiscount11plus: 0.15,

    isActive: true,
    priority: 100,
  };

  await prisma.pricingRule.upsert({
    where: { id: "default-pricing-rule" },
    update: defaultRule,
    create: {
      id: "default-pricing-rule",
      ...defaultRule,
    },
  });

  console.log("✅ Created/Updated default pricing rule");
  console.log("✅ Pricing rules seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
