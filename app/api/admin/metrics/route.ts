import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get booking statistics
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.booking.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        paymentStatus: 'paid',
      },
    });

    // Get cruise statistics
    const activeCruises = await prisma.cruise.count({
      where: {
        status: 'active',
      },
    });

    // Get user statistics
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      bookingStats: {
        totalBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
      },
      cruiseStats: {
        activeCruises,
      },
      userStats: {
        totalUsers,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch metrics',
        // Return empty stats instead of error
        bookingStats: {
          totalBookings: 0,
          totalRevenue: 0,
        },
        cruiseStats: {
          activeCruises: 0,
        },
        userStats: {
          totalUsers: 0,
        },
      },
      { status: 200 } // Return 200 even on error to prevent UI issues
    );
  }
}
