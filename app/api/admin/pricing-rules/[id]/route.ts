import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const existing = await prisma.pricingRule.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rule = await prisma.pricingRule.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.ruleType !== undefined && { ruleType: body.ruleType }),
        ...(body.inventoryThresholdLow !== undefined && { inventoryThresholdLow: body.inventoryThresholdLow }),
        ...(body.inventoryThresholdMedium !== undefined && { inventoryThresholdMedium: body.inventoryThresholdMedium }),
        ...(body.inventoryThresholdHigh !== undefined && { inventoryThresholdHigh: body.inventoryThresholdHigh }),
        ...(body.priceMultiplierLow !== undefined && { priceMultiplierLow: body.priceMultiplierLow }),
        ...(body.priceMultiplierMedium !== undefined && { priceMultiplierMedium: body.priceMultiplierMedium }),
        ...(body.priceMultiplierHigh !== undefined && { priceMultiplierHigh: body.priceMultiplierHigh }),
        ...(body.demandMultiplierHigh !== undefined && { demandMultiplierHigh: body.demandMultiplierHigh }),
        ...(body.demandMultiplierMedium !== undefined && { demandMultiplierMedium: body.demandMultiplierMedium }),
        ...(body.demandMultiplierLow !== undefined && { demandMultiplierLow: body.demandMultiplierLow }),
        ...(body.groupDiscount3to5 !== undefined && { groupDiscount3to5: body.groupDiscount3to5 }),
        ...(body.groupDiscount6to10 !== undefined && { groupDiscount6to10: body.groupDiscount6to10 }),
        ...(body.groupDiscount11plus !== undefined && { groupDiscount11plus: body.groupDiscount11plus }),
        ...(body.applicableCruises !== undefined && {
          applicableCruises: body.applicableCruises ? JSON.stringify(body.applicableCruises) : null,
        }),
        ...(body.applicableCategories !== undefined && {
          applicableCategories: body.applicableCategories ? JSON.stringify(body.applicableCategories) : null,
        }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({
      rule: {
        ...rule,
        applicableCruises: rule.applicableCruises ? JSON.parse(rule.applicableCruises) : null,
        applicableCategories: rule.applicableCategories ? JSON.parse(rule.applicableCategories) : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pricingRule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
