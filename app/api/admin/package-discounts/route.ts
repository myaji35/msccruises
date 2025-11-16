import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoPostContent } from "@/services/sns-posting.service";

// GET /api/admin/package-discounts - Get all package discounts (including inactive)
export async function GET(request: NextRequest) {
  try {
    const discounts = await prisma.packageDiscount.findMany({
      orderBy: { priority: "desc" },
    });

    // Parse JSON fields
    const discountsWithParsedFields = discounts.map((discount) => ({
      ...discount,
      benefits: discount.benefits ? JSON.parse(discount.benefits) : [],
      conditions: discount.conditions ? JSON.parse(discount.conditions) : [],
    }));

    return NextResponse.json({ discounts: discountsWithParsedFields });
  } catch (error: any) {
    console.error("[Package Discounts Admin API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch package discounts", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/package-discounts - Create new package discount
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      nameEn,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      benefits,
      conditions,
      applicableTo,
      displayText,
      validFrom,
      validUntil,
      priority,
      isActive,
      createdBy,
    } = body;

    // Validation
    if (!code || !name || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "code, name, discountType, discountValue, validFrom, and validUntil are required" },
        { status: 400 }
      );
    }

    // Check for existing code
    const existing = await prisma.packageDiscount.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Package discount with this code already exists" },
        { status: 400 }
      );
    }

    const discount = await prisma.packageDiscount.create({
      data: {
        code,
        name,
        nameEn,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderAmount,
        benefits: benefits ? JSON.stringify(benefits) : null,
        conditions: conditions ? JSON.stringify(conditions) : null,
        applicableTo,
        displayText,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        priority: priority || 100,
        isActive: isActive ?? true,
      },
    });

    // Auto-post to SNS
    const tempUserId = createdBy || 'system';
    const { postIds, errors } = await autoPostContent(
      'packageDiscount',
      discount.id,
      tempUserId
    );

    if (errors.length > 0) {
      console.warn('[Package Discount Created] SNS auto-post errors:', errors);
    }

    return NextResponse.json({
      discount: {
        ...discount,
        benefits: discount.benefits ? JSON.parse(discount.benefits) : [],
        conditions: discount.conditions ? JSON.parse(discount.conditions) : [],
      },
      snsPostsCreated: postIds.length,
      snsErrors: errors,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[Package Discounts Admin API Error]", error);
    return NextResponse.json(
      { error: "Failed to create package discount", message: error.message },
      { status: 500 }
    );
  }
}
