import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pricing-rules - Get active pricing rules
export async function GET(request: NextRequest) {
  try {
    const rules = await prisma.pricingRule.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priority: "desc",
      },
    });

    // Parse JSON fields
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
    console.error("[Pricing Rules Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rules", message: error.message },
      { status: 500 }
    );
  }
}
