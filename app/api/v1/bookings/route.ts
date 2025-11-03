import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crsApiService } from "@/services/crs-api.service";

// AC3: 예약 생성
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cruise_id, cabin_category, passengers, contact, package_info, partner_id } = body;

    // Validation
    if (!cruise_id || !cabin_category || !passengers || passengers.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "CRS_INVALID_REQUEST",
          required_fields: ["cruise_id", "cabin_category", "passengers"],
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create booking in CRS (mock)
      const crsBooking = await crsApiService.createBooking({
        cruise_id,
        cabin_category,
        passengers,
        contact: contact || {
          email: user.email!,
          phone: user.phone || "",
        },
      });

      // 2. Generate booking number
      const bookingNumber = crsBooking.confirmation_number;

      // 3. Calculate prices
      const totalPrice = crsBooking.total_price;
      const packageDiscount = package_info?.package_discount || null;
      const partnerCommission = partner_id
        ? await calculatePartnerCommission(tx, partner_id, totalPrice)
        : null;

      // 4. Get cruise details from mock data
      const cruiseDetails = await getCruiseDetails(cruise_id);

      // 5. Create booking in database
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          bookingNumber,
          cruiseId: cruise_id,
          cruiseName: cruiseDetails.name,
          shipName: cruiseDetails.ship_name,
          departureDate: new Date(cruiseDetails.departure_date),
          returnDate: new Date(cruiseDetails.return_date),
          departurePort: cruiseDetails.departure_port,
          cabinCategory: cabin_category,
          cabinNumber: crsBooking.cabin_category, // Will be assigned by CRS
          totalPrice,
          currency: "USD",
          status: crsBooking.status,
          paymentStatus: "pending",
          isPackage: !!package_info,
          outboundFlight: package_info?.outbound_flight || null,
          returnFlight: package_info?.return_flight || null,
          packageDiscount: packageDiscount,
          partnerId: partner_id || null,
          partnerCommission: partnerCommission,
          passengers: {
            create: passengers.map((p: any, index: number) => ({
              firstName: p.first_name,
              lastName: p.last_name,
              dateOfBirth: new Date(p.date_of_birth),
              passportNumber: p.passport || null,
              nationality: p.nationality,
              isPrimary: index === 0,
            })),
          },
        },
        include: {
          passengers: true,
        },
      });

      return booking;
    });

    console.log(`[Success] Booking created: ${result.bookingNumber} for user ${user.email}`);

    return NextResponse.json(
      {
        booking_id: result.id,
        booking_number: result.bookingNumber,
        status: result.status,
        total_price: result.totalPrice,
        currency: result.currency,
        created_at: result.createdAt,
        cruise: {
          id: result.cruiseId,
          name: result.cruiseName,
          ship_name: result.shipName,
          departure_date: result.departureDate,
          return_date: result.returnDate,
        },
        message: "Booking successfully created",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Error] Failed to create booking:", error);

    // Check for specific error types
    if (error.code === "P2002") {
      // Prisma unique constraint violation
      return NextResponse.json(
        {
          error: "Duplicate booking",
          code: "CRS_DUPLICATE_BOOKING",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create booking",
        code: "CRS_BOOKING_ERROR",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// AC2: 모든 예약 조회 (사용자별)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        passengers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("[Error] Failed to fetch bookings:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function calculatePartnerCommission(
  tx: any,
  partnerId: string,
  totalPrice: number
): Promise<number> {
  const partnerInfo = await tx.partnerInfo.findUnique({
    where: { id: partnerId },
  });

  if (!partnerInfo) {
    return 0;
  }

  return totalPrice * partnerInfo.commissionRate;
}

async function getCruiseDetails(cruiseId: string) {
  // Mock data - in production, this would query CRS API or database
  const mockCruises: Record<string, any> = {
    MSC123456: {
      name: "Caribbean Adventure",
      ship_name: "MSC Seaside",
      departure_port: "Miami, FL",
      departure_date: "2025-12-15",
      return_date: "2025-12-22",
    },
    MSC123457: {
      name: "Mediterranean Explorer",
      ship_name: "MSC Meraviglia",
      departure_port: "Barcelona, Spain",
      departure_date: "2025-07-10",
      return_date: "2025-07-20",
    },
    MSC123458: {
      name: "Northern Fjords",
      ship_name: "MSC Divina",
      departure_port: "Copenhagen, Denmark",
      departure_date: "2025-08-05",
      return_date: "2025-08-17",
    },
  };

  return (
    mockCruises[cruiseId] || {
      name: "Unknown Cruise",
      ship_name: "MSC Ship",
      departure_port: "Unknown",
      departure_date: "2025-12-01",
      return_date: "2025-12-08",
    }
  );
}
