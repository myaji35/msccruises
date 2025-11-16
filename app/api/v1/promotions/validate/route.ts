import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/v1/promotions/validate
 *
 * Validate a promotion code before applying it to a booking
 *
 * Request Body:
 * {
 *   "code": "string",
 *   "cruiseId": "string",
 *   "cabinCategory": "string",
 *   "totalAmount": number
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "isValid": boolean,
 *     "code": "string",
 *     "discountAmount": number,
 *     "message": "string"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, cruiseId, cabinCategory, totalAmount } = body;

    if (!code || !cruiseId || !cabinCategory || !totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: code, cruiseId, cabinCategory, totalAmount',
        },
        { status: 400 }
      );
    }

    const promo = await prisma.promotionCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Invalid promotion code',
        },
      });
    }

    const now = new Date();

    // Check validity period
    if (now < promo.validFrom || now > promo.validUntil) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Promotion code has expired',
        },
      });
    }

    // Check if active
    if (!promo.isActive) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Promotion code is not active',
        },
      });
    }

    // Check usage limit
    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Promotion code usage limit reached',
        },
      });
    }

    // Check minimum order amount
    if (promo.minOrderAmount && totalAmount < promo.minOrderAmount) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: `Minimum order amount of $${promo.minOrderAmount} required`,
        },
      });
    }

    // Check applicable cruises
    if (promo.applicableCruises) {
      const applicableCruisesList = JSON.parse(promo.applicableCruises);
      if (!applicableCruisesList.includes(cruiseId)) {
        return NextResponse.json({
          success: true,
          data: {
            isValid: false,
            message: 'Promotion not applicable to this cruise',
          },
        });
      }
    }

    // Check applicable categories
    if (promo.applicableCategories) {
      const applicableCategoriesList = JSON.parse(promo.applicableCategories);
      if (!applicableCategoriesList.includes(cabinCategory)) {
        return NextResponse.json({
          success: true,
          data: {
            isValid: false,
            message: 'Promotion not applicable to this cabin category',
          },
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = totalAmount * (promo.value / 100);
    } else if (promo.type === 'fixed') {
      discountAmount = promo.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        message: `Discount of $${Math.round(discountAmount * 100) / 100} applied`,
      },
    });
  } catch (error: any) {
    console.error('Validate promotion error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to validate promotion',
      },
      { status: 500 }
    );
  }
}
