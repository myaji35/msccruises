import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 특정 항로 항목 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itineraryId: string }> }
) {
  try {
    const { itineraryId } = await params;

    const itinerary = await prisma.cruiseItinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: "Itinerary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error fetching cruise itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch itinerary" },
      { status: 500 }
    );
  }
}

// PATCH: 특정 항로 항목 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itineraryId: string }> }
) {
  try {
    const { itineraryId } = await params;
    const body = await request.json();

    const itinerary = await prisma.cruiseItinerary.update({
      where: { id: itineraryId },
      data: {
        day: body.day,
        portType: body.portType,
        port: body.port,
        portCode: body.portCode,
        country: body.country,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        arrival: body.arrival,
        departure: body.departure,
        durationHours: body.durationHours ? parseInt(body.durationHours) : null,
        activities: body.activities,
        description: body.description,
        imageUrl: body.imageUrl,
        order: body.order,
      },
    });

    return NextResponse.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error updating cruise itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update itinerary" },
      { status: 500 }
    );
  }
}

// DELETE: 특정 항로 항목 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itineraryId: string }> }
) {
  try {
    const { itineraryId } = await params;

    await prisma.cruiseItinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json({
      success: true,
      message: "Itinerary deleted",
    });
  } catch (error) {
    console.error("Error deleting cruise itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete itinerary" },
      { status: 500 }
    );
  }
}
