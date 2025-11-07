import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reason } = await request.json();

    // TODO: Implement actual cancellation logic
    // 1. Check if booking exists and belongs to user
    // 2. Check cancellation policy (can cancel?)
    // 3. Calculate refund amount
    // 4. Process refund
    // 5. Update booking status to 'cancelled'
    // 6. Send cancellation confirmation email

    // Mock implementation
    const bookingId = params.id;

    // Calculate cancellation fee (example: 20% fee)
    const cancellationFee = 0.20;
    const refundPercentage = (1 - cancellationFee) * 100;

    return NextResponse.json({
      success: true,
      message: "예약이 취소되었습니다.",
      bookingId,
      refundPercentage,
      cancellationFee: cancellationFee * 100,
      reason,
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
