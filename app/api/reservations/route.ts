import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Generate reservation number (format: RES-YYYYMMDD-XXXX)
function generateReservationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() + 10000)
    .toString()
    .padStart(4, "0");
  return `RES-${year}${month}${day}-${random}`;
}

// POST: Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      passportName,
      desiredDepartureDate,
      participants,
      preferredTour,
      additionalOptions,
      regularMedication,
      medicalConditions,
      preferredCabinType,
      specialMealRequests,
      mobilePhone,
      email,
      kakaoTalkId,
      socialMediaAccount,
      additionalRequests,
      cruiseId,
    } = body;

    // Validate required fields
    if (!passportName || !desiredDepartureDate || !participants || !preferredCabinType || !mobilePhone || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate participants
    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one participant is required" },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber: generateReservationNumber(),
        passportName,
        desiredDepartureDate,
        participants: JSON.stringify(participants),
        preferredTour,
        additionalOptions,
        regularMedication,
        medicalConditions,
        preferredCabinType,
        specialMealRequests,
        mobilePhone,
        email,
        kakaoTalkId,
        socialMediaAccount,
        additionalRequests,
        cruiseId,
        status: "pending",
      },
    });

    // TODO: Send confirmation email to customer
    // TODO: Send notification to admin

    return NextResponse.json(
      {
        success: true,
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        message: "Reservation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

// GET: Get all reservations (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const email = searchParams.get("email");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (email) {
      where.email = email;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { submittedAt: "desc" },
    });

    // Parse participants JSON
    const parsedReservations = reservations.map((res) => ({
      ...res,
      participants: JSON.parse(res.participants),
    }));

    return NextResponse.json({
      success: true,
      reservations: parsedReservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
