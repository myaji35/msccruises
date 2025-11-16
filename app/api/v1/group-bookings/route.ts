import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { groupBookingService } from '@/services/group-booking.service';

/**
 * POST /api/v1/group-bookings
 *
 * Create a new group booking (3+ cabins)
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
    if (!body.cruiseId || !body.cabins || !Array.isArray(body.cabins)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: cruiseId, cabins',
        },
        { status: 400 }
      );
    }

    // Validate minimum cabins
    if (body.cabins.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Minimum 3 cabins required for group booking',
        },
        { status: 400 }
      );
    }

    // Create group booking
    const groupBooking = await groupBookingService.createGroupBooking({
      cruiseId: body.cruiseId,
      groupLeaderId: session.user.id,
      groupName: body.groupName,
      groupLeaderEmail: session.user.email || body.groupLeaderEmail,
      groupLeaderPhone: body.groupLeaderPhone,
      cabins: body.cabins,
      notes: body.notes,
    });

    // Check if requires sales contact
    if ('requiresSalesContact' in groupBooking && groupBooking.requiresSalesContact) {
      return NextResponse.json({
        success: true,
        requiresSalesContact: true,
        data: groupBooking,
        message: groupBooking.message,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: groupBooking,
        message: 'Group booking created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create group booking error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create group booking',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/group-bookings
 *
 * Get all group bookings for the current user
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

    const groupBookings = await groupBookingService.getUserGroupBookings(session.user.id);

    return NextResponse.json({
      success: true,
      data: groupBookings,
    });
  } catch (error: any) {
    console.error('Get group bookings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch group bookings',
      },
      { status: 500 }
    );
  }
}
