import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Generate booking number (format: MSC-YYYYMMDD-XXXX)
function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `MSC-${year}${month}${day}-${random}`;
}

// POST: Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cruiseId, departureDate, cabinCategory, passengers, totalPrice, partnerId } = body;

    // Validate required fields
    if (!cruiseId || !departureDate || !cabinCategory || !passengers || !totalPrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get cruise details
    const cruise = await prisma.cruise.findUnique({
      where: { id: cruiseId },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 }
      );
    }

    // Calculate return date
    const depDate = new Date(departureDate);
    const returnDate = new Date(depDate);
    returnDate.setDate(returnDate.getDate() + cruise.durationDays);

    // Calculate partner commission if partnerId is provided
    let partnerCommission = null;
    if (partnerId) {
      const partner = await prisma.partnerInfo.findUnique({
        where: { id: partnerId },
      });
      if (partner && partner.status === "active") {
        partnerCommission = totalPrice * partner.commissionRate;
      }
    }

    // Create booking with passengers in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          bookingNumber: generateBookingNumber(),
          cruiseId: cruise.id,
          cruiseName: cruise.name,
          shipName: cruise.shipName,
          departureDate: new Date(departureDate),
          returnDate: returnDate,
          departurePort: cruise.departurePort,
          cabinCategory: cabinCategory,
          totalPrice: totalPrice,
          currency: cruise.currency,
          status: "pending",
          paymentStatus: "pending",
          partnerId: partnerId || null,
          partnerCommission: partnerCommission,
        },
      });

      // 2. Create passengers
      if (passengers && Array.isArray(passengers)) {
        await tx.passenger.createMany({
          data: passengers.map((p: any) => ({
            bookingId: newBooking.id,
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: new Date(p.dateOfBirth),
            passportNumber: p.passportNumber || null,
            nationality: p.nationality,
            isPrimary: p.isPrimary || false,
          })),
        });
      }

      // 3. Fetch complete booking with passengers
      return await tx.booking.findUnique({
        where: { id: newBooking.id },
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
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET: Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        passengers: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
