import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { groupBookingService } from '@/services/group-booking.service';

/**
 * POST /api/v1/group-bookings/[id]/cabins
 *
 * Add a cabin to an existing group booking
 */
export async function POST(
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
    const body = await req.json();

    if (!body.cabinCategory || !body.numPassengers) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: cabinCategory, numPassengers',
        },
        { status: 400 }
      );
    }

    await groupBookingService.addCabinToGroup(
      resolvedParams.id,
      {
        cabinCategory: body.cabinCategory,
        numPassengers: body.numPassengers,
        passengers: body.passengers,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Cabin added to group booking successfully',
    });
  } catch (error: any) {
    console.error('Add cabin to group error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add cabin to group',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/group-bookings/[id]/cabins/[bookingId]
 *
 * Remove a cabin from group booking
 */
export async function DELETE(
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
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing bookingId parameter' },
        { status: 400 }
      );
    }

    await groupBookingService.removeCabinFromGroup(resolvedParams.id, bookingId);

    return NextResponse.json({
      success: true,
      message: 'Cabin removed from group booking successfully',
    });
  } catch (error: any) {
    console.error('Remove cabin from group error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to remove cabin from group',
      },
      { status: 500 }
    );
  }
}
