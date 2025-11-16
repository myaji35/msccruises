import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/package-discounts - Get active package discounts
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const discounts = await prisma.packageDiscount.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: {
        priority: "desc",
      },
    });

    // Parse JSON fields
    const discountsWithParsedFields = discounts.map((discount) => ({
      ...discount,
      benefits: discount.benefits ? JSON.parse(discount.benefits) : [],
      conditions: discount.conditions ? JSON.parse(discount.conditions) : [],
    }));

    return NextResponse.json({ discounts: discountsWithParsedFields });
  } catch (error: any) {
    console.error("[Package Discounts Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch package discounts", message: error.message },
      { status: 500 }
    );
  }
}
