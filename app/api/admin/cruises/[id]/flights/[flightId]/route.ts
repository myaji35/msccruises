import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 특정 항공 경로 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; flightId: string }> }
) {
  try {
    const { flightId } = await params;

    const flight = await prisma.flightItinerary.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      return NextResponse.json(
        { success: false, error: "Flight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, flight });
  } catch (error) {
    console.error("Error fetching flight itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flight" },
      { status: 500 }
    );
  }
}

// PATCH: 특정 항공 경로 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; flightId: string }> }
) {
  try {
    const { flightId } = await params;
    const body = await request.json();

    const flight = await prisma.flightItinerary.update({
      where: { id: flightId },
      data: {
        segmentType: body.segmentType,
        flightNumber: body.flightNumber,
        airline: body.airline,
        airlineCode: body.airlineCode,

        departureAirport: body.departureAirport,
        departureCode: body.departureCode,
        departureCity: body.departureCity,
        departureCountry: body.departureCountry,
        departureTime: body.departureTime,
        departureDate: body.departureDate
          ? new Date(body.departureDate)
          : undefined,
        departureTerminal: body.departureTerminal,

        arrivalAirport: body.arrivalAirport,
        arrivalCode: body.arrivalCode,
        arrivalCity: body.arrivalCity,
        arrivalCountry: body.arrivalCountry,
        arrivalTime: body.arrivalTime,
        arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : undefined,
        arrivalTerminal: body.arrivalTerminal,

        duration: body.duration ? parseInt(body.duration) : null,
        aircraft: body.aircraft,
        cabinClass: body.cabinClass,
        stops: body.stops ? parseInt(body.stops) : 0,
        stopoverInfo: body.stopoverInfo,

        bookingClass: body.bookingClass,
        seatInfo: body.seatInfo,
        baggageAllowance: body.baggageAllowance,
        mealService: body.mealService,

        order: body.order,
      },
    });

    return NextResponse.json({ success: true, flight });
  } catch (error) {
    console.error("Error updating flight itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update flight" },
      { status: 500 }
    );
  }
}

// DELETE: 특정 항공 경로 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; flightId: string }> }
) {
  try {
    const { flightId } = await params;

    await prisma.flightItinerary.delete({
      where: { id: flightId },
    });

    return NextResponse.json({
      success: true,
      message: "Flight deleted",
    });
  } catch (error) {
    console.error("Error deleting flight itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete flight" },
      { status: 500 }
    );
  }
}
