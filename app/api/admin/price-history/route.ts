import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/price-history - 가격 변동 이력 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cruiseId = searchParams.get('cruiseId');
    const cabinCategory = searchParams.get('cabinCategory');
    const changeReason = searchParams.get('changeReason');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build filter conditions
    const where: any = {};

    if (cruiseId) {
      where.cruiseId = cruiseId;
    }

    if (cabinCategory) {
      where.cabinCategory = cabinCategory;
    }

    if (changeReason) {
      where.changeReason = changeReason;
    }

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) {
        where.changedAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.changedAt.lte = end;
      }
    }

    const history = await prisma.priceHistory.findMany({
      where,
      orderBy: {
        changedAt: 'desc',
      },
      take: limit,
    });

    // Calculate statistics
    const stats = {
      total: history.length,
      byReason: {
        inventory: history.filter((h) => h.changeReason === 'inventory').length,
        demand: history.filter((h) => h.changeReason === 'demand').length,
        promotion: history.filter((h) => h.changeReason === 'promotion').length,
        manual: history.filter((h) => h.changeReason === 'manual').length,
      },
      avgChange: history.length > 0
        ? history.reduce((sum, h) => {
            const changePercent = ((h.newPrice - h.oldPrice) / h.oldPrice) * 100;
            return sum + changePercent;
          }, 0) / history.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      history,
      stats,
      meta: {
        count: history.length,
        limit,
        filters: {
          cruiseId,
          cabinCategory,
          changeReason,
          startDate,
          endDate,
        },
      },
    });
  } catch (error: any) {
    console.error('[Price History API Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price history',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
