import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { groupBookingService } from '@/services/group-booking.service';

/**
 * GET /api/v1/group-bookings/[id]
 *
 * Get a specific group booking
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const groupBooking = await groupBookingService.getGroupBooking(resolvedParams.id);

    if (!groupBooking) {
      return NextResponse.json(
        { success: false, error: 'Group booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (groupBooking.groupLeaderId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: groupBooking,
    });
  } catch (error: any) {
    console.error('Get group booking error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch group booking',
      },
      { status: 500 }
    );
  }
}
