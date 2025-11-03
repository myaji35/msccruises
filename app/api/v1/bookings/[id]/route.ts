import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// AC2: 특정 예약 조회
export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id,
      },
      include: {
        passengers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is a partner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { partnerInfo: true },
    });

    const isOwner = booking.userId === session.user.id;
    const isPartner = user?.partnerInfo && booking.partnerId === user.partnerInfo.id;

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("[Error] Failed to fetch booking:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch booking",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// AC4: 예약 수정
export async function PUT(
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // AC4: 수정 제한 규칙 - 출발 7일 전까지만 가능
    const daysUntilDeparture =
      (booking.departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeparture < 7) {
      return NextResponse.json(
        {
          error: "Modifications not allowed within 7 days of departure",
          code: "CRS_MODIFICATION_DEADLINE",
          days_until_departure: Math.floor(daysUntilDeparture),
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cabin_category, passengers } = body;

    // Update booking
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // 1. Update main booking
      const updated = await tx.booking.update({
        where: { id: params.id },
        data: {
          cabinCategory: cabin_category || booking.cabinCategory,
          updatedAt: new Date(),
        },
      });

      // 2. Update passengers if provided
      if (passengers && passengers.length > 0) {
        // Delete existing passengers
        await tx.passenger.deleteMany({
          where: { bookingId: params.id },
        });

        // Create new passengers
        await tx.passenger.createMany({
          data: passengers.map((p: any, index: number) => ({
            bookingId: params.id,
            firstName: p.first_name,
            lastName: p.last_name,
            dateOfBirth: new Date(p.date_of_birth),
            passportNumber: p.passport || null,
            nationality: p.nationality,
            isPrimary: index === 0,
          })),
        });
      }

      // 3. Log modification (변경 이력)
      console.log(`[Modification] Booking ${booking.bookingNumber} updated by user ${session.user!.id}`);

      return updated;
    });

    // 4. Call CRS API to update booking (mock)
    // await crsApiService.updateBooking(booking.bookingNumber, { cabin_category, passengers });

    return NextResponse.json({
      booking_id: updatedBooking.id,
      booking_number: updatedBooking.bookingNumber,
      status: updatedBooking.status,
      message: "Booking successfully updated",
      updated_at: updatedBooking.updatedAt,
    });
  } catch (error: any) {
    console.error("[Error] Failed to update booking:", error);

    return NextResponse.json(
      {
        error: "Failed to update booking",
        code: "CRS_UPDATE_ERROR",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// AC5: 예약 취소
export async function DELETE(
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking already cancelled" },
        { status: 400 }
      );
    }

    // AC5: 취소 수수료 계산
    const daysUntilDeparture =
      (booking.departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    let cancellationFee = 0;
    if (daysUntilDeparture < 7) {
      cancellationFee = booking.totalPrice * 0.5; // 50% fee
    } else if (daysUntilDeparture < 30) {
      cancellationFee = booking.totalPrice * 0.25; // 25% fee
    } else {
      cancellationFee = booking.totalPrice * 0.1; // 10% fee
    }

    const refundAmount = booking.totalPrice - cancellationFee;

    // Update booking status
    const cancelledBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "cancelled",
        paymentStatus: "refunded",
        updatedAt: new Date(),
      },
    });

    // AC5: CRS API 취소 호출 (mock)
    // await crsApiService.cancelBooking(booking.bookingNumber);

    // AC5: 환불 요청 큐에 추가 (mock)
    console.log(`[Refund Queue] Booking ${booking.bookingNumber} - Refund: $${refundAmount}`);

    // AC5: 취소 확인 이메일 발송 (mock)
    console.log(`[Email] Cancellation confirmation sent to ${session.user.email}`);

    return NextResponse.json({
      booking_id: cancelledBooking.id,
      booking_number: cancelledBooking.bookingNumber,
      status: "cancelled",
      cancellation_fee: cancellationFee,
      refund_amount: refundAmount,
      currency: booking.currency,
      message: "Booking successfully cancelled",
      cancelled_at: cancelledBooking.updatedAt,
    });
  } catch (error: any) {
    console.error("[Error] Failed to cancel booking:", error);

    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        code: "CRS_CANCELLATION_ERROR",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
