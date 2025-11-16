import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/v1/promotions
 *
 * Get all active promotion codes (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const promos = await prisma.promotionCode.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: promos,
    });
  } catch (error: any) {
    console.error('Get promotions error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch promotions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/promotions
 *
 * Create a new promotion code (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.code || !body.type || !body.value || !body.validFrom || !body.validUntil) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: code, type, value, validFrom, validUntil',
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!['percentage', 'fixed'].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type. Must be "percentage" or "fixed"',
        },
        { status: 400 }
      );
    }

    // Create promotion code
    const promo = await prisma.promotionCode.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: parseFloat(body.value),
        currency: body.currency || 'USD',
        description: body.description,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        maxUsesPerUser: body.maxUsesPerUser ? parseInt(body.maxUsesPerUser) : 1,
        minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
        applicableCruises: body.applicableCruises
          ? JSON.stringify(body.applicableCruises)
          : null,
        applicableCategories: body.applicableCategories
          ? JSON.stringify(body.applicableCategories)
          : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdBy: session.user.email || session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: promo,
        message: 'Promotion code created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create promotion error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion code already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create promotion',
      },
      { status: 500 }
    );
  }
}
