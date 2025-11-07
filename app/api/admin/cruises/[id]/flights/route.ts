import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 항공 경로 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const flights = await prisma.flightItinerary.findMany({
      where: { cruiseId: id },
      orderBy: [{ departureDate: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ success: true, flights });
  } catch (error) {
    console.error("Error fetching flight itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flights" },
      { status: 500 }
    );
  }
}

// POST: 항공 경로 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify cruise exists
    const cruise = await prisma.cruise.findUnique({
      where: { id },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 }
      );
    }

    const flight = await prisma.flightItinerary.create({
      data: {
        cruiseId: id,
        segmentType: body.segmentType,
        flightNumber: body.flightNumber,
        airline: body.airline,
        airlineCode: body.airlineCode,

        departureAirport: body.departureAirport,
        departureCode: body.departureCode,
        departureCity: body.departureCity,
        departureCountry: body.departureCountry,
        departureTime: body.departureTime,
        departureDate: new Date(body.departureDate),
        departureTerminal: body.departureTerminal,

        arrivalAirport: body.arrivalAirport,
        arrivalCode: body.arrivalCode,
        arrivalCity: body.arrivalCity,
        arrivalCountry: body.arrivalCountry,
        arrivalTime: body.arrivalTime,
        arrivalDate: new Date(body.arrivalDate),
        arrivalTerminal: body.arrivalTerminal,

        duration: body.duration ? parseInt(body.duration) : null,
        aircraft: body.aircraft,
        cabinClass: body.cabinClass,
        stops: body.stops ? parseInt(body.stops) : 0,
        stopoverInfo: body.stopoverInfo,

        bookingClass: body.bookingClass,
        seatInfo: body.seatInfo,
        baggageAllowance: body.baggageAllowance,
        mealService: body.mealService !== false,

        order: body.order || 0,
      },
    });

    return NextResponse.json({ success: true, flight }, { status: 201 });
  } catch (error) {
    console.error("Error creating flight itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create flight" },
      { status: 500 }
    );
  }
}

// PUT: 항공 경로 일괄 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { flights } = body;

    if (!Array.isArray(flights)) {
      return NextResponse.json(
        { success: false, error: "Invalid flights data" },
        { status: 400 }
      );
    }

    // Transaction으로 일괄 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 1. 기존 항공 경로 모두 삭제
      await tx.flightItinerary.deleteMany({
        where: { cruiseId: id },
      });

      // 2. 새 항공 경로 생성
      if (flights.length > 0) {
        await tx.flightItinerary.createMany({
          data: flights.map((item: any) => ({
            cruiseId: id,
            segmentType: item.segmentType,
            flightNumber: item.flightNumber,
            airline: item.airline,
            airlineCode: item.airlineCode,

            departureAirport: item.departureAirport,
            departureCode: item.departureCode,
            departureCity: item.departureCity,
            departureCountry: item.departureCountry,
            departureTime: item.departureTime,
            departureDate: new Date(item.departureDate),
            departureTerminal: item.departureTerminal,

            arrivalAirport: item.arrivalAirport,
            arrivalCode: item.arrivalCode,
            arrivalCity: item.arrivalCity,
            arrivalCountry: item.arrivalCountry,
            arrivalTime: item.arrivalTime,
            arrivalDate: new Date(item.arrivalDate),
            arrivalTerminal: item.arrivalTerminal,

            duration: item.duration ? parseInt(item.duration) : null,
            aircraft: item.aircraft,
            cabinClass: item.cabinClass,
            stops: item.stops ? parseInt(item.stops) : 0,
            stopoverInfo: item.stopoverInfo,

            bookingClass: item.bookingClass,
            seatInfo: item.seatInfo,
            baggageAllowance: item.baggageAllowance,
            mealService: item.mealService !== false,

            order: item.order || 0,
          })),
        });
      }

      // 3. 업데이트된 항공 경로 조회
      return await tx.flightItinerary.findMany({
        where: { cruiseId: id },
        orderBy: [{ departureDate: "asc" }, { order: "asc" }],
      });
    });

    return NextResponse.json({ success: true, flights: result });
  } catch (error) {
    console.error("Error updating flight itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update flights" },
      { status: 500 }
    );
  }
}

// DELETE: 항공 경로 전체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.flightItinerary.deleteMany({
      where: { cruiseId: id },
    });

    return NextResponse.json({
      success: true,
      message: "All flights deleted",
    });
  } catch (error) {
    console.error("Error deleting flight itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete flights" },
      { status: 500 }
    );
  }
}
