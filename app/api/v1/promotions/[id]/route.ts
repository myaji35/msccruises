import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PUT /api/v1/promotions/[id]
 *
 * Update a promotion code (admin only)
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = params;

    // Build update data
    const updateData: any = {};

    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.discountType !== undefined) updateData.type = body.discountType;
    if (body.discountValue !== undefined) updateData.value = parseFloat(body.discountValue);
    if (body.minOrderAmount !== undefined) updateData.minOrderAmount = body.minOrderAmount ? parseFloat(body.minOrderAmount) : null;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses ? parseInt(body.maxUses) : null;
    if (body.validFrom !== undefined) updateData.validFrom = new Date(body.validFrom);
    if (body.validUntil !== undefined) updateData.validUntil = new Date(body.validUntil);
    if (body.applicableCruises !== undefined)
      updateData.applicableCruises = body.applicableCruises.length > 0 ? JSON.stringify(body.applicableCruises) : null;
    if (body.applicableCategories !== undefined)
      updateData.applicableCategories = body.applicableCategories.length > 0 ? JSON.stringify(body.applicableCategories) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const promo = await prisma.promotionCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: promo,
      message: 'Promotion code updated successfully',
    });
  } catch (error: any) {
    console.error('Update promotion error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Promotion code not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update promotion',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/promotions/[id]
 *
 * Delete a promotion code (admin only)
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.promotionCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Promotion code deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete promotion error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Promotion code not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete promotion',
      },
      { status: 500 }
    );
  }
}
