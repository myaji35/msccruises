import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const rules = await prisma.pricingRule.findMany({
      orderBy: { priority: "desc" },
    });

    const rulesWithParsedFields = rules.map((rule) => ({
      ...rule,
      applicableCruises: rule.applicableCruises
        ? JSON.parse(rule.applicableCruises)
        : null,
      applicableCategories: rule.applicableCategories
        ? JSON.parse(rule.applicableCategories)
        : null,
    }));

    return NextResponse.json({ rules: rulesWithParsedFields });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch pricing rules", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      ruleType,
      inventoryThresholdLow,
      inventoryThresholdMedium,
      inventoryThresholdHigh,
      priceMultiplierLow,
      priceMultiplierMedium,
      priceMultiplierHigh,
      demandMultiplierHigh,
      demandMultiplierMedium,
      demandMultiplierLow,
      groupDiscount3to5,
      groupDiscount6to10,
      groupDiscount11plus,
      applicableCruises,
      applicableCategories,
      priority,
      isActive,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const rule = await prisma.pricingRule.create({
      data: {
        name,
        ruleType,
        inventoryThresholdLow,
        inventoryThresholdMedium,
        inventoryThresholdHigh,
        priceMultiplierLow,
        priceMultiplierMedium,
        priceMultiplierHigh,
        demandMultiplierHigh,
        demandMultiplierMedium,
        demandMultiplierLow,
        groupDiscount3to5,
        groupDiscount6to10,
        groupDiscount11plus,
        applicableCruises: applicableCruises
          ? JSON.stringify(applicableCruises)
          : null,
        applicableCategories: applicableCategories
          ? JSON.stringify(applicableCategories)
          : null,
        priority: priority || 100,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      rule: {
        ...rule,
        applicableCruises: rule.applicableCruises
          ? JSON.parse(rule.applicableCruises)
          : null,
        applicableCategories: rule.applicableCategories
          ? JSON.parse(rule.applicableCategories)
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create pricing rule", message: error.message },
      { status: 500 }
    );
  }
}
