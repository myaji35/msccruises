import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/promotions/[id] - 프로모션 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await prisma.promotionCode.findUnique({
      where: { id: params.id },
    });

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: "Promotion not found" },
        { status: 404 }
      );
    }

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
    console.error("GET /api/admin/promotions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotion", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promotions/[id] - 프로모션 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if promotion exists
    const existing = await prisma.promotionCode.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Promotion not found" },
        { status: 404 }
      );
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.promotionCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Promotion code already exists" },
          { status: 409 }
        );
      }
    }

    const promotion = await prisma.promotionCode.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        type,
        value,
        currency: type === "fixed" ? (currency || "USD") : null,
        description,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        maxUses,
        maxUsesPerUser,
        minOrderAmount,
        applicableCruises: applicableCruises
          ? JSON.stringify(applicableCruises)
          : undefined,
        applicableCategories: applicableCategories
          ? JSON.stringify(applicableCategories)
          : undefined,
        isActive,
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
    console.error("PUT /api/admin/promotions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update promotion", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promotions/[id] - 프로모션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.promotionCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/promotions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete promotion", message: error.message },
      { status: 500 }
    );
  }
}
