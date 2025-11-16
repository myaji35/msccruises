import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/promotions - 프로모션 코드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: any = {};

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const promotions = await prisma.promotionCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields
    const promotionsWithParsedFields = promotions.map((promo) => ({
      ...promo,
      applicableCruises: promo.applicableCruises
        ? JSON.parse(promo.applicableCruises)
        : null,
      applicableCategories: promo.applicableCategories
        ? JSON.parse(promo.applicableCategories)
        : null,
    }));

    return NextResponse.json({
      success: true,
      promotions: promotionsWithParsedFields,
    });
  } catch (error: any) {
    console.error("GET /api/admin/promotions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotions", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/promotions - 프로모션 코드 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      type,
      value,
      currency,
      description,
      validFrom,
      validUntil,
      maxUses,
      maxUsesPerUser,
      minOrderAmount,
      applicableCruises,
      applicableCategories,
      isActive,
    } = body;

    // Validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Code, type, and value are required" },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Type must be 'percentage' or 'fixed'" },
        { status: 400 }
      );
    }

    if (!validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: "Valid from and until dates are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.promotionCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Promotion code already exists" },
        { status: 409 }
      );
    }

    const promotion = await prisma.promotionCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        currency: type === "fixed" ? (currency || "USD") : null,
        description,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        maxUses,
        maxUsesPerUser: maxUsesPerUser || 1,
        minOrderAmount,
        applicableCruises: applicableCruises
          ? JSON.stringify(applicableCruises)
          : null,
        applicableCategories: applicableCategories
          ? JSON.stringify(applicableCategories)
          : null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      promotion: {
        ...promotion,
        applicableCruises: promotion.applicableCruises
          ? JSON.parse(promotion.applicableCruises)
          : null,
        applicableCategories: promotion.applicableCategories
          ? JSON.parse(promotion.applicableCategories)
          : null,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/promotions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create promotion", message: error.message },
      { status: 500 }
    );
  }
}
